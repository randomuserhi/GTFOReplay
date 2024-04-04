import { ModuleLoader } from "../../../replay/moduleloader.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Player.Stats": {
                parse: {
                };
                spawn: {
                };
                despawn: void;
            };
        }

        interface Data {
        }
    }
}

ModuleLoader.registerDynamic("Vanilla.Player.Stats", "0.0.1", {
    main: {
        parse: async (data) => {
            return {};
        }, 
        exec: (id, data, snapshot) => {
        }
    },
    spawn: {
        parse: async (data) => {
            return {};
        },
        exec: (id, data, snapshot) => {
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
        }
    }
});

export class PlayerStatsNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class DuplicatePlayerStats extends Error {
    constructor(message?: string) {
        super(message);
    }
}