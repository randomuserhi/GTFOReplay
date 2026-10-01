import { notify } from "../../components/feedback/overlays";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { PlaybackAdapter, Bookmark } from "../../../../assets/src/main/interface";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { formatTime } from "../../time";

export function Bookmarks({ adapter, identity }: { adapter: PlaybackAdapter; identity?: string }) {
    const { t } = useTranslation();
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [draft, setDraft] = useState<Bookmark>();
    const [removed, setRemoved] = useState<Bookmark>();
    const [busy, setBusy] = useState(true);
    const [page, setPage] = useState(0);
    useEffect(() => {
        let active = true;
        if (!identity) { setBusy(false); return; }
        void adapter.bookmarks().then(notes => { if (active) setBookmarks(notes); }).catch(error => { if (active) notify(String(error)); }).finally(() => { if (active) setBusy(false); });
        return () => { active = false; };
    }, [adapter, identity]);
    const save = async (next: Bookmark[]) => {
        setBusy(true);
        try { await adapter.saveBookmarks(next); setBookmarks(next); setDraft(undefined); notify(t("saved"), "success"); return true; }
        catch (error) { notify(String(error)); return false; }
        finally { setBusy(false); }
    };
    const sorted = [...bookmarks].sort((a, b) => a.time - b.time);
    return <div className="notes-panel">
        <div className="event-filters"><Button disabled={busy || !identity} onClick={() => setDraft({ id: crypto.randomUUID(), time: adapter.state().time, label: t("newBookmark"), note: "" })}>{t("addBookmark")}</Button>
            <span className="muted">{t("notesHint")}</span>
            {removed && <Button variant="ghost" disabled={busy} onClick={() => void save([...bookmarks, removed]).then(ok => { if (ok) setRemoved(undefined); })}>{t("undo")}</Button>}
        </div>
        {draft ? <form noValidate className="note-editor" onSubmit={event => { event.preventDefault(); if (!draft.label.trim()) { notify(t("bookmarkRequired")); return; } void save([...bookmarks.filter(note => note.id !== draft.id), draft]); }}>
            <time>{formatTime(draft.time)}</time>
            <label>{t("bookmarkTitle")}<Input required maxLength={120} value={draft.label} onChange={e => setDraft({ ...draft, label: e.target.value })} /></label>
            <label>{t("note")}<textarea rows={3} maxLength={8000} value={draft.note} onChange={e => setDraft({ ...draft, note: e.target.value })} /></label>
            <div><Button type="submit" disabled={busy}>{t("save")}</Button> <Button variant="ghost" disabled={busy} onClick={() => setDraft(undefined)}>{t("cancel")}</Button></div>
        </form> : <div className="notes-list">
            {busy && <p role="status">{t("loadingNotes")}</p>}
            {!busy && bookmarks.length === 0 && <p className="empty-message">{t("emptyNotes")}</p>}
            {sorted.slice(page * 30, (page + 1) * 30).map(note => <div className="note-row" key={note.id}>
                <button className="note-jump" onClick={() => adapter.seek(note.time)}><time>{formatTime(note.time)}</time><strong>{note.label}</strong></button>
                {note.note && <p>{note.note}</p>}
                <div><Button variant="outline" title={`${t("goToBookmark")} · ${formatTime(note.time)} · ${note.label}`} onClick={() => adapter.seek(note.time)}>{t("goToBookmark")}</Button><Button variant="ghost" disabled={busy} onClick={() => setDraft({ ...note })}>{t("edit")}</Button><Button variant="ghost" disabled={busy} onClick={() => void save(bookmarks.filter(value => value.id !== note.id)).then(ok => { if (ok) { setRemoved(note); setPage(0); } })}>{t("remove")}</Button></div>
            </div>)}
            {sorted.length > 30 && <div className="event-filters"><Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>{t("previousPage")}</Button><Button variant="outline" disabled={(page + 1) * 30 >= sorted.length} onClick={() => setPage(page + 1)}>{t("nextPage")}</Button></div>}
        </div>}
    </div>;
}
