import { signal, Signal } from "@/rhu/signal.js";
import { Internal } from "./internal.js";
import { ModuleDesc, ModuleLoader, NoExecFunc, ReplayApi, Typemap, UnknownModuleType } from "./moduleloader.js";

export declare namespace Timeline {
    interface Event<T = unknown> {
        delta: number;
        type: number;
        data: T;
    }

    interface Dynamic<T = unknown> {
        id: number;
        data: T;
    }

    interface Snapshot {
        tick: number;
        time: number;
    
        events: Event[];
        dynamics: Map<number, Dynamic[]>;
    }
}

export interface Snapshot {
    time: number;
    typedTime: Map<string, number>;
    tick: number;
    data: Map<string, unknown>;
}

// TODO(randomuserhi): For the sake of RAM usage, I should store a m3u8 format for timestamps to files which contain snapshots + timeline data
//                     Have the data split up across Storage and RAM much like how mp4 or streaming videos work with m3u8 to minimise RAM usage. 

// TODO(randomuserhi): should be configurable along side player lerp -> since they are related maybe tie them together?
export const largestTickRate = 200; //ms -> tick rate of 100ms (1/10) so longest possible time is 100ms. We add lee-way of an extra tick for variance.

export class Replay {
    typemap: Map<number, ModuleDesc>;
    types: Map<string, number>;
    timeline: Timeline.Snapshot[];
    snapshots: Snapshot[];
    header: Map<string, unknown>;
    private signals: Map<string, Signal<any>>;
    private cache: Snapshot | undefined;

    constructor() {
        this.signals = new Map();
        this.typemap = new Map();
        this.types = new Map();
        this.header = new Map();
        this.timeline = [];
        this.snapshots = [];
    }
    
    public getOrDefault<T extends keyof Typemap.Headers>(typename: T, def: () => Typemap.Headers[T]): Typemap.Headers[T] {
        if (typename as string === "" || typename === undefined) throw new SyntaxError("Typename cannot be blank.");
        if (!this.header.has(typename)) this.set(typename, def());
        return this.header.get(typename) as any;
    }
    public get<T extends keyof Typemap.Headers>(typename: T): Typemap.Headers[T] | undefined {
        if (typename as string === "" || typename === undefined) throw new SyntaxError("Typename cannot be blank.");
        return this.header.get(typename) as any;
    }
    public set<T extends keyof Typemap.Headers>(typename: T, value: Typemap.Headers[T]): void {
        if (typename as string === "" || typename === undefined) throw new SyntaxError("Typename cannot be blank.");
        this.header.set(typename, value);
        if (this.signals.has(typename)) {
            this.signals.get(typename)!(value);
        }
    }
    public has<T extends keyof Typemap.Headers>(typename: T): boolean{
        if (typename as string === "" || typename === undefined) throw new SyntaxError("Typename cannot be blank.");
        return this.header.has(typename);
    }
    public watch<T extends keyof Typemap.Headers>(typename: T): Signal<Typemap.Headers[T] | undefined> {
        if (typename as string === "" || typename === undefined) throw new SyntaxError("Typename cannot be blank.");
        if (!this.signals.has(typename)) {
            this.signals.set(typename, signal(this.get(typename)));
        }
        return this.signals.get(typename)!;
    }

    public api(state: Snapshot): ReplayApi {
        const replay = this;
        return {
            time(): number {
                return state.time;
            },
            tick(): number {
                return state.tick;
            },
            getOrDefault(typename: string, def: () => any): any {
                if (typename === "" || typename === undefined) throw new SyntaxError("Typename cannot be blank.");
                if (!state.data.has(typename)) state.data.set(typename, def());
                return state.data.get(typename);
            },
            get(typename: string): any {
                if (typename === "" || typename === undefined) throw new SyntaxError("Typename cannot be blank.");
                return state.data.get(typename);
            },
            set(typename: string, value: any): void {
                if (typename === "" || typename === undefined) throw new SyntaxError("Typename cannot be blank.");
                state.data.set(typename, value);
            },
            has(typename: string): boolean {
                if (typename === "" || typename === undefined) throw new SyntaxError("Typename cannot be blank.");
                return state.data.has(typename);
            },
            header: {
                getOrDefault: Replay.prototype.getOrDefault.bind(replay),
                get: Replay.prototype.get.bind(replay),
                set: Replay.prototype.set.bind(replay),
                has: Replay.prototype.has.bind(replay),
            }
        };
    }

    private getModule(type: number): ModuleDesc {
        const module = this.typemap.get(type);
        if (module === undefined) throw new UnknownModuleType(`Unknown module of type '${type}'.`);
        return module;
    }

