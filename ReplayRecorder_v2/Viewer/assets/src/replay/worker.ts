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
    ipc.on("init", async (file: FileHandle, links: string[]) => {
        await Promise.all(links.map(link => import(link)));
        parse(file);
    });

    async function parse(file: FileHandle) {
        if (replay !== undefined) return;
        replay = new Replay();

        const fs = new FileStream(ipc, file);
        console.log(file.finite);

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

            // Parse Headers
            let [module] = await getModule(bytes);
            while (module?.typename !== "ReplayRecorder.EndOfHeader") {
                const func = ModuleLoader.getHeader(module as any);
                if (func === undefined) throw new ModuleNotFound(`No valid module was found for '${module.typename}(${module.version})'.`);
                await func.parse(bytes, {
                    getOrDefault: Replay.prototype.getOrDefault.bind(replay),
                    get: Replay.prototype.get.bind(replay),
                    set: Replay.prototype.set.bind(replay),
                    has: Replay.prototype.has.bind(replay)
                });
                [module] = await getModule(bytes);
            }

            ipc.send("eoh", replay.typemap, replay.types, replay.header);

            // Parse snapshots
            const state: Snapshot = {
                tick: 0,
                time: 0,
                dynamics: new Map(),
                data: new Map()
            };
            const api = replay.api(state);
            const parseEvents = async (bytes: ByteStream): Promise<Timeline.Event[]> => {
                if (replay === undefined) throw new Error(`No replay was found - Parsing has not yet been started.`);

                const events: Timeline.Event[] = [];
                const size = await BitHelper.readInt(bytes);
                for (let i = 0; i < size; ++i) {
                    const delta = await BitHelper.readUShort(bytes);
                    const [module, type] = await getModule(bytes);

                    let data: any = undefined;
                    if (module.typename === "ReplayRecorder.Despawn" || module.typename === "ReplayRecorder.Spawn") {
                        // Special case to parse spawn and despawn events
                        const parse = Internal.DynamicParse[module.typename][module.version];
                        if (parse === undefined) throw new ModuleNotFound(`No valid module was found for '${module.typename}(${module.version})'.`);
                        data = await parse(bytes, replay);
                        events.push({
                            type,
                            delta,
                            data
                        });
                        const exec = Internal.DynamicExec[module.typename][module.version];
                        if (exec === undefined) throw new NoExecFunc(`No valid exec function was found for '${module.typename}(${module.version})'.`);
                        exec(data, replay, api);
                    } else {
                        // Parse regular events
                        const func = ModuleLoader.getEvent(module as any);
                        if (func === undefined) throw new ModuleNotFound(`No valid module was found for '${module.typename}(${module.version})'.`);
                        data = await func.parse(bytes);
                        events.push({
                            type,
                            delta,
                            data
                        });
                        if (func.exec === undefined) throw new NoExecFunc(`No valid exec function was found for '${module.typename}(${module.version})'.`);
                        func.exec(data as never, api);
                    }
                }
                return events.sort((a, b) => b.delta - a.delta);
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
                    const data = await func.main.parse(bytes);
                    dynamics.push({ id, data });
                    func.main.exec(id, data, api, 1);
                }
                return [dynamics, type];
            };
            for (;;) {
                const snapshotSize = await BitHelper.readInt(fs);
                if (snapshotSize <= 0) {
                    throw new Error(`Invalid Snapshot size of ${snapshotSize}.`);
                }
                const bytes = await fs.getBytes(snapshotSize);

                if ((state.tick % 50) === 0) ipc.send("state", state);

                const now = await BitHelper.readUInt(bytes);
                state.time = now;
                const snapshot: Timeline.Snapshot = {
                    tick: ++state.tick,
                    time: now,
                    dynamics: new Map()
                } as any;

                snapshot.events = await parseEvents(bytes); // parse events
                const nDynamicCollections = await BitHelper.readUShort(bytes);
                for (let i = 0; i < nDynamicCollections; ++i) {
                    const [dynamics, type] = await parseDynamicCollection(bytes);
                    snapshot.dynamics.set(type, dynamics); // parse dynamics
                }
                
                ipc.send("snapshot", snapshot);
            }
        } catch (err) {
            if (!(err instanceof RangeError)) {
                throw err;
            }
        }

        ipc.send("end");
        self.close();
    }
})();