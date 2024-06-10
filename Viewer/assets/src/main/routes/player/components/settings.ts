import { Constructor, Macro } from "@/rhu/macro.js";
import { Style } from "@/rhu/style.js";
import Fuse from "fuse.js";
import { Typemap } from "../../../../replay/moduleloader.js";
import { player } from "../index.js";
import { dropdown } from "./dropdown.js";

const style = Style(({ style }) => {
    const wrapper = style.class`
    position: relative;
    width: 400px;
    padding: 20px;
    color: white;
    font-size: 15px;
    `;
    style`
    ${wrapper} h1 {
        font-size: 30px;
    }
    `;

    const search = style.class`
    background-color: #12121a;
    padding: 7px 10px;
    border-radius: 3px;
    color: white;
    width: 100%;
    `;

    const row = style.class`
    width: 100%;
    display: flex;
    flex-direction: column;
    `;

    const divider = style.class`
    width: 100%;
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-bottom-color: white;
    `;

    const body = style.class`
    display: flex;
    flex-direction: column;
    gap: 30px;
    `;

    const active = style.class``;
    const toggle = style.class`
    width: 50px;
    height: 15px;
    border-radius: 100px;
    border-style: solid;
    border-width: 3px;

    --color: #7169ce;
    border-color: var(--color);
    background-color: transparent;
    transition: all ease-in-out 200ms;
    `;
    style`
    ${toggle}${active} {
    background-color: var(--color);
    }
    `;

    return {
        wrapper,
        search,
        row,
        divider,
        body,
        toggle,
        active
    };
});

export interface settings extends HTMLDivElement {
    search: HTMLInputElement;
    body: HTMLDivElement;

    features: [node: Node, key: string, update?: () => void, reset?: () => void][];
    fuse: Fuse<[node: Node, key: string, update?: () => void, reset?: () => void]>;

    player: player;
    init(player: player): void;
    update(): void;
    reset(): void;
}

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "routes/player.settings": settings;
    }
}

function setInputFilter(textbox: Element, inputFilter: (value: string) => boolean): void {
    ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop", "focusout" ].forEach(function(event) {
        textbox.addEventListener(event, function(this: (HTMLInputElement | HTMLTextAreaElement) & { oldValue: string; oldSelectionStart: number | null, oldSelectionEnd: number | null }) {
            if (inputFilter(this.value)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.oldSelectionEnd = this.selectionEnd;
            } else if (Object.prototype.hasOwnProperty.call(this, "oldValue")) {
                this.value = this.oldValue;
          
                if (this.oldSelectionStart !== null &&
            this.oldSelectionEnd !== null) {
                    this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
                }
            } else {
                this.value = "";
            }
        });
    });
}

