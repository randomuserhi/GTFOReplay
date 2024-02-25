/* exported ParseFunc */
type ParseFunc = (data: ByteStream, ...args: any[]) => Promise<void>;

/* exported Parser */
class Parser {
    static typemapParsers: { [v in string]: ParseFunc } = {
        "0.0.1": async (data: ByteStream, replay: Replay) => {
            const size = await BitHelper.readUShort(data);
            for (let i = 0; i < size; ++i) {
                replay.typemap.set(await BitHelper.readUShort(data), {
                    typename: await BitHelper.readString(data),
                    version: await BitHelper.readString(data)
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

        const module = async (bytes: ByteStream | FileStream): Promise<Module | undefined> => {
            const id = await BitHelper.readUShort(bytes);
            return replay.typemap.get(id);
        };
        
        // Parse Header
        const headerSize = await BitHelper.readInt(fs);
        console.log(`header: ${headerSize} bytes`);
        const bytes = await fs.getBytes(headerSize);
        const typeMapVersion = await BitHelper.readString(bytes);
        if (Parser.typemapParsers[typeMapVersion] === undefined) {
            throw new ModuleNotFound(`No valid parser was found for 'ReplayRecorder.TypeMap(${typeMapVersion})'.`);
        }
        await Parser.typemapParsers[typeMapVersion](bytes, replay);
        // Parse Headers
        let m = await module(bytes);
        while (m?.typename !== "ReplayRecorder.EndOfHeader") {
            if (m === undefined) throw new UnknownModuleType();
            const func = ModuleLoader.get(m);
            if (func === undefined) throw new ModuleNotFound(`No valid parser was found for '${m.typename}(${m.version})'.`);
            await func(bytes, replay.header);
            m = await module(bytes);
        }
        // Parse Snapshots
        try {
            for (;;) {
                // TODO(randomuserhi): Previous state, Next state
                // TODO(randomuserhi): Timeline
                const now: Snapshot = new Snapshot();
                const prev: Snapshot = new Snapshot();

                    
                const snapshotSize = await BitHelper.readInt(fs);
                console.log(`snapshot: ${snapshotSize} bytes`);
                const bytes = await fs.getBytes(snapshotSize);
                const timestamp = await BitHelper.readUInt(bytes);

                const nEvents = await BitHelper.readInt(bytes);
                for (let i = 0; i < nEvents; ++i) {
                    const delta = await BitHelper.readUShort(bytes);
                    m = await module(bytes);
                    if (m === undefined) throw new UnknownModuleType();
                    const func = ModuleLoader.get(m);
                    if (func === undefined) throw new ModuleNotFound(`No valid parser was found for '${m.typename}(${m.version})'.`);
                    await func(bytes, prev, now);
                }

                const nDynamicCollections = await BitHelper.readUShort(bytes);
                for (let i = 0; i < nDynamicCollections; ++i) {
                    m = await module(bytes);
                    if (m === undefined) throw new UnknownModuleType();
                    const func = ModuleLoader.get(m);
                    if (func === undefined) throw new ModuleNotFound(`No valid parser was found for '${m.typename}(${m.version})'.`);
                    await func(bytes, prev, now);
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