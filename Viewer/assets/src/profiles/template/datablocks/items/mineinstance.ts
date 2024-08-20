import { Group, Material, Mesh, MeshPhongMaterial } from "@esm/three";
import { MineInstanceDatablock } from "../../../vanilla/datablocks/items/mineinstance.js";
import { loadGLTF } from "../../../vanilla/library/modelloader.js";
import { Identifier } from "../../../vanilla/parser/identifier.js";

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