export interface ClipBlock {
    state: { time: number; tick: number; typedTime: Map<string, number>; data: Map<string, unknown> };
    timeline: { time: number; tick: number; events: { type: number; delta: number; data: unknown }[]; dynamics: Map<number, { id: number; data: unknown }[]> }[];
}
export interface ClipHeader {
    version: 1; identity: string; sourceIdentity?: string; start: number; end: number; blockCount: number;
    typemap: Map<number, [string, string] & { typename: string; version: string }>;
    types: Map<string, number>; header: Map<string, unknown>;
    events: { id: number; time: number; kind: string; data: unknown }[];
}
export interface ClipSelection {
    start: number; end: number; sourceIdentity?: string;
    typemap: ClipHeader["typemap"]; types: ClipHeader["types"]; header: ClipHeader["header"]; events: ClipHeader["events"];
    blocks: { id: number; start: number; end: number }[];
}
export interface OpenClip { token: string; manifest: ClipHeader; blocks: { id: number; start: number; end: number }[] }
