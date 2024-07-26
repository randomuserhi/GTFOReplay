import { GearPartDeliveryDatablock } from "./delivery.js";

GearPartDeliveryDatablock.clear();

const root = `../js3party/models/GearParts/Delivery`;

GearPartDeliveryDatablock.set(2, {
    path: `${root}/Delivery_Mine_Deployer_Direct_1.glb`,
    aligns: [{alignType:"ToolTargeting", alignName:"Delivery_Targeting"},{alignType:"ToolScreen", alignName:"Delivery_Screen"},{alignType:"ToolPayload", alignName:"Delivery_Payload"},{alignType:"LeftHand", alignName:"LeftHand"}]
});
GearPartDeliveryDatablock.set(6, {
    path: `${root}/Delivery_Nano_Swarm_1.glb`,
    aligns: [{alignType:"ToolTargeting", alignName:"Delivery_Targeting"},{alignType:"ToolScreen", alignName:"Delivery_Screen"},{alignType:"ToolPayload", alignName:"Delivery_Payload"},{alignType:"LeftHand", alignName:"LeftHand"}]
});
GearPartDeliveryDatablock.set(3, {
    path: `${root}/Delivery_Bio_Tracker_1.glb`,
    aligns: [{alignType:"ToolTargeting", alignName:"Bio_Tracker_1_Targeting"},{alignType:"ToolScreen", alignName:"Bio_Tracker_1_Screen"},{alignType:"LeftHand", alignName:"LeftHand"}]
});
GearPartDeliveryDatablock.set(4, {
    path: `${root}/Delivery_Glue_Distance_1.glb`,
    aligns: [{alignType:"ToolPayload", alignName:"a_payload"},{alignType:"SightLook", alignName:"a_sight"},{alignType:"LeftHand", alignName:"LeftHand"},{alignType:"ToolScreen", alignName:"a_Screen"},{alignType:"ToolTargeting", alignName:"a_sight"},{alignType:"ToolTargeting", alignName:"a_targeting"},{alignType:"Muzzle", alignName:"a_Muzzle"}]
});
GearPartDeliveryDatablock.set(5, {
    path: `${root}/Delivery_Geo_Tracker_1.glb`,
    aligns: []
});