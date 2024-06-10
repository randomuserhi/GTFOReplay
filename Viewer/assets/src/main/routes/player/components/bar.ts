import { Constructor, Macro } from "@/rhu/macro.js";
import { Style } from "@/rhu/style.js";
import * as icons from "../../../global/components/atoms/icons/index.js";
import { player } from "../index.js";
import { finder } from "./finder.js";
import { info } from "./info.js";
import { settings } from "./settings.js";
import { stats } from "./stats.js";

const style = Style(({ style }) => {
    const wrapper = style.class`
    width: 60px;
    height: 100%;
    background-color: #050506; /*TODO: Theme-ColorScheme*/

    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    `;

    const button = style.class`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    position: relative;
    width: 60px;
    height: 60px;
    padding: 20px 20px 20px 15px;
    color: #B9BBBE; /*TODO: Theme-ColorScheme*/
    `;
    style`
    ${button}:focus {
        outline:0;
    }
    ${button}:hover {
        background-color: #272733; /*TODO: Theme-ColorScheme*/
    }
    `;

    const highlight = style.class`
    width: 5px;
    height: 10px;
    background-color: white;
    border-radius: 100px;
    margin-right: 5px;
    visibility: hidden;
    transition: all ease-in-out 200ms;
    `;

    const selected = style.class`
        padding: 20px 15px 20px 15px;
    `;

    style`
    ${selected} ${highlight} {
        height: 30px;
        margin-right: 10px;
        visibility: visible;
    }
    `;

    return {
        wrapper,
        button,
        highlight,
        selected
    };
});

export interface bar extends HTMLDivElement {
    gear: HTMLButtonElement;
    stats: HTMLButtonElement;
    finder: HTMLButtonElement;
    info: HTMLButtonElement;

    player: player;

    init(player: player): void;
    update(): void;
    reset(): void;
}

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "routes/player.bar": bar;
    }
}

const settingsPage = document.createMacro(settings);
const infoPage = document.createMacro(info);
const statsPage = document.createMacro(stats);
const finderPage = document.createMacro(finder);

export const bar = Macro((() => {
    const bar = function(this: bar) {
        const buttons = [
            this.gear,
            this.stats,
            this.finder,
            this.info
        ];

        const load = (node: Node, button: HTMLButtonElement) => {
            this.player.load(node);
            for (const b of buttons) {
                b.classList.remove(`${style.selected}`);
            }
            if (this.player.loadedNode === node) {
                button.classList.add(`${style.selected}`);
            }
        };

        this.gear.onclick = () => {
            load(settingsPage, this.gear);
        };
        this.info.onclick = () => {
            load(infoPage, this.info);
        };
        this.stats.onclick = () => {
            load(statsPage, this.stats);
        };
        this.finder.onclick = () => {
            load(finderPage, this.finder);
        };
    } as Constructor<bar>;

    bar.prototype.update = function() {
        if (this.player.loadedNode === settingsPage) settingsPage.update();
        if (this.player.loadedNode === infoPage) infoPage.update();
        if (this.player.loadedNode === statsPage) statsPage.update();
        if (this.player.loadedNode === finderPage) finderPage.update();
    };

    bar.prototype.init = function(player) {
        this.player = player;

        settingsPage.init(player);
        infoPage.init(player);
        statsPage.init(player);
        finderPage.init(player);
    };

    bar.prototype.reset = function() {
        settingsPage.reset();
        infoPage.reset();
        statsPage.reset();
        finderPage.reset();
    };

    return bar;
})(), "routes/player.bar", //html
`
    <button rhu-id="gear" class="${style.button}">
        <div class="${style.highlight}"></div>
        ${icons.gear}
    </button>
    <button rhu-id="stats" class="${style.button}">
        <div class="${style.highlight}"></div>
        ${icons.stats}
    </button>
    <button rhu-id="finder" class="${style.button}">
        <div class="${style.highlight}"></div>
        ${icons.finder}
    </button>
    <div style="flex: 1"></div>
    <button rhu-id="info" class="${style.button}">
        <div class="${style.highlight}"></div>
        ${icons.info}
    </button>
    `, {
    element: //html
        `<div class="${style.wrapper}"></div>`
});