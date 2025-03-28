import Program from "../main.cjs";
import * as BitHelper from "../net/bitHelper.cjs";
import { ByteStream } from "../net/stream.cjs";
import { TcpClient } from "../net/tcpClient.cjs";
import { FileManager } from "./filemanager.cjs";

export class GTFOManager {
    client: TcpClient;
    fileManager: FileManager;

    constructor(fileManager: FileManager) {
        this.fileManager = fileManager;

        this.client = new TcpClient();

        this.client.addEventListener("close", () => {
            Program.post("console.log", "connection closed");
            // TODO(randomuserhi)
        });

        this.client.addEventListener("startGame", async (bytes) => {
            const replayInstanceId = BitHelper.readByte(bytes);
                
            // Open a new net file and link to replay instance to start live view
            this.fileManager.open();
            this.fileManager.link(replayInstanceId);
            
            console.log(`start game! ${replayInstanceId}`);
            Program.post("startGame");
        });

        this.client.addEventListener("endGame", () => {
            Program.post("console.log", "game ended");
            // TODO(randomuserhi)
        });

        this.client.addEventListener("connected", () => {
            Program.post("liveConnected", "connected");
        });

        this.client.addEventListener("failedToConnect", () => {
            Program.post("liveFailedToConnect", "failed to connect");
        });

        this.client.addEventListener("inGameMessage", (bytes) => {
            Program.post("inGameMessage", BitHelper.readULong(bytes), BitHelper.readString(bytes));
        });
        this.client.addEventListener("ackInGameMessage", (bytes) => {
            Program.post("ackInGameMessage", BitHelper.readUShort(bytes));
        });

        // Handling file link
        this.client.addEventListener("liveBytes", (bytes) => {
            this.fileManager.file?.receiveLiveBytes({
                replayInstanceId: BitHelper.readByte(bytes),
                offset: BitHelper.readInt(bytes),
                bytes: BitHelper.readBytes(BitHelper.readInt(bytes), bytes)
            });
        });
    }

    public setupIPC(ipc: Electron.IpcMain) {
        let messageId = 0;
        ipc.handle("sendChatMessage", async (_, message: string) => {
            if (!this.client.active()) return;
            const packet = new ByteStream();
            const id = (messageId++) % 65536;
            BitHelper.writeUShort(id, packet);
            BitHelper.writeString(message, packet);
            this.client.send("inGameMessage", packet);
            return id;
        });
        ipc.handle("link", async (_, ip: string, port: number) => {
            try {
                await this.client.connect(ip, port);
                return undefined;
            } catch (err) {
                return `${ip}(${port}): ${err.message}`;
            }
        });
        ipc.handle("goLive", (_, id: bigint) => {
            if (!this.client.active()) return;
            const packet = new ByteStream();
            BitHelper.writeULong(id, packet);
            console.log(`Sending Player: ${id}`);
            this.client.send("acknowledgement", packet);
        });
        ipc.handle("unlink", () => {
            this.client.disconnect();
        });
    }
}