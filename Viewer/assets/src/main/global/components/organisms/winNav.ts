import { html, Macro, MacroElement } from "@/rhu/macro.js";
import { Signal } from "@/rhu/signal.js";
import { Style } from "@/rhu/style.js";
import * as icons from "../atoms/icons/index.js";

const moduleListStyles = Style(({ style }) => {
    const wrapper = style.class`
    position: absolute;
    top: calc(100% + 5px);
    padding: 5px;
    background-color: #2a2a43;
    border-radius: 7px;
    border-style: solid;
    border-width: 1px;
    border-color: #2f2e44;
    font-size: 0.75rem;
    min-width: 100px;
    `;

    const filter = style.class`
    background-color: #12121a;
    padding: 3px 5px;
    border-radius: 4px;
    color: white;
    width: 100%;
    `;

    const mount = style.class`
    display: flex;
    flex-direction: column;
    gap: 2px;
    color: white;
    padding: 5px 0px;
    max-height: 300px;
    overflow: auto;
    `;

    const item = style.class`
    padding: 3px 5px;
    cursor: pointer;
    `;
    style`
    ${item}:hover {
        background-color: black;
        border-radius: 4px;
    }
    `;

    return {
        wrapper,
        filter,
        mount,
        item
    };
});

const ModuleList = Macro(class ModuleList extends MacroElement {
    constructor (dom: Node[], bindings: any, children: Node[]) {
        super(dom, bindings);
    }
}, html`
    <div class="${moduleListStyles.wrapper}">
        <input m-id="filter" class="${moduleListStyles.filter}" type="text" spellcheck="false" autocomplete="false" value=""/>
        <ul class="${moduleListStyles.mount}">
            <li class="${moduleListStyles.item}">vanilla</li>
            <li class="${moduleListStyles.item}">duo trials</li>
            <li class="${moduleListStyles.item}">vanilla</li>
            <li class="${moduleListStyles.item}">duo trials</li>
            <li class="${moduleListStyles.item}">vanilla</li>
            <li class="${moduleListStyles.item}">duo trials</li>
            <li class="${moduleListStyles.item}">vanilla</li>
            <li class="${moduleListStyles.item}">duo trials</li>
            <li class="${moduleListStyles.item}">vanilla</li>
            <li class="${moduleListStyles.item}">duo trials</li>
            <li class="${moduleListStyles.item}">vanilla</li>
            <li class="${moduleListStyles.item}">duo trials</li>
            <li class="${moduleListStyles.item}">vanilla</li>
            <li class="${moduleListStyles.item}">duo trials</li>
            <li class="${moduleListStyles.item}">vanilla</li>
            <li class="${moduleListStyles.item}">duo trials</li>
            <li class="${moduleListStyles.item}">vanilla</li>
            <li class="${moduleListStyles.item}">duo trials</li>
        </ul>
    </div>
    `);

const style = Style(({ style }) => {
    const height = "40px";

    const wrapper = style.class`
    display: flex;
    justify-content: flex-start;
    flex-direction: row-reverse;
    align-items: stretch;
    height: ${height};
    background-color: #11111B; /*TODO: Theme-ColorScheme*/

    z-index: 3001;
    -webkit-app-region: drag;
    -ms-flex-negative: 0;
    flex-shrink: 0;

    border-bottom-style: solid;
    border-bottom-width: 2px;
    border-bottom-color: #2f2e44;
    `;
    const button = style.class`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    position: relative;
    width: 45px;
    height: ${height};
    color: #B9BBBE; /*TODO: Theme-ColorScheme*/

    -webkit-app-region: no-drag;
    pointer-events: auto;
    `;
    style`
    ${button}:focus {
        outline:0;
    }
    ${button}:hover {
        color: white;
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

    const popup = style.class`
        display: none;
        position: absolute;
        top: calc(100% + 5px);
        transform: translate(calc(50% - 22.5px), 0);
        padding: 5px 10px;
        background-color: #11111B; /*TODO: Theme-ColorScheme*/
        border-radius: 7px;
        border-style: solid;
        border-width: 1px;
        border-color: #2f2e44;
        font-size: 0.75rem;
    `;
    /*style`
    ${button}:hover ${popup} {
        display: block;
    }
    `;*/

    return {
        wrapper,
        button,
        text,
        popup
    };
});

export const WinNav = Macro(class WinNav extends MacroElement {
    close: HTMLButtonElement;
    max: HTMLButtonElement;
    min: HTMLButtonElement;
    icon: HTMLButtonElement;
    plugin: HTMLButtonElement;
    mount: HTMLDivElement;

    moduleName: Signal<string>;

    constructor(dom: Node[], bindings: any, children: Node[]) {
        super(dom, bindings);

        this.close.onclick = () => {
            window.api.closeWindow();
        };
        this.max.onclick = () => {
            window.api.maximizeWindow();
        };
        this.min.onclick = () => {
            window.api.minimizeWindow();
        };

        this.mount.append(...children);
    }
}, html`
    <nav class="${style.wrapper}">
        <div m-id="close" class="${style.button}" tabindex="-1" role="button" aria-label="Close">
            ${icons.cross()}
        </div>
        <div m-id="max" class="${style.button}" tabindex="-1" role="button" aria-label="Maximize">
            ${icons.square()}
        </div>
        <div m-id="min" class="${style.button}" tabindex="-1" role="button" aria-label="Minimize">
            ${icons.line()}
        </div>
        <div m-id="mount" class="${style.text}">
        </div>
        <span style="position: relative;">
            <div m-id="plugin" class="${style.button}" style="padding: 10px;" tabindex="-1" role="button">
                ${icons.plugin()}
                <div class="${style.popup}">
                    <span>${Macro.signal("moduleName", "vanilla")}</span>
                </div>
            </div>
            ${ModuleList()}
        </span>
        <div m-id="icon" class="${style.button}" style="padding: 10px; width: 60px;" tabindex="-1" role="button" aria-label="Load Replay">
            ${icons.rug()}
        </div>
    </nav>
    `);