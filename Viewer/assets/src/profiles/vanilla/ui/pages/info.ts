import { ui, uiText, language } from "@esm/@root/main/i18n.js";
import { html, Mutable } from "@esm/@/rhu/html.js";
import { effect, Signal, signal } from "@esm/@/rhu/signal.js";
import type { View } from "@esm/@root/main/routes/player/components/view/index.js";
import { dispose } from "../main.js";
import { pageStyles } from "./lib.js";

const style = pageStyles;

const versionInfo = new Map<string, string>();
versionInfo.set("0.0.1", `Initial Release`);
versionInfo.set("0.0.2", `- Added Squid Boss Tumours`);
versionInfo.set("0.0.3", `- Fix door locks sometimes being on the wrong side
- Enemy max health is now recorded instead of being hard coded for better modded support`);
versionInfo.set("0.0.4", `- Fixed items being in the wrong dimension
- Added dimension filter to item search
- Teleporting to an item now also brings you to the right dimension`);   
versionInfo.set("0.0.5", `- Fixed bulkhead keys not having serial numbers
- Added door punch effect
- Fixed checkpoints sometimes bricking replays`);    
versionInfo.set("0.0.6", `- Improved algorithm for generating map navmesh
- Hybrids now have spikey heads for visual clarity
- Configurable render distance for enemies`); 
versionInfo.set("0.0.7", `- OldBulkheadSounds compatibility layer
- Chargers and Shooters now have custom heads for visual clarity
- Lockout 2 compatibility layer for custom weapon systems`);    
versionInfo.set("0.0.8", `- Mines now use a proper Identifier for modded support
- Thrown items are now shown
- Added ability to change module folder to swap parser for modded content
- Duo Trials profile provided as an example for modders
- Hot reloading support to aid modding
- Fixed map not including all geometry for the ground (really only applies to R8E2)
- Fog repeller radius can be toggled
- Option to follow rotation of player`);  
versionInfo.set("0.0.9", `- Not all items have serial numbers
- Lockmelters applied on doors not removing locks in replay`);
versionInfo.set("0.1.0", `- Replay now detects silent shots when ran as host`);
versionInfo.set("0.1.1", `- Fix silent shot detection not working properly for host player
- Fix snatcher stagger damage calculation
- Show how close an enemy is to being staggered in enemy info`);
versionInfo.set("0.1.2", `- Checkpoint support added
- Vanity support added`);
versionInfo.set("0.1.3", `- Added all resource container locations (including hidden ones)
- Resource containers now include debug info for their assigned item type`);
versionInfo.set("0.1.4", `- Added resource container lock type to debug info`);
versionInfo.set("0.1.5", `- Fix 6 use packs showing up incorrectly`);
versionInfo.set("0.1.6", `- Fix shooter projectiles being incompatible with EEC
- Added terminal serial numbers
- Added reactor objective messages
- Added terminals, reactors, generators, disinfect station and bulkhead controllers to finder tab`);
versionInfo.set("0.1.7", `- Added communication between players that have replay mod
- If host has replay mod, clients with replay mod gain damage information etc...
- Added Survival Warden Event timers`);

