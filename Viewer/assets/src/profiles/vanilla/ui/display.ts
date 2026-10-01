import { html, Mutable } from "@esm/@/rhu/html.js";
import { Signal, signal } from "@esm/@/rhu/signal.js";
import type { View } from "@esm/@root/main/routes/player/components/view/index.js";
import { Debug } from "./hud/debug.js";
import { ObjectiveDisplay } from "./hud/objectives.js";
import { TacticalDisplay } from "./hud/tactical.js";
import { dispose } from "./main.js";
import { Scoreboard } from "./scoreboard.js";
import { intervalStats } from "../library/interval-stats.js";
import { StatTracker } from "../parser/stattracker/stattracker.js";
import { eventLeadIn, resolveEventFocus } from "../library/eventCamera.js";
import { validateRange } from "@esm/@root/replay/transport.js";

export const Display = () => {
    interface Display {
        readonly view: Signal<html<typeof View> | undefined>;
        readonly scoreboard: html<typeof Scoreboard>;
        readonly mount: HTMLDivElement;
        readonly debug: html<typeof Debug>;
    }
    interface Private {
        readonly controls: HTMLDivElement;
        readonly objective: html<typeof ObjectiveDisplay>;
        readonly tactical: html<typeof TacticalDisplay>;
    }
    const dom = html<Mutable<Display & Private>>`
        <div m-id="mount" style="position:absolute;inset:0 0 96px;"></div>
        ${html.bind(Scoreboard(), "scoreboard").transform(macro => {
            Object.assign(macro.wrapper.style, { position: "absolute", top: "50%", left: "50%", zIndex: "1", width: "80%", maxWidth: "900px", maxHeight: "500px", transform: "translate(-50%, -50%)" });
        })}
        ${html.bind(Debug(), "debug")}
        ${html.bind(ObjectiveDisplay(), "objective")}
        ${html.bind(TacticalDisplay(), "tactical")}
        <div m-id="controls" style="position:absolute;bottom:0;left:0;right:0;z-index:3;"></div>
    `;
    html(dom).box();
    dom.view = signal<html<typeof View> | undefined>(undefined);
    let unmount: (() => void) | undefined;
    const observer = new ResizeObserver(() => {
        dom.mount.style.bottom = `${dom.controls.getBoundingClientRect().height}px`;
        dom.tactical.wrapper.style.bottom = `${dom.controls.getBoundingClientRect().height + 16}px`;
        dom.view()?.resize();
    });
    observer.observe(dom.controls);
    dispose.signal.addEventListener("abort", () => { unmount?.(); observer.disconnect(); }, { once: true });
    dom.view.on(view => {
        unmount?.();
        if (!view) return;
        dom.mount.replaceChildren(...view);
        dom.scoreboard.view(view);
        dom.debug.view(view);
        dom.objective.view(view);
        dom.tactical.view(view);
        const identity = () => {
            const id = view.replay()?.identity;
            if (!id) throw new Error("This stream has no persistent replay identity.");
            return id;
        };
        let focusRequest = 0;
        unmount = window.ReplayInterface.mountControls(dom.controls, {
            follow: slot => { ++focusRequest; view.renderer.get("Controls")?.followPlayer(slot); },
            autoCamera: () => { ++focusRequest; view.renderer.get("Controls")?.enableAutoCamera(); },
            firstPerson: enabled => { ++focusRequest; view.renderer.get("Controls")?.setFirstPerson(enabled); },
            copyText: text => window.api.invoke("copyText", text),
            screenshot: async () => {
                const blob = await new Promise<Blob>((resolve, reject) => requestAnimationFrame(() => {
                    try {
                        const api = view.api();
                        if (!api) throw new Error("No rendered replay frame is available.");
                        view.renderer.render(0, api);
                        view.canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Screenshot capture failed.")), "image/png");
                    } catch (error) { reject(error); }
                }));
                return window.api.invoke("saveReplayScreenshot", new Uint8Array(await blob.arrayBuffer()));
            },
            statistics: async (start, end) => {
                const replay = view.replay();
                if (!replay) return { players: [], confirmedEnemyDeaths: null };
                validateRange({ start, end }, replay.length());
                const before = await replay.getSnapshot(start - 0.001);
                const after = await replay.getSnapshot(end);
                if (!before || !after) throw new Error("Replay interval is not available yet.");
                const a = replay.api(before), b = replay.api(after);
                const names = new Map<bigint, string>();
                for (const api of [a, b]) for (const player of api.get("Vanilla.Player.Snet")?.values() ?? []) names.set(player.snet, player.nickname);
                return {
                    players: intervalStats(a.get("Vanilla.StatTracker")?.players ?? new Map(), b.get("Vanilla.StatTracker")?.players ?? new Map(), names, id => ({ ...StatTracker.availability(b, id), clientPacks: StatTracker.clientPacksAvailable(b, id) })),
                    confirmedEnemyDeaths: b.header.get("Vanilla.StatTracker.Client") === true ? (b.get("Vanilla.StatTracker")?.confirmedEnemyDeaths ?? 0) - (a.get("Vanilla.StatTracker")?.confirmedEnemyDeaths ?? 0) : null
                };
            },
            focusEvent: async event => {
                const replay = view.replay(), controls = view.renderer.get("Controls");
                if (!replay || !controls) return false;
                const request = ++focusRequest;
                controls.cancelEventFocus();
                const revision = controls.revision;
                const time = eventLeadIn(event.time, replay.startTime);
                view.pause(true); view.live(false); view.time(time);
                const state = await replay.getSnapshot(Math.max(replay.startTime, event.time - .001));
                // A late chunk read must not steal the camera from a newer click or manual input.
                if (request !== focusRequest || controls.revision !== revision || view.replay() !== replay || view.time() !== time || !view.pause() || dispose.signal.aborted || dom.view() !== view) return true;
                if (!state) return false;
                const api = replay.api(state);
                const target = resolveEventFocus(event, api.get('Vanilla.Player') ?? new Map(), api.get('Vanilla.Enemy') ?? new Map());
                if (!target) return false;
                controls.focusEvent(target, time);
                return true;
            },
            bookmarks: async () => window.api.invoke("replayBookmarks", identity()),
            saveBookmarks: async bookmarks => window.api.invoke("saveReplayBookmarks", identity(), bookmarks),
            state: () => ({ players: [...(view.api()?.get("Vanilla.Player")?.values() ?? [])].map(p => ({ slot: p.slot, nickname: p.nickname })), following: view.renderer.get("Controls")?.targetSlot(), cameraAuto: view.renderer.get("Controls")?.autoCamera() ?? true, firstPerson: view.renderer.get("Controls")?.firstPerson() ?? false, cameraTarget: view.renderer.get("Controls")?.targetName(), identity: view.replay()?.identity, startTime: view.replay()?.startTime ?? 0, time: view.time(), duration: view.replay()?.length() ?? 0, loadedUntil: view.replay()?.loadedLength() ?? 0, loadFailed: !!view.replay()?.error, live: view.replay()?.endTime === undefined, paused: view.pause(), speed: view.timescale(), indexing: view.replay()?.complete !== true, events: view.replay()?.events ?? [] }),
            seek: time => { ++focusRequest; view.renderer.get("Controls")?.cancelEventFocus(); view.live(false); view.time(time); },
            pause: value => view.pause(value),
            speed: value => view.timescale(value),
            step: async direction => {
                ++focusRequest; view.renderer.get("Controls")?.cancelEventFocus();
                view.pause(true);
                view.live(false);
                const replay = view.replay();
                if (replay) view.time(await replay.step(view.time(), direction));
            }
        });
    }, { signal: dispose.signal });
    return dom as html<Display>;
};
