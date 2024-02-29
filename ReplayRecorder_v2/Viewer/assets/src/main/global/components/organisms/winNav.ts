import { Style } from "@/rhu/style.js";
import { Macro, Constructor } from "@/rhu/macro.js";
import * as icons from "../atoms/icons/index.js";

const style = Style(({ style }) => {
    const wrapper = style.class`
    display: flex;
    justify-content: flex-start;
    flex-direction: row-reverse;
    align-items: stretch;
    height: 22px;
    background-color: #11111B; /*TODO: Theme-ColorScheme*/

    z-index: 3001;
    -webkit-app-region: drag;
    -ms-flex-negative: 0;
    flex-shrink: 0;
    `;
    const button = style.class`
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    position: relative;
    width: 28px;
    height: 22px;
    color: #B9BBBE; /*TODO: Theme-ColorScheme*/

    -webkit-app-region: no-drag;
    pointer-events: auto;
    `;
    style`
    ${button}:hover {
        background-color: #272733; /*TODO: Theme-ColorScheme*/
    }
    `;
    const text = style.class`
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    height: 100%;
    margin-left: 10px;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.75rem;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    `;

    return {
        wrapper,
        button,
        text
    };
});

export interface winNav extends HTMLDivElement {
    close: HTMLButtonElement;
    max: HTMLButtonElement;
    min: HTMLButtonElement;
}

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "organisms/winNav": winNav;
    }
}

export const winNav = Macro((() => {
    const winNav = function(this: winNav) {
        this.close.onclick = () => {
            window.api.closeWindow();
        };
        this.max.onclick = () => {
            window.api.maximizeWindow();
        };
        this.min.onclick = () => {
            window.api.minimizeWindow();
        };
    } as Constructor<winNav>;

    return winNav;
})(), "organisms/winNav", //html
`
    <div rhu-id="close" class="${style.button}" tabindex="-1" role="button" aria-label="Close">
        ${icons.cross}
    </div>
    <div rhu-id="max" class="${style.button}" tabindex="-1" role="button" aria-label="Maximize">
        ${icons.square}
    </div>
    <div rhu-id="min" class="${style.button}" tabindex="-1" role="button" aria-label="Minimize">
        ${icons.line}
    </div>
    <div class="${style.text}">
        GTFO Replay Viewer
    </div>
    `, {
    element: //html
        `<nav class="${style.wrapper}"></nav>`
});