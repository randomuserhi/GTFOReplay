export type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';
export interface LogEntry { id: number; time: number; level: LogLevel; message: string }
export const logLimit = 2000;
let entries: readonly LogEntry[] = [];
let nextId = 0;
let dropped = 0;
const listeners = new Set<() => void>();
let pending = false;
function changed() {
    if (pending) return;
    pending = true;
    setTimeout(() => { pending = false; for (const listener of listeners) listener(); }, 100);
}
export function formatArguments(args: unknown[]): string {
    return args.map(value => {
        if (typeof value === 'string') return value;
        if (value instanceof Error) return value.stack || `${value.name}: ${value.message}`;
        try {
            const seen = new WeakSet<object>();
            return JSON.stringify(value, (_key, item) => {
                if (typeof item === 'bigint') return `${item}n`;
                if (item && typeof item === 'object') {
                    if (seen.has(item)) return '[Circular]';
                    seen.add(item);
                }
                return item;
            }, 2) ?? String(value);
        } catch { return '[Unserializable value]'; }
    }).join(' ');
}
export function appendLog(level: LogLevel, ...args: unknown[]) {
    entries = [...entries, { id: ++nextId, time: Date.now(), level, message: formatArguments(args) }];
    if (entries.length > logLimit) { dropped += entries.length - logLimit; entries = entries.slice(-logLimit); }
    changed();
}
export const logSnapshot = () => entries;
export const droppedLogs = () => dropped;
export function subscribeLogs(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function clearLogs() { entries = []; dropped = 0; changed(); }
export function logText(logs: readonly LogEntry[]) {
    return logs.map(entry => `[${new Date(entry.time).toISOString()}] [${entry.level.toUpperCase()}] ${entry.message}`).join('\n');
}
// Loaded by the interface bundle before the Viewer app and replay profiles start.
export function captureConsole(target: Console) {
    for (const level of ['log', 'info', 'warn', 'error', 'debug'] as const) {
        const original = target[level].bind(target);
        target[level] = (...args: unknown[]) => { original(...args); appendLog(level, ...args); };
    }
}
