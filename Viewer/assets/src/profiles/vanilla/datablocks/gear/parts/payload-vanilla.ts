import { GearPartPayloadDatablock } from "./payload.js";

const root = `../js3party/models/GearParts/Payload`;

GearPartPayloadDatablock.clear();

GearPartPayloadDatablock.set(1, {
    paths: {
        Explosive: `${root}/Payload_Mine_1.glb`,
        Glue: `${root}/Payload_Mine_Glue_1.glb`
    },
});
GearPartPayloadDatablock.set(2, {
    paths: {
        Explosive: `${root}/Payload_Mine_1.glb`,
        Glue: `${root}/Payload_Glue_1.glb`
    },
});