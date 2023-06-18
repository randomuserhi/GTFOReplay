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
    current: GTFOReplay; // for debugging
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

    let eventParseMap: Record<GTFOEventType, (bytes: DataView, reader: Reader, parser: GTFOSnapshot) => GTFOEvent> = {
        "unknown": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            throw new Error("Unknown event type");
        },
        "playerJoin": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            let e: GTFOEventPlayerJoin = {
                player: BitHelper.readULong(bytes, reader), // player id
                instance: BitHelper.readInt(bytes, reader), // player instance id
                slot: BitHelper.readByte(bytes, reader), // player slot
                name: BitHelper.readString(bytes, reader)
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
        },
        "enemySpawn": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            let e: GTFOEventEnemySpawn = {
                instance: BitHelper.readInt(bytes, reader), // enemy instance id
                state: GTFOEnemyStateMap[BitHelper.readByte(bytes, reader)], // enemy state
                type: GTFOSpecification.enemies[BitHelper.readByte(bytes, reader)] // enemy type
            };
            return {
                type: "enemySpawn",
                detail: e
            };
        },
        "enemyDespawn": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            let e: GTFOEventEnemyDespawn = {
                instance: BitHelper.readInt(bytes, reader) // enemy instance id
            };
            return {
                type: "enemyDespawn",
                detail: e
            };
        },
        "enemyDead": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            let e: GTFOEventEnemyDead = {
                instance: BitHelper.readInt(bytes, reader) // enemy instance id
            };
            return {
                type: "enemyDead",
                detail: e
            };
        },
        "enemyChangeState": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            let e: GTFOEventEnemyChangeState = {
                instance: BitHelper.readInt(bytes, reader), // enemy instance id
                state: GTFOEnemyStateMap[BitHelper.readByte(bytes, reader)] // state
            };
            return {
                type: "enemyChangeState",
                detail: e
            };
        },
        "enemyBulletDamage": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            let e: GTFOEventEnemyBulletDamage = {
                instance: BitHelper.readInt(bytes, reader), // enemy instance id
                damage: BitHelper.readHalf(bytes, reader), // damage
                slot: 255, // player slot
                sentry: false
            };
            let temp = BitHelper.readByte(bytes, reader);
            e.slot = temp & 0b1111;
            e.sentry = (temp & 0b10000000) == 0b10000000;
            return {
                type: "enemyBulletDamage",
                detail: e
            };
        },
        "enemyMeleeDamage": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            let e: GTFOEventEnemyMeleeDamage = {
                instance: BitHelper.readInt(bytes, reader), // enemy instance id
                damage: BitHelper.readHalf(bytes, reader), // damage
                slot: BitHelper.readByte(bytes, reader) // player slot
            };
            return {
                type: "enemyMeleeDamage",
                detail: e
            };
        },
        "enemyMineDamage": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            // TODO(randomuserhi)
            throw new Error("Not Implemented");
        },
        "playerDead": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            let e: GTFOEventPlayerDead = {
                slot: BitHelper.readByte(bytes, reader)
            };
            return {
                type: "playerDead",
                detail: e
            };
        },
        "playerRevive": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            let e: GTFOEventPlayerRevive = {
                slot: BitHelper.readByte(bytes, reader),
                source: BitHelper.readByte(bytes, reader)
            };
            return {
                type: "playerRevive",
                detail: e
            };
        },
        "playerTongueDamage": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            let e: GTFOEventPlayerTongueDamage = {
                slot: BitHelper.readByte(bytes, reader),
                damage: BitHelper.readHalf(bytes, reader),
                source: BitHelper.readInt(bytes, reader)
            };
            return {
                type: "playerTongueDamage",
                detail: e
            };
        },
        "playerMeleeDamage": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            let e: GTFOEventPlayerMeleeDamage = {
                slot: BitHelper.readByte(bytes, reader),
                damage: BitHelper.readHalf(bytes, reader),
                source: BitHelper.readInt(bytes, reader)
            };
            return {
                type: "playerMeleeDamage",
                detail: e
            };
        },
        "playerPelletDamage": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            let e: GTFOEventPlayerPelletDamage = {
                slot: BitHelper.readByte(bytes, reader),
                damage: BitHelper.readHalf(bytes, reader),
                source: BitHelper.readInt(bytes, reader)
            };
            return {
                type: "playerPelletDamage",
                detail: e
            };
        },
        "playerBulletDamage": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            let e: GTFOEventPlayerBulletDamage = {
                slot: BitHelper.readByte(bytes, reader),
                damage: BitHelper.readHalf(bytes, reader),
                source: BitHelper.readByte(bytes, reader)
            };
            return {
                type: "playerBulletDamage",
                detail: e
            };
        },
        "playerMineDamage": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            // TODO(randomuserhi)
            throw new Error("Not Implemented");
        },
        "playerFallDamage": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            let e: GTFOEventPlayerFallDamage = {
                slot: BitHelper.readByte(bytes, reader),
                damage: BitHelper.readHalf(bytes, reader)
            };
            return {
                type: "playerFallDamage",
                detail: e
            };
        },
        "playerPelletDodge": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            let e: GTFOEventPlayerPelletDodge = {
                slot: BitHelper.readByte(bytes, reader),
                source: BitHelper.readInt(bytes, reader)
            };
            return {
                type: "playerPelletDodge",
                detail: e
            };
        },
        "playerTongueDodge": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            let e: GTFOEventPlayerTongueDodge = {
                slot: BitHelper.readByte(bytes, reader),
                source: BitHelper.readInt(bytes, reader)
            };
            return {
                type: "playerTongueDodge",
                detail: e
            };
        },
        "playerWield": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            let e: GTFOEventPlayerWield = {
                slot: BitHelper.readByte(bytes, reader),
                item: BitHelper.readByte(bytes, reader)
            };
            return {
                type: "playerWield",
                detail: e
            };
        },
        "doorChangeState": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            let e: GTFOEventDoorChangeState = {
                id: BitHelper.readByte(bytes, reader),
                state: GTFODoorStateMap[BitHelper.readByte(bytes, reader)]
            };
            return {
                type: "doorChangeState",
                detail: e
            };
        },
        "doorDamage": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            let e: GTFOEventDoorDamage = {
                id: BitHelper.readByte(bytes, reader)
            };
            return {
                type: "doorDamage",
                detail: e
            };
        },
        "spawnMine": function(bytes: DataView, reader: Reader, parser: GTFOSnapshot): GTFOEvent
        {
            let e: GTFOEventMineSpawn = {
                slot: BitHelper.readByte(bytes, reader),
                type: GTFOSpecification.mines[BitHelper.readByte(bytes, reader)],
                instance: BitHelper.readInt(bytes, reader),
                position: BitHelper.readVector(bytes, reader),
                rotation: BitHelper.readHalfQuaternion(bytes, reader)
            };
            e.position.x *= GTFOReplaySettings.scale;
            e.position.y *= GTFOReplaySettings.scale;
            e.position.z *= GTFOReplaySettings.scale;
            return {
                type: "spawnMine",
                detail: e
            };
        },
        "despawnMine": function(bytes: DataView, reader: Reader)
        {
            let e: GTFOEventMineDespawn = {
                instance: BitHelper.readInt(bytes, reader)
            };
            return {
                type: "despawnMine",
                detail: e
            };
        },
        "explodeMine": function(bytes: DataView, reader: Reader)
        {
            let e: GTFOEventMineExplode = {
                instance: BitHelper.readInt(bytes, reader)
            };
            return {
                type: "explodeMine",
                detail: e
            };
        },
        "tripline": function(bytes: DataView, reader: Reader)
        {
            let e: GTFOEventMineTripLine = {
                instance: BitHelper.readInt(bytes, reader),
                length: BitHelper.readHalf(bytes, reader)
            };
            return {
                type: "tripline",
                detail: e
            };
        },
        "spawnSentry": function(bytes: DataView, reader: Reader)
        {
            let e: GTFOEventSentrySpawn = {
                slot: BitHelper.readByte(bytes, reader),
                instance: BitHelper.readInt(bytes, reader),
                position: BitHelper.readVector(bytes, reader)
            };
            return {
                type: "spawnSentry",
                detail: e
            };
        },
        "despawnSentry": function(bytes: DataView, reader: Reader)
        {
            let e: GTFOEventSentryDespawn = {
                instance: BitHelper.readInt(bytes, reader)
            };
            return {
                type: "despawnSentry",
                detail: e
            };
        },
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
        const snapshotRate = 50;
        let tick = 0;
        let parser: GTFOSnapshot = new GTFOSnapshot(this);
        this.snapshots = [GTFOSnapshot.clone(parser)];
        while(reader.index < bytes.byteLength)
        {
            // Tick timestamp
            let now = BitHelper.readUInt(bytes, reader);

            // Create snapshot checkpoint
            if (tick++ % snapshotRate == 0)
            {
                this.snapshots.push(new GTFOSnapshot(this, tick, this.timeline.length, now, parser));
            }
            let startIdx = this.timeline.length;

            // Number of events
            let nEvents = BitHelper.readUShort(bytes, reader);
            for (let i = 0; i < nEvents; ++i)
            {
                // type of event
                let type = eventMap[BitHelper.readByte(bytes, reader)];
                let rel = BitHelper.readUShort(bytes, reader); // relative time to last tick
                let timestamp = now - rel;

                let e = eventParseMap[type](bytes, reader, parser);
                let t: GTFOTimeline = {
                    tick: tick,
                    type: "event",
                    time: timestamp,
                    order: i,
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

                // scale positions accordingly
                position.x *= GTFOReplaySettings.scale;
                position.y *= GTFOReplaySettings.scale;
                position.z *= GTFOReplaySettings.scale;

                // Update dynamic position
                if (!parser.dynamics.has(instance))
                    throw new ReferenceError(`Unknown dynamic: ${instance} was encountered.`);

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
                    order: i,
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
        }
        this.timeline.sort((a, b) => {
            if (a.time == b.time)
            {
                // If time is the same, sort by tick
                if (a.tick != b.tick) return a.tick - b.tick;
                // If type is the same, give precedence to order
                else if (a.type == b.type) return a.order - b.order;
                // otherwise give precedence to event
                else
                {
                    if (a.type == "event") return -1;
                    else return 1;
                }
            }
            return a.time - b.time
        });
        window.current = this;
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
        snapshot.time = time;

        return snapshot;
    };

})();



