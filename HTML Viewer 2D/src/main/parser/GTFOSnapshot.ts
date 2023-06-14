declare var GTFOSnapshot: GTFOSnapshotConstructor
interface Window
{
    GTFOSnapshot: GTFOSnapshotConstructor;
}

interface GTFOSnapshot
{
    index: number; // When in the timeline the snapshot was taken
    time: number; // Time of snapshot
    tick: number; // Tick snapshot is from

    // snapshot data
    snet: Map<bigint, GTFOPlayer>;
    players: Map<number, bigint>;
    enemies: Map<number, GTFOEnemy>;

    dynamics: Map<number, GTFODynamic>;

    clone(snapshot: GTFOSnapshot): void;
    do(t: GTFOTimeline): void;
    lerp(time: number, t: GTFOTimeline): void;
}
interface GTFOSnapshotConstructor
{
    new(tick?: number, index?: number, time?: number, parser?: GTFOSnapshot): GTFOSnapshot;
    prototype: GTFOSnapshot;
    clone(snapshot: GTFOSnapshot): GTFOSnapshot;
}

(function() {

    let timelineMap: Record<"event" | "dynamic", (snapshot: GTFOSnapshot, t: GTFOTimeline, lerp?: number) => void> = {
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
                eventMap[ev.type](snapshot, ev);
            }
        },
        "dynamic": function(snapshot: GTFOSnapshot, t: GTFOTimeline, lerp?: number)
        {
            let dynamic = t.detail as {
                instance: number,
                position: Vector,
                rotation: Quaternion
            };
            if (!snapshot.dynamics.has(dynamic.instance))
            {
                if (!RHU.exists(lerp) || lerp == 1) throw ReferenceError(`Referenced dynamic does not exist: t: ${t.time}`);
                return;
            }
            let d = snapshot.dynamics.get(dynamic.instance)!;

            let l = 1;
            if (RHU.exists(lerp)) l = lerp;
            
            // lerp vector
            d.position = {
                x: d.position.x + (dynamic.position.x - d.position.x) * l,
                y: d.position.y + (dynamic.position.y - d.position.y) * l,
                z: d.position.z + (dynamic.position.z - d.position.z) * l
            };

            d.rotation = dynamic.rotation;

            // slerp quaternion TODO(randomuserhi): Fix it jumps about when crossing the 0 degree to 359 degree angle
            // https://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/index.htm
            /*let qa = d.rotation;
            let qb = dynamic.rotation;
            let cosHalfTheta = qa.w * qb.w + qa.x * qb.x + qa.y * qb.y + qa.z * qb.z;
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
            };*/
        }
    };

    let eventMap: Record<GTFOEventType, (snapshot: GTFOSnapshot, ev: GTFOEvent) => void> = {
        "unknown": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            throw new Error("Unkown event type");
        },
        "playerJoin": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            let e = ev.detail as GTFOEventPlayerJoin;
            snapshot.snet.set(e.player, new GTFOPlayer(e.instance, e.name));
            snapshot.players.set(e.instance, e.player);
            snapshot.dynamics.set(e.instance, {
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0, w: 0 }
            });
        },
        "playerLeave": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            // TODO(randomuserhi) : error checking for deleting a player that doesnt exist
            //                      or atleast a warning
            let e = ev.detail as GTFOEventPlayerLeave;
            snapshot.snet.delete(e.player);
            snapshot.players.delete(e.instance);
            snapshot.dynamics.delete(e.instance);
        },
        "enemySpawn": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            let e = ev.detail as GTFOEventEnemySpawn;
            snapshot.enemies.set(e.instance, new GTFOEnemy(e.instance, e.state));
            snapshot.dynamics.set(e.instance, {
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0, w: 0 }
            });
        },
        "enemyDespawn": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            let e = ev.detail as GTFOEventEnemySpawn;
            snapshot.enemies.delete(e.instance);
            snapshot.dynamics.delete(e.instance);
        },
        "enemyDead": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            let e = ev.detail as GTFOEventEnemySpawn;
            snapshot.enemies.delete(e.instance);
            snapshot.dynamics.delete(e.instance);
        },
        "enemyChangeState": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            let e = ev.detail as GTFOEventEnemyChangeState;
            let enemy = snapshot.enemies.get(e.instance);
            if (RHU.exists(enemy))
            {
                enemy.state = e.state;
            }
            else throw new ReferenceError("Enemy does not exist to change state of.");
        }
    };

    let GTFOSnapshot: GTFOSnapshotConstructor = window.GTFOSnapshot = function(this: GTFOSnapshot, tick?: number, index?: number, time?: number, parser?: GTFOSnapshot)
    {
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
        this.tick = snapshot.tick;
        this.index = snapshot.index;
        this.time = snapshot.time;
        
        this.enemies = new Map();
        for (let kv of snapshot.enemies) this.enemies.set(kv[0], GTFOEnemy.clone(kv[1]));

        this.snet = new Map();
        for (let kv of snapshot.snet) this.snet.set(kv[0], GTFOPlayer.clone(kv[1]));

        this.players = new Map();
        for (let kv of snapshot.players) this.players.set(kv[0], kv[1]);

        this.dynamics = new Map();
        for (let kv of snapshot.dynamics) this.dynamics.set(kv[0], {
            position: { x: kv[1].position.x, y: kv[1].position.y, z: kv[1].position.z },
            rotation: { x: kv[1].rotation.x, y: kv[1].rotation.y, z: kv[1].rotation.z, w: kv[1].rotation.w }
        });
    }
    GTFOSnapshot.clone = function(snapshot: GTFOSnapshot): GTFOSnapshot
    {
        let clone = new GTFOSnapshot();
        clone.clone(snapshot);
        return clone;
    };

})();