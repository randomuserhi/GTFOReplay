let replay: Replay | undefined = undefined;

(() => {
    importScripts("./moduleloader.js");
    importScripts("./bithelper.js");
    importScripts("./typemap.js");
    importScripts("./replay.js");
    importScripts("./ipc.js");
    importScripts("./math.js");

    const ipc = new IpcInterface({
        on: (callback) => self.addEventListener("message", (e) => { callback(e.data); }),
        send: self.postMessage.bind(self)
    });
    ipc.on("init", (path: string, links: string[], finite: boolean = true) => {
        importScripts(...links);
        parse(path, finite);
    });

    async function parse(path: string, finite: boolean = true) {
        if (replay !== undefined) return;
        replay = new Replay();

        const fs = new FileStream(ipc, path, finite);
        await fs.open();

        const getModule = async (bytes: ByteStream | FileStream): Promise<[Module, number]> => {
            if (replay === undefined) throw new Error(`No replay was found - Parsing has not yet been started.`);
            const id = await BitHelper.readUShort(bytes);
            const module = replay.typemap.get(id);
            if (module === undefined) throw new UnknownModuleType(`No module was found for '${id}'.`);
            return [module, id];
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
        let [module, type] = await getModule(bytes);
        while (module?.typename !== "ReplayRecorder.EndOfHeader") {
            const func = ModuleLoader.get(module);
            if (func === undefined) throw new ModuleNotFound(`No valid module was found for '${module.typename}(${module.version})'.`);
            replay.header.set(type, await func.parse(bytes));
            [module, type] = await getModule(bytes);
        }

        ipc.send("eoh", replay.typemap, replay.types, replay.header);

        // Parse snapshots
        const state: Snapshot = {
            tick: 0,
            time: 0,
            dynamics: new Map()
        };
        ipc.send("snapshot", {
            tick: 0,
            time: 0,
            events: [],
            dynamics: new Map()
        }, state);
        const api = replay.api(state);
        const parseEvents = async (bytes: ByteStream): Promise<Timeline.Event[]> => {
            const events: Timeline.Event[] = [];
            const size = await BitHelper.readInt(bytes);
            for (let i = 0; i < size; ++i) {
                const delta = await BitHelper.readUShort(bytes);
                const [module, type] = await getModule(bytes);
                const func = ModuleLoader.get(module);
                if (func === undefined) throw new ModuleNotFound(`No valid module was found for '${module.typename}(${module.version})'.`);
                const eventType = await BitHelper.readByte(bytes);
                const data = await func.parse(bytes);
                events.push({
                    eventType,
                    type,
                    delta,
                    data
                });
                if (func.exec === undefined) throw new NoExecFunc(`No valid exec function was found for '${module.typename}(${module.version})'.`);
                func.exec(data, api, 1);
            }
            return events;
        };
        const parseDynamicCollection = async (bytes: ByteStream): Promise<[Timeline.Dynamic[], number]> => {
            const dynamics: Timeline.Dynamic[] = [];
            const [module, type] = await getModule(bytes);
            const func = ModuleLoader.get(module);
            if (func === undefined) throw new ModuleNotFound(`No valid module was found for '${module.typename}(${module.version})'.`);
            if (func.exec === undefined) throw new NoExecFunc(`No valid exec function was found for '${module.typename}(${module.version})'.`);

            const size = await BitHelper.readInt(bytes);
            for (let i = 0; i < size; ++i) {
                const id = await BitHelper.readInt(bytes);
                const data = await func.parse(bytes);
                dynamics.push({ id, data });
                func.exec(id, data, api, 1);
            }
            return [dynamics, type];
        };
        try {
            for (;;) {
                const snapshotSize = await BitHelper.readInt(fs);
                const bytes = await fs.getBytes(snapshotSize);
                
                const now = await BitHelper.readUInt(bytes);
                state.time = now;
                ++state.tick;
                const snapshot: Timeline.Snapshot = {
                    tick: state.tick,
                    time: now,
                    dynamics: new Map()
                } as any;

                snapshot.events = await parseEvents(bytes); // parse events
                const nDynamicCollections = await BitHelper.readUShort(bytes);
                for (let i = 0; i < nDynamicCollections; ++i) {
                    const [dynamics, type] = await parseDynamicCollection(bytes);
                    snapshot.dynamics.set(type, dynamics); // parse dynamics
                }
                
                ipc.send("snapshot", snapshot, (state.tick % 50) === 0 ? state : undefined);
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