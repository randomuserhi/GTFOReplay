(function(typename: string) {
    ModuleLoader.register(typename, "0.0.1", async (fs, replay) => {
        replay.header.version = await BitHelper.readString(fs);
        replay.header.isMaster = await BitHelper.readByte(fs) == 1;
    });
})("ReplayRecorder.Header");