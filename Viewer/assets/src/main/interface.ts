export interface SelectControl {
    label: string; value: string; options: { value: string; label: string }[]; onChange(value: string): void;
    placeholder?: string; disabled?: boolean; open?: boolean; onOpenChange?(open: boolean): void;
}
export interface EventParticipant { role: 'source' | 'target' | 'owner' | 'player' | 'enemy'; type: 'player' | 'enemy' | 'entity'; id: number | string; name?: string }
export interface IndexedEvent { id: number; time: number; kind: string; data: unknown; participants?: EventParticipant[] }
export interface Bookmark { id: string; time: number; label: string; note: string }
export interface IntervalPlayerStats { player: string; damage: number | null; kills: number | null; assists: number | null; shots: number | null; hits: number | null; revives: number; packs: number | null; packsConsumed: number | null }
export interface RunStatistics { players: IntervalPlayerStats[]; confirmedEnemyDeaths: number | null }
export interface LibraryRow { path: string; name: string; size: number; modified: number; favorite?: boolean; duration?: number; viewedAt?: number }
export interface LibraryState { folders: string[]; defaultFolder?: string; files: LibraryRow[]; errors: string[] }
export interface LibraryAdapter {
    snapshot(): Promise<LibraryState>;
    addFolder(): Promise<void>;
    configure(folders: string[], defaultFolder?: string): Promise<void>;
    importFile(): Promise<void>;
    open(path: string): Promise<void>;
    favorite(path: string, value: boolean): Promise<void>;
    reveal(path: string): Promise<void>;
    trash(path: string, labels: { title: string; message: string; cancel: string; remove: string }): Promise<boolean>;
}
export interface PlaybackState {
    identity?: string;
    startTime: number;
    time: number; duration: number; paused: boolean; speed: number; indexing: boolean;
    loadedUntil: number;
    loadFailed: boolean;
    live: boolean;
    events: readonly IndexedEvent[];
    players: { slot: number; nickname: string }[];
    following?: number;
    cameraAuto: boolean;
    firstPerson: boolean;
    cameraTarget?: string;
}
export interface PlaybackAdapter {
    state(): PlaybackState;
    follow(slot?: number): void;
    autoCamera(): void;
    firstPerson(enabled: boolean): void;
    seek(time: number): void;
    pause(paused: boolean): void;
    speed(speed: number): void;
    step(direction: number): Promise<void>;
    bookmarks(): Promise<Bookmark[]>;
    saveBookmarks(bookmarks: Bookmark[]): Promise<void>;
    statistics(start: number, end: number): Promise<RunStatistics>;
    focusEvent(event: IndexedEvent): Promise<boolean>;
    screenshot(): Promise<boolean>;
    copyText(text: string): Promise<void>;
}
declare global {
    interface Window {
        ReplayInterface: {
            notify(message: string, type?: 'error' | 'success' | 'info' | 'warning'): void;
            mountSelect(element: HTMLElement, props: SelectControl): { update(props: SelectControl): void; unmount(): void };
            mountSettings(element: HTMLElement, props: SelectControl & { content?: HTMLElement }): { update(props: SelectControl & { content?: HTMLElement }): void; unmount(): void };
            mountSwitch(element: HTMLElement, value: boolean, change: (value: boolean) => void, label: string): { update(value: boolean, label: string): void; unmount(): void };
            mountLanguage(element: HTMLElement): () => void;
            mountConnection(element: HTMLElement, connect: (id: string) => Promise<void>, status: string): { update(status: string): void; unmount(): void };
            mountControls(element: HTMLElement, adapter: PlaybackAdapter): () => void;
            mountLibrary(element: HTMLElement, adapter: LibraryAdapter): () => void;
            ui(text: string, values?: Record<string, unknown>): string;
            t(key: string, values?: Record<string, unknown>): string;
        };
    }
}
