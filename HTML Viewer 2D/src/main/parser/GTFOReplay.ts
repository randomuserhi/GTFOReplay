interface Vector
{
    x: number;
    y: number;
    z: number;
}

interface Quaternion
{
    x: number;
    y: number;
    z: number;
    w: number;
}

interface Mesh
{
    vertices: Vector[];
    indices: number[];
}

declare var GTFOReplay: GTFOReplayConstructor;
interface Window
{
    currentReplay: GTFOReplay; // for debugging
    GTFOReplay: GTFOReplayConstructor;
}

interface GTFOReplay
{
    dimensions: Map<number, GTFODimension>;
    timeline: GTFOTimeline[];
    snapshots: GTFOSnapshot[];
    ticks: Map<number, number[]>; // Map of tick to range in timeline

    getNearestSnapshot(time: number): GTFOSnapshot;
    getSnapshot(time: number): GTFOSnapshot;
}
interface GTFOReplayConstructor
{
    new(binary: ArrayBuffer): GTFOReplay;
    prototype: GTFOReplay;
}

(function() {

    let eventParseMap: Record<GTFOEventType, (bytes: DataView, reader: Reader) => GTFOEvent> = {
        "playerJoin": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            let e: GTFOEventPlayerJoin = {
                player: BitHelper.readULong(bytes, reader), // player id
                instance: BitHelper.readInt(bytes, reader) // player instance id
            };
            return {
                type: "playerJoin",
                detail: e
            };
        },
        "playerLeave": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            let e: GTFOEventPlayerLeave = {
                player: BitHelper.readULong(bytes, reader), // player id
                instance: BitHelper.readInt(bytes, reader) // player instance id
            };
            return {
                type: "playerLeave",
                detail: e
            };
        }
    }

    let GTFOReplay: GTFOReplayConstructor = window.GTFOReplay = function(this: GTFOReplay, binary: ArrayBuffer)
    {
        this.dimensions = new Map();

        let bytes: DataView = new DataView(binary);
        let reader: Reader = new Reader();

        // Parse map data
        let nDimensions = BitHelper.readByte(bytes, reader);
        for (let i = 0; i < nDimensions; ++i)
        {
            let dimension = GTFODimension.parse(bytes, reader);
            this.dimensions.set(dimension.index, dimension);
        }
    
        // Parse timeline data
        this.timeline = [];
        this.ticks = new Map();
        const tickRate = 20;
        const msBetweenTicks = 1000 / tickRate;
        const snapshotRate = 50;
        let tick = 0;
        let prev = 0;
        let parser: GTFOSnapshot = new GTFOSnapshot();
        this.snapshots = [GTFOSnapshot.clone(parser)];
        while(reader.index < bytes.byteLength)
        {
            // Tick timestamp
            let now = BitHelper.readUInt(bytes, reader);
            let delta = now - prev;

            // Create snapshot checkpoint
            if (tick++ % 50 == 0)
            {
                this.snapshots.push(new GTFOSnapshot(tick, this.timeline.length, now, parser));
            }
            let startIdx = this.timeline.length;

            // Number of events
            let nEvents = BitHelper.readUShort(bytes, reader);
            for (let i = 0; i < nEvents; ++i)
            {
                // type of event
                let type = eventMap[BitHelper.readByte(bytes, reader)];
                let rel = BitHelper.readUShort(bytes, reader); // relative time to last tick
                let timestamp = prev + rel;

                let e = eventParseMap[type](bytes, reader);
                let t: GTFOTimeline = {
                    tick: tick,
                    type: "event",
                    time: timestamp,
                    detail: e
                };
                parser.do(t);
                this.timeline.push(t);
            }

            // Number of dynamics that need updating
            let nDynamics = BitHelper.readUShort(bytes, reader);
            for (let i = 0; i < nDynamics; ++i)
            {
                let absolute = BitHelper.readByte(bytes, reader) == 1;
                let instance = BitHelper.readInt(bytes, reader);
                let position;
                if (absolute) position = BitHelper.readVector(bytes, reader);
                else position = BitHelper.readHalfVector(bytes, reader);
                let rotation = BitHelper.readHalfQuaternion(bytes, reader);

                // Update dynamic position
                if (!parser.dynamics.has(instance))
                    throw new ReferenceError(`Unknown dynamic: ${instance} was encountered.`);
                else
                {
                    // If dynamic existed previously and delta exceeds 1.5 ticks, add intermediate to prevent sliding
                    if (delta > 1.5 * msBetweenTicks)
                    {
                        let dynamic = parser.dynamics.get(instance)!;
                        this.timeline.push({
                            tick: tick,
                            type: "dynamic",
                            time: now - msBetweenTicks,
                            detail: {
                                instance: instance,
                                position: {
                                    x: dynamic.position.x,
                                    y: dynamic.position.y,
                                    z: dynamic.position.z
                                },
                                rotation: {
                                    x: dynamic.rotation.x,
                                    y: dynamic.rotation.y,
                                    z: dynamic.rotation.z,
                                    w: dynamic.rotation.w
                                }
                            }
                        });
                    } 
                }
                let dynamic = parser.dynamics.get(instance)!;
                if (absolute) dynamic.position = position;
                else
                {
                    dynamic.position.x += position.x;
                    dynamic.position.y += position.y;
                    dynamic.position.z += position.z;
                }
                dynamic.rotation = rotation;

                // Add to timeline
                this.timeline.push({
                    tick: tick,
                    type: "dynamic",
                    time: now,
                    detail: {
                        instance: instance,
                        position: {
                            x: dynamic.position.x,
                            y: dynamic.position.y,
                            z: dynamic.position.z
                        },
                        rotation: {
                            x: dynamic.rotation.x,
                            y: dynamic.rotation.y,
                            z: dynamic.rotation.z,
                            w: dynamic.rotation.w
                        }
                    }
                });
            }

            this.ticks.set(tick, [startIdx, this.timeline.length]);
            prev = now;
        }
        this.timeline.sort((a, b) => {
            // Give precedence to events
            if (a.time == b.time && a.type != b.type)
            {
                if (a.type == "event") return -1;
                else return 1;
            }
            return a.time - b.time
        });
        window.currentReplay = this;
    } as Function as GTFOReplayConstructor;
    GTFOReplay.prototype.getNearestSnapshot = function(time: number): GTFOSnapshot
    {
        // Binary search to find nearest snapshot
        let min = 0;
        let max = this.snapshots.length;
        let prev = -1;
        while (max != min)
        {
            let midpoint = Math.floor((max + min) / 2);
            if (midpoint == prev) break;
            prev = midpoint;
            if (this.snapshots[midpoint].time > time)
                max = midpoint;
            else
                min = midpoint;
        }
        return this.snapshots[min];
    };
    GTFOReplay.prototype.getSnapshot = function(time: number): GTFOSnapshot
    {
        // Get nearest snapshot from cache
        let snapshot = GTFOSnapshot.clone(this.getNearestSnapshot(time));

        // extrapolate snapshot until time
        for (let i = snapshot.index; i < this.timeline.length; ++i)
        {
            let t = this.timeline[i];
            if (t.time > time) break;
            snapshot.do(t);
        }

        // lerp dynamics to next tick
        let tickRange = this.ticks.get(snapshot.tick + 1);
        if (!RHU.exists(tickRange)) return snapshot; // end of timeline
        
        for (let i = tickRange[0]; i < tickRange[1]; ++i)
        {
            let t = this.timeline[i];
            snapshot.lerp(time, t);
        }

        return snapshot;
    };

})();



