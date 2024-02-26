/* exported Replay */
declare namespace Replay {
    interface Header {
        version: string;
        isMaster: boolean;
    }
    interface Snapshot { 
        time: number;
        tick: number;
    }
}

declare namespace Timeline {


    interface Event<T = unknown> {
        delta: number;
        type: number;
        data: T;
    }

    interface Snapshot {
        tick: number;
        time: number;
    
        events: Event[];
        dynamics: Map<number, unknown[]>;
    }
}

type PartialSnapshot = Partial<Replay.Snapshot> & { tick: number, time: number }; 

class Replay {
    typemap: Map<number, Module>;
    header: Partial<Replay.Header>;
    timeline: Timeline.Snapshot[];
    snapshots: PartialSnapshot[];
    
    constructor() {
        this.typemap = new Map();
        this.header = {};
        this.timeline = [];
        this.snapshots = [];
    }

    private get(type: number): Module {
        const module = this.typemap.get(type);
        if (module === undefined) throw new UnknownModuleType(`Unknown module of type '${type}'.`);
        return module;
    }

    private exec(time: number, state: PartialSnapshot, snapshot: Timeline.Snapshot) {
        // perform events
        for (const { type, data, delta } of snapshot.events) {
            const exec = ModuleLoader.getExecFunc(this.get(type));
            exec(data, state, time >= state.time + delta ? 1 : 0);
        }

        const diff = snapshot.time - state.time;
        const largestTickRate = 0.2;
        // NOTE(randomuserhi): If the difference in time between current state and snapshot we are lerping to
        //                     is greater than the longest possible time taken between ticks, then no dynamics
        //                     have moved as they are recorded on each tick.
        if (diff <= largestTickRate) {
            const lerp = time < snapshot.time ? (time - snapshot.time) / diff : 1;

            // perform dynamics
            for (const [type, collection] of snapshot.dynamics) {
                const exec = ModuleLoader.getExecFunc(this.get(type));
                for (const data of collection) {
                    exec(data, state, lerp);
                }
            }
        } 
        
        state.tick = snapshot.tick;
        state.time = time;
    }

    private getNearestSnapshot(time: number): PartialSnapshot {
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

    public getSnapshot(time: number): PartialSnapshot {
        // Get nearest snapshot from cache
        const state = structuredClone(this.getNearestSnapshot(time));

        // extrapolate snapshot until time
        let tick = state.tick;
        for (; tick < this.timeline.length; ++tick) {
            const snapshot = this.timeline[tick];
            this.exec(time, state, snapshot);
            if (snapshot.time > state.time) break;
        }

        return state;
    }
}