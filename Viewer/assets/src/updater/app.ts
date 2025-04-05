import { html, Mutable } from "@/rhu/html.js";
import { signal } from "@/rhu/signal.js";
import { Style } from "@/rhu/style.js";
import { Theme } from "@/rhu/theme.js";
import * as icons from "@root/main/global/components/atoms/icons/index.js";

export const theme = Theme(({ theme }) => {
    return {
        defaultColor: theme`rgba(255, 255, 255, 0.8)`,
        fullWhite: theme`white`,
        fullBlack: theme`black`,
        hoverPrimary: theme`#2997ff`,
        backgroundPrimary: theme`#0071e3`,
        backgroundAccent: theme`#147ce5`,
    };
});

const style = Style(({ css }) => {
    const wrapper = css.class`
    font-family: Oxanium;

    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    background-color:rgb(30, 30, 40);
    color: white;

    overflow: hidden;
    `;

    const body = css.class`
    position: relative;
    flex: 1;

    padding: 0 40px;

    -webkit-app-region: drag;
    `;

    css`
    @keyframes breathing {
        0% {
            -webkit-transform: scale(0.95);
            transform: scale(0.95);
        }

        50% {
            -webkit-transform: scale(1);
            transform: scale(1);
        }

        100% {
            -webkit-transform: scale(0.95);
            transform: scale(0.95);
        }
    }
    `;
    const icon = css.class`
    width: 100%;
    height: 100%;
    animation: breathing 5s ease-in-out infinite normal;
    `;

    const footer = css.class`
    position: relative;
    height: 100px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    gap: 10px;
    `;

    const progressWrapper = css.class`
    padding: 0 30px;
    padding-bottom: 10px;
    height: 30px;
    width: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    `;

    const progress = css.class`
    width: 100%;
    height: 5px;
    border-radius: 100px;

    background-color: grey;
    
    overflow: hidden;
    `;

    const progressBar = css.class`
    width: 100%;
    height: 100%;
    border-radius: 100px;

    background-color: white;
    `;

    const skip = css.class`
    color:rgb(170, 170, 170);
    `;

    return {
        wrapper,
        body,
        icon,
        footer,
        progress,
        progressWrapper,
        progressBar,
        skip
    };
});

const App = () => {
    interface App {
    }
    interface Private {
        readonly progress: HTMLDivElement;
        readonly gitlink: HTMLLinkElement;
        readonly skip: HTMLButtonElement;

        readonly info: HTMLDivElement;
        readonly nopackage: HTMLDivElement;
    }

    const text = signal("Checking for updates ...");
    const progress = signal(0);
    progress.guard = (newValue) => {
        return Math.max(0, Math.min(1, newValue));
    };

    const dom = html<Mutable<Private & App>>/**//*html*/`
        <div class="${theme} ${style.wrapper}">
            <!-- Content goes here -->
            <div class="${style.body}">
                <div class="${style.icon}">${icons.rug()}</div>
            </div>
            <div m-id="info" class="${style.footer}">
                <div style="text-align: center;">${text}</div>
                <div class="${style.progressWrapper}">
                    <div class="${style.progress}">
                        <div m-id="progress" class="${style.progressBar}"></div>
                    </div>
                </div>
            </div>
            <div m-id="nopackage" class="${style.footer}" style="display: none;">
                <div style="text-align: center;">Please download '${text}' from <a m-id="gitlink">github</a>.</div>
                <button class="${style.skip}" m-id="skip">skip update</button>
            </div>
        </div>
        `;
    html(dom).box();

    progress.on((value) => {
        dom.progress.style.width = `${value * 100}%`;
    });

    dom.skip.addEventListener("click", () => window.api.send("close"));

    window.api.on("console.error", (value) => {
        console.error(value);
    });

    window.api.on("progress", (value) => {
        progress(value);
    });

    window.api.on("text", (value) => {
        text(value);
    });

    (async () => {
        return await window.api.invoke("download-package");
    })().then((release) => {
        if (release === undefined) window.api.send("close");
        else {
            dom.gitlink.href = release.html_url;
            dom.info.style.display = "none";
            dom.nopackage.style.display = "flex";
            text(release.tag_name);
        }
    }).catch(() => {
        window.api.send("close");
    });

    return dom as html<App>;
};

export const app = App();

// Load app
const __load__ = () => {
    document.body.replaceChildren(...app);
};
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", __load__);
} else {
    __load__();
}