import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";
import { DynamicPosition } from "../../parser/replayrecorder.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Bioscan": {
                parse: {
                    dimension: number; 
                    absolute: boolean;
                    position: Pod.Vector;
                };
                spawn: {
                    dimension: number;
                    position: Pod.Vector;
                    radius: number;
                };
                despawn: void;
            };

            "Vanilla.Bioscan.Status": {
                parse: {
                    progress: number;
                    r: number;
                    g: number;
                    b: number;
                };
                spawn: {
                    progress: number;
                    r: number;
                    g: number;
                    b: number;
                };
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Bioscan": Map<number, Bioscan>
            "Vanilla.Bioscan.Status": Map<number, BioscanStatus>;
        }
    }
}

export interface Bioscan extends DynamicPosition {
    radius: number;
}

export interface BioscanStatus {
    id: number;
    color: number;
    progress: number;
}

ModuleLoader.registerDynamic("Vanilla.Bioscan", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await DynamicPosition.parse(data);
            return result;
        }, 
        exec: (id, data, snapshot, lerp) => {
            const scans = snapshot.getOrDefault("Vanilla.Bioscan", () => new Map());
    
            if (!scans.has(id)) throw new BioscanNotFound(`Bioscan of id '${id}' was not found.`);
            const scan = scans.get(id)!;
            DynamicPosition.lerp(scan, data, lerp);
        }
    },
    spawn: {
        parse: async (data) => {
            const spawn = await DynamicPosition.parseSpawn(data);
            const result = {
                ...spawn,
                radius: await BitHelper.readHalf(data)
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const scans = snapshot.getOrDefault("Vanilla.Bioscan", () => new Map());
        
            if (scans.has(id)) throw new DuplicateBioscan(`Bioscan of id '${id}' already exists.`);
            scans.set(id, { id, ...data });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const scans = snapshot.getOrDefault("Vanilla.Bioscan", () => new Map());

            if (!scans.has(id)) throw new BioscanNotFound(`Bioscan of id '${id}' did not exist.`);
            scans.delete(id);
        }
    }
});

ModuleLoader.registerDynamic("Vanilla.Bioscan.Status", "0.0.1", {
    main: {
        parse: async (data) => {
            return {
                progress: await BitHelper.readByte(data) / 255,
                r: await BitHelper.readByte(data),
                g: await BitHelper.readByte(data),
                b: await BitHelper.readByte(data),
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const scans = snapshot.getOrDefault("Vanilla.Bioscan.Status", () => new Map());
    
            const { progress, r, g, b } = data;
            if (!scans.has(id)) throw new BioscanNotFound(`Bioscan status of id '${id}' was not found.`);
            const scan = scans.get(id)!;
            scan.color = (r << 16) | (g << 8) | b;
            scan.progress += (progress - scan.progress) * lerp;
        }
    },
    spawn: {
        parse: async (data) => {
            return {
                progress: await BitHelper.readByte(data) / 255,
                r: await BitHelper.readByte(data),
                g: await BitHelper.readByte(data),
                b: await BitHelper.readByte(data),
            };
        },
        exec: (id, data, snapshot) => {
            const scans = snapshot.getOrDefault("Vanilla.Bioscan.Status", () => new Map());
        
            const { progress, r, g, b } = data;
            const color = (r << 16) | (g << 8) | b;
            if (scans.has(id)) throw new DuplicateBioscan(`Bioscan status of id '${id}' already exists.`);
            scans.set(id, { 
                id, progress, color,
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const scans = snapshot.getOrDefault("Vanilla.Bioscan.Status", () => new Map());

            if (!scans.has(id)) throw new BioscanNotFound(`Bioscan status of id '${id}' did not exist.`);
            scans.delete(id);
        }
    }
});

export class BioscanNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class DuplicateBioscan extends Error {
    constructor(message?: string) {
        super(message);
    }
}