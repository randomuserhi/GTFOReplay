class InvalidWorkerCommand extends Error {
    constructor(message: string) {
        super(message);
    }
}

let replay: Replay | undefined = undefined;

(() => {
    importScripts("./moduleloader.js");
    importScripts("./bithelper.js");
    importScripts("./typemap.js");
    importScripts("./replay.js");
    importScripts("./ipc.js");

    const ipc = new IpcInterface({
        on: (callback) => self.addEventListener("message", (e) => { callback(e.data); }),
        send: self.postMessage.bind(self)
    });
    ipc.on("init", (path: string, links: string[]) => {
        importScripts(...links);
        parse(path);
    });

    async function parse(path: string, finite: boolean = true) {
        if (replay !== undefined) return;
        replay = new Replay();

        const fs = new FileStream(ipc, path, finite);
        await fs.open();

        const module = async (bytes: ByteStream | FileStream): Promise<Module | undefined> => {
            const id = await BitHelper.readUShort(bytes);
            return replay!.typemap.get(id);
        };
        
        // Parse Header
        const headerSize = await BitHelper.readInt(fs);
        const bytes = await fs.getBytes(headerSize);
        const typeMapVersion = await BitHelper.readString(bytes);
        if (Typemap.parsers[typeMapVersion] === undefined) {
            throw new ModuleNotFound(`No valid parser was found for 'ReplayRecorder.TypeMap(${typeMapVersion})'.`);
        }
        await Typemap.parsers[typeMapVersion](bytes, replay);
        // Parse Headers
        let m = await module(bytes);
        while (m?.typename !== "ReplayRecorder.EndOfHeader") {
            if (m === undefined) throw new UnknownModuleType();
            const func = ModuleLoader.get(m);
            if (func === undefined) throw new ModuleNotFound(`No valid parser was found for '${m.typename}(${m.version})'.`);
            await func.parse(bytes, replay.header);
            m = await module(bytes);
        }

        ipc.send("eoh");

        fs.close();
        self.close();
    }
})();