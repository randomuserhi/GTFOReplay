import { useEffect, useRef, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { Pause, Play, SkipBack, SkipForward, RotateCcw, RotateCw, ChevronsLeft, ChevronsRight, Keyboard } from 'lucide-react';
import type { PlaybackAdapter, PlaybackState, IndexedEvent } from '../../../../assets/src/main/interface';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { notify } from '../../components/feedback/overlays';
import { timelineEvents } from '../../events';
import { formatTime } from '../../time';

export function Transport({ state, adapter, events, seek, onShortcuts }: {
    state: PlaybackState; adapter: PlaybackAdapter; events: readonly IndexedEvent[];
    seek(time: number): void; onShortcuts(): void;
}) {
    const { t } = useTranslation();
    const canvas = useRef<HTMLCanvasElement>(null);
    const scrubbing = useRef(false);
    const wasPaused = useRef(true);
    const loadedPercent = state.duration > state.startTime ? Math.max(0, Math.min(100, (state.loadedUntil - state.startTime) / (state.duration - state.startTime) * 100)) : 0;
    const loadingLabel = state.loadFailed || state.live || state.indexing
        ? t(state.loadFailed ? 'loadStopped' : state.live ? 'liveLoaded' : 'loadProgress', { loaded: formatTime(state.loadedUntil) })
        : '';
    useEffect(() => {
        const element = canvas.current;
        if (!element) return;
        const draw = () => {
            const context = element.getContext("2d");
            if (!context) return;
            element.width = Math.max(1, element.clientWidth * devicePixelRatio);
            element.height = 14 * devicePixelRatio;
            context.clearRect(0, 0, element.width, element.height);
            for (const [column, event] of timelineEvents(events, state.startTime, state.duration, element.clientWidth)) {
                context.fillStyle = event.kind.endsWith("Marker") ? "#dba852" : "#597a83";
                context.fillRect(column * devicePixelRatio, 2, Math.max(1, devicePixelRatio), element.height - 2);
            }
        };
        draw();
        const observer = new ResizeObserver(draw); observer.observe(element);
        return () => observer.disconnect();
    }, [events, state.duration, state.startTime]);
    useEffect(() => {
        const key = (event: KeyboardEvent) => {
            const target = event.target instanceof Element ? event.target : undefined;
            // Closed playback selectors retain focus after choosing a player or
            // speed. Space still belongs to playback; open menus handle their keys.
            const transportControl = target?.closest('.transport');
            const openOverlay = [...document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"],[role="listbox"]')]
                .some(element => element.checkVisibility());
            if (event.repeat || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || (!transportControl && target?.closest('input,textarea,button,[role="combobox"],[contenteditable="true"]')) || openOverlay) return;
            const current = adapter.state();
            // Keyboard layouts/input methods may report the character without a
            // physical code. Both identify the same playback action.
            if (event.code === 'Space' || event.key === ' ') adapter.pause(!current.paused);
            else if (event.code === 'Home') adapter.seek(current.startTime);
            else if (event.code === 'End') adapter.seek(current.loadedUntil);
            else if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
                const direction = event.code === 'ArrowLeft' ? -1 : 1;
                if (event.shiftKey) void adapter.step(direction).catch(error => notify(String(error)));
                else adapter.seek(Math.max(current.startTime, Math.min(current.loadedUntil, current.time + direction * 5000)));
            } else return;
            event.preventDefault(); event.stopPropagation();
        };
        window.addEventListener('keydown', key, true); return () => window.removeEventListener('keydown', key, true);
    }, [adapter]);
    const endScrub = () => { if (scrubbing.current) { scrubbing.current = false; adapter.pause(wasPaused.current); } };
    return (
        <div className="transport">
            <div className="timeline"><canvas ref={canvas} aria-hidden="true" /><input type="range" aria-label={t("seek")} min={state.startTime} max={Math.max(state.startTime + 1, state.duration)} step={1000} value={state.time}
                aria-valuetext={`${formatTime(state.time)} / ${formatTime(state.duration)}${loadingLabel ? `; ${loadingLabel}` : ''}`} style={{ '--loaded-percent': `${loadedPercent}%` } as CSSProperties}
                onPointerDown={() => { scrubbing.current = true; wasPaused.current = state.paused; adapter.pause(true); }} onPointerUp={endScrub} onPointerCancel={endScrub} onBlur={endScrub}
                onChange={e => seek(Number(e.target.value))} /></div>
            <div className="transport-row">
                <div className="transport-primary" role="group" aria-label={t('playbackControls')}>
                <Button variant="ghost" size="icon" title={`${t("start")} · Home`} aria-label={t('start')} onClick={() => seek(state.startTime)}><ChevronsLeft /></Button>
                <Button variant="ghost" size="icon" title={`${t("skipBack")} · ←`} aria-label={t('skipBack')} onClick={() => seek(state.time - 5000)}><RotateCcw /></Button>
                <Button variant="ghost" size="icon" title={`${t("previousTick")} · Shift + ←`} aria-label={t("previousTick")} onClick={() => void adapter.step(-1).catch(error => notify(String(error)))}><SkipBack /></Button>
                <Button size="icon" title={`${t(state.paused ? "play" : "pause")} · Space`} aria-label={t(state.paused ? "play" : "pause")} onClick={() => adapter.pause(!state.paused)}>{state.paused ? <Play /> : <Pause />}</Button>
                <Button variant="ghost" size="icon" title={`${t("nextTick")} · Shift + →`} aria-label={t("nextTick")} onClick={() => void adapter.step(1).catch(error => notify(String(error)))}><SkipForward /></Button>
                <Button variant="ghost" size="icon" title={`${t("skipForward")} · →`} aria-label={t('skipForward')} onClick={() => seek(state.time + 5000)}><RotateCw /></Button>
                <Button variant="ghost" size="icon" title={`${t("end")} · End`} aria-label={t('end')} onClick={() => seek(state.duration)}><ChevronsRight /></Button>
                <time className="playback-time">{formatTime(state.time)} <span className="muted">/ {formatTime(state.duration)}</span></time>
                </div>
                <div className="transport-secondary">
                <div className="speed-status">
                    <Select label={t('speed')} value={String(state.speed)} onChange={value => adapter.speed(Number(value))} options={[...new Set([0.1, 0.25, 0.5, 1, 1.5, 2, 4, 8, state.speed])].sort((a,b) => a-b).map(speed => ({ value: String(speed), label: `${speed}×` }))} />
                    {loadingLabel && <span className="load-status" data-tooltip={state.indexing && !state.live && !state.loadFailed ? t('unloadedHint') : undefined}>{loadingLabel}</span>}
                </div>
                <div className="transport-camera" role="group" aria-label={t('camera')}>
                <label className="follow-field"><span data-tooltip={t('autoCameraHint')}>{t('camera')}</span><Select label={t('followPlayer')} value={state.cameraAuto ? 'auto' : state.following !== undefined ? String(state.following) : state.cameraTarget ? 'event' : 'free'} onChange={value => { if (value === 'auto') adapter.autoCamera(); else if (value !== 'event') adapter.follow(value === 'free' ? undefined : Number(value)); }} options={[{ value: 'auto', label: t('autoCamera') }, { value: 'free', label: t('freeCamera') }, ...(state.cameraTarget && state.following === undefined && !state.cameraAuto ? [{ value: 'event', label: state.cameraTarget }] : []), ...state.players.map(player => ({ value: String(player.slot), label: player.nickname }))]} /></label>
                <Button variant={state.firstPerson ? 'secondary' : 'ghost'} aria-pressed={state.firstPerson} disabled={state.following === undefined && !state.firstPerson} title={t(state.following === undefined && !state.firstPerson ? 'selectPlayerForFirstPerson' : 'firstPersonHint')} onClick={() => adapter.firstPerson(!state.firstPerson)}>{t('firstPerson')}</Button>
                </div>
                <Button className="shortcut-help" variant="ghost" size="icon" title={t('shortcutsHint')} aria-label={t('shortcuts')} onClick={onShortcuts}><Keyboard /></Button>
                </div>
            </div>

        </div>
    );
}
