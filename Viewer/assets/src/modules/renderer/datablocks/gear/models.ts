import { GearModelDatablock } from "../../../datablocks/gear/models.js";
import { Identifier } from "../../../parser/identifier.js";

GearModelDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Mastaba Fixed Blade","Packet":{"Comps":{"Length":7,"a":{"c":2,"v":27},"b":{"c":3,"v":161},"c":{"c":4,"v":39},"d":{"c":44,"v":12},"e":{"c":48,"v":14},"f":{"c":50,"v":10}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Mastaba Fixed Blade"}}}`
    ), {
        model: () => new EquippableModel(),
    }
);