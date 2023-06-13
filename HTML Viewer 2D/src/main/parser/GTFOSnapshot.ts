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
    players: Map<bigint, GTFOPlayer>;
    dynamics: Map<number, GTFODynamic>;

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
            // events only trigger on the event (aka lerp == 1)
            if (RHU.exists(lerp) && lerp != 1) return;

            let ev = t.detail as GTFOEvent;
            eventMap[ev.type](snapshot, ev);
        },
        "dynamic": function(snapshot: GTFOSnapshot, t: GTFOTimeline, lerp?: number)
        {
            let dynamic = t.detail as {
                instance: number,
                position: Vector,
                rotation: Quaternion
            };
            if (!snapshot.dynamics.has(dynamic.instance))
                throw ReferenceError("Referenced dynamic does not exist.");
            let d = snapshot.dynamics.get(dynamic.instance)!;

            // TODO(randomuserhi): Lerp vector and quaternion
            if (!RHU.exists(lerp) || lerp == 1)
            {
                d.position = dynamic.position;
                d.rotation = dynamic.rotation;
            }
        }
    };

    let eventMap: Record<GTFOEventType, (snapshot: GTFOSnapshot, ev: GTFOEvent) => void> = {
        "playerJoin": function(snapshot: GTFOSnapshot, ev: GTFOEvent)
        {
            let e = ev.detail as GTFOEventPlayerJoin;
            snapshot.players.set(e.player, new GTFOPlayer());
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
            snapshot.players.delete(e.player);
            snapshot.dynamics.delete(e.instance);
        }
    };

    let GTFOSnapshot: GTFOSnapshotConstructor = window.GTFOSnapshot = function(this: GTFOSnapshot, tick?: number, index?: number, time?: number, parser?: GTFOSnapshot)
    {
        if (RHU.exists(tick)) this.tick = tick;
        else this.tick = 0;
        if (RHU.exists(index)) this.index = index;
        else this.index = 0;
        if (RHU.exists(time)) this.time = time;
        else this.time = 0;

        if (RHU.exists(parser)) 
        {
            this.players = new Map(parser.players);
            this.dynamics = new Map(parser.dynamics);
        }
        else 
        {
            this.players = new Map();
            this.dynamics = new Map();
        }
    } as Function as GTFOSnapshotConstructor;
    GTFOSnapshot.prototype.do = function(t: GTFOTimeline): void
    {
        timelineMap[t.type](this, t);
        this.tick = t.tick;
        this.time = t.time;
    };
    GTFOSnapshot.prototype.lerp = function(time: number, t: GTFOTimeline): void
    {
        timelineMap[t.type](this, t, 0);
        this.time = time;
    };
    GTFOSnapshot.clone = function(snapshot: GTFOSnapshot): GTFOSnapshot
    {
        let clone = new GTFOSnapshot();

        clone.tick = snapshot.tick;
        clone.index = snapshot.index;
        clone.time = snapshot.time;
        clone.players = new Map(snapshot.players);
        clone.dynamics = new Map(snapshot.dynamics);

        return clone;
    }

})();