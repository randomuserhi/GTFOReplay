(function () {
    let eventParseMap = {
        "unknown": function (bytes, reader) {
            throw new Error("Unknown event type");
        },
        "playerJoin": function (bytes, reader, tick, timestamp, order) {
            let e = {
                player: BitHelper.readULong(bytes, reader),
                instance: BitHelper.readInt(bytes, reader),
                slot: BitHelper.readByte(bytes, reader),
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
        "playerLeave": function (bytes, reader, tick, timestamp, order) {
            let e = {
                player: BitHelper.readULong(bytes, reader),
                instance: BitHelper.readInt(bytes, reader)
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
        "enemySpawn": function (bytes, reader, tick, timestamp, order) {
            let e = {
                instance: BitHelper.readInt(bytes, reader),
                state: GTFOEnemyBehaviourStateMap[BitHelper.readByte(bytes, reader)],
                type: GTFOSpecification.enemies[BitHelper.readByte(bytes, reader)]
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
        "enemyDespawn": function (bytes, reader, tick, timestamp, order) {
            let e = {
                instance: BitHelper.readInt(bytes, reader)
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
        "enemyDead": function (bytes, reader, tick, timestamp, order) {
            let e = {
                instance: BitHelper.readInt(bytes, reader)
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
        "enemyBehaviourChangeState": function (bytes, reader, tick, timestamp, order) {
            let e = {
                instance: BitHelper.readInt(bytes, reader),
                state: GTFOEnemyBehaviourStateMap[BitHelper.readByte(bytes, reader)]
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
        "enemyLocomotionChangeState": function (bytes, reader, tick, timestamp, order) {
            let e = {
                instance: BitHelper.readInt(bytes, reader),
                state: GTFOEnemyLocomotionStateMap[BitHelper.readByte(bytes, reader)]
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
        "enemyBulletDamage": function (bytes, reader, tick, timestamp, order) {
            let e = {
                instance: BitHelper.readInt(bytes, reader),
                damage: BitHelper.readHalf(bytes, reader),
                slot: 255,
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
        "enemyMeleeDamage": function (bytes, reader, tick, timestamp, order) {
            let e = {
                instance: BitHelper.readInt(bytes, reader),
                damage: BitHelper.readHalf(bytes, reader),
                slot: BitHelper.readByte(bytes, reader)
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
        "enemyMineDamage": function () {
            throw new Error("Not Implemented");
        },
        "playerDead": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "playerRevive": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "playerTongueDamage": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "playerMeleeDamage": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "playerPelletDamage": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "playerBulletDamage": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "playerMineDamage": function () {
            throw new Error("Not Implemented");
        },
        "playerFallDamage": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "playerPelletDodge": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "playerTongueDodge": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "playerWield": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "doorChangeState": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "doorDamage": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "spawnMine": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "despawnMine": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "explodeMine": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "tripline": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "spawnSentry": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "despawnSentry": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "spawnPellet": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "despawnPellet": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "spawnTongue": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "despawnTongue": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "setTongue": function (bytes, reader, tick, timestamp, order) {
            let e = {
                instance: BitHelper.readInt(bytes, reader),
                spline: new Array(BitHelper.readByte(bytes, reader)),
                lerp: 1
            };
            e.spline[0] = BitHelper.readVector(bytes, reader);
            e.spline[0].x *= GTFOReplaySettings.scale;
            e.spline[0].y *= GTFOReplaySettings.scale;
            e.spline[0].z *= GTFOReplaySettings.scale;
            for (let i = 1; i < e.spline.length; ++i) {
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
        "spawnGlue": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "despawnGlue": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "enemyAlerted": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "enemyScreamed": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "enemyTargetSet": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
        "bulletShot": function (bytes, reader, tick, timestamp, order) {
            let e = {
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
    let dynamicPropParseMap = {
        "unknown": function (bytes, reader) {
            throw new Error("Unknown event type");
        },
        "tongue": function (bytes, reader) {
            let e = {
                instance: BitHelper.readInt(bytes, reader),
                lerp: BitHelper.readHalf(bytes, reader),
                spline: new Array(BitHelper.readByte(bytes, reader))
            };
            e.spline[0] = BitHelper.readVector(bytes, reader);
            e.spline[0].x *= GTFOReplaySettings.scale;
            e.spline[0].y *= GTFOReplaySettings.scale;
            e.spline[0].z *= GTFOReplaySettings.scale;
            for (let i = 1; i < e.spline.length; ++i) {
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
    let GTFOReplay = window.GTFOReplay = function (binary) {
        this.dimensions = new Map();
        let bytes = new DataView(binary);
        let reader = new Reader();
        let nDimensions = BitHelper.readByte(bytes, reader);
        for (let i = 0; i < nDimensions; ++i) {
            let dimension = GTFODimension.parse(bytes, reader);
            this.dimensions.set(dimension.index, dimension);
        }
        this.timeline = [];
        const snapshotRate = 50;
        let tick = 0;
        let parser = new GTFOSnapshot(this);
        let cache = new GTFOSnapshot(this);
        let pelletLifetime = new Map();
        let blackListedPellet = new Set();
        let maxWarnings = 200;
        this.snapshots = [GTFOSnapshot.clone(cache)];
        while (reader.index < bytes.byteLength) {
            let now = BitHelper.readUInt(bytes, reader);
            if (tick++ % snapshotRate == 0) {
                this.snapshots.push(new GTFOSnapshot(this, tick, this.timeline.length, now, cache));
            }
            let nEvents = BitHelper.readUShort(bytes, reader);
            for (let i = 0; i < nEvents; ++i) {
                let typeId = BitHelper.readByte(bytes, reader);
                let type = eventMap[typeId];
                let rel = BitHelper.readUShort(bytes, reader);
                let timestamp = now - rel;
                try {
                    let t = eventParseMap[type](bytes, reader, tick, timestamp, i, parser);
                    const pelletEvent = t.detail;
                    if (t.detail.type == "spawnPellet" && GTFOReplaySettings.maxProjectileLifetime > 0) {
                        pelletLifetime.set(pelletEvent.detail.instance, t.time);
                    }
                    for (const [instance, time] of [...pelletLifetime.entries()]) {
                        if (t.time - time > GTFOReplaySettings.maxProjectileLifetime) {
                            const despawnPellet = {
                                type: "despawnPellet",
                                detail: {
                                    instance
                                }
                            };
                            const _t = {
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
                }
                catch (e) {
                    console.error(`${typeId} [${type}]`);
                    throw e;
                }
            }
            {
                let t = {
                    tick: tick,
                    type: "EVENTSECTION",
                    time: now,
                    order: -1,
                    detail: null
                };
                this.timeline.push(t);
            }
            let nDynamics = BitHelper.readUShort(bytes, reader);
            for (let i = 0; i < nDynamics; ++i) {
                let absolute = BitHelper.readByte(bytes, reader) == 1;
                let instance = BitHelper.readInt(bytes, reader);
                let position;
                if (absolute)
                    position = BitHelper.readVector(bytes, reader);
                else
                    position = BitHelper.readHalfVector(bytes, reader);
                let rotation = BitHelper.readHalfQuaternion(bytes, reader);
                let scale = BitHelper.readHalf(bytes, reader);
                let dimensionIndex = BitHelper.readByte(bytes, reader);
                if (Number.isNaN(rotation.x) || Number.isNaN(rotation.y) || Number.isNaN(rotation.z) || Number.isNaN(rotation.w)) {
                    console.warn("Dynamic had an NaN rotation, falling back to identity");
                    rotation.x = 0;
                    rotation.y = 0;
                    rotation.z = 0;
                    rotation.w = 1;
                }
                position.x *= GTFOReplaySettings.scale;
                position.y *= GTFOReplaySettings.scale;
                position.z *= GTFOReplaySettings.scale;
                scale *= GTFOReplaySettings.scale;
                if (!blackListedPellet.has(instance)) {
                    if (!parser.dynamics.has(instance))
                        throw new ReferenceError(`Unknown dynamic: ${instance} was encountered.`);
                    let dynamic = parser.dynamics.get(instance);
                    let dt = (now - dynamic.lastUpdated) / 1000;
                    dynamic.lastUpdated = now;
                    if (absolute) {
                        dynamic.velocity.x = (position.x - dynamic.position.x) / dt;
                        dynamic.velocity.y = (position.y - dynamic.position.y) / dt;
                        dynamic.velocity.z = (position.z - dynamic.position.z) / dt;
                        dynamic.position = position;
                    }
                    else {
                        dynamic.velocity.x = position.x / dt;
                        dynamic.velocity.y = position.y / dt;
                        dynamic.velocity.z = position.z / dt;
                        dynamic.position.x += position.x;
                        dynamic.position.y += position.y;
                        dynamic.position.z += position.z;
                    }
                    dynamic.rotation = rotation;
                    dynamic.scale = scale;
                    let t = {
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
            let nDynamicProps = BitHelper.readUShort(bytes, reader);
            for (let i = 0; i < nDynamicProps; ++i) {
                let type = dynamicPropMap[BitHelper.readByte(bytes, reader)];
                let e = dynamicPropParseMap[type](bytes, reader, parser);
                let t = {
                    tick: tick,
                    type: "dynamicProp",
                    time: now,
                    order: i,
                    detail: e
                };
                this.timeline.push(t);
                cache.do(t);
            }
            {
                let t = {
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
            if (a.time == b.time) {
                if (a.tick != b.tick)
                    return a.tick - b.tick;
                else if (a.type == b.type)
                    return a.order - b.order;
                else {
                    if (a.type == "event")
                        return -1;
                    else if (a.type == "EVENTSECTION" && b.type != "event")
                        return -1;
                    else if (a.type == "DYNAMICSECTION")
                        return 1;
                    else if (a.type == "dynamic" && b.type == "DYNAMICSECTION")
                        return -1;
                    else
                        return 1;
                }
            }
            return a.time - b.time;
        });
        window.current = this;
    };
    GTFOReplay.prototype.getNearestSnapshot = function (time) {
        let min = 0;
        let max = this.snapshots.length;
        let prev = -1;
        while (max != min) {
            let midpoint = Math.floor((max + min) / 2);
            if (midpoint == prev)
                break;
            prev = midpoint;
            if (this.snapshots[midpoint].time > time)
                max = midpoint;
            else
                min = midpoint;
        }
        return this.snapshots[min];
    };
    GTFOReplay.prototype.getSnapshot = function (time) {
        let snapshot = GTFOSnapshot.clone(this.getNearestSnapshot(time));
        let i = snapshot.index;
        let tickTime = snapshot.time;
        for (; i < this.timeline.length; ++i) {
            let t = this.timeline[i];
            if (t.time > time)
                break;
            snapshot.do(t);
            if (t.type == "DYNAMICSECTION")
                tickTime = snapshot.time;
        }
        snapshot.time = tickTime;
        for (; i < this.timeline.length; ++i) {
            let t = this.timeline[i];
            if (t.type == "EVENTSECTION")
                break;
            snapshot.lerp(time, t);
        }
        for (; i < this.timeline.length; ++i) {
            let t = this.timeline[i];
            if (t.type == "DYNAMICSECTION")
                break;
            snapshot.lerp(time, t);
        }
        snapshot.time = time;
        snapshot.tick = this.timeline[i - 1].tick;
        return snapshot;
    };
})();
