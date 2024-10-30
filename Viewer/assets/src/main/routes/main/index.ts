import { html, Macro, MacroElement } from "@/rhu/macro.js";
import { signal } from "@/rhu/signal.js";
import { Style } from "@/rhu/style.js";
import { app } from "../../app.js";
import { __version__ } from "../../appinfo.js";

const style = Style(({ css }) => {
    const wrapper = css.class`
    width: 100%;
    height: 100%;
    position: relative;
    `;

    const empty = css.class`
    position: absolute;
    z-index: 1000;
    width: 100%;
    height: 100%;
    background-color: black;
    display: flex;
    align-items: center;
    justify-content: center;
    `;

    const loader = css.class`
    width: 65px;
    aspect-ratio: 1;
    position: relative;
    `;
    css`
    ${loader}:before,
    ${loader}:after {
        content: "";
        position: absolute;
        border-radius: 50px;
        box-shadow: 0 0 0 3px inset #fff;
        animation: l5 2.5s infinite;
    }
    ${loader}:after {
        animation-delay: -1.25s;
        border-radius: 0;
    }
    @keyframes l5{
        0%    {inset:0    35px 35px 0   }
        12.5% {inset:0    35px 0    0   }
        25%   {inset:35px 35px 0    0   }
        37.5% {inset:35px 0    0    0   }
        50%   {inset:35px 0    0    35px}
        62.5% {inset:0    0    0    35px}
        75%   {inset:0    0    35px 35px}
        87.5% {inset:0    0    35px 0   }
        100%  {inset:0    35px 35px 0   }
    }
    `;

    const watermark = css.class`
    position: absolute;
    bottom: 0;
    right: 0;
    padding: 5px 10px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    z-index: 10000;
    `;

    return {
        wrapper,
        watermark,
        empty,
        loader
    };
});

export const Main = Macro(class Main extends MacroElement {
    private loadingWidget: HTMLDivElement;
    private loadButton: HTMLButtonElement;
    public video: HTMLVideoElement;

    public loading = signal(false);

    constructor(dom: Node[], bindings: any) {
        super(dom, bindings);

        this.loadButton.addEventListener("click", () => {
            app().replayfile.click();    
        });

        this.loading.on((value) => {
            this.loadingWidget.style.display = value ? "block" : "none";
            this.loadButton.style.display = value ? "none" : "block";
        });
    }
}, html`
    <div class="${style.wrapper}">
        <div class="${style.empty}">
            <div class="${style.watermark}">${__version__}</div>
            <video m-id="video" style="position: absolute; width: 100%; height: 100%; object-fit: cover;" muted autoplay loop playsinline disablepictureinpicture>
                <source src="https://storage.googleapis.com/gtfo-prod-v1/Trailer_for_website_Pro_Res_2_H_264_24fef05909/Trailer_for_website_Pro_Res_2_H_264_24fef05909.mp4" type="video/mp4">
            </video>   
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;">
                <button m-id="loadButton" class="gtfo-button">LOAD REPLAY</button>
                <div m-id="loadingWidget" style="display: none;" class="${style.loader}"></div>
            </div>
        </div>
    </div>
    `);
