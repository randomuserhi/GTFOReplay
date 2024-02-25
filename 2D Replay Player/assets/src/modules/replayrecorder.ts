(function(typename: string) {
    ModuleLoader.register(typename, "0.0.1", async (fs, header: Replay.Header) => {
        header.version = await BitHelper.readString(fs);
        header.isMaster = await BitHelper.readByte(fs) == 1;
    });
})("ReplayRecorder.Header");