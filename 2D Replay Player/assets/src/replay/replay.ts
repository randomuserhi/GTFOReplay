declare namespace Timeline {
    interface Event<T = unknown> {
        eventType: number;
        dynamicType?: number;
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
}

declare namespace Snapshot {
    interface API { 
        get(typename: string, version: string): Map<number, unknown>;
        header(typename: string, version?: string): unknown;
    }
}

/* exported Replay */
class Replay {
    typemap: Map<number, Module>;
    types: Map<string, number>;
    header: Map<number, unknown>;
    timeline: Timeline.Snapshot[];
    snapshots: Snapshot[];
    
    constructor() {
        this.typemap = new Map();
        this.types = new Map();
        this.header = new Map();
        this.timeline = [];
        this.snapshots = [];
    }

    public api(state: Snapshot): Snapshot.API {
        const replay = this;
        return {
            get(typename: string, version: string): Map<number, unknown> {
                if (typename === "" || version === "" || typename === undefined || version === undefined) throw new SyntaxError("Typename or version cannot be blank.");
                const identifier = `${typename}(${version})`;
                if (!state.dynamics.has(identifier)) state.dynamics.set(identifier, new Map());
                return state.dynamics.get(identifier)!;
            },
            header(typename: string, version?: string): unknown {
                const type = replay.types.get(`${typename}(${version})`);
                if (type === undefined || !replay.header.has(type)) throw new TypeError(`Type '${typename}(${version})' does not exist.`);
                return replay.header.get(type)!;
            }
        };
    }

    private get(type: number): Module {
        const module = this.typemap.get(type);
        if (module === undefined) throw new UnknownModuleType(`Unknown module of type '${type}'.`);
        return module;
    }

    private exec(time: number, api: Snapshot.API, state: Snapshot, snapshot: Timeline.Snapshot) {
        const exists = new Map<number, Map<number, boolean>>();

        // perform events
        for (const { dynamicType, eventType, type, data, delta } of snapshot.events) {
            const exec = ModuleLoader.getExecFunc(this.get(type));
            console.log(state);
            console.log(`event: ${dynamicType} ${eventType} ${type} - ${time} >= ${snapshot.time + delta}`);
            if (time >= snapshot.time + delta) {
                exec(data, api, 1);
                if (eventType !== 0) {
                    if (dynamicType === undefined) throw new Error("Spawn / Despawn events should have a dynamic type associated with them.");
                    const id = (data as any).id;

                    if (!exists.has(dynamicType)) exists.set(dynamicType, new Map());
                    const collection = exists.get(dynamicType)!;

                    if (eventType === 2) { // Despawn event has been triggered
                        collection.set(id, false);
                    } else if (eventType === 1) { // Spawn event has been triggered
                        collection.set(id, true);
                    }
                }
            } else {
                if (eventType !== 0) {
                    if (dynamicType === undefined) throw new Error("Spawn / Despawn events should have a dynamic type associated with them.");
                    const id = (data as any).id;

                    if (!exists.has(dynamicType)) exists.set(dynamicType, new Map());
                    const collection = exists.get(dynamicType)!;

                    if (eventType === 1) { // Spawn event has not yet been triggered
                        if (!collection.has(id)) {
                            collection.set(id, false);
                        }
                    }
                }
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
                const exec = ModuleLoader.getExecFunc(this.get(type));
                for (const { id, data } of collection) {
                    const exist = exists.get(type)?.get(id);
                    if (exist === undefined || exist === true) {
                        exec(id, data, api, lerp);
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

    public getSnapshot(time: number): Snapshot {
        // Get nearest snapshot from cache
        const state = structuredClone(this.getNearestSnapshot(time));
        const api = this.api(state);

        // extrapolate snapshot until time
        let tick = state.tick + 1;
        for (; tick < this.timeline.length; ++tick) {
            const snapshot = this.timeline[tick];
            console.log(`tick: ${tick}`);
            this.exec(time, api, state, snapshot);
            if (snapshot.time > state.time) break;
        }

        return state;
    }

    public length(): number {
        return this.snapshots.length === 0 ? 0 : this.snapshots[this.snapshots.length - 1].time;
    }
}