const _features: ((parent: settings) => [node: Node, key: string, update?: () => void, reset?: () => void])[] = [
    (parent) => {
        const [frag, node] = Macro.anon<{
            text: HTMLInputElement;
            slider: HTMLInputElement;
        }>(/*html*/`
            <div class="${style.row}" style="
            gap: 10px;
            ">
                <span>Timescale</span>
                <div class="${style.row}" style="
                flex-direction: row;
                gap: 20px;
                align-items: center;
                ">
                    <input rhu-id="slider" style="
                    flex: 1;
                    " type="range" min="-3" max="3" value="1" step="0.1" />
                    <input rhu-id="text" style="
                    width: 50px;
                    " class="${style.search}" type="text" spellcheck="false" autocomplete="false" value="1"/>
                </div>
            </div>
            `);

        let active = false;
        frag.slider.addEventListener("mousedown", () => {
            active = true;
        });
        window.addEventListener("mouseup", () => {
            active = false;
        });
        frag.slider.addEventListener("mousemove", () => {
            if (!active) return;
            frag.text.value = frag.slider.value;
            parent.player.timescale = parseFloat(frag.slider.value);
        });

        frag.text.addEventListener("keyup", () => {
            frag.slider.value = frag.text.value;
            parent.player.timescale = parseFloat(frag.text.value);
        });

        const update = () => {
            if (document.activeElement !== frag.text && document.activeElement !== frag.slider) {
                const value = parent.player.timescale.toString();
                frag.text.value = value;
                frag.slider.value = value;
            }
        };

        setInputFilter(frag.text, function(value) { return /^-?\d*[.,]?\d*$/.test(value); });

        return [node.children[0], "Timescale", update];
    },
    (parent) => {
        const [frag, node] = Macro.anon<{
            dropdown: dropdown;
        }>(/*html*/`
            <div class="${style.row}" style="
            gap: 10px;
            ">
                <span style="flex: 1; padding-top: 1px;">Dimension</span>
                ${dropdown`rhu-id="dropdown" style="width: 100%;"`}
            </div>
            `);
            
        frag.dropdown.onSet = function(value) {
            if (parent.player.renderer.get("Dimension") !== value) {
                parent.player.renderer.set("Dimension", value);
                parent.player.renderer.get("CameraControls")!.targetSlot = undefined;
            }
        };

        const reset = () => {
            if (parent.player.replay === undefined) return;

            const dimensions = parent.player.replay.getOrDefault("Vanilla.Map.Geometry", () => new Map());
            frag.dropdown.clear();
            for (const index of dimensions.keys()) {
                frag.dropdown.add(index, `${index === 0 ? "Reality" : `Dimension ${index}`}`);
            }
        };

        const update = () => {
            frag.dropdown.set(parent.player.renderer.getOrDefault("Dimension", () => 0), false);
        };

        return [node.children[0], "Dimension", update, reset];
    },
    (parent) => {
        const [frag, node] = Macro.anon<{
            toggle: HTMLButtonElement;
        }>(/*html*/`
            <div class="${style.row}" style="
            flex-direction: row;
            gap: 20px;
            align-items: center;
            ">
                <span style="flex: 1; padding-top: 1px;">Transparent Resource Containers</span>
                <button rhu-id="toggle" class="${style.toggle}"></button>
            </div>
            `);

        const type: keyof Typemap.RenderData = "ResourceContainers.Transparent";
        frag.toggle.addEventListener("click", () => {
            const value = !parent.player.renderer.getOrDefault(type, () => false);
            parent.player.renderer.set(type, value);
            if (value) frag.toggle.classList.add(`${style.active}`);
            else frag.toggle.classList.remove(`${style.active}`);
        });
    
        const update = () => {
            const value = parent.player.renderer.getOrDefault(type, () => false);
            if (value) frag.toggle.classList.add(`${style.active}`);
            else frag.toggle.classList.remove(`${style.active}`);
        };

        return [node.children[0], "Transparent Resource Containers", update];
    },
    (parent) => {
        const [frag, node] = Macro.anon<{
            toggle: HTMLButtonElement;
        }>(/*html*/`
            <div class="${style.row}" style="
            flex-direction: row;
            gap: 20px;
            align-items: center;
            ">
                <span style="flex: 1; padding-top: 1px;">Show Enemy Info</span>
                <button rhu-id="toggle" class="${style.toggle}"></button>
            </div>
            `);

        const type: keyof Typemap.RenderData = "Enemy.ShowInfo";
        frag.toggle.addEventListener("click", () => {
            const value = !parent.player.renderer.getOrDefault(type, () => false);
            parent.player.renderer.set(type, value);
            if (value) frag.toggle.classList.add(`${style.active}`);
            else frag.toggle.classList.remove(`${style.active}`);
        });
    
        const update = () => {
            const value = parent.player.renderer.getOrDefault(type, () => false);
            if (value) frag.toggle.classList.add(`${style.active}`);
            else frag.toggle.classList.remove(`${style.active}`);
        };

        return [node.children[0], "Show Enemy Info", update];
    }
];

export const settings = Macro((() => {
    const settings = function(this: settings) {
        this.features = [];
        for (const feature of _features) {
            const f = feature(this);
            const [node, key, update] = f;
            this.features.push(f);
            this.body.append(node);
        }
        this.fuse = new Fuse(this.features, {
            keys: ["1"]
        });

        this.search.addEventListener("keyup", () => {
            let value = this.search.value;
            value = value.trim();
            if (value.length === 0) {
                this.body.replaceChildren(...this.features.map((n) => n[0]));
                return;
            }
            const results = this.fuse.search(value).map((n) => n.item[0]);
            this.body.replaceChildren(...results);
        });
    } as Constructor<settings>;

    settings.prototype.init = function(player) {
        this.player = player;
    };

    settings.prototype.update = function() { 
        for (const [node, key, update, reset] of this.features) {
            if (update !== undefined) update();
        }
    };

    settings.prototype.reset = function() {
        for (const [node, key, update, reset] of this.features) {
            if (reset !== undefined) reset();
        }
    };

    return settings;
})(), "routes/player.settings", //html
`
    <div style="margin-bottom: 20px;">
        <h1>SETTINGS</h1>
        <p>Change the way the viewer behaves</p>
    </div>
    <div style="
    position: sticky; 
    padding: 20px 0; 
    top: 0px; 
    background-color: #1f1f29;
    margin-bottom: 10px;
    ">
        <input rhu-id="search" placeholder="Search ..." class="${style.search}" type="text" spellcheck="false" autocomplete="false"/>
    </div>
    <div rhu-id="body" class="${style.body}">
    </div>
    `, {
    element: //html
        `<div class="${style.wrapper}"></div>`
});