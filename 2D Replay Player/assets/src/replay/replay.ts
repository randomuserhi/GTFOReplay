declare namespace Timeline {
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

interface Snapshot {
    time: number;
    tick: number;
    dynamics: Map<string, Map<number, Timeline.Dynamic>>;
    data: Map<string, unknown>;
}

declare namespace Replay {
    interface Api { 
        buffer<T extends keyof Typemap.Buffers>(typename: T): Map<any, Typemap.Buffers[T]>;
        data: {
            get<T extends keyof Typemap.Data>(typename: T): Typemap.Data[T] | undefined;
            set<T extends keyof Typemap.Data>(typename: T, value: Typemap.Data[T]): void;
            has<T extends keyof Typemap.Data>(typename: T): boolean;
        };
        header: {
            get<T extends keyof Typemap.Headers>(typename: T): Typemap.Headers[T] | undefined;
            set<T extends keyof Typemap.Headers>(typename: T, value: Typemap.Headers[T]): void;
            has<T extends keyof Typemap.Headers>(typename: T): boolean;
        }
    }
}

/* exported Replay */
class Replay {
    typemap: Map<number, ModuleDesc>;
    types: Map<string, number>;
    header: Map<string, unknown>;
    timeline: Timeline.Snapshot[];
    snapshots: Snapshot[];
    
    constructor() {
        this.typemap = new Map();
        this.types = new Map();
        this.header = new Map();
        this.timeline = [];
        this.snapshots = [];
    }
    
    public get<T extends keyof Typemap.Headers>(typename: T): Typemap.Headers[T] | undefined {
        if (typename as string === "" || typename === undefined) throw new SyntaxError("Typename cannot be blank.");
        return this.header.get(typename) as any;
    }
    public set<T extends keyof Typemap.Headers>(typename: T, value: Typemap.Headers[T]): void {
        if (typename as string === "" || typename === undefined) throw new SyntaxError("Typename cannot be blank.");
        this.header.set(typename, value);
    }
    public  has<T extends keyof Typemap.Headers>(typename: T): boolean{
        if (typename as string === "" || typename === undefined) throw new SyntaxError("Typename cannot be blank.");
        return this.header.has(typename);
    }

    public api(state: Snapshot): Replay.Api {
        const replay = this;
        return {
            data: {
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
                }
            },
            buffer(typename: string): Map<number, unknown> {
                if (typename === "" || typename === undefined) throw new SyntaxError("Typename cannot be blank.");
                if (!state.dynamics.has(typename)) state.dynamics.set(typename, new Map());
                return state.dynamics.get(typename)!;
            },
            header: {
                get: Replay.prototype.get.bind(replay),
                set: Replay.prototype.set.bind(replay),
                has: Replay.prototype.has.bind(replay),
            }
        } as any;
    }

    private getModule(type: number): ModuleDesc {
        const module = this.typemap.get(type);
        if (module === undefined) throw new UnknownModuleType(`Unknown module of type '${type}'.`);
        return module;
    }

    private exec(time: number, api: Replay.Api, state: Snapshot, snapshot: Timeline.Snapshot) {
        const exists = new Map<number, Map<number, boolean>>();

        // perform events
        for (const { type, data, delta } of snapshot.events) {
            const module = this.typemap.get(type);
            if (module === undefined) throw new UnknownModuleType(`Unknown module type '${type}'.`);
            const runEvent = time >= snapshot.time - delta;
            if (module.typename === "ReplayRecorder.Spawn" || module.typename === "ReplayRecorder.Despawn") {
                // Special case for spawn events
                const isSpawn = module.typename === "ReplayRecorder.Spawn";
                const isDespawn = module.typename === "ReplayRecorder.Despawn";
                const exec = Internal.DynamicExec[module.typename][module.version];
                if (exec === undefined) throw new NoExecFunc(`Could not find exec function for '${module.typename}(${module.version})'.`);

                if (runEvent) {
                    exec(data, this, api);
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
                exec(data as never, api);
            }
        }

        const diff = snapshot.time - state.time;
        const lerp = time < snapshot.time ? (time - state.time) / diff : 1;
        const largestTickRate = 0.2;
        // NOTE(randomuserhi): If the difference in time between current state and snapshot we are lerping to
        //                     is greater than the longest possible time taken between ticks, then no dynamics
        //                     have moved as they are recorded on each tick.
        if (diff <= largestTickRate) {
            // perform dynamics
            for (const [type, collection] of snapshot.dynamics) {
                const exec = ModuleLoader.getDynamic(this.getModule(type) as any).main.exec;
                for (const { id, data } of collection) {
                    const exist = exists.get(type)?.get(id);
                    if (exist === undefined || exist === true) {
                        exec(id, data as never, api, lerp);
                    }
                }
            }
        } 
        
        state.tick = lerp === 1 ? snapshot.tick : state.tick;
        state.time = lerp === 1 ? snapshot.time : (state.time + lerp * diff);
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
        const state = structuredClone(this.getNearestSnapshot(time));
        const api = this.api(state);

        // extrapolate snapshot until time
        let tick = state.tick;
        for (; tick < this.timeline.length; ++tick) {
            const snapshot = this.timeline[tick];
            this.exec(time, api, state, snapshot);
            if (snapshot.time > state.time) break;
        }

        return state;
    }

    public length(): number {
        return this.snapshots.length === 0 ? 0 : this.snapshots[this.snapshots.length - 1].time;
    }
}