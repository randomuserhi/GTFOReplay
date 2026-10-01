import { Select } from "../../components/ui/select";
import { notify } from "../../components/feedback/overlays";
import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useTranslation } from "react-i18next";
import { FolderOpen, Settings2, Star, Trash2 } from "lucide-react";
import type { LibraryAdapter, LibraryState } from "../../../../assets/src/main/interface";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { formatTime } from "../../time";
import i18n from "../../i18n";

function Library({ adapter, element }: { adapter: LibraryAdapter; element: HTMLElement }) {
    const { t } = useTranslation();
    const [state, setState] = useState<LibraryState>({ folders: [], files: [], errors: [] });
    const [busy, setBusy] = useState(false);
    const [query, setQuery] = useState("");
    const [favorites, setFavorites] = useState(false);
    const [sort, setSort] = useState("modified");
    const [foldersVisible, setFoldersVisible] = useState(false);
    const scroll = useRef<HTMLDivElement>(null);
    const refresh = async () => setState(await adapter.snapshot());
    useEffect(() => {
        let active = true, pending = false;
        const poll = async () => {
            if (!element.isConnected || pending) return;
            pending = true;
            try { const next = await adapter.snapshot(); if (active) setState(next); }
            catch (error) { if (active) notify(String(error)); }
            finally { pending = false; }
        };
        void poll(); const timer = setInterval(() => void poll(), 1500);
        return () => { active = false; clearInterval(timer); };
    }, [adapter, element]);
    const action = async (operation: () => Promise<unknown>) => {
        setBusy(true);
        try { await operation(); await refresh(); } catch (error) { notify(String(error)); } finally { setBusy(false); }
    };
    const files = useMemo(() => state.files.filter(file => (!favorites || file.favorite) && `${file.name} ${file.path}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())).sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : sort === "size" ? b.size - a.size : sort === "viewedAt" ? (b.viewedAt ?? 0) - (a.viewedAt ?? 0) : b.modified - a.modified), [state.files, favorites, query, sort]);
    const rows = useVirtualizer({ count: files.length, getScrollElement: () => scroll.current, estimateSize: () => 110, overscan: 5 });
    const size = (bytes: number) => bytes >= 1073741824 ? `${(bytes / 1073741824).toFixed(2)} GB` : `${(bytes / 1048576).toFixed(1)} MB`;
    return <main className="replay-interface library dark">
        <header className="library-header"><div><h1>{t("library.title")}</h1><p className="muted">{t("library.subtitle")}</p></div>
            <div className="library-actions"><Button variant="outline" disabled={busy} onClick={() => void action(adapter.addFolder)}><FolderOpen />{t("library.addFolder")}</Button>
                <Button disabled={busy} onClick={() => void action(adapter.importFile)}>{t("library.import")}</Button>
                <Button variant="ghost" onClick={() => window.dispatchEvent(new Event('replay-open-settings'))}><Settings2 />{t('settings')}</Button>
            </div>
        </header>
        <div className="library-summary"><span>{t("library.count", { count: state.files.length })} · {size(state.files.reduce((total, file) => total + file.size, 0))}</span>
            <Button variant="ghost" aria-expanded={foldersVisible} onClick={() => setFoldersVisible(!foldersVisible)}>{t("library.folders", { count: state.folders.length })}</Button></div>
        {foldersVisible && <section className="library-folders" aria-label={t("library.folderSettings")}><p className="muted">{t("library.folderHint")}</p>
            {state.folders.map(folder => <div key={folder}><span data-tooltip={folder}>{folder}</span><Button disabled={busy || folder === state.defaultFolder} variant="outline" onClick={() => void action(() => adapter.configure(state.folders, folder))}>{t(folder === state.defaultFolder ? "library.defaultFolder" : "library.setDefault")}</Button>
                <Button variant="ghost" disabled={busy} onClick={() => void action(() => adapter.configure(state.folders.filter(value => value !== folder), folder === state.defaultFolder ? state.folders.find(value => value !== folder) : state.defaultFolder))}>{t("library.stopTracking")}</Button></div>)}
        </section>}
        <div className="library-filters"><Input aria-label={t("library.search")} placeholder={t("library.search")} value={query} onChange={e => setQuery(e.target.value)} />
            <Button variant={favorites ? "default" : "outline"} aria-pressed={favorites} onClick={() => setFavorites(!favorites)}><Star />{t("library.favorites")}</Button>
            <Select label={t('library.sort')} value={sort} onChange={setSort} options={['modified', 'name', 'size', 'viewedAt'].map(key => ({ value: key, label: t(`library.${key}`) }))} /></div>
        {state.errors.length > 0 && <details className="library-errors"><summary>{t("library.folderErrors")}</summary>{state.errors.map((error, i) => <p key={i}>{error}</p>)}</details>}
        <div className="library-list" ref={scroll} aria-busy={busy}>
            {!files.length ? <div className="library-empty"><FolderOpen size={36} /><h2>{t(query || favorites ? "library.noMatches" : "library.empty")}</h2><p>{t("library.emptyHint")}</p><Button variant="outline" disabled={busy} onClick={() => void action(adapter.addFolder)}>{t("library.addFolder")}</Button></div> :
                <div style={{ height: rows.getTotalSize(), position: "relative" }}>{rows.getVirtualItems().map(row => { const file = files[row.index]; return <article className="library-row" key={file.path} style={{ transform: `translateY(${row.start}px)` }}>
                    <Button variant="ghost" size="icon" aria-label={t("library.favorite", { name: file.name })} aria-pressed={!!file.favorite} disabled={busy} onClick={() => void action(() => adapter.favorite(file.path, !file.favorite))}><Star fill={file.favorite ? "currentColor" : "none"} /></Button>
                    <div className="library-file"><strong>{file.name}</strong><span className="muted" data-tooltip={file.path}>{file.path}</span><small className="muted">{size(file.size)} · {new Date(file.modified).toLocaleString(i18n.language)}{file.duration !== undefined && ` · ${formatTime(file.duration)}`}</small></div>
                    <div className="library-row-actions"><Button disabled={busy} onClick={() => void action(() => adapter.open(file.path))}>{t("library.open")}</Button>
                        <Button variant="ghost" size="icon" aria-label={t("library.reveal", { name: file.name })} disabled={busy} onClick={() => void action(() => adapter.reveal(file.path))}><FolderOpen /></Button>
                        <Button variant="ghost" size="icon" aria-label={t("library.trash", { name: file.name })} disabled={busy} onClick={() => void action(() => adapter.trash(file.path, { title: t("library.trashTitle"), message: t("library.trashMessage"), cancel: t("cancel"), remove: t("library.trashConfirm") }))}><Trash2 /></Button></div>
                </article>; })}</div>}
        </div>
    </main>;
}
export function mountLibrary(element: HTMLElement, adapter: LibraryAdapter) {
    const root = createRoot(element); root.render(<Library adapter={adapter} element={element} />);
    return () => root.unmount();
}
