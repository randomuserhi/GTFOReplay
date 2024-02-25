/* exported ParseFunc */
type ParseFunc = () => void;

/* exported Parser */
class Parser {
    readonly path: string;
    private current?: Replay; 

    constructor(path: string) {
        this.path = path;
    }

    public parse(): Replay {
        if (this.current !== undefined) return this.current;

        this.current = new Replay();

        // Parse...

        return this.current;
    }
}