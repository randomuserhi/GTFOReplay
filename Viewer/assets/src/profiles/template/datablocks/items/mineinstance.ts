import { MineInstanceDatablock } from "@asl/vanilla/datablocks/items/mineinstance.js";
import { loadGLTF } from "@asl/vanilla/library/modelloader.js";
import { Identifier } from "@asl/vanilla/parser/identifier.js";
import { Group, Material, Mesh, MeshPhongMaterial } from "@esm/three";

MineInstanceDatablock.clear();

function ApplyMaterial(model: Group, material: Material) {
    model.traverse((obj) => {
        const mesh = obj as Mesh;
        if (mesh.isMesh === true) {
            mesh.material = material;
            mesh.scale.set(0.9, 0.9, 0.9);
        }
    });
}

MineInstanceDatablock.set(Identifier.create("Unknown"), {
    model: (model, playerColor) => loadGLTF("../js3party/models/Consumables/depmine.glb").then((factory) => {
        const mine = factory();
        ApplyMaterial(mine, new MeshPhongMaterial({ color: playerColor }));
        model.add(mine);
        model.scale.set(0.1, 0.1, 0.1);
        model.rotateX(90 * Math.deg2rad);
    }),
});

MineInstanceDatablock.set(Identifier.create("Item", 144), {
    model: (model, playerColor) => loadGLTF("../js3party/models/Consumables/ctrip.glb").then((factory) => {
        const mine = factory();
        ApplyMaterial(mine, new MeshPhongMaterial({ color: playerColor }));
        model.add(mine);
        model.scale.set(0.1, 0.1, 0.1);
        model.rotateX(90 * Math.deg2rad);
    }),
    laserColor: 0x0000ff
});

MineInstanceDatablock.set(Identifier.create("Item", 139), {
    model: (model, playerColor) => loadGLTF("../js3party/models/Consumables/emine.glb").then((factory) => {
        const mine = factory();
        ApplyMaterial(mine, new MeshPhongMaterial({ color: playerColor }));
        model.add(mine);
        model.scale.set(0.1, 0.1, 0.1);
        model.rotateX(90 * Math.deg2rad);
    }),
});