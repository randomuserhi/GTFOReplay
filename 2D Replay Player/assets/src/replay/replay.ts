/* exported Replay */
declare namespace Replay {
    interface Header {
        version: string;
        isMaster: boolean;
    }
    interface Snapshot { }
}

class Snapshot {
    tick: number;
    time: number;

    constructor() {
    }
}

class Timeline {
    snapshots: Snapshot[];

    constructor() {

    }
}

class Replay {
    typemap: Map<number, Module>;
    header: Partial<Replay.Header>;
    timeline: Timeline;
    snapshots: Partial<Replay.Snapshot>[];
    
    constructor() {
        this.typemap = new Map();
        this.header = {};
        this.timeline = new Timeline();
        this.snapshots = [];
    }
}