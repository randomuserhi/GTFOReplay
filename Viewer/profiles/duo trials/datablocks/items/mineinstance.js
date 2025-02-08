const { MeshPhongMaterial } = await require("three", "esm");
const { MineInstanceDatablock } = await require("../../../vanilla/datablocks/items/mineinstance.js", "asl");
const { loadGLTF } = await require("../../../vanilla/library/modelloader.js", "asl");
const { Identifier } = await require("../../../vanilla/parser/identifier.js", "asl");
MineInstanceDatablock.clear();
function ApplyMaterial(model, material) {
  model.traverse(obj => {
    const mesh = obj;
    if (mesh.isMesh === true) {
      mesh.material = material;
      mesh.scale.set(0.9, 0.9, 0.9);
    }
  });
}
MineInstanceDatablock.set(Identifier.create("Unknown"), {
  model: (model, playerColor) => loadGLTF("../js3party/models/Consumables/depmine.glb").then(factory => {
    const mine = factory();
    ApplyMaterial(mine, new MeshPhongMaterial({
      color: playerColor
    }));
    model.add(mine);
    model.scale.set(0.1, 0.1, 0.1);
    model.rotateX(90 * Math.deg2rad);
  })
});
MineInstanceDatablock.set(Identifier.create("Item", 144), {
  model: (model, playerColor) => loadGLTF("../js3party/models/Consumables/ctrip.glb").then(factory => {
    const mine = factory();
    ApplyMaterial(mine, new MeshPhongMaterial({
      color: playerColor
    }));
    model.add(mine);
    model.scale.set(0.1, 0.1, 0.1);
    model.rotateX(90 * Math.deg2rad);
  }),
  laserColor: 0x0000ff
});
MineInstanceDatablock.set(Identifier.create("Item", 139), {
  model: (model, playerColor) => loadGLTF("../js3party/models/Consumables/emine.glb").then(factory => {
    const mine = factory();
    ApplyMaterial(mine, new MeshPhongMaterial({
      color: playerColor
    }));
    model.add(mine);
    model.scale.set(0.1, 0.1, 0.1);
    model.rotateX(90 * Math.deg2rad);
  })
});