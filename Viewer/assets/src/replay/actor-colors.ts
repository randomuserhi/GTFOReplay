import { Color, Material } from "three";

export const characterColors: Record<string, {name: string; color: string}> = {
    bishop: {name: "Olive", color: "#829160"},
    woods: {name: "Steel blue", color: "#628ca5"},
    hackett: {name: "Ochre", color: "#c29b52"},
    dauda: {name: "Burgundy", color: "#a15b62"}
};

export function colorCharacterClothing(materials: Iterable<Material>, id: string) {
    const palette = characterColors[id];
    if (!palette) return;
    const tint = new Color(palette.color);
    tint.multiplyScalar(1 / (.2126 * tint.r + .7152 * tint.g + .0722 * tint.b));
    for (const material of materials) {
        // Source cloth materials: keep skin, gloves, mask glass, boots and gear
        // intact. A luminance-preserving hue keeps worn patches and stitching.
        if (!/^Torso00[2-5]/.test(material.name) && !material.name.startsWith("Headgear002HackettOriginalHood")) continue;
        if (/Gloves/.test(material.name)) continue;
        material.onBeforeCompile = shader => {
            shader.uniforms.clothingTint = {value: tint};
            shader.fragmentShader = 'uniform vec3 clothingTint;\n' + shader.fragmentShader.replace(
                '#include <map_fragment>',
                `#include <map_fragment>
                float clothLuminance = dot(diffuseColor.rgb, vec3(.2126, .7152, .0722));
                diffuseColor.rgb = mix(diffuseColor.rgb, clothLuminance * clothingTint, .9);`
            );
        };
        material.customProgramCacheKey = () => 'gtfo-character-clothing-v1';
        material.needsUpdate = true;
    }
}
