import { ReplayContainerReader } from "./container.cjs";

/** Recorder diagnostics live inside the recording, outside its playback stream. */
export async function readRecordingDiagnostics(source: string, sessionId?: string): Promise<Record<string, unknown> | undefined> {
    const reader = await ReplayContainerReader.open(source);
    if (!reader) return undefined;
    try { return await reader.readDiagnostics(sessionId); }
    finally { await reader.close(); }
}
