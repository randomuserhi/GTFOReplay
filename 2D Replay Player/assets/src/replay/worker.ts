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

        const getModule = async (bytes: ByteStream | FileStream): Promise<Module | undefined> => {
            const id = await BitHelper.readUShort(bytes);
            return replay!.typemap.get(id);
        };
        
        // Parse Typemap
        const headerSize = await BitHelper.readInt(fs);
        const bytes = await fs.getBytes(headerSize);
        const typeMapVersion = await BitHelper.readString(bytes);
        if (Typemap.parsers[typeMapVersion] === undefined) {
            throw new ModuleNotFound(`No valid parser was found for 'ReplayRecorder.TypeMap(${typeMapVersion})'.`);
        }
        await Typemap.parsers[typeMapVersion](bytes, replay);

        // Parse Headers
        let module = await getModule(bytes);
        while (module?.typename !== "ReplayRecorder.EndOfHeader") {
            if (module === undefined) throw new UnknownModuleType();
            const func = ModuleLoader.get(module);
            if (func === undefined) throw new ModuleNotFound(`No valid module was found for '${module.typename}(${module.version})'.`);
            await func.parse(bytes, replay.header);
            module = await getModule(bytes);
        }

        ipc.send("eoh", replay.header);

        // Parse snapshots
        const parseTypes = async (state: Replay.Snapshot) => {
            const size = await BitHelper.readUInt(bytes);
            for (let i = 0; i < size; ++i) {
                const module = await getModule(bytes);
                if (module === undefined) throw new UnknownModuleType();
                const func = ModuleLoader.get(module);
                if (func === undefined) throw new ModuleNotFound(`No valid module was found for '${module.typename}(${module.version})'.`);
                const data = await func.parse(bytes);
                if (func.exec === undefined) throw new NoExecFunc(`No valid exec function was found for '${module.typename}(${module.version})'.`);
                func.exec(data, state, 1);
            }
        };

        const state: Replay.Snapshot = {} as any;
        try {
            for (;;) {
                const snapshotSize = await BitHelper.readInt(fs);
                const bytes = await fs.getBytes(snapshotSize);

                const now = await BitHelper.readUInt(bytes);
                
                parseTypes(state); // parse events
                parseTypes(state); // parse dynamics
            }
        } catch(err) {
            if (!(err instanceof RangeError)) {
                throw err;
            }
        }

        fs.close();
        ipc.send("end");
        self.close();
    }
})();