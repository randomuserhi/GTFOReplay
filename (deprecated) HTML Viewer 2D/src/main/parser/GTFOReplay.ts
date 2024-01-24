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

    getNearestSnapshot(time: number): GTFOSnapshot;
    getSnapshot(time: number): GTFOSnapshot;
}
interface GTFOReplayConstructor
{
    new(binary: ArrayBuffer): GTFOReplay;
    prototype: GTFOReplay;
}

(function() {

    let eventParseMap: Record<GTFOEventType, (bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number, parser: GTFOSnapshot) => GTFOTimeline> = {
        "unknown": function(bytes: DataView, reader: Reader): GTFOTimeline
        {
            throw new Error("Unknown event type");
        },
        "playerJoin": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventPlayerJoin = {
                player: BitHelper.readULong(bytes, reader), // player id
                instance: BitHelper.readInt(bytes, reader), // player instance id
                slot: BitHelper.readByte(bytes, reader), // player slot
                name: BitHelper.readString(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "playerJoin",
                    detail: e
                }
            };
        },
        "playerLeave": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventPlayerLeave = {
                player: BitHelper.readULong(bytes, reader), // player id
                instance: BitHelper.readInt(bytes, reader) // player instance id
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "playerLeave",
                    detail: e
                }
            };
        },
        "enemySpawn": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventEnemySpawn = {
                instance: BitHelper.readInt(bytes, reader), // enemy instance id
                state: GTFOEnemyBehaviourStateMap[BitHelper.readByte(bytes, reader)], // enemy state
                type: GTFOSpecification.enemies[BitHelper.readByte(bytes, reader)] // enemy type
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "enemySpawn",
                    detail: e
                }
            };
        },
        "enemyDespawn": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventEnemyDespawn = {
                instance: BitHelper.readInt(bytes, reader) // enemy instance id
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "enemyDespawn",
                    detail: e
                }
            };
        },
        "enemyDead": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventEnemyDead = {
                instance: BitHelper.readInt(bytes, reader) // enemy instance id
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "enemyDead",
                    detail: e
                }
            };
        },
        "enemyBehaviourChangeState": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventEnemyBehaviourChangeState = {
                instance: BitHelper.readInt(bytes, reader), // enemy instance id
                state: GTFOEnemyBehaviourStateMap[BitHelper.readByte(bytes, reader)] // state
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "enemyBehaviourChangeState",
                    detail: e
                }
            };
        },
        "enemyLocomotionChangeState": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventEnemyLocomotionChangeState = {
                instance: BitHelper.readInt(bytes, reader), // enemy instance id
                state: GTFOEnemyLocomotionStateMap[BitHelper.readByte(bytes, reader)] // state
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "enemyLocomotionChangeState",
                    detail: e
                }
            };
        },
        "enemyBulletDamage": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
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
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "enemyBulletDamage",
                    detail: e
                }
            };
        },
        "enemyMeleeDamage": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventEnemyMeleeDamage = {
                instance: BitHelper.readInt(bytes, reader), // enemy instance id
                damage: BitHelper.readHalf(bytes, reader), // damage
                slot: BitHelper.readByte(bytes, reader) // player slot
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "enemyMeleeDamage",
                    detail: e
                }
            };
        },
        "enemyMineDamage": function(): GTFOTimeline
        {
            // TODO(randomuserhi)
            throw new Error("Not Implemented");
        },
        "playerDead": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventPlayerDead = {
                slot: BitHelper.readByte(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "playerDead",
                    detail: e
                }
            };
        },
        "playerRevive": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventPlayerRevive = {
                slot: BitHelper.readByte(bytes, reader),
                source: BitHelper.readByte(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "playerRevive",
                    detail: e
                }
            };
        },
        "playerTongueDamage": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventPlayerTongueDamage = {
                slot: BitHelper.readByte(bytes, reader),
                damage: BitHelper.readHalf(bytes, reader),
                source: BitHelper.readInt(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "playerTongueDamage",
                    detail: e
                }
            };
        },
        "playerMeleeDamage": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventPlayerMeleeDamage = {
                slot: BitHelper.readByte(bytes, reader),
                damage: BitHelper.readHalf(bytes, reader),
                source: BitHelper.readInt(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "playerMeleeDamage",
                    detail: e
                }
            };
        },
        "playerPelletDamage": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventPlayerPelletDamage = {
                slot: BitHelper.readByte(bytes, reader),
                damage: BitHelper.readHalf(bytes, reader),
                source: BitHelper.readInt(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "playerPelletDamage",
                    detail: e
                }
            };
        },
        "playerBulletDamage": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventPlayerBulletDamage = {
                slot: BitHelper.readByte(bytes, reader),
                damage: BitHelper.readHalf(bytes, reader),
                source: BitHelper.readByte(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "playerBulletDamage",
                    detail: e
                }
            };
        },
        "playerMineDamage": function(): GTFOTimeline
        {
            // TODO(randomuserhi)
            throw new Error("Not Implemented");
        },
        "playerFallDamage": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventPlayerFallDamage = {
                slot: BitHelper.readByte(bytes, reader),
                damage: BitHelper.readHalf(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "playerFallDamage",
                    detail: e
                }
            };
        },
        "playerPelletDodge": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventPlayerPelletDodge = {
                slot: BitHelper.readByte(bytes, reader),
                source: BitHelper.readInt(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "playerPelletDodge",
                    detail: e
                }
            };
        },
        "playerTongueDodge": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventPlayerTongueDodge = {
                slot: BitHelper.readByte(bytes, reader),
                source: BitHelper.readInt(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "playerTongueDodge",
                    detail: e
                }
            };
        },
        "playerWield": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventPlayerWield = {
                slot: BitHelper.readByte(bytes, reader),
                item: BitHelper.readByte(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "playerWield",
                    detail: e
                }
            };
        },
        "doorChangeState": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventDoorChangeState = {
                id: BitHelper.readByte(bytes, reader),
                state: GTFODoorStateMap[BitHelper.readByte(bytes, reader)]
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "doorChangeState",
                    detail: e
                }
            };
        },
        "doorDamage": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventDoorDamage = {
                id: BitHelper.readByte(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "doorDamage",
                    detail: e
                }
            };
        },
        "spawnMine": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventMineSpawn = {
                slot: BitHelper.readByte(bytes, reader),
                type: GTFOSpecification.mines[BitHelper.readByte(bytes, reader)],
                dimensionIndex: BitHelper.readByte(bytes, reader),
                instance: BitHelper.readInt(bytes, reader),
                position: BitHelper.readVector(bytes, reader),
                rotation: BitHelper.readHalfQuaternion(bytes, reader)
            };
            e.position.x *= GTFOReplaySettings.scale;
            e.position.y *= GTFOReplaySettings.scale;
            e.position.z *= GTFOReplaySettings.scale;
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "spawnMine",
                    detail: e
                }
            };
        },
        "despawnMine": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventMineDespawn = {
                instance: BitHelper.readInt(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "despawnMine",
                    detail: e
                }
            };
        },
        "explodeMine": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventMineExplode = {
                instance: BitHelper.readInt(bytes, reader),
                slot: BitHelper.readByte(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "explodeMine",
                    detail: e
                }
            };
        },
        "tripline": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventMineTripLine = {
                instance: BitHelper.readInt(bytes, reader),
                length: BitHelper.readHalf(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "tripline",
                    detail: e
                }
            };
        },
        "spawnSentry": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventSentrySpawn = {
                slot: BitHelper.readByte(bytes, reader),
                instance: BitHelper.readInt(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "spawnSentry",
                    detail: e
                }
            };
        },
        "despawnSentry": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventSentryDespawn = {
                instance: BitHelper.readInt(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "despawnSentry",
                    detail: e
                }
            };
        },
        "spawnPellet": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventPelletSpawn = {
                instance: BitHelper.readInt(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "spawnPellet",
                    detail: e
                }
            };
        },
        "despawnPellet": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventPelletDespawn = {
                instance: BitHelper.readInt(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "despawnPellet",
                    detail: e
                }
            };
        },
        "spawnTongue": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventTongueSpawn = {
                instance: BitHelper.readInt(bytes, reader),
                dimensionIndex: BitHelper.readByte(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "spawnTongue",
                    detail: e
                }
            };
        },
        "despawnTongue": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventTongueDespawn = {
                instance: BitHelper.readInt(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "despawnTongue",
                    detail: e
                }
            };
        },
        "setTongue": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFODynamicPropTongue = {
                instance: BitHelper.readInt(bytes, reader),
                spline: new Array(BitHelper.readByte(bytes, reader)),
                lerp: 1
            };
            e.spline[0] = BitHelper.readVector(bytes, reader);
            e.spline[0].x *= GTFOReplaySettings.scale;
            e.spline[0].y *= GTFOReplaySettings.scale;
            e.spline[0].z *= GTFOReplaySettings.scale;
            for (let i = 1; i < e.spline.length; ++i)
            {
                let delta = BitHelper.readHalfVector(bytes, reader);
                delta.x *= GTFOReplaySettings.scale;
                delta.y *= GTFOReplaySettings.scale;
                delta.z *= GTFOReplaySettings.scale;
                e.spline[i] = delta;
            }
            return {
                tick: tick,
                type: "dynamicProp",
                time: timestamp,
                order: order,
                detail: {
                    type: "tongue",
                    detail: e
                }
            };
        },
        "spawnGlue": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventGlueSpawn = {
                instance: BitHelper.readInt(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "spawnGlue",
                    detail: e
                }
            };
        },
        "despawnGlue": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventGlueDespawn = {
                instance: BitHelper.readInt(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "despawnGlue",
                    detail: e
                }
            };
        },
        "enemyAlerted": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventEnemyAlerted = {
                instance: BitHelper.readInt(bytes, reader),
                slot: BitHelper.readByte(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "enemyAlerted",
                    detail: e
                }
            };
        },
        "enemyScreamed": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventEnemyScreamed = {
                instance: BitHelper.readInt(bytes, reader),
                scout: BitHelper.readByte(bytes, reader) != 0
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "enemyScreamed",
                    detail: e
                }
            };
        },
        "enemyTargetSet": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline
        {
            let e: GTFOEventEnemyTargetSet = {
                instance: BitHelper.readInt(bytes, reader),
                slot: BitHelper.readByte(bytes, reader)
            };
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "enemyTargetSet",
                    detail: e
                }
            };
        },
        "bulletShot": function(bytes: DataView, reader: Reader, tick: number, timestamp: number, order: number): GTFOTimeline 
        {
            let e: GTFOEventBulletShot = {
                damage: BitHelper.readHalf(bytes, reader),
                hit: BitHelper.readByte(bytes, reader) != 0,
                dimensionIndex: BitHelper.readByte(bytes, reader),
                start: BitHelper.readHalfVector(bytes, reader),
                end: BitHelper.readHalfVector(bytes, reader)
            };
            e.start.x *= GTFOReplaySettings.scale;
            e.start.y *= GTFOReplaySettings.scale;
            e.start.z *= GTFOReplaySettings.scale;
            e.end.x *= GTFOReplaySettings.scale;
            e.end.y *= GTFOReplaySettings.scale;
            e.end.z *= GTFOReplaySettings.scale;
            return {
                tick: tick,
                type: "event",
                time: timestamp,
                order: order,
                detail: {
                    type: "bulletShot",
                    detail: e
                }
            };
        }
    };

    let dynamicPropParseMap: Record<GTFODynamicPropType, (bytes: DataView, reader: Reader, parser: GTFOSnapshot) => GTFOEvent> = {
        "unknown": function(bytes: DataView, reader: Reader): GTFOEvent
        {
            throw new Error("Unknown event type");
        },
        "tongue": function(bytes: DataView, reader: Reader)
        {
            let e: GTFODynamicPropTongue = {
                instance: BitHelper.readInt(bytes, reader),
                lerp: BitHelper.readHalf(bytes, reader),
                spline: new Array(BitHelper.readByte(bytes, reader))
            };
            e.spline[0] = BitHelper.readVector(bytes, reader);
            e.spline[0].x *= GTFOReplaySettings.scale;
            e.spline[0].y *= GTFOReplaySettings.scale;
            e.spline[0].z *= GTFOReplaySettings.scale;
            for (let i = 1; i < e.spline.length; ++i)
            {
                let delta = BitHelper.readHalfVector(bytes, reader);
                delta.x *= GTFOReplaySettings.scale;
                delta.y *= GTFOReplaySettings.scale;
                delta.z *= GTFOReplaySettings.scale;
                e.spline[i] = delta;
            }
            return {
                type: "tongue",
                detail: e
            };
        },
    };

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
        const snapshotRate = 50;
        let tick = 0;
        let parser: GTFOSnapshot = new GTFOSnapshot(this);
        let cache: GTFOSnapshot = new GTFOSnapshot(this);
        let pelletLifetime = new Map<number, number>(); // fail safe for shooter projectiles if they exist for too long, add a destroy event
        let blackListedPellet = new Set<number>()
        let maxWarnings = 200;
        this.snapshots = [GTFOSnapshot.clone(cache)];
        while(reader.index < bytes.byteLength)
        {
            // Tick timestamp
            let now = BitHelper.readUInt(bytes, reader);

            // Create snapshot checkpoint
            if (tick++ % snapshotRate == 0)
            {
                this.snapshots.push(new GTFOSnapshot(this, tick, this.timeline.length, now, cache));
            }

            // Number of events
            let nEvents = BitHelper.readUShort(bytes, reader);
            for (let i = 0; i < nEvents; ++i)
            {
                // type of event
                let typeId = BitHelper.readByte(bytes, reader);
                let type = eventMap[typeId];
                let rel = BitHelper.readUShort(bytes, reader); // relative time to last tick
                let timestamp = now - rel;

                try {
                    let t = eventParseMap[type](bytes, reader, tick, timestamp, i, parser);

                    // Manage pellet lifetime safety => solve bug with old replays and kraken
                    const pelletEvent: GTFOEvent<"spawnPellet"> = t.detail as unknown as GTFOEvent<"spawnPellet">;
                    if ((t as GTFOTimeline<GTFOEvent>).detail.type == "spawnPellet" && GTFOReplaySettings.maxProjectileLifetime > 0) {
                        pelletLifetime.set(pelletEvent.detail.instance, t.time);
                    }
                    for (const [instance, time] of [...pelletLifetime.entries()]) {
                        if (t.time - time > GTFOReplaySettings.maxProjectileLifetime) {
                            const despawnPellet: GTFOEvent<"despawnPellet"> = {
                                type: "despawnPellet",
                                detail: {
                                    instance
                                }
                            }
                            const _t: GTFOTimeline = {
                                type: "event",
                                tick: t.tick,
                                time: t.time,
                                detail: despawnPellet,
                                order: t.order
                            };
                            parser.do(_t);
                            cache.do(_t);
                            this.timeline.push(_t);
                            pelletLifetime.delete(instance);
                            blackListedPellet.add(instance);
                            if (maxWarnings > 0) {
                                --maxWarnings;
                                console.warn("projectile despawn event forceably added. This should not happen!");
                            }
                        }
                    }
                    
                    parser.do(t);
                    cache.do(t);
                    this.timeline.push(t);
                } catch (e) {
                    console.error(`${typeId} [${type}]`);
                    throw e;
                }
            }

            // Add EVENTSECTION marker
            {
                let t : GTFOTimeline = {
                    tick: tick,
                    type: "EVENTSECTION",
                    time: now,
                    order: -1,
                    detail: null
                };
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
                let scale = BitHelper.readHalf(bytes, reader);
                let dimensionIndex = BitHelper.readByte(bytes, reader);

                if (Number.isNaN(rotation.x) || Number.isNaN(rotation.y) || Number.isNaN(rotation.z) || Number.isNaN(rotation.w))
                {
                    console.warn("Dynamic had an NaN rotation, falling back to identity");
                    rotation.x = 0;
                    rotation.y = 0;
                    rotation.z = 0;
                    rotation.w = 1;   
                }

                // scale accordingly
                position.x *= GTFOReplaySettings.scale;
                position.y *= GTFOReplaySettings.scale;
                position.z *= GTFOReplaySettings.scale;
                scale *= GTFOReplaySettings.scale;

                if (!blackListedPellet.has(instance)) {
                    // Update dynamic position
                    if (!parser.dynamics.has(instance))
                        throw new ReferenceError(`Unknown dynamic: ${instance} was encountered.`);

                    let dynamic = parser.dynamics.get(instance)!;

                    // NOTE(randomuserhi): * 1000 to convert ms to seconds
                    let dt = (now - dynamic.lastUpdated) / 1000;
                    dynamic.lastUpdated = now;

                    if (absolute) 
                    {
                        dynamic.velocity.x = (position.x - dynamic.position.x) / dt;
                        dynamic.velocity.y = (position.y - dynamic.position.y) / dt;
                        dynamic.velocity.z = (position.z - dynamic.position.z) / dt;

                        dynamic.position = position;
                    }
                    else
                    {
                        dynamic.velocity.x = position.x / dt;
                        dynamic.velocity.y = position.y / dt;
                        dynamic.velocity.z = position.z / dt;

                        dynamic.position.x += position.x;
                        dynamic.position.y += position.y;
                        dynamic.position.z += position.z;
                    }
                    dynamic.rotation = rotation;
                    dynamic.scale = scale;

                    // Add to timeline
                    let t : GTFOTimeline = {
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
                            velocity: {
                                x: dynamic.velocity.x,
                                y: dynamic.velocity.y,
                                z: dynamic.velocity.z,
                            },
                            rotation: {
                                x: dynamic.rotation.x,
                                y: dynamic.rotation.y,
                                z: dynamic.rotation.z,
                                w: dynamic.rotation.w
                            },
                            lastUpdated: dynamic.lastUpdated,
                            scale: dynamic.scale,
                            dimensionIndex: dimensionIndex
                        }
                    };
                    this.timeline.push(t);
                    cache.do(t);
                }
            }

            // Number of dynamic properties that need updating
            let nDynamicProps = BitHelper.readUShort(bytes, reader);
            for (let i = 0; i < nDynamicProps; ++i)
            {
                let type = dynamicPropMap[BitHelper.readByte(bytes, reader)];
                let e = dynamicPropParseMap[type](bytes, reader, parser);

                // Add to timeline
                let t : GTFOTimeline = {
                    tick: tick,
                    type: "dynamicProp",
                    time: now,
                    order: i,
                    detail: e
                };
                this.timeline.push(t);
                cache.do(t);
            }

            // Add DYNAMICSECTION marker
            {
                let t : GTFOTimeline = {
                    tick: tick,
                    type: "DYNAMICSECTION",
                    time: now,
                    order: -1,
                    detail: null
                };
                this.timeline.push(t);
            }
        }
        this.timeline.sort((a, b) => {
            if (a.time == b.time)
            {
                // If time is the same, sort by tick
                if (a.tick != b.tick) return a.tick - b.tick;
                // If type is the same, give precedence to order
                else if (a.type == b.type) return a.order - b.order;
                // otherwise with different type and same tick and time, give precedence to event followed by EVENTSECTION followed by dynamics and then DYNAMIC SECTION
                else
                {
                    if (a.type == "event") return -1;
                    else if (a.type == "EVENTSECTION" && b.type != "event") return -1;
                    else if (a.type == "DYNAMICSECTION") return 1;
                    else if (a.type == "dynamic" && b.type == "DYNAMICSECTION") return -1;
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
        let i = snapshot.index;
        let tickTime = snapshot.time; // Time of last processed tick
        for (; i < this.timeline.length; ++i)
        {
            let t = this.timeline[i];
            if (t.time > time) break;
            snapshot.do(t);
            // Tick time is the timestamp of the last tick that was processed,
            // the last tick can be identified as the timestamp of the last dynamic section crossed
            if (t.type == "DYNAMICSECTION") 
                tickTime = snapshot.time;
        }
        snapshot.time = tickTime; // Its important that the timestamp is set to the last tick to ensure lerping occures from the last tick

        // lerp to next event section
        for (; i < this.timeline.length; ++i)
        {
            let t = this.timeline[i];
            if (t.type == "EVENTSECTION") break;
            snapshot.lerp(time, t);
        }
        // lerp to next dynamic section
        for (; i < this.timeline.length; ++i)
        {
            let t = this.timeline[i];
            if (t.type == "DYNAMICSECTION") break;
            snapshot.lerp(time, t);
        }
        snapshot.time = time;
        snapshot.tick = this.timeline[i - 1].tick;

        return snapshot;
    };

})();



