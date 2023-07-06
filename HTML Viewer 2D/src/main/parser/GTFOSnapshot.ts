declare var GTFOSnapshot: GTFOSnapshotConstructor
interface Window
{
    GTFOSnapshot: GTFOSnapshotConstructor;
}

interface GTFOSnapshot
{
    owner: GTFOReplay;

    index: number; // When in the timeline the snapshot was taken
    time: number; // Time of snapshot
    tick: number; // Tick snapshot is from

    // snapshot data
    snet: Map<bigint, GTFOPlayer>;
    players: Map<number, bigint>;
    slots: (bigint | null | undefined)[];
    enemies: Map<number, GTFOEnemy>;
    doors: Map<number, GTFODoorState>;
    mines: Map<number, GTFOMine>;

    dynamics: Map<number, GTFODynamic>;
    sentries: Map<number, GTFOSentry>;
    pellets: Set<number>;
    tongues: Map<number, GTFOTongue>;
    glue: Set<number>;
    
    tracers: GTFOTracer[];
    cross: GTFOCross[];
    trails: Map<number, GTFOTrail>;
    hits: GTFOHit[]; // TODO(randomuserhi)

    clone(snapshot: GTFOSnapshot): void;
    do(t: GTFOTimeline): void;
    lerp(time: number, t: GTFOTimeline): void;
}
interface GTFOSnapshotConstructor
{
    new(owner: GTFOReplay, tick?: number, index?: number, time?: number, parser?: GTFOSnapshot): GTFOSnapshot;
    prototype: GTFOSnapshot;
    clone(snapshot: GTFOSnapshot): GTFOSnapshot;
}

