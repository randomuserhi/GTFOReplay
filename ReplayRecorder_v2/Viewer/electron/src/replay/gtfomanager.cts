import { resolve } from "path";
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
            console.log("connection closed");
            // TODO(randomuserhi)
        });

        this.client.addEventListener("startGame", (bytes) => {
            const path = BitHelper.readString(bytes);
            console.log(`game started: ${path}`);
            // TODO(randomuserhi)
        });

        this.client.addEventListener("endGame", () => {
            console.log("game ended");
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
        ipc.handle("link", async (_, port: number) => {
            const ip = "127.0.0.1";
            try {
                await this.client.connect(ip, port);
                return undefined;
            } catch (err) {
                return `${ip}(${port}): ${err.message}`;
            }
        });
        ipc.on("goLive", (_, path: string) => {
            if (!this.client.active()) return;
            const stream = new ByteStream();
            BitHelper.writeString(resolve(path), stream);
            this.client.send("acknowledgement", stream);
        });
        ipc.on("unlink", () => {
            this.client.disconnect();
        });
    }
}