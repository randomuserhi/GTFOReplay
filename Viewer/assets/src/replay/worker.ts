import { VM } from "./async-script-loader.js";
import * as BitHelper from "./bithelper.js";
import { Internal } from "./internal.js";
import { IpcInterface } from "./ipc.js";
import { ModuleDesc, ModuleLoader, ModuleNotFound, NoExecFunc, UnknownModuleType } from "./moduleloader.js";
import { Replay, Snapshot, Timeline } from "./replay.js";
import { ByteStream, FileHandle, FileStream } from "./stream.js";

let replay: Replay | undefined = undefined;

(() => {

    const ipc = new IpcInterface({
        on: (callback) => self.addEventListener("message", (e) => { callback(e.data); }),
        send: self.postMessage.bind(self)
    });
    ipc.on("init", async (file: FileHandle, links: string[], baseURI?: string) => {
        const vm = new VM({ isParser: true }, baseURI);
        await Promise.all(links.map(async link => (vm.load(link)).then(module => module.execution)));
        parse(vm, file);
    });

    async function parse(vm: VM, file: FileHandle) {
        if (replay !== undefined) return;
        replay = new Replay();

        const fs = new FileStream(ipc, file);

        // Cache as much available data
        await fs.cacheAllBytes();
        await fs.cacheNetworkBuffer();

        const getModule = async (bytes: ByteStream | FileStream): Promise<[ModuleDesc, number]> => {
            if (replay === undefined) throw new Error(`No replay was found - Parsing has not yet been started.`);
            const id = await BitHelper.readUShort(bytes);
            const module = replay.typemap.get(id);
            if (module === undefined) throw new UnknownModuleType(`No module was found for '${id}'.`);
            return [module, id];
        };

        try {
            // Parse Typemap
            const headerSize = await BitHelper.readInt(fs);
            const bytes = await fs.getBytes(headerSize);
            const typeMapVersion = await BitHelper.readString(bytes);
            if (Internal.parsers[typeMapVersion] === undefined) {
                throw new ModuleNotFound(`No valid parser was found for 'ReplayRecorder.TypeMap(${typeMapVersion})'.`);
            }
            await Internal.parsers[typeMapVersion](bytes, replay);

            // Setup API
            const state: Snapshot = {
                tick: 0,
                time: 0,
                typedTime: new Map(),
                data: new Map()
            };
            const api = replay.api(state);

            // Initialise
            for (const init of ModuleLoader.library.init) {
                init(api.header);
            }

            // Parse Headers
            let [module] = await getModule(bytes);
            while (module?.typename !== "ReplayRecorder.EndOfHeader") {
                const func = ModuleLoader.getHeader(module as any);
                if (func === undefined) throw new ModuleNotFound(`No valid module was found for '${module.typename}(${module.version})'.`);
                await func.parse(bytes, api.header, api);
                [module] = await getModule(bytes);
            }

            ipc.send("eoh", replay.typemap, replay.types, replay.header);

            // Parse snapshots
            const exists = new Map<number, Map<number, boolean>>();
            const parseEvents = async (bytes: ByteStream): Promise<Timeline.Event[]> => {
                if (replay === undefined) throw new Error(`No replay was found - Parsing has not yet been started.`);

                const now = state.time;

                const events: Timeline.Event[] = [];
                const size = await BitHelper.readInt(bytes);
                for (let i = 0; i < size; ++i) {
                    const delta = await BitHelper.readUShort(bytes);
                    const [module, type] = await getModule(bytes);

                    state.time = now - delta;

                    let data: any = undefined;
                    if (module.typename === "ReplayRecorder.Despawn" || module.typename === "ReplayRecorder.Spawn") {
                        // Special case to parse spawn and despawn events
                        const parse = Internal.DynamicParse[module.typename][module.version];
                        if (parse === undefined) throw new ModuleNotFound(`No valid module was found for '${module.typename}(${module.version})'.`);
                        data = await parse(bytes, replay, api);
                        events.push({
                            type,
                            delta,
                            data
                        });
                        const exec = Internal.DynamicExec[module.typename][module.version];
                        if (exec === undefined) throw new NoExecFunc(`No valid exec function was found for '${module.typename}(${module.version})'.`);
                        exec(data, replay, api);

                        if (!exists.has(data.type)) exists.set(data.type, new Map());
                        exists.get(data.type)!.set(data.id, module.typename === "ReplayRecorder.Spawn");
                    } else {
                        // Parse regular events
                        const func = ModuleLoader.getEvent(module as any);
                        if (func === undefined) throw new ModuleNotFound(`No valid module was found for '${module.typename}(${module.version})'.`);
                        data = await func.parse(bytes, api);
                        events.push({
                            type,
                            delta,
                            data
                        });
                        if (func.exec === undefined) throw new NoExecFunc(`No valid exec function was found for '${module.typename}(${module.version})'.`);
                        func.exec(data as never, api);
                    }
                }

                state.time = now;

                //return events.sort((a, b) => b.delta - a.delta);
                return events; // NOTE(randomuserhi): Should be written sorted by game
            };
            const parseDynamicCollection = async (bytes: ByteStream): Promise<[Timeline.Dynamic[], number]> => {
                const dynamics: Timeline.Dynamic[] = [];
                const [module, type] = await getModule(bytes);
                const func = ModuleLoader.getDynamic(module as any);
                if (func === undefined) throw new ModuleNotFound(`No valid module was found for '${module.typename}(${module.version})'.`);
                if (func.main.exec === undefined) throw new NoExecFunc(`No valid exec function was found for '${module.typename}(${module.version})'.`);

                const size = await BitHelper.readInt(bytes);
                for (let i = 0; i < size; ++i) {
                    const id = await BitHelper.readInt(bytes);
                    const data = await func.main.parse(bytes, api);
                    dynamics.push({ id, data });

                    if (!exists.has(type)) exists.set(type, new Map());
                    if (exists.get(type)!.get(id) !== false) {
                        func.main.exec(id, data, api, 1);
                    }
                }
                return [dynamics, type];
            };
            for (;;) {
                await fs.cacheNetworkBuffer();

                const snapshotSize = await BitHelper.readInt(fs);
                if (snapshotSize <= 0) {
                    throw new Error(`Invalid Snapshot size of ${snapshotSize}.`);
                }
                const bytes = await fs.getBytes(snapshotSize);

                if ((state.tick % 500) === 0) ipc.send("state", state);

                const now = await BitHelper.readUInt(bytes);
                state.time = now;
                const snapshot: Timeline.Snapshot = {
                    tick: ++state.tick,
                    time: now,
                    dynamics: new Map()
                } as any;

                exists.clear();
                snapshot.events = await parseEvents(bytes); // parse events
                const nDynamicCollections = await BitHelper.readUShort(bytes);
                for (let i = 0; i < nDynamicCollections; ++i) {
                    const [dynamics, type] = await parseDynamicCollection(bytes);
                    snapshot.dynamics.set(type, dynamics); // parse dynamics
                }

                for (const tick of ModuleLoader.library.tick) {
                    tick(api);
                }

                ipc.send("snapshot", snapshot);
            }
        } catch (err) {
            if (!(err instanceof RangeError)) {
                throw new Error(`Failed to parse replay:\n\n${vm.verboseError(err)}`);
            }
        }

        ipc.send("end");
        self.close();
    }
})();