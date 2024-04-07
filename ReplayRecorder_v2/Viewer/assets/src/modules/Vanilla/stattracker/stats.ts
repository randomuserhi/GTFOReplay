
declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Data {
            "Vanilla.StatTracker": StatTracker
        }
    }
}

export interface PlayerStats {
    snet: number;
}

export interface StatTracker {
    players: Map<number, PlayerStats> 
}