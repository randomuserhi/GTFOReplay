import { signal, Signal } from "@/rhu/signal.js";
import { Internal } from "./internal.js";
import type { IndexedEvent } from "../main/interface.js";
import { TimeRange, validateRange } from "./transport.js";
import type { ClipSelection } from "../../../shared/clip.js";
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

export interface ReplayBlock { state: Snapshot; timeline: Timeline.Snapshot[] }

// TODO(randomuserhi): should be configurable along side player lerp -> since they are related maybe tie them together?
export const largestTickRate = 200; //ms -> tick rate of 100ms (1/10) so longest possible time is 100ms. We add lee-way of an extra tick for variance.

export class Replay {
    identity?: string;
    cacheToken?: string;
    startTime = 0;
    endTime?: number;
    events: IndexedEvent[] = [];
    range?: TimeRange;
    looping = false;
    setRange(range: TimeRange) { validateRange(range, this.length()); if (range.start < this.startTime) throw new Error("Interval begins before this clip."); this.range = range; }
    clipSelection(start: number, end: number): ClipSelection {
        if (this.error) throw new Error("Cannot export a replay with a parsing or rendering error. Export its diagnostic report instead.");
        validateRange({ start, end }, this.length());
        if (!this.complete || start < this.startTime) throw new Error("Wait for replay indexing before exporting an interval.");
        const first = this.blocks.findIndex(block => block.end >= start);
        const blocks = this.blocks.slice(first).filter(block => block.start <= end + largestTickRate);
        if (first < 0 || !blocks.length) throw new Error("Replay interval is unavailable.");
        return { start, end, sourceIdentity: this.identity, blocks, typemap: this.typemap, types: this.types, header: this.header, events: this.events.filter(event => event.time >= start && event.time <= end) };
    }
    typemap: Map<number, ModuleDesc>;
    types: Map<string, number>;
    readonly blocks: { id: number; start: number; end: number }[] = [];
    loadBlock?: (id: number) => Promise<ReplayBlock>;
    preview?: ReplayBlock;
    loading = false;
    complete = false;
    error?: Error;
    private readonly loadedBlocks = new Map<number, ReplayBlock>();
    private cursor?: { block: ReplayBlock; next?: ReplayBlock; timeline: Timeline.Snapshot[];
        state: Snapshot; tick: number; exists: Map<number, Map<number, boolean>> };
    header: Map<string, unknown>;
    private signals: Map<string, Signal<any>>;

    constructor() {
        this.signals = new Map();
        this.typemap = new Map();
        this.types = new Map();
        this.header = new Map();
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
            try {
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
            } catch (err) {
                console.error(err);
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
                    try {
                        if (exist === undefined || exist === true) {
                            exec(id, data as never, currentApi, lerp);
                        }
                    } catch (err) {
                        console.log(exist);
                        console.error(err);
                    }
                }
                
                state.typedTime.set(module.typename, lerp === 1 ? snapshot.time : (typedTime + lerp * lerpDiff));
            }
        }

        state.tick = currentTick;
        state.time = currentTime;

        for (const tick of ModuleLoader.library.tick) {
            try {
                tick(api);
            } catch (err) {
                console.error(err);
            }
        }
    }

    private async block(id: number): Promise<ReplayBlock> {
        let block = this.loadedBlocks.get(id);
        if (block === undefined) {
            if (!this.loadBlock) throw new Error("Replay cache is unavailable.");
            this.loading = true;
            try { block = await this.loadBlock(id); }
            finally { this.loading = false; }
        }
        this.loadedBlocks.delete(id);
        this.loadedBlocks.set(id, block);
        while (this.loadedBlocks.size > 2) this.loadedBlocks.delete(this.loadedBlocks.keys().next().value!);
        return block;
    }

    public async getSnapshot(time: number): Promise<Snapshot | undefined> {
        if (time > this.loadedLength()) return undefined;
        let min = 0, max = this.blocks.length;
        while (min < max) {
            const mid = (min + max) >>> 1;
            if (this.blocks[mid].end < time) min = mid + 1;
            else max = mid;
        }
        let block: ReplayBlock | undefined;
        let next: ReplayBlock | undefined;
        if (min < this.blocks.length) {
            block = await this.block(this.blocks[min].id);
            if (time + largestTickRate >= this.blocks[min].end) {
                next = min + 1 < this.blocks.length ? await this.block(this.blocks[min + 1].id) : this.preview;
            }
        } else block = this.preview ?? (this.complete && this.blocks.length ? await this.block(this.blocks[this.blocks.length - 1].id) : undefined);
        if (!block) return undefined;
        // Retain only committed ticks. Interpolated/future state belongs to the
        // returned frame and must never feed the next frame's event execution.
        let cursor = this.cursor;
        if (!cursor || cursor.block !== block || cursor.next !== next || time < cursor.state.time) {
            const state = structuredClone(block.state);
            const timeline = next ? [...block.timeline, ...next.timeline] : block.timeline;
            cursor = this.cursor = {block, next, timeline, state, tick: 0, exists: new Map()};
            const api = this.api(state);
            while (cursor.tick < timeline.length && timeline[cursor.tick].time <= state.time)
                this.exec(time, api, state, timeline[cursor.tick++]);
        }
        const {timeline} = cursor;
        const committedApi = this.api(cursor.state);
        while (cursor.tick < timeline.length && timeline[cursor.tick].time <= time) {
            this.exec(time, committedApi, cursor.state, timeline[cursor.tick++], cursor.exists);
        }
        const state = structuredClone(cursor.state);
        const api = this.api(state);
        let tick = cursor.tick;
        const exists = new Map([...cursor.exists].map(([type, ids]) => [type, new Map(ids)]));
        const future = new Set<number>(); // Persistent future set to only process each dynamic type once in the future
        for (; tick < timeline.length; ++tick) {
            const snapshot = timeline[tick];
            this.exec(time, api, state, snapshot, exists, future);
            if (snapshot.time > state.time + largestTickRate) break;
        }

        // The completion timestamp can follow the final tick. Hold that state
        // through the recording's tail without inventing further game updates.
        if (this.complete && !this.error && time > timeline[timeline.length - 1]?.time) state.time = time;
        return state;
    }

    public length(): number {
        return this.endTime ?? this.loadedLength();
    }
    public loadedLength(): number {
        if (this.complete && !this.error && this.endTime !== undefined) return this.endTime;
        return Math.min(this.endTime ?? Infinity, this.preview?.timeline[this.preview.timeline.length - 1]?.time ?? this.blocks[this.blocks.length - 1]?.end ?? 0);
    }
    public async step(time: number, direction: number): Promise<number> {
        let index = this.blocks.findIndex(block => block.end >= time);
        if (index < 0) index = this.blocks.length;
        const frames: Timeline.Snapshot[] = [];
        for (let i = Math.max(0, index - 1); i <= Math.min(this.blocks.length - 1, index + 1); ++i) {
            frames.push(...(await this.block(this.blocks[i].id)).timeline);
        }
        if (index >= this.blocks.length - 1 && this.preview) frames.push(...this.preview.timeline);
        const times = frames.map(frame => frame.time).filter(time => time >= this.startTime && time <= this.loadedLength());
        return direction < 0 ? [...times].reverse().find(value => value < time) ?? this.startTime : times.find(value => value > time) ?? this.loadedLength();
    }
}
