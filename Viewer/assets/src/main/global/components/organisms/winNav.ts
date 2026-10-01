import { ui, uiAttribute } from "../../../i18n.js";
import { html } from "@/rhu/html.js";
import { signal, Signal } from "@/rhu/signal.js";
import { app } from "../../../app.js";
import { rug } from "../atoms/icons/rug.js";

export const WinNav = () => {
    const dom = html<{
        linkedStatus: Signal<string>; module: Signal<string>; error: Signal<boolean>; moduleList: { values: Signal<string[]> }; activeModuleList: Signal<boolean>;
        icon: HTMLButtonElement; mount: HTMLDivElement; settings: HTMLDivElement; live: HTMLDivElement; language: HTMLDivElement;
        close: HTMLButtonElement; min: HTMLButtonElement; max: HTMLButtonElement;
    }>`<nav class="app-header">
        <button m-id="icon" class="brand-mark" type="button">${rug()}</button>
        <div m-id="mount" class="app-brand"></div>
        <div m-id="settings" hidden></div>
        <div class="header-spacer"></div>
        <div m-id="live"></div>
        <div m-id="language" class="header-language"></div>
        <div class="window-actions">
            <button m-id="min" type="button"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10" /></svg></button>
            <button m-id="max" type="button"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="3" width="10" height="10" /></svg></button>
            <button m-id="close" type="button"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 3 10 10M13 3 3 13" /></svg></button>
        </div>
    </nav>`;
    html(dom).box().children(children => dom.mount.append(...children));
    dom.module = signal(""); dom.error = signal(true); dom.moduleList = { values: signal<string[]>([]) }; dom.activeModuleList = signal(false);
    let settingsContent: HTMLElement | undefined;
    const props = () => ({
        content: settingsContent,
        label: window.ReplayInterface.t("profile"), placeholder: window.ReplayInterface.t("chooseProfile"), value: dom.module(),
        options: dom.moduleList.values().filter(value => value !== "extensions").map(value => ({ value, label: value })),
        open: dom.activeModuleList(), onOpenChange: (value: boolean) => dom.activeModuleList(value),
        onChange: (value: string) => {
            dom.activeModuleList(false); app.player.unlink();
            void window.api.invoke("loadModule", value).then(response => app.onLoadModule(response)).catch(error => window.ReplayInterface.notify(String(error)));
        }
    });
    const selected = window.ReplayInterface.mountSettings(dom.settings, props());
    window.ReplayInterface.mountLanguage(dom.language);
    const update = () => {
        selected.update(props());
        window.dispatchEvent(new CustomEvent("replay-settings-open", { detail: dom.activeModuleList() }));
    };
    dom.module.on(update); dom.moduleList.values.on(update); dom.activeModuleList.on(update);
    window.addEventListener("replay-language-changed", update); update();
    window.addEventListener("replay-open-settings", () => dom.activeModuleList(true));
    window.addEventListener("replay-settings-content", ((event: CustomEvent<HTMLElement | undefined>) => {
        settingsContent = event.detail; update();
    }) as EventListener);
    dom.linkedStatus = signal("Not Linked");
    let targetId = "";
    const connection = window.ReplayInterface.mountConnection(dom.live, async id => {
        targetId = id; dom.linkedStatus("Connecting to {{id}}");
        try { await app.player.link(id); }
        catch (error) { dom.linkedStatus("Failed to link"); throw error; }
    }, ui(dom.linkedStatus()));
    const updateConnection = () => connection.update(ui(dom.linkedStatus(), { id: targetId }));
    dom.linkedStatus.on(updateConnection);
    window.api.on("liveConnected", () => dom.linkedStatus("Linked!"));
    window.api.on("liveFailedToConnect", () => { dom.linkedStatus("Failed to link"); window.ReplayInterface.notify(ui(dom.linkedStatus())); });
    window.addEventListener("replay-language-changed", updateConnection);
    for (const [button, label] of [[dom.close, "Close"], [dom.max, "Maximize"], [dom.min, "Minimize"], [dom.icon, "Load Replay"]] as const) {
        uiAttribute(button, "aria-label", label); uiAttribute(button, "data-tooltip", label);
    }
    dom.close.onclick = () => window.api.closeWindow(); dom.max.onclick = () => window.api.maximizeWindow(); dom.min.onclick = () => window.api.minimizeWindow();
    return dom;
};
