import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUp, Folder, File, Search } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { DialogRequest, DirectoryListing } from '../../../../shared/dialog';
import { Modal } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { notify } from '../feedback/overlays';

const api = (window as unknown as { api?: { on(channel: string, cb: (request: DialogRequest) => void): number; off(channel: string, id: number): void; invoke(channel: string, ...args: unknown[]): Promise<any> } }).api;
export function FileDialog() {
    const [request, setRequest] = useState<DialogRequest>();
    useEffect(() => {
        if (!api) return;
        const id = api.on('appDialog', setRequest); return () => api.off('appDialog', id);
    }, []);
    return request && <FilePicker key={request.id} request={request} close={() => setRequest(undefined)} />;
}
function FilePicker({ request, close }: { request: DialogRequest; close(): void }) {
    const { t } = useTranslation();
    const save = request.kind === 'save', confirm = request.kind === 'confirm';
    const split = request.path.lastIndexOf('\\') >= 0 ? '\\' : '/';
    const initial = save ? request.path.slice(0, request.path.lastIndexOf(split) + 1) : request.path;
    const [listing, setListing] = useState<DirectoryListing>();
    const [address, setAddress] = useState(initial);
    const [name, setName] = useState(save ? request.path.split(split).pop()! : '');
    const [selected, setSelected] = useState('');
    const [query, setQuery] = useState('');
    const [busy, setBusy] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [overwrite, setOverwrite] = useState<string>();
    const generation = useRef(0);
    const scroll = useRef<HTMLDivElement>(null);
    const entries = listing?.entries.filter(entry => entry.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())) ?? [];
    const rows = useVirtualizer({ count: entries.length, getScrollElement: () => scroll.current, estimateSize: () => 36, overscan: 8 });
    const browse = async (path: string) => {
        const version = ++generation.current; setBusy(true); setError('');
        try { const next = await api!.invoke('browseAppDialog', request.id, path); if (version === generation.current) { setListing(next); setAddress(next.path); setSelected(''); setQuery(''); } }
        catch (e) { if (version === generation.current) setError(String(e)); }
        finally { if (version === generation.current) setBusy(false); }
    };
    useEffect(() => { if (!confirm) void browse(initial); return () => { generation.current++; }; }, []);
    const finish = async (path?: string, replace = false) => {
        setSubmitting(true);
        try { const result = await api!.invoke('completeAppDialog', request.id, path, replace); if (result.overwrite) setOverwrite(path); else close(); }
        catch (e) { notify(String(e)); }
        finally { setSubmitting(false); }
    };
    const chosen = confirm ? 'confirm' : request.kind === 'folder' ? selected || listing?.path : save ? listing && `${listing.path}${split}${name}` : selected;
    return <Modal open onClose={() => { if (!submitting) void finish(); }} title={request.title ?? t(`dialog.${request.kind}`)} description={request.message ?? t('dialog.hint')} className={confirm ? 'confirm-dialog' : 'file-dialog'}>
        {confirm ? <p className="dialog-detail">{request.path}</p> : <>
            <form className="file-address" noValidate onSubmit={e => { e.preventDefault(); void browse(address); }}>
                <Button variant="outline" size="icon" disabled={busy || !listing || listing.parent === listing.path} aria-label={t('dialog.up')} onClick={() => void browse(listing!.parent)}><ArrowUp /></Button>
                <Input aria-label={t('dialog.path')} value={address} onChange={e => setAddress(e.target.value)} /><Button type="submit" variant="outline" disabled={busy}>{t('dialog.go')}</Button>
            </form>
            <div className="file-body"><nav aria-label={t('dialog.locations')}>{listing?.locations.map(location => <Button key={location.path} variant="ghost" onClick={() => void browse(location.path)} disabled={busy}><Folder />{t(`dialog.${location.name}`, { defaultValue: location.name })}</Button>)}</nav>
                <div className="file-content"><div className="file-search"><Search size={16} /><Input aria-label={t('dialog.filter')} placeholder={t('dialog.filter')} value={query} onChange={e => setQuery(e.target.value)} /></div>
                    {error && <p className="file-error" role="alert">{error}</p>}
                    <div className="file-entries" ref={scroll} aria-busy={busy}>
                        {busy ? <p className="empty-message">{t('dialog.loading')}</p> : entries.length ? <div style={{ height: rows.getTotalSize(), position: 'relative' }}>{rows.getVirtualItems().map(row => { const entry = entries[row.index]; return <button key={entry.path} className="file-entry" data-selected={selected === entry.path} style={{ transform: `translateY(${row.start}px)` }}
                            onClick={() => { if (entry.directory) void browse(entry.path); else { setSelected(entry.path); if (save) setName(entry.name); } }} onDoubleClick={() => { if (!entry.directory && !save) void finish(entry.path); }}>
                            {entry.directory ? <Folder size={17} /> : <File size={17} />}<span>{entry.name}</span>{entry.directory && <small>↗</small>}
                        </button>; })}</div> : !error && <p className="empty-message">{t('dialog.empty')}</p>}
                    </div>
                </div></div>
            {save && <label className="file-name">{t('dialog.filename')}<Input value={name} onChange={e => { setName(e.target.value); setOverwrite(undefined); }} /></label>}
            <p className="dialog-detail muted">{request.kind === 'folder' ? listing?.path : `.${request.extensions?.join(' · .')}`}</p>
        </>}
        {overwrite && <div className="overwrite-warning" role="alert"><strong>{t('dialog.overwrite')}</strong><p>{overwrite}</p><Button variant="destructive" disabled={busy} onClick={() => void finish(overwrite, true)}>{t('dialog.replace')}</Button><Button variant="ghost" onClick={() => setOverwrite(undefined)}>{t('cancel')}</Button></div>}
        <footer className="dialog-footer"><Button variant="ghost" disabled={submitting} onClick={() => void finish()}>{t('cancel')}</Button><Button variant={confirm ? 'destructive' : 'default'} disabled={busy || submitting || !chosen || !!overwrite} onClick={() => void finish(chosen)}>{request.accept ?? t(save ? 'save' : request.kind === 'folder' ? 'dialog.chooseFolder' : 'library.open')}</Button></footer>
    </Modal>;
}
