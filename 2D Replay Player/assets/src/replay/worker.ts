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

        const getModule = async (bytes: ByteStream | FileStream): Promise<Module> => {
            const id = await BitHelper.readUShort(bytes);
            const module = replay!.typemap.get(id);
            if (module === undefined) throw new UnknownModuleType(`No module was found for '${id}'.`);
            return module;
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
            const func = ModuleLoader.get(module);
            if (func === undefined) throw new ModuleNotFound(`No valid module was found for '${module.typename}(${module.version})'.`);
            await func.parse(bytes, replay.header);
            module = await getModule(bytes);
        }

        ipc.send("eoh", replay.header);

        // Parse snapshots
        const parseEvents = async (bytes: ByteStream, state: Replay.Snapshot) => {
            const size = await BitHelper.readInt(bytes);
            console.log(`size: ${size}`);
            for (let i = 0; i < size; ++i) {
                console.log(bytes);
                const delta = await BitHelper.readUShort(bytes);
                console.log(`delta: ${delta}`);
                const module = await getModule(bytes);
                console.log(`[module: ${module.typename}(${module.version})]`);
                const func = ModuleLoader.get(module);
                if (func === undefined) throw new ModuleNotFound(`No valid module was found for '${module.typename}(${module.version})'.`);
                const data = await func.parse(bytes);
                if (func.exec === undefined) throw new NoExecFunc(`No valid exec function was found for '${module.typename}(${module.version})'.`);
                func.exec(data, state, 1);
            }
        };
        const parseDynamicCollection = async (bytes: ByteStream, state: Replay.Snapshot) => {
            const size = await BitHelper.readInt(bytes);
            console.log(`size: ${size}`);
            for (let i = 0; i < size; ++i) {
                const module = await getModule(bytes);
                console.log(`[module: ${module.typename}(${module.version})]`);
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
                console.log(`snapshot: ${snapshotSize}`);
                const bytes = await fs.getBytes(snapshotSize);

                const now = await BitHelper.readUInt(bytes);
                console.log(`now: ${now}`);
                
                await parseEvents(bytes, state); // parse events
                const nDynamicCollections = await BitHelper.readInt(bytes);
                for (let i = 0; i < nDynamicCollections; ++i) {
                    await parseDynamicCollection(bytes, state); // parse dynamics
                }

                console.log(state);
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