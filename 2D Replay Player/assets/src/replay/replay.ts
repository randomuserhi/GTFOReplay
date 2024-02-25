/* exported Replay */
declare namespace Replay {
    interface Header {
        version: string;
        isMaster: boolean;
    }
    interface Snapshot {

    }
}

class Timeline {
    sequence: string;

    constructor() {
        
    }
}

class Replay {
    readonly path: string;
    header: Partial<Replay.Header>;
    timeline: Timeline;
    snapshots: Partial<Replay.Snapshot>[];
    
    constructor(path: string) {
        this.path = path;
        this.header = {};
    }
}