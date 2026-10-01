import { LogConsole } from "./LogConsole";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronRight, Info, X } from "lucide-react";
import { Transport } from "./Transport";
import { WorkspaceNavigation, panelLabel } from "../../components/layout/WorkspaceNavigation";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/dialog";
import { Select } from "../../components/ui/select";
import { Switch } from "@base-ui/react/switch";
import { visibleEvents, groupEvents, eventKindKey, eventDetail } from "../../events";
import { notify } from "../../components/feedback/overlays";
import { Input } from "../../components/ui/input";
import type { PlaybackAdapter, IndexedEvent } from "../../../../assets/src/main/interface";
import i18n from "../../i18n";
import { formatTime } from "../../time";
import { Bookmarks } from "../bookmarks/Bookmarks";
import { Statistics } from "../statistics/Statistics";

export function PlaybackWorkspace({ adapter }: { adapter: PlaybackAdapter }) {
    const { t } = useTranslation();
    const [state, setState] = useState(adapter.state);
    const [shortcuts, setShortcuts] = useState(false);
    const [query, setQuery] = useState("");
    const [kind, setKind] = useState("");
    const [panel, setPanel] = useState<string>();
    const panelTrigger = useRef<HTMLElement | null>(null);
    const expanded = panel === "events";
    const [includeDetails, setIncludeDetails] = useState(false);
    const [openGroups, setOpenGroups] = useState<Set<number>>(new Set());
    useEffect(() => setOpenGroups(new Set()), [state.identity]);
    const [exporting, setExporting] = useState(false);
    const scroll = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const timer = setInterval(() => {
            const next = adapter.state();
            setState(old => old.identity === next.identity && old.time === next.time && old.duration === next.duration && old.loadedUntil === next.loadedUntil && old.loadFailed === next.loadFailed && old.live === next.live && old.paused === next.paused && old.speed === next.speed && old.events === next.events && old.indexing === next.indexing && old.following === next.following && old.cameraAuto === next.cameraAuto && old.firstPerson === next.firstPerson && old.cameraTarget === next.cameraTarget && JSON.stringify(old.players) === JSON.stringify(next.players) ? old : next);
        }, 100);
        return () => clearInterval(timer);
    }, [adapter]);
    const label = (event: IndexedEvent) => t(`kinds.${eventKindKey(event.kind)}`, { defaultValue: eventKindKey(event.kind) });
    const detail = (event: IndexedEvent) => eventDetail(event, person => person.name ? `${person.name}${person.type === "enemy" ? ` #${person.id}` : ""}` : t(`participant.${person.type}`, { id: person.id }));
    const events = useMemo(() => visibleEvents(state.events, includeDetails, kind, query, event => `${label(event)} ${detail(event)}`), [state.events, includeDetails, kind, query, i18n.language]);
    const kinds = useMemo(() => [...new Set(visibleEvents(state.events, includeDetails).map(event => event.kind))].sort(), [state.events, includeDetails]);
    const groups = useMemo(() => groupEvents(events), [events]);
    const timeline = useMemo(() => groups.map(group => group.events[0]), [groups]);
    const displayRows = useMemo(() => groups.flatMap(group => [
        { event: group.events[0], group, child: false },
        ...(group.events.length > 1 && openGroups.has(group.events[0].id) ? group.events.map(event => ({ event, group, child: true })) : [])
    ]), [groups, openGroups]);
    const rows = useVirtualizer({ count: displayRows.length, getScrollElement: () => scroll.current, estimateSize: () => 64, overscan: 6 });
    const exportFile = async (operation: () => Promise<boolean>) => {
        setExporting(true);
        try { if (await operation()) notify(t("exportSaved"), "success"); }
        catch (error) { notify(`${t("exportError")} ${error}`); }
        finally { setExporting(false); }
    };
    const seek = (time: number) => { adapter.seek(Math.max(state.startTime, Math.min(state.loadedUntil, time))); setState(adapter.state()); };
    const focusEvent = (event: IndexedEvent) => void adapter.focusEvent(event).then(found => { if (!found) notify(t("noEventLocation"), "info"); }, error => notify(String(error)));
    const activate = (next?: string) => {
        if (next === 'settings') { window.dispatchEvent(new Event('replay-open-settings')); return; }
        if (next) panelTrigger.current = document.querySelector<HTMLElement>(`.workspace-nav [data-panel="${next}"]`);
        setPanel(next);
        window.dispatchEvent(new CustomEvent('replay-panel', { detail: next }));
    };
    useEffect(() => {
        const close = () => activate(undefined);
        window.addEventListener('replay-close-panel', close);
        return () => window.removeEventListener('replay-close-panel', close);
    }, []);
    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            if (panel) {
                const target = document.querySelector<HTMLElement>('[data-react-panel] .panel-heading h2')
                    ?? document.querySelector<HTMLElement>('.legacy-panel:not([hidden]) .panel-close');
                target?.focus({ preventScroll: true });
            } else panelTrigger.current?.focus({ preventScroll: true });
        });
        if (!panel) return () => cancelAnimationFrame(frame);
        const escape = (event: KeyboardEvent) => {
            if (event.key !== 'Escape' || event.defaultPrevented) return;
            const overlay = [...document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"],[role="listbox"]')]
                .some(element => element.checkVisibility());
            if (overlay) return;
            event.preventDefault();
            activate(undefined);
        };
        window.addEventListener('keydown', escape);
        return () => { cancelAnimationFrame(frame); window.removeEventListener('keydown', escape); };
    }, [panel]);
    const nav = document.querySelector('[data-replay-nav]');
    const panelHost = document.querySelector('[data-react-panel]');
    const ownPanel = panel && ['events', 'notes', 'stats', 'exports', 'logs'].includes(panel);
    return <section className="replay-interface dark" aria-label={t("seek")}>
        <Modal open={shortcuts} onClose={() => setShortcuts(false)} title={t('shortcuts')}><div className="dialog-content shortcut-list"><p className="muted">{t('cameraControlsHint')}</p>{[['Space','play'],['←','skipBack'],['→','skipForward'],['Shift + ←','previousTick'],['Shift + →','nextTick'],['Home','start'],['End','end']].map(([key,label]) => <div key={key}><span>{t(label)}</span><kbd>{key}</kbd></div>)}</div></Modal>
        {nav && createPortal(<WorkspaceNavigation active={panel} onChange={activate} />, nav)}
        {ownPanel && panelHost && createPortal(<aside className="replay-interface workspace-panel" aria-label={panelLabel(panel)}><header className="panel-heading"><h2 tabIndex={-1}>{panelLabel(panel)}</h2><Button variant="ghost" size="icon" aria-label={t('close')} onClick={() => activate(undefined)}><X /></Button></header>
        {panel === "logs" && <LogConsole copyText={adapter.copyText} />}
        {panel === "notes" && <Bookmarks key={state.identity} adapter={adapter} identity={state.identity} />}
        {panel === "stats" && <Statistics key={state.identity} adapter={adapter} start={state.startTime} end={state.duration} />}
        {panel === "exports" && <div className="panel-content"><p className="muted">{t('captureHint')}</p><Button variant="outline" disabled={exporting} onClick={() => void exportFile(adapter.screenshot)}>{t('screenshot')}</Button><Button variant="ghost" onClick={() => activate('info')}>{t('diagnosticsLink')}</Button></div>}
        {expanded && <div className="event-browser">
            <p className="panel-description">{t('eventHint')}</p>
            <div className="event-filters">
                <Input aria-label={t("filterEvents")} placeholder={t("filterEvents")} value={query} onChange={e => setQuery(e.target.value)} />
                <Select label={t('events')} value={kind || 'all'} onChange={value => setKind(value === 'all' ? '' : value)} options={[{ value: 'all', label: t('allEvents') }, ...kinds.map(value => ({ value, label: t(`kinds.${eventKindKey(value)}`, { defaultValue: eventKindKey(value) }) }))]} />
                <label className="detail-toggle"><Switch.Root className="ui-switch" checked={includeDetails} onCheckedChange={value => { setIncludeDetails(value); setKind(''); }}><Switch.Thumb className="ui-switch-thumb" /></Switch.Root><span>{t('details')}</span><Info size={15} data-tooltip={t('detailsHint')} tabIndex={0} /></label>
                <span className="muted">{t("eventCount", { count: events.length })}{groups.length < events.length && ` · ${t('eventGroups', { count: groups.length })}`}</span>
            </div>
            <div className="event-scroll" ref={scroll}>
                {events.length === 0 ? <p className="empty-message">{t("emptyEvents")}</p> : <div style={{ height: rows.getTotalSize(), position: "relative" }}>
                    {rows.getVirtualItems().map(row => { const { event, group, child } = displayRows[row.index]; const grouped = !child && group.events.length > 1;
                        const names = [...new Set(group.events.flatMap(item => item.participants?.flatMap(person => person.name ? [person.name] : []) ?? []))];
                        const groupDetail = [`${formatTime(group.time)} – ${formatTime(group.endTime)}`, ...names].join(' · ');
                        return <div className="event-row" data-child={child} key={`${child ? 'child' : 'group'}-${event.id}`} style={{ transform: `translateY(${row.start}px)` }}>
                        <button className="event-jump" data-tooltip={grouped ? t('groupHint') : detail(event)} onClick={() => focusEvent(event)}><span className="event-primary"><time>{formatTime(event.time)}</time><span>{label(event)}</span></span><span className="muted event-detail">{grouped ? groupDetail : detail(event)}</span></button>
                        {grouped ? <Button className="event-group-toggle" variant="ghost" size="sm" aria-expanded={openGroups.has(event.id)} aria-label={t(openGroups.has(event.id) ? 'collapseEvents' : 'expandEvents', { count: group.events.length })} onClick={() => setOpenGroups(old => { const next = new Set(old); if (!next.delete(event.id)) next.add(event.id); return next; })}>×{group.events.length}{openGroups.has(event.id) ? <ChevronDown /> : <ChevronRight />}</Button> : <Button variant="ghost" size="sm" onClick={() => focusEvent(event)}>{t("focusEvent")}</Button>}
                    </div>; })}
                </div>}
            </div>
        </div>}
        </aside>, panelHost)}
        <Transport state={state} adapter={adapter} events={timeline} seek={seek} onShortcuts={() => setShortcuts(true)} />
    </section>;
}