export const Info = () => {
    interface Info {
        readonly view: Signal<html<typeof View> | undefined>;
        active: Signal<boolean>;
    }
    interface Private {
        readonly diagnostics: HTMLPreElement;
        readonly exportDiagnostics: HTMLButtonElement;
        readonly sessionText: HTMLPreElement;
        readonly isMasterText: HTMLDivElement;
        readonly isNotMasterText: HTMLDivElement;
        readonly versionText: HTMLDivElement;
        readonly compatibilityText: HTMLDivElement;
        readonly diagnosticSummary: HTMLParagraphElement;
    }

    const isMaster = signal("");
    const version = signal("");

    const dom = html<Mutable<Private & Info>>/**//*html*/`
        <div class="${style.wrapper}">
            <div style="margin-bottom: 20px;">
                <h1>${uiText("REPLAY INFORMATION")}</h1>
                <p>${uiText("Metadata of the current replay")}</p>
            </div>
            <div m-id="body" class="${style.body}">
                <h2>${uiText("Recording diagnostics")}</h2>
                <p>${uiText("Includes the recorder report and up to 500 viewer errors with replay timestamps. Dismissing an alert does not erase it from the report.")}</p>
                <button m-id="exportDiagnostics" style="color:inherit;background:#303943;border:1px solid #596470;border-radius:6px;padding:10px;cursor:pointer;">${uiText("Export diagnostic report")}</button>
                <p m-id="diagnosticSummary" style="white-space:pre-wrap;"></p>
                <pre m-id="diagnostics" style="white-space:pre-wrap;overflow-wrap:anywhere;"></pre>
                <pre m-id="sessionText" style="white-space: pre-wrap; overflow-wrap: anywhere;"></pre>
                <div class="${style.row}">
                    <div class="${style.row}" style="
                    flex-direction: row;
                    gap: 20px;
                    align-items: center;
                    margin-bottom: 10px;
                    font-size: 20px;
                    ">
                        <span>${uiText("Is Master")}</span>
                        <div style="flex: 1"></div>
                        <span>${isMaster}</span>
                    </div>
                    <div m-id="isMasterText" style="display: none; margin-left: 10px;">${uiText("Recorded by the host. Host-authoritative events are available where the installed recorder modules captured them. Missing events are unknown, not proof that nothing happened.")}</div>
                    <div m-id="isNotMasterText" style="display: none; margin-left: 10px;">${uiText("Recorded by a client. Local observations may be incomplete. Compatible peers can supply synchronized damage and other events; this file does not establish which peers supplied every event. Statistics describe captured evidence only.")}</div>
                </div>
                <div class="${style.row}">
                    <div class="${style.row}" style="
                    flex-direction: row;
                    gap: 20px;
                    align-items: center;
                    margin-bottom: 10px;
                    font-size: 20px;
                    ">
                        <span>${uiText("Version")}</span>
                        <div style="flex: 1"></div>
                        <span>${version}</span>
                    </div>
                    <div m-id="versionText" style="margin-left: 10px;">
                    </div>
                </div>
                <div class="${style.row}">
                    <div class="${style.row}" style="
                    flex-direction: row;
                    gap: 20px;
                    align-items: center;
                    margin-bottom: 10px;
                    font-size: 20px;
                    ">
                        <span>${uiText("Compatibility")}</span>
                    </div>
                    <div m-id="compatibilityText" style="margin-left: 10px;">
                    </div>
                </div>
            </div>
        </div>
        `;
    html(dom).box();
    
    dom.view = signal<html<typeof View> | undefined>(undefined);
    dom.active = signal(false);
    let recorderReport: Record<string, unknown> | undefined;
    const diagnosticState = signal("This recording has no embedded diagnostics. A running or interrupted recorder may not have finalized them.");
    const renderDiagnostics = () => {
        dom.diagnostics.textContent = recorderReport ? JSON.stringify(recorderReport, null, 2) : ui(diagnosticState());
        dom.diagnosticSummary.textContent = recorderReport ? [
            recorderReport.Failure ? `${ui("Recording failure")}: ${recorderReport.Failure}` : ui("The recorder reported no capture failure."),
            `${ui("Captured ticks")}: ${recorderReport.Ticks ?? "—"}`,
            `${ui("Average / maximum capture time")}: ${typeof recorderReport.AverageTickMs === "number" ? recorderReport.AverageTickMs.toFixed(2) : "—"} / ${typeof recorderReport.MaxTickMs === "number" ? recorderReport.MaxTickMs.toFixed(2) : "—"} ms`
        ].join("\n") : "";
    };
    language.on(renderDiagnostics, { signal: dispose.signal });
    diagnosticState.on(renderDiagnostics, { signal: dispose.signal });
    dom.exportDiagnostics.onclick = async () => {
        const view = dom.view();
        const replay = view?.replay();
        if (!view || !replay) return;
        dom.exportDiagnostics.disabled = true;
        try {
            const report = {
                schemaVersion: 1,
                createdUtc: new Date().toISOString(), session: replay.get("ReplayRecorder.Session"),
                identity: replay.identity, time: view.time(), duration: replay.length(), complete: replay.complete,
                recorder: recorderReport, recorderStatus: recorderReport ? "available" : diagnosticState(),
                viewerError: replay.error?.stack, logs: view.diagnosticLogs(),
                render: view.renderer.renderer.info.render, browser: navigator.userAgent
            };
            const saved = await window.api.invoke("exportReplayDiagnostics", JSON.stringify(report, null, 2));
            if (saved) window.ReplayInterface.notify(ui("Diagnostic report saved."), "success");
        } catch (error) { window.ReplayInterface.notify(`${ui("Could not export diagnostics.")} ${error}`); }
        finally { dom.exportDiagnostics.disabled = false; }
    };

    dom.view.on((view) => {
        if (view === undefined) return;

        version.on((value) => {
            const text = versionInfo.get(value);
            if (text !== undefined) dom.versionText.innerText = text;
        });

        view.replay.on((replay) => {
            if (replay === undefined) return;

            recorderReport = undefined;
            diagnosticState("Loading diagnostics…");
            void window.api.invoke("recordingDiagnostics", replay.get("ReplayRecorder.Session")?.id).then(report => {
                if (view.replay() !== replay) return;
                recorderReport = report;
                diagnosticState(report ? "" : "This recording has no embedded diagnostics. A running or interrupted recorder may not have finalized them.");
                renderDiagnostics();
            }).catch(error => {
                if (view.replay() !== replay) return;
                diagnosticState(`${ui("Could not read recorder diagnostics.")} ${error}`);
            });
            const _header = replay.watch("ReplayRecorder.Header");
            const _metadata = replay.watch("Vanilla.Metadata");
            const _session = replay.watch("ReplayRecorder.Session");
            effect(() => {
                const session = _session();
                dom.sessionText.textContent = session === undefined ? ui("Session details were not recorded in this file.") :
                    `${session.expedition} — ${session.level}\n${session.rundown}\n${session.startedUtc}\n${ui("Game")}： ${session.gameVersion}\n${ui("Sampling")}： ${session.idleHz}–${session.combatHz} Hz\n${ui("Session")}： ${session.id}\n\n${ui("Loaded plugins")}：\n${session.plugins.map(p => `${p.id} ${p.version}`).join("\n")}`;
                const header = _header();
                if (header === undefined) return;
                
                isMaster(ui(header.isMaster ? "True" : "False"));
                dom.isMasterText.style.display = header.isMaster ? "block" : "none";
                dom.isNotMasterText.style.display = header.isMaster ? "none" : "block";
                
                let versionStr = "0.0.1";
                const metadata = _metadata();
                if (metadata !== undefined) versionStr = metadata.version;
                version(`${versionStr}`);

                // TODO(randomuserhi): Make more maintainable
                const compatability: Node[] = [];
                if (metadata !== undefined) {
                    if (metadata.compatibility_OldBulkheadSound === true) {
                        compatability.push(...html`
                            <a href="https://thunderstore.io/c/gtfo/p/DarkEmperor/OldBulkheadSound/">OldBulkheadSounds</a>
                            <ul style="margin-left: 10px;">
                                <li>${uiText("- Alert blame may be incorrect for sound events triggered on security doors opening")}</li>
                                <li>${uiText("- Can't patch 'LG_SecurityDoor.OnDoorIsOpened' due to NativeDetour vs Harmony")}</li>
                            </ul>
                            `);
                    }
                    if (metadata.compatibility_NoArtifact === true) {
                        compatability.push(...html`
                            <a href="https://thunderstore.io/c/gtfo/p/Secta_aivar/PAIR/">${uiText("PAIR (Or other rundowns without Artifact DB)")}</a>
                            <ul style="margin-left: 10px;">
                                <li>${uiText("- Can't acquire resource locker debug information")}</li>
                                <li>${uiText("- Can't patch 'LG_ResourceContainerBuilder.SetupFunctionGO' as it causes checksum errors when no artifacts are present")}</li>
                            </ul>
                            `);
                    }
                    if (metadata.recordEnemyRagdolls === false) {
                        compatability.push(...html`
                            <div>${uiText("Enamy Ragdolls are not present in this replay.")}</div>
                            <ul style="margin-left: 10px;">
                                <li>${uiText("- Most people disable enemy ragdolls from being recorded to reduce sizes of replays.")}</li>
                            </ul>
                            `);
                    }
                }
                if (compatability.length === 0) dom.compatibilityText.textContent = ui("None");
                else dom.compatibilityText.replaceChildren(...compatability);
            }, [_header, _metadata, _session, language], { signal: dispose.signal });
        }, { signal: dispose.signal });
    }, { signal: dispose.signal });

    return dom as html<Info>;
};