(function() {

    let timelineMap: Record<"event" | "dynamic" | "dynamicProp" | "EVENTSECTION" | "DYNAMICSECTION", (snapshot: GTFOSnapshot, t: GTFOTimeline, lerp?: number) => void> = {
        "EVENTSECTION": function() {},
        "DYNAMICSECTION": function() {},
        "event": function (snapshot: GTFOSnapshot, t: GTFOTimeline, lerp?: number)
        {
            let time = t.time;
            if (RHU.exists(lerp))
            {
                time = snapshot.time + (t.time - snapshot.time) * lerp;
            }

            if (time >= t.time)
            {
                let ev = t.detail as GTFOEvent;
                eventMap[ev.type as GTFOEventType](snapshot, ev, t.time);
            }
        },
        "dynamicProp": function (snapshot: GTFOSnapshot, t: GTFOTimeline, lerp?: number)
        {
            let ev = t.detail as GTFOEvent;
            dynamicPropMap[ev.type as GTFODynamicPropType](snapshot, t, ev, lerp);
        },
        "dynamic": function(snapshot: GTFOSnapshot, t: GTFOTimeline, lerp?: number)
        {
            let dynamic = t.detail as {
                instance: number,
                position: Vector,
                velocity: Vector,
                rotation: Quaternion,
                scale: number,
                dimensionIndex: number,
                lastUpdated: number
            };
            if (!snapshot.dynamics.has(dynamic.instance))
            {
                if (!RHU.exists(lerp) || lerp == 1) throw ReferenceError(`Referenced dynamic does not exist: t: ${t.time} ${dynamic.instance}`);
                return;
            }
            let d = snapshot.dynamics.get(dynamic.instance)!;
            d.dimensionIndex = dynamic.dimensionIndex;
            d.lastUpdated = dynamic.lastUpdated;

            let l = 1;
            if (RHU.exists(lerp)) l = lerp;

            // smoothed delayed velocity (not true velocity)
            d.velocity = {
                x: d.velocity.x + (dynamic.velocity.x - d.velocity.x) * l,
                y: d.velocity.y + (dynamic.velocity.y - d.velocity.y) * l,
                z: d.velocity.z + (dynamic.velocity.z - d.velocity.z) * l
            };

            // If position is 0, just set lerp to 1 to prevent weird lerping from origin
            if (d.position.x == 0 && d.position.y == 0 && d.position.z == 0)
            {
                d.velocity.x = 0;
                d.velocity.y = 0;
                d.velocity.z = 0;
                l = 1;
            }

            let old = d.position;

            // lerp scale
            d.scale = d.scale + (dynamic.scale - d.scale) * l;

            // lerp vector
            d.position = {
                x: d.position.x + (dynamic.position.x - d.position.x) * l,
                y: d.position.y + (dynamic.position.y - d.position.y) * l,
                z: d.position.z + (dynamic.position.z - d.position.z) * l
            };

            // Update trails
            if ((old.x != 0 || old.y != 0 || old.z != 0) && snapshot.trails.has(dynamic.instance))
            {
                let trail = snapshot.trails.get(dynamic.instance)!;
                let diff: Vector = {
                    x: d.position.x - old.x,
                    y: d.position.y - old.y,
                    z: d.position.z - old.z,
                }
                let dist = Math.sqrt(diff.x * diff.x + diff.y * diff.y + diff.z * diff.z);
                let points = dist / 60;
                
                if (!RHU.exists(trail.points.find(tr => tr.time == snapshot.time)))
                {
                    trail.points.push({
                        dimensionIndex: d.dimensionIndex,
                        position: {
                            x: old.x,
                            y: old.y,
                            z: old.z
                        },
                        time: snapshot.time
                    });
                }

                for (let i = 0; i < 1; i += 1 / points)
                {
                    if (i > l) break;
                    let time = snapshot.time + (t.time - snapshot.time) * i;
                    if (!RHU.exists(trail.points.find(tr => tr.time == time)))
                    {
                        trail.points.push({
                            dimensionIndex: d.dimensionIndex,
                            position: {
                                x: old.x + (dynamic.position.x - old.x) * i,
                                y: old.y + (dynamic.position.y - old.y) * i,
                                z: old.z + (dynamic.position.z - old.z) * i
                            },
                            time: time
                        });
                    }
                }
            }

            //d.rotation = dynamic.rotation;

            // slerp quaternion
            // https://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/index.htm
            let qa = d.rotation;
            let qb = dynamic.rotation;
            let cosHalfTheta = qa.w * qb.w + qa.x * qb.x + qa.y * qb.y + qa.z * qb.z;
            if (cosHalfTheta < 0) // flip the quarternion if they face opposite directions to prevent slerp going the long way
            {
                qa.x = -qa.x;
                qa.y = -qa.y;
                qa.z = -qa.z;
                qa.w = -qa.w;
            }
            if (Math.abs(cosHalfTheta) >= 1.0)
            {
                d.rotation = qa;
                return;
            }
            let halfTheta = Math.acos(cosHalfTheta);
            let sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);
            if (Math.abs(sinHalfTheta) < 0.001)
            {
                d.rotation = {
                    w: (qa.w * 0.5 + qb.w * 0.5),
                    x: (qa.x * 0.5 + qb.x * 0.5),
                    y: (qa.y * 0.5 + qb.y * 0.5),
                    z: (qa.z * 0.5 + qb.z * 0.5)
                }
                return;
            }
            let ratioA = Math.sin((1 - l) * halfTheta) / sinHalfTheta;
            let ratioB = Math.sin(l * halfTheta) / sinHalfTheta;
            d.rotation = {
                w: (qa.w * ratioA + qb.w * ratioB),
                x: (qa.x * ratioA + qb.x * ratioB),
                y: (qa.y * ratioA + qb.y * ratioB),
                z: (qa.z * ratioA + qb.z * ratioB)
            };
        }
    };

    const xor = (seed: number) => 
    {
        const baseSeeds = [123456789, 362436069, 521288629, 88675123]

        let [x, y, z, w] = baseSeeds

        const random = () => 
        {
            const t = x ^ (x << 11);
            [x, y, z] = [y, z, w];
            w = w ^ (w >> 19) ^ (t ^ (t >> 8));
            return w / 0x7fffffff;
        }

        [x, y, z, w] = baseSeeds.map(i => i + seed);
        [x, y, z, w] = [0, 0, 0, 0].map(() => Math.round(random() * 1e16));

        return random
    }

    let eventMap: Record<GTFOEventType, (snapshot: GTFOSnapshot, ev: GTFOEvent, time: number) => void> = {
        "unknown": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            throw new Error("Unkown event type");
        },
        "playerJoin": function(snapshot: GTFOSnapshot, ev: GTFOEvent, time: number)
        {
            let e = ev.detail as GTFOEventPlayerJoin;
            if (snapshot.snet.has(e.player))
            {
                // player rejoined, simply update credentials
                let player = snapshot.snet.get(e.player)!;
                player.name = e.name;
                player.slot = e.slot;
                player.instance = e.instance;
            }
            else snapshot.snet.set(e.player, new GTFOPlayer(e.instance, e.name, e.slot));
            snapshot.players.set(e.instance, e.player);
            snapshot.slots[e.slot] = e.player;
            snapshot.dynamics.set(e.instance, {
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0, w: 0 },
                velocity: { x: 0, y: 0, z: 0 },
                scale: 0,
                dimensionIndex: 0,
                lastUpdated: time
            });
        },
        "playerLeave": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            // TODO(randomuserhi) : error checking for deleting a player that doesnt exist
            //                      or atleast a warning
            let e = ev.detail as GTFOEventPlayerLeave;
            let p = snapshot.snet.get(e.player);
            //snapshot.snet.delete(e.player); // NOTE(randomuserhi): We don't remove the player data in case they rejoin
            snapshot.players.delete(e.instance);
            if (RHU.exists(p)) snapshot.slots[p.slot] = undefined;
            snapshot.dynamics.delete(e.instance);
        },
        "enemySpawn": function(snapshot: GTFOSnapshot, ev: GTFOEvent, time: number)
        {
            let e = ev.detail as GTFOEventEnemySpawn;
            snapshot.enemies.set(e.instance, new GTFOEnemy(e.instance, e.type, e.state));
            snapshot.dynamics.set(e.instance, {
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0, w: 0 },
                velocity: { x: 0, y: 0, z: 0 },
                scale: 0,
                dimensionIndex: 0,
                lastUpdated: time
            });
        },
        "enemyDespawn": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            let e = ev.detail as GTFOEventEnemySpawn;
            snapshot.enemies.delete(e.instance);
            snapshot.dynamics.delete(e.instance);
        },
        "enemyDead": function(snapshot: GTFOSnapshot, ev: GTFOEvent, time: number)
        {
            let e = ev.detail as GTFOEventEnemySpawn;
            let dyn = snapshot.dynamics.get(e.instance);
            snapshot.enemies.delete(e.instance);
            snapshot.dynamics.delete(e.instance);

            if (RHU.exists(dyn))
            {
                let r = xor(time + e.instance ^ 0x190104029);
                r(); r(); r();
                let d = r() * 300;
                const shakeAmount = 13;
                let shake = new Array(10);
                for (let i = 0; i < 10; ++i)
                {
                    shake[i] = [-(shakeAmount/2) + r() * shakeAmount, -(shakeAmount/2) + r() * shakeAmount];
                }
                snapshot.cross.push({
                    dimensionIndex: dyn.dimensionIndex,
                    pos: dyn.position,
                    time: time,
                    deviation: d,
                    shake: shake,
                    color: "#f00"
                });
            }
            else throw new ReferenceError("Referenced enemy does not exist.");
        },
        "enemyBehaviourChangeState": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            let e = ev.detail as GTFOEventEnemyBehaviourChangeState;
            let enemy = snapshot.enemies.get(e.instance);
            if (RHU.exists(enemy))
            {
                enemy.behaviourState = e.state;
            }
            else throw new ReferenceError("Enemy does not exist to change behaviour state of.");
        },
        "enemyLocomotionChangeState": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            let e = ev.detail as GTFOEventEnemyLocomotionChangeState;
            let enemy = snapshot.enemies.get(e.instance);
            if (RHU.exists(enemy))
            {
                enemy.locomotionState = e.state;
            }
            else throw new ReferenceError("Enemy does not exist to change locomotion state of.");
        },
        "enemyBulletDamage": function(snapshot: GTFOSnapshot, ev: GTFOEvent, time: number)
        {
            let replay = snapshot.owner;
            let e = ev.detail as GTFOEventEnemyBulletDamage;
            let enemy = snapshot.enemies.get(e.instance);
            let eDynamic = snapshot.dynamics.get(e.instance);
            if (RHU.exists(enemy) && RHU.exists(eDynamic))
            {
                let pDynamic;
                let player = snapshot.snet.get(snapshot.slots[e.slot]!)!;
                if (e.sentry) 
                {
                    if (RHU.exists(player.sentry)) pDynamic = snapshot.dynamics.get(player.sentry)!;
                    else throw ReferenceError("Player damaged an enemy with a sentry, yet a sentry was not placed by them.");
                }
                else pDynamic = snapshot.dynamics.get(player.instance)!;
                // TODO(randomuserhi): Improve performance of this...
                let r = xor(time + e.damage ^ 0x190104029);
                r(); r(); r();
                let dx = -15 + r() * 30;
                let dz = -15 + r() * 30;
                snapshot.tracers.push({
                    dimensionIndex: pDynamic.dimensionIndex,
                    a: { x: pDynamic.position.x, y: pDynamic.position.y, z: pDynamic.position.z },
                    b: { x: eDynamic.position.x + dx, y: eDynamic.position.y, z: eDynamic.position.z + dz },
                    damage: e.damage / 30, // TODO(randomuserhi): change ratio to be in settings
                    time: time,
                    color: "233, 181, 41"
                });
            }
            else throw new ReferenceError("Enemy does not exist to do bullet damage.");
        },
        "enemyMeleeDamage": function(snapshot: GTFOSnapshot, ev: GTFOEvent, time: number)
        {
            let replay = snapshot.owner;
            let e = ev.detail as GTFOEventEnemyBulletDamage;
            let enemy = snapshot.enemies.get(e.instance);
            let eDynamic = snapshot.dynamics.get(e.instance);
            if (RHU.exists(enemy) && RHU.exists(eDynamic))
            {
                let player = snapshot.snet.get(snapshot.slots[e.slot]!)!;
                let pDynamic = snapshot.dynamics.get(player.instance)!;
                snapshot.tracers.push({
                    dimensionIndex: eDynamic.dimensionIndex,
                    a: { x: pDynamic.position.x, y: pDynamic.position.y, z: pDynamic.position.z },
                    b: { x: eDynamic.position.x, y: eDynamic.position.y, z: eDynamic.position.z },
                    damage: e.damage / 30, // TODO(randomuserhi): change ratio to be in settings
                    time: time,
                    color: "233, 181, 41"
                });
            }
            else throw new ReferenceError("Enemy does not exist to do melee damage.");
        },
        "enemyMineDamage": function(snapshot: GTFOSnapshot, ev: GTFOEvent, time: number)
        {
            // TODO(randomuserhi)
        },
        "playerDead": function(snapshot: GTFOSnapshot, ev: GTFOEvent, time: number)
        {
            let e = ev.detail as GTFOEventPlayerDead;
            if (RHU.exists(snapshot.slots[e.slot]))
            {
                let player = snapshot.snet.get(snapshot.slots[e.slot]!)!;
                let dyn = snapshot.dynamics.get(player.instance);
                if (RHU.exists(dyn))
                {
                    if (player.alive)
                    {
                        let r = xor(time + player.instance ^ 0x190104029);
                        r(); r(); r();
                        let d = r() * 300;
                        const shakeAmount = 13;
                        let shake = new Array(10);
                        for (let i = 0; i < 10; ++i)
                        {
                            shake[i] = [-(shakeAmount/2) + r() * shakeAmount, -(shakeAmount/2) + r() * shakeAmount];
                        }
                        snapshot.cross.push({
                            dimensionIndex: dyn.dimensionIndex,
                            pos: dyn.position,
                            time: time,
                            deviation: d,
                            shake: shake,
                            color: "#fff"
                        });
                    }
                }
                else throw new ReferenceError("Referenced player does not exist.");
                
                player.alive = false;
            }
            else throw new ReferenceError("Player that died does not exist");
        },
        "playerRevive": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            let e = ev.detail as GTFOEventPlayerRevive;
            if (RHU.exists(snapshot.slots[e.slot]) && RHU.exists(snapshot.slots[e.source]))
            {
                let target = snapshot.snet.get(snapshot.slots[e.slot]!)!;
                target.alive = true;
                // TODO(randomuserhi): set hp??
            }
            else throw new ReferenceError("Either target or source of revive did not exist.");
        },
        "playerTongueDamage": function(snapshot: GTFOSnapshot, ev: GTFOEvent, time: number)
        {
            let e = ev.detail as GTFOEventPlayerTongueDamage;
            if (RHU.exists(snapshot.slots[e.slot]) && snapshot.enemies.has(e.source))
            {
                let player = snapshot.snet.get(snapshot.slots[e.slot]!)!;

                let pDynamic = snapshot.dynamics.get(player.instance)!;
                snapshot.hits.push({
                    dimensionIndex: pDynamic.dimensionIndex,
                    pos: { x: pDynamic.position.x, y: pDynamic.position.y, z: pDynamic.position.z },
                    time: time,
                    color: "255, 255, 255"
                });
            }
            else throw new ReferenceError("Either enemy or player did not exist.");
        },
        "playerMeleeDamage": function(snapshot: GTFOSnapshot, ev: GTFOEvent, time: number)
        {
            let e = ev.detail as GTFOEventPlayerMeleeDamage;
            if (RHU.exists(snapshot.slots[e.slot]) && snapshot.enemies.has(e.source))
            {
                let player = snapshot.snet.get(snapshot.slots[e.slot]!)!;

                let pDynamic = snapshot.dynamics.get(player.instance)!;
                let eDynamic = snapshot.dynamics.get(e.source)!;
                
                snapshot.tracers.push({
                    dimensionIndex: pDynamic.dimensionIndex,
                    a: { x: eDynamic.position.x, y: eDynamic.position.y, z: eDynamic.position.z },
                    b: { x: pDynamic.position.x, y: pDynamic.position.y, z: pDynamic.position.z },
                    damage: e.damage / 5, // TODO(randomuserhi): change ratio to be in settings
                    time: time,
                    color: "233, 0, 41"
                });
            }
            else throw new ReferenceError("Either enemy or player did not exist.");
        },
        "playerPelletDamage": function(snapshot: GTFOSnapshot, ev: GTFOEvent, time: number)
        {
            // TODO(randomuserhi)
        },
        "playerBulletDamage": function(snapshot: GTFOSnapshot, ev: GTFOEvent, time: number)
        {
            let e = ev.detail as GTFOEventPlayerPelletDamage;
            if (RHU.exists(snapshot.slots[e.slot]) && RHU.exists(snapshot.slots[e.source]))
            {
                let target = snapshot.snet.get(snapshot.slots[e.slot]!)!;
                let source = snapshot.snet.get(snapshot.slots[e.source]!)!;

                let tDynamic = snapshot.dynamics.get(target.instance)!;
                let sDynamic = snapshot.dynamics.get(source.instance)!;
                
                // TODO(randomuserhi): Improve performance of this
                let r = xor(time + e.damage ^ 0x190104029);
                r(); r(); r();
                let dx = -15 + r() * 30;
                let dz = -15 + r() * 30;
                snapshot.tracers.push({
                    dimensionIndex: sDynamic.dimensionIndex,
                    a: { x: sDynamic.position.x, y: sDynamic.position.y, z: sDynamic.position.z },
                    b: { x: tDynamic.position.x + dx, y: tDynamic.position.y, z: tDynamic.position.z + dz },
                    time: time,
                    damage: e.damage / 5, // TODO(randomuserhi): change ratio to be in settings 
                    color: "233, 181, 41"
                });
            }
            else throw new ReferenceError("Either enemy or player did not exist.");
        },
        "playerMineDamage": function(snapshot: GTFOSnapshot, ev: GTFOEvent, time: number)
        {
            // TODO(randomuserhi)
        },
        "playerFallDamage": function(snapshot: GTFOSnapshot, ev: GTFOEvent, time: number)
        {
            // TODO(randomuserhi)
        },
        "playerPelletDodge": function(snapshot: GTFOSnapshot, ev: GTFOEvent, time: number)
        {
            // TODO(randomuserhi)
        },
        "playerTongueDodge": function(snapshot: GTFOSnapshot, ev: GTFOEvent, time: number)
        {
            // TODO(randomuserhi)
        },
        "playerWield": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            let e = ev.detail as GTFOEventPlayerWield;
            if (RHU.exists(snapshot.slots[e.slot]))
            {
                let player = snapshot.snet.get(snapshot.slots[e.slot]!)!;
                player.equipped = GTFOSpecification.items[e.item];
            }
            else throw new ReferenceError("Player did not exist.");
        },
        "doorChangeState": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            let e = ev.detail as GTFOEventDoorChangeState;
            snapshot.doors.set(e.id, e.state);
        },
        "doorDamage": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            let e = ev.detail as GTFOEventDoorChangeState;
            // TODO(randomuserhi): Door Shake => probably add a new dictionary for door shake
            //                     and do the same as I did for the crosses
        },
        "spawnMine": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            let e = ev.detail as GTFOEventMineSpawn;
            let owner = snapshot.slots[e.slot];
            if (!RHU.exists(owner)) throw ReferenceError("Player that owns this mine does not exist.");
            let mine = new GTFOMine(e.instance, owner, e.type, e.dimensionIndex, e.position, e.rotation);
            snapshot.mines.set(mine.instance, mine);
        },
        "despawnMine": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            let e = ev.detail as GTFOEventMineDespawn;
            snapshot.mines.delete(e.instance);
        },
        "explodeMine": function(snapshot: GTFOSnapshot, ev: GTFOEvent, time: number)
        {
            let e = ev.detail as GTFOEventMineExplode;
            if (e.slot !== 255)
            {
                if (RHU.exists(snapshot.slots[e.slot]) && snapshot.mines.has(e.instance))
                {
                    let source = snapshot.snet.get(snapshot.slots[e.slot]!)!;
                    
                    let tDynamic = snapshot.mines.get(e.instance)!;
                    let sDynamic = snapshot.dynamics.get(source.instance)!;
                    
                    snapshot.tracers.push({
                        dimensionIndex: sDynamic.dimensionIndex,
                        a: { x: sDynamic.position.x, y: sDynamic.position.y, z: sDynamic.position.z },
                        b: { x: tDynamic.position.x, y: tDynamic.position.y, z: tDynamic.position.z },
                        time: time,
                        damage: 1,
                        color: "233, 181, 41"
                    });
                }
                else throw new ReferenceError("Either mine or player did not exist.");
            }
            snapshot.mines.delete(e.instance);
        },
        "tripline": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            let e = ev.detail as GTFOEventMineTripLine;
            if (snapshot.mines.has(e.instance))
            {
                snapshot.mines.get(e.instance)!.length = e.length * GTFOReplaySettings.scale;
            }
            else throw ReferenceError("Mine does not exist.");
        },
        "spawnSentry": function(snapshot: GTFOSnapshot, ev: GTFOEvent, time: number)
        {
            let e = ev.detail as GTFOEventSentrySpawn;
            let owner = snapshot.slots[e.slot];
            if (!RHU.exists(owner)) throw ReferenceError("Player that owns this sentry does not exist.");
            let player = snapshot.snet.get(owner)!;
            if (player.sentry != null) throw Error("Player has already spawned a sentry.");
            player.sentry = e.instance;
            snapshot.sentries.set(e.instance, new GTFOSentry(e.instance, owner));
            snapshot.dynamics.set(e.instance, {
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0, w: 0 },
                velocity: { x: 0, y: 0, z: 0 },
                scale: 0,
                dimensionIndex: 0,
                lastUpdated: time
            });
        },
        "despawnSentry": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            let e = ev.detail as GTFOEventSentryDespawn;
            if (snapshot.sentries.has(e.instance))
            {
                let sentry = snapshot.sentries.get(e.instance)!;
                if (!RHU.exists(sentry.owner)) throw ReferenceError("Player that owns this sentry does not exist.");
                let player = snapshot.snet.get(sentry.owner)!;
                player.sentry = null;
                snapshot.sentries.delete(e.instance);
                snapshot.dynamics.delete(e.instance);
            }
            else throw ReferenceError("Sentry does not exist.");
        },
        "spawnPellet": function(snapshot: GTFOSnapshot, ev: GTFOEvent, time: number)
        {
            let e = ev.detail as GTFOEventPelletSpawn;
            snapshot.pellets.add(e.instance);
            snapshot.dynamics.set(e.instance, {
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0, w: 0 },
                velocity: { x: 0, y: 0, z: 0 },
                scale: 0,
                dimensionIndex: 0,
                lastUpdated: time
            });
            snapshot.trails.set(e.instance, {
                points: [],
                duration: 200
            });
        },
        "despawnPellet": function(snapshot: GTFOSnapshot, ev: GTFOEvent, time: number)
        {
            let e = ev.detail as GTFOEventPelletDespawn;
            if (snapshot.pellets.has(e.instance))
            {
                snapshot.pellets.delete(e.instance);
                let dynamic = snapshot.dynamics.get(e.instance)!;
                snapshot.hits.push({
                    dimensionIndex: dynamic.dimensionIndex,
                    pos: { x: dynamic.position.x, y: dynamic.position.y, z: dynamic.position.z },
                    time: time,
                    color: "255, 255, 255"
                });
                snapshot.dynamics.delete(e.instance);
                    
            }
            else throw ReferenceError("pellet does not exist.");
        },
        "spawnTongue": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            let e = ev.detail as GTFOEventTongueSpawn;
            snapshot.tongues.set(e.instance, new GTFOTongue(e.instance, e.dimensionIndex));
        },
        "despawnTongue": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            let e = ev.detail as GTFOEventTongueDespawn;
            if (snapshot.tongues.has(e.instance))
            {
                snapshot.tongues.delete(e.instance);
            }
            else throw ReferenceError("tongue does not exist.");
        },
        "setTongue": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            throw new Error("Unreachable");
        },
        "spawnGlue": function(snapshot: GTFOSnapshot, ev: GTFOEvent, time: number)
        {
            let e = ev.detail as GTFOEventGlueSpawn;
            snapshot.glue.add(e.instance);
            snapshot.dynamics.set(e.instance, {
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0, w: 0 },
                velocity: { x: 0, y: 0, z: 0 },
                scale: 0,
                dimensionIndex: 0,
                lastUpdated: time
            });
        },
        "despawnGlue": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            let e = ev.detail as GTFOEventGlueDespawn;
            if (snapshot.glue.has(e.instance))
            {
                snapshot.glue.delete(e.instance);
                snapshot.dynamics.delete(e.instance);
            }
            else throw ReferenceError("glue does not exist.");
        }
    };

    let dynamicPropMap: Record<GTFODynamicPropType, (snapshot: GTFOSnapshot, t: GTFOTimeline, ev: GTFOEvent, lerp?: number) => void> = {
        "unknown": function(snapshot: GTFOSnapshot, t: GTFOTimeline, ev: GTFOEvent)
        {
            throw new Error("Unkown event type");
        },
        "tongue": function(snapshot: GTFOSnapshot, t: GTFOTimeline, ev: GTFOEvent, lerp?: number)
        {
            let _tongue = ev.detail as GTFODynamicPropTongue;
            if (!snapshot.tongues.has(_tongue.instance))
            {
                if (!RHU.exists(lerp) || lerp == 1) throw ReferenceError(`Referenced tongue does not exist: t: ${t.time} ${_tongue.instance}`);
                return;
            }

            let tongue = snapshot.tongues.get(_tongue.instance)!;
            tongue.spline = _tongue.spline;

            let l = 1;
            if (RHU.exists(lerp)) l = lerp;

            tongue.lerp = tongue.lerp + (_tongue.lerp - tongue.lerp) * l;
        },
    }

    let GTFOSnapshot: GTFOSnapshotConstructor = window.GTFOSnapshot = function(this: GTFOSnapshot, owner: GTFOReplay, tick?: number, index?: number, time?: number, parser?: GTFOSnapshot)
    {
        this.owner = owner;

        if (RHU.exists(parser)) 
        {
            this.clone(parser);
        }
        else
        {
            this.enemies = new Map();
            this.snet = new Map();
            this.players = new Map();
            this.dynamics = new Map();
            this.doors = new Map();
            this.slots = new Array(4);
            this.mines = new Map();
            this.sentries = new Map();
            this.pellets = new Set();
            this.glue = new Set();
            this.tongues = new Map();
            this.tracers = [];
            this.cross = [];
            this.hits = [];
            this.trails = new Map();
        }

        if (RHU.exists(tick)) this.tick = tick;
        else this.tick = 0;
        if (RHU.exists(index)) this.index = index;
        else this.index = 0;
        if (RHU.exists(time)) this.time = time;
        else this.time = 0;
    } as Function as GTFOSnapshotConstructor;
    GTFOSnapshot.prototype.do = function(t: GTFOTimeline): void
    {
        // Cleanup continuous things like tracers, crosses, trails
        this.tracers = this.tracers.filter(tr => {
            let bonusLinger = tr.damage * 500;
            if (bonusLinger > 500) bonusLinger = 500;
            else if (bonusLinger < 0) bonusLinger = 0;

            return (t.time - tr.time) < GTFOReplaySettings.tracerLingerTime + bonusLinger;
        });
        this.cross = this.cross.filter(c => {
            return (t.time - c.time) < GTFOReplaySettings.crossLingerTime + c.deviation;
        })
        this.hits = this.hits.filter(h => t.time - h.time < GTFOReplaySettings.hitLingerTime)
        let old = this.trails;
        this.trails = new Map();
        for (let kv of old)
        {
            let trail = kv[1];
            trail.points = trail.points.filter(p => !RHU.exists(trail.duration) || t.time - p.time < trail.duration);
            if (this.dynamics.has(kv[0]) || trail.points.length != 0)
                this.trails.set(kv[0], trail);
        }

        // Perform timeline event
        timelineMap[t.type](this, t);
        this.tick = t.tick;
        this.time = t.time;
    };
    GTFOSnapshot.prototype.lerp = function(time: number, t: GTFOTimeline): void
    {
        let lerp = (time - this.time) / (t.time - this.time);
        if (lerp < 0) lerp = 0;
        else if (lerp > 1) lerp = 1;
        timelineMap[t.type](this, t, lerp);
    };
    GTFOSnapshot.prototype.clone = function(snapshot: GTFOSnapshot)
    {
        this.owner = snapshot.owner;
        this.tick = snapshot.tick;
        this.index = snapshot.index;
        this.time = snapshot.time;
        
        // NOTE(randomuserhi): Since the data inside tracers / cross don't change these do not need to be deep copied
        this.tracers = [...snapshot.tracers];
        this.cross = [...snapshot.cross];
        this.hits = [...snapshot.hits];
        
        // NOTE(randomuserhi): Since the data inside mines don't change these do not need to be deep copied
        this.mines = new Map();
        for (let kv of snapshot.mines) this.mines.set(kv[0], kv[1]);
        
        // NOTE(randomuserhi): Since the data inside pellets don't change these do not need to be deep copied
        this.pellets = new Set();
        for (let v of snapshot.pellets) this.pellets.add(v);

        // NOTE(randomuserhi): Since the data inside glue don't change these do not need to be deep copied
        this.glue = new Set();
        for (let v of snapshot.glue) this.glue.add(v);

        this.tongues = new Map();
        for (let kv of snapshot.tongues) this.tongues.set(kv[0], GTFOTongue.clone(kv[1]));

        // NOTE(randomuserhi): Since the data inside sentries don't change these do not need to be deep copied
        this.sentries = new Map();
        for (let kv of snapshot.sentries) this.sentries.set(kv[0], kv[1]);
        
        this.trails = new Map();
        for (let kv of snapshot.trails) 
            this.trails.set(kv[0], {
                points: [...kv[1].points],
                duration: kv[1].duration
            });

        this.enemies = new Map();
        for (let kv of snapshot.enemies) this.enemies.set(kv[0], GTFOEnemy.clone(kv[1]));

        this.doors = new Map();
        for (let kv of snapshot.doors) this.doors.set(kv[0], kv[1]);
        
        this.snet = new Map();
        for (let kv of snapshot.snet) this.snet.set(kv[0], GTFOPlayer.clone(kv[1]));
        
        this.slots = new Array(4);
        for (let i = 0; i < 4; ++i) this.slots[i] = snapshot.slots[i];

        this.players = new Map();
        for (let kv of snapshot.players) this.players.set(kv[0], kv[1]);

        this.dynamics = new Map();
        for (let kv of snapshot.dynamics) this.dynamics.set(kv[0], {
            position: { x: kv[1].position.x, y: kv[1].position.y, z: kv[1].position.z },
            rotation: { x: kv[1].rotation.x, y: kv[1].rotation.y, z: kv[1].rotation.z, w: kv[1].rotation.w },
            velocity: { x: kv[1].velocity.x, y: kv[1].velocity.y, z: kv[1].velocity.z },
            scale: kv[1].scale,
            dimensionIndex: kv[1].dimensionIndex,
            lastUpdated: kv[1].lastUpdated
        });
    }
    GTFOSnapshot.clone = function(snapshot: GTFOSnapshot): GTFOSnapshot
    {
        let clone = new GTFOSnapshot(snapshot.owner);
        clone.clone(snapshot);
        return clone;
    };

})();