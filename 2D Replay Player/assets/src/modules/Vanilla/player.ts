(function(typename: string) {
    ModuleLoader.register(typename, "0.0.1", async (data) => {
        const module = { typename: "ReplayRecorder.Dynamic", version: "0.0.1" };
        const func = ModuleLoader.get(module);
        if (func === undefined) throw new ModuleNotFound(`Could not find parser for ${module.typename}(${module.version})`);
        return func.parse(data);
    }, (data, snapshot, lerp) => {
        const module = { typename: "ReplayRecorder.Dynamic", version: "0.0.1" };
        const func = ModuleLoader.get(module);
        if (func === undefined || func.exec === undefined) throw new NoExecFunc(`Could not find exec function for ${module.typename}(${module.version})`);
        return func.exec(data, snapshot, lerp);
    });
})("Vanilla.Player");