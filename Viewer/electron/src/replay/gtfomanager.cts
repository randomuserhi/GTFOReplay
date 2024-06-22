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

        this.client.addEventListener("startGame", (bytes) => {
            const path = BitHelper.readString(bytes);
            Program.post("console.log", `game started: ${path}`);
            Program.post("startGame");
            // TODO(randomuserhi)
        });

        this.client.addEventListener("endGame", () => {
            Program.post("console.log", "game ended");
            // TODO(randomuserhi)
        });

        // Handling file link
        this.client.addEventListener("liveBytes", (bytes) => {
            this.fileManager.file?.receiveLiveBytes({
                offset: BitHelper.readInt(bytes),
                bytes: BitHelper.readBytes(BitHelper.readInt(bytes), bytes)
            });
        });
    }

    public setupIPC(ipc: Electron.IpcMain) {
        ipc.handle("link", async (_, ip: string, port: number) => {
            try {
                await this.client.connect(ip, port);
                return undefined;
            } catch (err) {
                return `${ip}(${port}): ${err.message}`;
            }
        });
        ipc.on("goLive", () => {
            if (!this.client.active()) return;
            this.client.send("acknowledgement", new ByteStream());
        });
        ipc.on("unlink", () => {
            this.client.disconnect();
        });
    }
}