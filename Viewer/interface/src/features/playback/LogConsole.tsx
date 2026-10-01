import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { clearLogs, droppedLogs, logSnapshot, logText, subscribeLogs } from '../../logs';

export function LogConsole({ copyText }: { copyText(text: string): Promise<void> }) {
    const { t } = useTranslation();
    const logs = useSyncExternalStore(subscribeLogs, logSnapshot);
    const [query, setQuery] = useState('');
    const [level, setLevel] = useState('all');
    const [follow, setFollow] = useState(true);
    const [status, setStatus] = useState('');
    const scroll = useRef<HTMLDivElement>(null);
    const visible = useMemo(() => logs.filter(log => (level === 'all' || log.level === level) && log.message.toLowerCase().includes(query.toLowerCase())), [logs, level, query]);
    useEffect(() => { if (follow && scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight; }, [visible, follow]);
    useEffect(() => { setStatus(''); }, [query, level, logs]);
    const copy = async () => {
        try { await copyText(logText(visible)); setStatus('logCopied'); }
        catch { setStatus('logCopyError'); }
    };
    return <div className="log-console">
        <div className="log-tools">
            <p className="muted">{t('logHint')}</p>
            <Input aria-label={t('logSearch')} placeholder={t('logSearch')} value={query} onChange={event => setQuery(event.target.value)} />
            <Select label={t('logLevel')} value={level} onChange={setLevel} options={[{ value: 'all', label: t('logAll') }, ...['error', 'warn', 'info', 'log', 'debug'].map(value => ({ value, label: value.toUpperCase() }))]} />
            <div className="log-actions"><Button size="sm" variant="outline" disabled={!visible.length} onClick={() => void copy()}>{t('logCopy')}</Button><Button size="sm" variant="ghost" disabled={!logs.length} onClick={clearLogs}>{t('logClear')}</Button></div>
            <label className="log-follow"><input type="checkbox" checked={follow} onChange={event => setFollow(event.target.checked)} />{t('logFollow')}</label>
            <span className="muted">{t('logCount', { count: visible.length, total: logs.length })}</span>
            {droppedLogs() > 0 && <span className="muted">{t('logDropped', { count: droppedLogs() })}</span>}
            <span role="status">{status && t(status)}</span>
        </div>
        <div className="log-scroll" ref={scroll} tabIndex={0} aria-label={t('logs')} onScroll={event => { const el = event.currentTarget; if (el.scrollHeight - el.scrollTop - el.clientHeight > 40) setFollow(false); }}>
            {!visible.length ? <p className="empty-message">{t('logEmpty')}</p> : visible.map(log => <article className="log-entry" data-level={log.level} key={log.id}>
                <div><time dateTime={new Date(log.time).toISOString()}>{new Date(log.time).toLocaleTimeString([], { hour12: false })}</time><strong>{log.level.toUpperCase()}</strong></div>
                <pre>{log.message}</pre>
            </article>)}
        </div>
    </div>;
}
