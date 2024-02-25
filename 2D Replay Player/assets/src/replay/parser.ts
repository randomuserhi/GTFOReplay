/* exported ParseFunc */
type ParseFunc = (fs: FileStream, replay: Replay) => Promise<void>;

/* exported Parser */
class Parser {
    static typemapParsers: { [v in string]: ParseFunc } = {
        "0.0.1": async (fs: FileStream, replay: Replay) => {
            const size = await BitHelper.readUShort(fs);
            for (let i = 0; i < size; ++i) {
                replay.typemap.set(await BitHelper.readUShort(fs), {
                    typename: await BitHelper.readString(fs),
                    version: await BitHelper.readString(fs)
                });
            }
        }
    };

    readonly path: string;
    private current?: Replay; 

    constructor(path: string) {
        this.path = path;
    }

    public async parseSync(): Promise<Replay> {
        if (this.current !== undefined) return this.current;
        const replay = this.current = new Replay();
        const fs = new FileStream(this.path, true);
        await fs.open();

        const module = async (): Promise<Module | undefined> => {
            const id = await BitHelper.readUShort(fs);
            return replay.typemap.get(id);
        };
        
        // Parse TypeMap
        const typeMapVersion = await BitHelper.readString(fs);
        if (Parser.typemapParsers[typeMapVersion] === undefined) {
            throw new ModuleNotFound(`No valid parser was found for 'ReplayRecorder.TypeMap(${typeMapVersion})'.`);
        }
        await Parser.typemapParsers[typeMapVersion](fs, replay);
        // Parse Headers
        let m = await module();
        while (m?.typename !== "ReplayRecorder.EndOfHeader") {
            if (m === undefined) throw new UnknownModuleType();
            const func = ModuleLoader.get(m);
            if (func === undefined) throw new ModuleNotFound(`No valid parser was found for '${m.typename}(${m.version})'.`);
            await func(fs, replay);
            m = await module();
        }
        // Parse Snapshots
        try {
            for (;;) {
                const now = await BitHelper.readUInt(fs);

                const nEvents = await BitHelper.readInt(fs);
                for (let i = 0; i < nEvents; ++i) {
                    const delta = await BitHelper.readUShort(fs);
                    m = await module();
                    if (m === undefined) throw new UnknownModuleType();
                    const func = ModuleLoader.get(m);
                    if (func === undefined) throw new ModuleNotFound(`No valid parser was found for '${m.typename}(${m.version})'.`);
                    await func(fs, replay);
                }

                const nDynamicCollections = await BitHelper.readUShort(fs);
                for (let i = 0; i < nDynamicCollections; ++i) {
                    m = await module();
                    if (m === undefined) throw new UnknownModuleType();
                    const func = ModuleLoader.get(m);
                    if (func === undefined) throw new ModuleNotFound(`No valid parser was found for '${m.typename}(${m.version})'.`);
                    await func(fs, replay);
                }
            } 
        } catch { /* empty */ }
        fs.close();
        return this.current;
    }
}

/* exported UnknownModuleType */
class UnknownModuleType extends Error {
    constructor(message?: string) {
        super(message);
    }
}

/* exported ModuleVersionNotFound */
class ModuleNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}