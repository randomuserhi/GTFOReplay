import { GearPartGripDatablock } from "@asl/vanilla/datablocks/gear/parts/grip.js";

GearPartGripDatablock.clear();

const root = `../js3party/models/GearParts/Grip`;

GearPartGripDatablock.set(2, {
    path: `${root}/Grip_1.glb`,
    aligns: [{alignType:"LeftHand", alignName:"LeftHand"},{alignType:"RightHand", alignName:"RightHand"}]
});
GearPartGripDatablock.set(3, {
    path: `${root}/Grip_2.glb`,
    aligns: [{alignType:"LeftHand", alignName:"LeftHand"},{alignType:"RightHand", alignName:"RightHand"}]
});
GearPartGripDatablock.set(5, {
    path: `${root}/Grip_3.glb`,
    aligns: [{alignType:"LeftHand", alignName:"LeftHand"},{alignType:"RightHand", alignName:"RightHand"}]
});
GearPartGripDatablock.set(6, {
    path: `${root}/Grip_Nano_Swarm_1.glb`,
    aligns: [{alignType:"LeftHand", alignName:"LeftHand"},{alignType:"RightHand", alignName:"RightHand"}]
});
GearPartGripDatablock.set(7, {
    path: `${root}/Grip_Nano_Swarm_1.glb`,
    aligns: [{alignType:"LeftHand", alignName:"LeftHand"},{alignType:"RightHand", alignName:"RightHand"}]
});