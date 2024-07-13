import { html, Macro, MacroElement } from "@esm/@/rhu/macro.js";
import { Signal, signal } from "@esm/@/rhu/signal.js";
import type { View } from "@esm/@root/main/routes/player/components/view/index.js";
import Fuse from "@esm/fuse.js";
import { EnemyModel } from "../../renderer/enemy/lib.js";
import { ResourceContainerModel } from "../../renderer/map/resourcecontainers.js";
import { Dropdown } from "../components/dropdown.js";
import { Toggle } from "../components/toggle.js";
import { dispose } from "../main.js";
import { pageStyles, setInputFilter } from "./lib.js";

const style = pageStyles;

const FeatureWrapper = Macro(class FeatureWrapper extends MacroElement {
    private body: HTMLDivElement;
    public tag: string;
    
    private _frag = new DocumentFragment();
    get frag() {
        this._frag.replaceChildren(...this.dom);
        return this._frag;
    }

    constructor(dom: Node[], bindings: any, children: Node[], tag: string) {
        super(dom, bindings);
        this.tag = tag;
        this.body.append(...children);
    }
}, html`
    <div m-id="body"></div>
`);

const features: ((v: Signal<Macro<typeof View> | undefined>) => Macro<typeof FeatureWrapper>)[] = [
    (v) => {
        const [bindings, frag] = html`
            ${FeatureWrapper.open("Timescale").bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    <span>Timescale</span>
                    <div class="${style.row}" style="
                        flex-direction: row;
                        gap: 20px;
                        align-items: center;
                        ">
                        <input m-id="slider" style="
                        flex: 1;
                        " type="range" min="-3" max="3" value="1" step="0.1" />
                        <input m-id="text" style="
                        width: 50px;
                        " class="${style.search}" type="text" spellcheck="false" autocomplete="false" value="1"/>
                    </div>
                </div>
            ${FeatureWrapper.close}
        `.dom<{
            wrapper: Macro<typeof FeatureWrapper>;
            slider: HTMLInputElement;
            text: HTMLInputElement;
        }>();

        const { text, slider } = bindings;

        let active = false;
        slider.addEventListener("mousedown", () => {
            active = true;
        });
        window.addEventListener("mouseup", () => {
            active = false;
        }, { signal: dispose.signal });
        slider.addEventListener("mousemove", () => {
            if (!active) return;
            text.value = slider.value;

            const view = v();
            if (view === undefined) return;

            view.timescale(parseFloat(slider.value));
        });

        text.addEventListener("keyup", () => {
            slider.value = text.value;

            const view = v();
            if (view === undefined) return;

            view.timescale(parseFloat(text.value));
        });

        setInputFilter(text, function(value) { return /^-?\d*[.,]?\d*$/.test(value); });

        return bindings.wrapper;
    },
    (v) => {
        const [bindings, frag] = html`
            ${FeatureWrapper.open("Render Distance").bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    <span>Render Distance</span>
                    <div class="${style.row}" style="
                    flex-direction: row;
                    gap: 20px;
                    align-items: center;
                    ">
                        <input m-id="slider" style="
                        flex: 1;
                        " type="range" min="50" max="500" value="100" step="10" />
                        <input m-id="text" style="
                        width: 50px;
                        " class="${style.search}" type="text" spellcheck="false" autocomplete="false" value="1"/>
                    </div>
                </div>
            ${FeatureWrapper.close}
        `.dom<{
            wrapper: Macro<typeof FeatureWrapper>;
            text: HTMLInputElement;
            slider: HTMLInputElement;
        }>();

        const { text, slider } = bindings;

        let active = false;
        slider.addEventListener("mousedown", () => {
            active = true;
        });
        window.addEventListener("mouseup", () => {
            active = false;
        }, { signal: dispose.signal });
        slider.addEventListener("mousemove", () => {
            if (!active) return;
            text.value = slider.value;

            const view = v();
            if (view === undefined) return;
            const camera = view.renderer.get("Camera");
            if (camera === undefined) return;

            camera.renderDistance = parseFloat(slider.value);
        });

        text.addEventListener("keyup", () => {
            slider.value = text.value;

            const view = v();
            if (view === undefined) return;
            const camera = view.renderer.get("Camera");
            if (camera === undefined) return;

            camera.renderDistance = parseFloat(text.value);
        });

        setInputFilter(text, function(value) { return /^-?\d*[.,]?\d*$/.test(value); });

        return bindings.wrapper;
    },
    (v) => {
        const [bindings, frag] = html`
            ${FeatureWrapper.open("Follow Player").bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    <span style="flex: 1; padding-top: 1px;">Follow Player</span>
                    ${Dropdown().bind("dropdown").then(d => d.wrapper.style.width = "100%")}
                </div>
            ${FeatureWrapper.close}
        `.dom<{
            wrapper: Macro<typeof FeatureWrapper>;
            dropdown: Macro<typeof Dropdown>;
        }>();
        
        const { dropdown } = bindings;
        
        dropdown.value.on((value: number) => {
            const view = v();
            if (view === undefined) return;
            const controls = view.renderer.get("Controls");
            if (controls === undefined) return;

            controls.targetSlot(value);
        });

        v.on((view) => {
            if (view === undefined) {
                dropdown.options([]);
                return;
            }
            
            view.renderer.watch("Controls").on(controls => {
                if (controls === undefined) return;
                
                controls.targetSlot.on(value => {
                    dropdown.value(value);
                });
            });

            view.api.on((api) => {
                if (api === undefined) {
                    dropdown.options([]);
                    return;
                }

                const all = api.get("Vanilla.Player");
                if (all === undefined) {
                    dropdown.options([]);
                    return;
                }

                const players: { key: string, value: any }[] = [];
                for (const player of all.values()) {
                    players.push({
                        key: player.nickname,
                        value: player.slot
                    });
                }
                dropdown.options(players);
            });
        });

        return bindings.wrapper;
    },
    (v) => {
        const [bindings, frag] = html`
            ${FeatureWrapper.open("Dimension").bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    <span style="flex: 1; padding-top: 1px;">Dimension</span>
                    ${Dropdown().bind("dropdown").then(d => d.wrapper.style.width = "100%")}
                </div>
            ${FeatureWrapper.close}
        `.dom<{
            wrapper: Macro<typeof FeatureWrapper>;
            dropdown: Macro<typeof Dropdown>;
        }>();
        
        const { dropdown } = bindings;
        
        dropdown.value.on((value: number) => {
            const view = v();
            if (view === undefined) return;

            view.renderer.set("Dimension", value);
        });

        v.on((view) => {
            if (view === undefined) {
                dropdown.options([]);
                return;
            }
            
            view.renderer.watch("Dimension").on(dimension => {
                if (dimension === undefined) return;
                dropdown.value(dimension);
            });

            view.replay.on((replay) => {
                if (replay === undefined) {
                    dropdown.options([]);
                    return;
                }

                replay.watch("Vanilla.Map.Geometry").on((map) => {
                    if (map === undefined) {
                        dropdown.options([]);
                        return;
                    }
    
                    const dimensions: { key: string, value: any }[] = [];
                    for (const dimension of map.keys()) {
                        dimensions.push({
                            key: dimension === 0 ? `Reality` : `Dimension ${dimension}`,
                            value: dimension
                        });
                    }
                    dropdown.options(dimensions);
                });
            });
        });

        return bindings.wrapper;
    },
    (v) => {
        const [bindings, frag] = html`
            ${FeatureWrapper.open("Dimension").bind("wrapper")}
                <div class="${style.row}" style="
                flex-direction: row;
                gap: 20px;
                align-items: center;
                ">
                    <span style="flex: 1; padding-top: 1px;">Transparent Resource Containers</span>
                    ${Toggle().bind("toggle")}
                </div>
            ${FeatureWrapper.close}
        `.dom<{
            wrapper: Macro<typeof FeatureWrapper>;
            toggle: Macro<typeof Toggle>;
        }>();

        const { toggle } = bindings;

        toggle.value.on((value) => {
            ResourceContainerModel.transparent(value);
        });

        ResourceContainerModel.transparent.on((value) => {
            toggle.value(value);
        });

        return bindings.wrapper;
    },
    (v) => {
        const [bindings, frag] = html`
            ${FeatureWrapper.open("Show Enemy Info").bind("wrapper")}
                <div class="${style.row}" style="
                flex-direction: row;
                gap: 20px;
                align-items: center;
                ">
                    <span style="flex: 1; padding-top: 1px;">Show Enemy Info</span>
                    ${Toggle().bind("toggle")}
                </div>
            ${FeatureWrapper.close}
        `.dom<{
            wrapper: Macro<typeof FeatureWrapper>;
            toggle: Macro<typeof Toggle>;
        }>();

        const { toggle } = bindings;

        toggle.value.on((value) => {
            EnemyModel.showInfo(value);
        });

        EnemyModel.showInfo.on((value) => {
            toggle.value(value);
        });

        return bindings.wrapper;
    },
];

export const Settings = Macro(class Settings extends MacroElement {
    private search: HTMLInputElement;
    private body: HTMLDivElement;

    public view = signal<Macro<typeof View> | undefined>(undefined);

    private features: Macro<typeof FeatureWrapper>[];
    private fuse: Fuse<Macro<typeof FeatureWrapper>>;

    constructor(dom: Node[], bindings: any) {
        super(dom, bindings);

        this.features = [];
        for (const feature of features) {
            const f = feature(this.view);
            this.features.push(f);

            this.body.append(f.frag);
        }
        this.fuse = new Fuse(this.features, {
            keys: ["tag"]
        });

        this.search.addEventListener("keyup", () => {
            let value = this.search.value;
            value = value.trim();
            if (value.length === 0) {
                this.body.replaceChildren(...this.features.map((n) => n.frag));
                return;
            }
            const results = this.fuse.search(value).map((n) => n.item.frag);
            this.body.replaceChildren(...results);
        });
    }
}, html`
    <div class="${style.wrapper}">
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
            <input m-id="search" placeholder="Search ..." class="${style.search}" type="text" spellcheck="false" autocomplete="false"/>
        </div>
        <div m-id="body" class="${style.body}">
        </div>
    </div>
    `);