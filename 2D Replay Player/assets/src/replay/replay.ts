/* exported Replay */
declare namespace Replay {
    interface Header {
        version: string;
        isMaster: boolean;
    }
    interface Snapshot { }
}

interface Event {

}

interface Dynamic {

}

class Snapshot {
    tick: number;
    time: number;

    events: Event[];
    dynamics: Dynamic[];

    constructor() {

    }
}

class Timeline {
    snapshots: Snapshot[];

    constructor() {

    }
}

class Replay {
    header: Partial<Replay.Header>;
    timeline: Timeline;
    snapshots: Partial<Replay.Snapshot>[];
    
    constructor() {
        this.header = {};
    }
}