    private exec(time: number, api: ReplayApi, state: Snapshot, snapshot: Timeline.Snapshot, exists?: Map<number, Map<number, boolean>>, future?: Set<number>) {
        if (exists === undefined) exists = new Map<number, Map<number, boolean>>();

        // perform events
        for (const { type, data, delta } of snapshot.events) {
            const module = this.typemap.get(type);
            if (module === undefined) throw new UnknownModuleType(`Unknown module type '${type}'.`);
            const timeOfEvent = snapshot.time - delta;
            const runEvent = time >= timeOfEvent;
            const adjustedAPI = { ...api, time() { return timeOfEvent; }, tick() { return snapshot.tick; } };
            if (module.typename === "ReplayRecorder.Spawn" || module.typename === "ReplayRecorder.Despawn") {
                // Special case for spawn events
                const isSpawn = module.typename === "ReplayRecorder.Spawn";
                const isDespawn = module.typename === "ReplayRecorder.Despawn";
                const exec = Internal.DynamicExec[module.typename][module.version];
                if (exec === undefined) throw new NoExecFunc(`Could not find exec function for '${module.typename}(${module.version})'.`);

                if (runEvent) {
                    exec(data, this, adjustedAPI);
                    if (isSpawn || isDespawn) {
                        const dynamicType: number = (data as any).type;
                        const id = (data as any).id;

                        if (!exists.has(dynamicType)) exists.set(dynamicType, new Map());
                        const collection = exists.get(dynamicType)!;

                        if (isDespawn) { // Despawn event has been triggered
                            collection.set(id, false);
                        } else if (isSpawn) { // Spawn event has been triggered
                            collection.set(id, true);
                        }
                    }
                } else {
                    if (isSpawn || isDespawn) {
                        const dynamicType: number = (data as any).type;
                        const id = (data as any).id;

                        if (!exists.has(dynamicType)) exists.set(dynamicType, new Map());
                        const collection = exists.get(dynamicType)!;

                        if (isSpawn) { // Spawn event has not yet been triggered
                            if (!collection.has(id)) {
                                collection.set(id, false);
                            }
                        }
                    }
                }
            } else if (runEvent) {
                const exec = ModuleLoader.getEvent(module as any)?.exec;
                if (exec === undefined) throw new NoExecFunc(`Could not find exec function for '${module.typename}(${module.version})'.`);
                exec(data as never, adjustedAPI);
            }
        }

        // Lerp state time
        const diff = snapshot.time - state.time;
        const lerp = time < snapshot.time ? (time - state.time) / diff : 1;
        let currentTime = state.time;
        let currentTick = state.tick;
        if (lerp > 0) {
            if (lerp > 1) throw new Error(`Lerp should be less than 1.`);
            currentTick = lerp === 1 ? snapshot.tick : state.tick;
            currentTime = lerp === 1 ? snapshot.time : (state.time + lerp * diff);
        }
        const currentApi: ReplayApi = { ...api, time() { return currentTime; }, tick() { return currentTick; } };

        // NOTE(randomuserhi): If the difference in time between current state and snapshot we are lerping to
        //                     is greater than the longest possible time taken between ticks, then no dynamics
        //                     have moved as they are recorded on each tick.
        //                     This is only relevant if we are lerping to this snapshot, otherwise dynamics are
        //                     executed regardless.
        if (lerp === 1 || diff <= largestTickRate) {
            for (const [type, collection] of snapshot.dynamics) {
                const module = this.getModule(type);

                if (!state.typedTime.has(module.typename)) state.typedTime.set(module.typename, state.time);
                const typedTime = state.typedTime.has(module.typename) ? state.typedTime.get(module.typename)! : state.time;
                const typedDiff = snapshot.time - typedTime;

                if (future !== undefined && snapshot.time > time && diff >= 0) {
                    if (future.has(type)) continue; // Skip because we have already processed this type once for upcoming future snapshots.
                    future.add(type);
                }

                // Lerp dynamics -> pushing "start" to largestTickRate in the event of large breaks due to non-written snapshots for changes of 0.
                const start = snapshot.time - Math.min(largestTickRate, typedDiff);
                const lerpDiff = snapshot.time - start;
                const lerp = time < snapshot.time ? (time - start) / lerpDiff : 1;
                if (lerp > 1) throw new Error(`Lerp should be between 0 and 1. ${lerp}`);
                if (lerp <= 0) continue;

                const exec = ModuleLoader.getDynamic(module as any).main.exec;
                for (const { id, data } of collection) {
                    const exist = exists.get(type)?.get(id);
                    if (exist === undefined || exist === true) {
                        exec(id, data as never, currentApi, lerp);
                    }
                }
                
                state.typedTime.set(module.typename, lerp === 1 ? snapshot.time : (typedTime + lerp * lerpDiff));
            }
        }

        state.tick = currentTick;
        state.time = currentTime;

        for (const tick of ModuleLoader.library.tick) {
            tick(api);
        }
    }

    private getNearestSnapshot(time: number): Snapshot {
        // Binary search to find nearest snapshot
        let min = 0;
        let max = this.snapshots.length;
        let prev = -1;
        while (max != min) {
            const midpoint = Math.floor((max + min) / 2);
            if (midpoint == prev) break;
            prev = midpoint;
            if (this.snapshots[midpoint].time > time)
                max = midpoint;
            else
                min = midpoint;
        }
        return this.snapshots[min];
    }

    public getSnapshot(time: number): Snapshot | undefined {
        if (this.snapshots.length === 0) return undefined;

        // Get nearest snapshot from cache
        if (this.cache === undefined || time < this.cache.time || time - this.cache.time >= 24000) {
            this.cache = this.getNearestSnapshot(time);
        }
        const state = structuredClone(this.cache);
        const api = this.api(state);

        // extrapolate snapshot until time
        let tick = state.tick; 
        for (; tick < this.timeline.length; ++tick) {
            const snapshot = this.timeline[tick];
            if (snapshot.time > state.time) break;
            this.exec(time, api, state, snapshot);
        }
        
        // NOTE(randomuserhi): Process extra snapshots to account for largestTickRate that can be encountered to smoothen
        //                     animations which occure every other tick etc...

        // Persistent exist map needs to be used to prevent error from dynamics not yet being spawned
        const exists = new Map<number, Map<number, boolean>>();
        const future = new Set<number>(); // Persistent future set to only process each dynamic type once in the future
        for (; tick < this.timeline.length; ++tick) {
            const snapshot = this.timeline[tick];
            this.exec(time, api, state, snapshot, exists, future);
            if (snapshot.time > state.time + largestTickRate) break;
        }

        return state;
    }

    public length(): number {
        return this.timeline.length === 0 ? 0 : this.timeline[this.timeline.length - 1].time;
    }
}