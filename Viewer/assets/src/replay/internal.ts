import * as BitHelper from "./bithelper.js";
import { ModuleLoader, ModuleNotFound, NoExecFunc, ReplayApi } from "./moduleloader.js";
import { Replay } from "./replay.js";
import { ByteStream } from "./stream.js";

export namespace Internal {
    export const parsers: { [v in string]: (data: ByteStream, replay: Replay) => Promise<void> } = {
        "0.0.1": async (data: ByteStream, replay: Replay) => {
            const size = await BitHelper.readUShort(data);
            for (let i = 0; i < size; ++i) {
                const type = await BitHelper.readUShort(data);
                const typename = await BitHelper.readString(data);
                const version = await BitHelper.readString(data);
                replay.typemap.set(type, {
                    typename,
                    version
                });
                replay.types.set(`${typename}(${version})`, type);
            }
        }
    };

    export const DynamicParse: { [k in "ReplayRecorder.Despawn" | "ReplayRecorder.Spawn"]: { [v in string]: (data: ByteStream, replay: Replay, snapshot: ReplayApi) => Promise<{ id: number, type: number, detail: any }> } } = {
        "ReplayRecorder.Spawn": {
            "0.0.1": async (data: ByteStream, replay: Replay, snapshot: ReplayApi) => {
                const type = await BitHelper.readUShort(data);
                const id = await BitHelper.readInt(data);
                const module = replay.typemap.get(type);
                if (module === undefined) throw new ModuleNotFound(`Could not find module of type '${type}'.`);
                const spawn = ModuleLoader.getDynamic(module as any)?.spawn?.parse;
                if (spawn === undefined) throw new ModuleNotFound(`Could not find spawn module of type '${type}'.`); 
                return {
                    id, type,
                    detail: await spawn(data, snapshot)
                };
            }
        },
        "ReplayRecorder.Despawn": {
            "0.0.1": async (data: ByteStream, replay: Replay, snapshot: ReplayApi) => {
                const type = await BitHelper.readUShort(data);
                const id = await BitHelper.readInt(data);
                const module = replay.typemap.get(type);
                if (module === undefined) throw new ModuleNotFound(`Could not find module of type '${type}'.`);
                const despawn = ModuleLoader.getDynamic(module as any)?.despawn?.parse;
                if (despawn === undefined) throw new ModuleNotFound(`Could not find despawn module of type '${type}'.`); 
                return {
                    id, type,
                    detail: await despawn(data, snapshot)
                };
            }
        }
    };

    export const DynamicExec: { [k in "ReplayRecorder.Despawn" | "ReplayRecorder.Spawn"]: { [v in string]: (data: any, replay: Replay, snapshot: ReplayApi) => void } } = {
        "ReplayRecorder.Spawn": {
            "0.0.1": (data: any, replay: Replay, snapshot: ReplayApi) => {
                const { type, id, detail } = data;
                const module = replay.typemap.get(type);
                if (module === undefined) throw new ModuleNotFound(`Could not find module of type '${type}'.`);
                const exec = ModuleLoader.getDynamic(module as any)?.spawn?.exec;
                if (exec === undefined) throw new NoExecFunc(`Could not find spawn exec function of type '${module.typename}(${module.version})'.`); 
                exec(id, structuredClone(detail) as never, snapshot);
            }
        },
        "ReplayRecorder.Despawn": {
            "0.0.1": (data: any, replay: Replay, snapshot: ReplayApi) => {
                const { type, id, detail } = data;
                const module = replay.typemap.get(type);
                if (module === undefined) throw new ModuleNotFound(`Could not find module of type '${type}'.`);
                const exec = ModuleLoader.getDynamic(module as any)?.despawn?.exec;
                if (exec === undefined) throw new NoExecFunc(`Could not find spawn exec function of type '${module.typename}(${module.version})'.`); 
                exec(id, structuredClone(detail) as never, snapshot);
            }
        }
    };
}