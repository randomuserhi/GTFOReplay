const { GearPartScreenDatablock } = await require("../../../../vanilla/datablocks/gear/parts/screen.js", "asl");
GearPartScreenDatablock.clear();
const root = `../js3party/models/GearParts/Screen`;
GearPartScreenDatablock.set(2, {
    path: `${root}/Screen_1.glb`,
    aligns: []
});
GearPartScreenDatablock.set(3, {
    path: `${root}/Screen_2.glb`,
    aligns: []
});
GearPartScreenDatablock.set(5, {
    path: `${root}/Screen_3.glb`,
    aligns: []
});
GearPartScreenDatablock.set(6, {
    path: `${root}/Screen_4.glb`,
    aligns: []
});
GearPartScreenDatablock.set(7, {
    path: `${root}/Screen_5.glb`,
    aligns: []
});
GearPartScreenDatablock.set(8, {
    path: `${root}/Screen_6.glb`,
    aligns: []
});
GearPartScreenDatablock.set(18, {
    path: `${root}/Screen_7.glb`,
    aligns: []
});
GearPartScreenDatablock.set(9, {
    path: `../js3party/models/GearParts/Front/Front_Bullpop_1.glb`,
    aligns: [{"alignType":"Sight","alignName":"Receiver_Sight"}]
});
GearPartScreenDatablock.set(16, {
    path: `../js3party/models/GearParts/Front/Front_AutoShotgun_1.glb`,
    aligns: [{"alignType":"Muzzle","alignName":"Front_M"},{"alignType":"ShellEject","alignName":"Front_SE"},{"alignType":"Magazine","alignName":"a_mag"},{"alignType":"Flashlight","alignName":"Front_Flash"},{"alignType":"LeftHand","alignName":"LeftHand"}]
});
GearPartScreenDatablock.set(14, {
    path: `../js3party/models/GearParts/Front/Front_Rifle_3.glb`,
    aligns: []
});
// NOTE(randomuserhi): Long range flashlight model - I have not imported this from the game yet
/*GearPartScreenDatablock.set(17, {
    path: `${root}/Consumable_MediumFlashlight.glb`, 
    aligns: []
});*/
GearPartScreenDatablock.set(12, {
    path: `../js3party/models/GearParts/Head/Head_Knife_1.glb`,
    aligns: []
});