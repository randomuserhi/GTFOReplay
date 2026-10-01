import { language, ui, uiText } from "../../i18n.js";
import { html, Mutable } from "@/rhu/html.js";
import { Signal, signal } from "@/rhu/signal.js";
import { app } from "../../app.js";
import type { ReplayOpenProgress } from "../../../../../shared/loading.js";

export const Main = () => {
    interface Main { readonly loading: Signal<boolean>; readonly error: Signal<string>; readonly active: Signal<boolean>; readonly libraryVisible: Signal<boolean> }
    interface Private { readonly library: HTMLDivElement; readonly landing: HTMLDivElement; readonly video: HTMLVideoElement; readonly loadButton: HTMLButtonElement; readonly loadingWidget: HTMLDivElement; readonly loadingLabel: HTMLDivElement; readonly loadingBytes: HTMLDivElement; readonly loadingBar: HTMLProgressElement }
    const dom = html<Mutable<Main & Private>>`
        <div style="position:absolute;inset:0;">
            <div m-id="landing" class="replay-landing">
                <video m-id="video" muted loop playsinline disablepictureinpicture preload="none" aria-hidden="true">
                    <source src="https://storage.googleapis.com/gtfo-prod-v1/Trailer_for_website_Pro_Res_2_H_264_24fef05909/Trailer_for_website_Pro_Res_2_H_264_24fef05909.mp4" type="video/mp4">
                </video>
                <button m-id="loadButton" class="gtfo-button" type="button">${uiText("Load Replay")}</button>
            </div>
            <div m-id="library" style="height:100%;" hidden></div>
            <div m-id="loadingWidget" style="position:absolute;inset:0;display:none;background:#171c24ed;color:white;align-items:center;justify-content:center;flex-direction:column;gap:12px;z-index:10;">
                <div m-id="loadingLabel" role="status"></div>
                <progress m-id="loadingBar" max="100" style="width:min(320px,80%);accent-color:#87aab7;"></progress>
                <div m-id="loadingBytes" style="font-size:14px;font-variant-numeric:tabular-nums;"></div>
            </div>
        </div>
    `;
    html(dom).box();
    dom.loading = signal(false);
    dom.error = signal("");
    dom.active = signal(false);
    dom.libraryVisible = signal(false);
    const updateLanding = () => {
        dom.library.hidden = !dom.libraryVisible();
        dom.landing.hidden = dom.libraryVisible();
        if (dom.active() && !dom.libraryVisible() && !dom.loading()) void dom.video.play().catch(error => {
            if (error.name !== 'AbortError') window.ReplayInterface.notify(ui('The background video could not load. Local recordings can still be opened.'), 'info');
        });
        else dom.video.pause();
    };
    dom.active.on(updateLanding); dom.libraryVisible.on(updateLanding); dom.loading.on(updateLanding);
    dom.video.muted = true;
    dom.loadButton.onclick = () => { void app.chooseFile().catch(error => window.ReplayInterface.notify(String(error))); };
    dom.error.on(value => { if (value) window.ReplayInterface.notify(value); });
    let progress: ReplayOpenProgress | undefined;
    const updateProgress = () => {
        dom.loadingLabel.textContent = window.ReplayInterface.t(progress ? `opening.${progress.phase}` : "library.loading");
        dom.loadingBar.setAttribute("aria-label", dom.loadingLabel.textContent);
        if (progress?.total && progress.loaded !== undefined) {
            const percent = Math.min(100, Math.floor(progress.loaded / progress.total * 100));
            dom.loadingBar.value = percent;
            dom.loadingBytes.textContent = window.ReplayInterface.t("opening.bytes", { percent, loaded: (progress.loaded / 1048576).toFixed(1), total: (progress.total / 1048576).toFixed(1) });
        } else { dom.loadingBar.removeAttribute("value"); dom.loadingBytes.textContent = ""; }
    };
    window.api.on("replayOpenProgress", (value: ReplayOpenProgress) => { if (dom.loading()) { progress = value; updateProgress(); } });
    dom.loading.on(value => {
        progress = undefined;
        dom.loadingWidget.style.display = value ? "flex" : "none";
        updateProgress();
    });
    language.on(updateProgress);
    window.ReplayInterface.mountLibrary(dom.library, {
        snapshot: () => window.api.invoke("replayLibrary"),
        addFolder: () => window.api.invoke("chooseRecordingFolder"),
        configure: (folders, defaultFolder) => window.api.invoke("recordingFolders", folders, defaultFolder),
        importFile: () => app.chooseFile(),
        open: path => app.openFile(path),
        favorite: (path, value) => window.api.invoke("favoriteReplay", path, value),
        reveal: path => window.api.invoke("revealReplay", path),
        trash: (path, labels) => window.api.invoke("trashReplay", path, labels)
    });
    return dom;
};
