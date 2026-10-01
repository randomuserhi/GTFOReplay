import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";

ModuleLoader.registerASLModule(module.src);

export interface NativeSurface {
    asset: string;
    revision: string;
    dimension: number;
    enabled: boolean;
    matrix: number[];
}

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap { interface Headers { "Vanilla.Map.NativeSurfaces": NativeSurface[]; "Vanilla.Map.NativeSurfaceDiagnostics": string[]; } }
}

ModuleLoader.registerHeader("Vanilla.Map.NativeSurfaces", "0.0.1", {
    parse: async (data, header) => {
        if (header.has("Vanilla.Map.NativeSurfaces")) throw new Error("Duplicate native surface header.");
        const diagnostics: string[] = [];
        const diagnosticCount = await BitHelper.readUShort(data);
        if (diagnosticCount > 32) throw new Error("Native surface diagnostic limit exceeded.");
        for (let i = 0; i < diagnosticCount; ++i) diagnostics.push(await BitHelper.readString(data));
        const assets = [];
        const ids = new Set<string>();
        const count = await BitHelper.readUShort(data);
        for (let i = 0; i < count; ++i) {
            const asset = await BitHelper.readString(data), revision = await BitHelper.readString(data);
            if (!/^architecture-[a-f0-9]{16}$/.test(asset) || !/^[a-f0-9]{64}$/.test(revision) || ids.has(asset)) throw new Error("Invalid native surface asset identity.");
            ids.add(asset); assets.push({asset, revision});
        }
        const instances = await BitHelper.readUInt(data);
        if (instances > 1000000) throw new Error("Native surface instance limit exceeded.");
        const surfaces: NativeSurface[] = [];
        for (let i = 0; i < instances; ++i) {
            const index = await BitHelper.readUShort(data);
            if (!assets[index]) throw new Error("Native surface references an unknown recorded asset.");
            const dimension = await BitHelper.readByte(data), enabled = await BitHelper.readByte(data);
            if (enabled > 1) throw new Error("Invalid native surface enabled state.");
            const matrix: number[] = [];
            // These are raw Unity floats. Vector helpers already reflect X and must not be used here.
            for (let j = 0; j < 16; ++j) matrix.push(await BitHelper.readFloat(data));
            if (matrix.some(value => !Number.isFinite(value)) || matrix[3] !== 0 || matrix[7] !== 0 || matrix[11] !== 0 || matrix[15] !== 1) throw new Error("Invalid native surface affine matrix.");
            surfaces.push({...assets[index], dimension, enabled: enabled === 1, matrix});
        }
        header.set("Vanilla.Map.NativeSurfaces", surfaces);
        header.set("Vanilla.Map.NativeSurfaceDiagnostics", diagnostics);
    }
});
