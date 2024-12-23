import { html, Macro, MacroElement, RHU_CHILDREN } from "@esm/@/rhu/macro.js";
import { Signal, signal } from "@esm/@/rhu/signal.js";
import type { View } from "@esm/@root/main/routes/player/components/view/index.js";
import Fuse from "@esm/fuse.js";
import { FogSphereModel } from "../../renderer/dynamicitems/fogsphere.js";
import { EnemyModelWrapper } from "../../renderer/enemy/lib.js";
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

    constructor(dom: Node[], bindings: any, children: RHU_CHILDREN, tag: string) {
        super(dom, bindings);
        this.tag = tag;
        this.body.append(...children);
    }
}, () => html`
    <div m-id="body"></div>
`);

const features: ((v: Signal<Macro<typeof View> | undefined>, active: Signal<boolean>) => Macro<typeof FeatureWrapper>)[] = [
    (v) => {
        const [bindings, frag] = html`
            ${FeatureWrapper("Timescale").open().bind("wrapper")}
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
        const change = () => {
            if (!active) return;
            text.value = slider.value;

            const view = v();
            if (view === undefined) return;

            view.timescale(parseFloat(slider.value));
        };
        slider.addEventListener("mousemove", change);
        slider.addEventListener("change", change);

        v.on((view) => {
            if (view === undefined) {
                return;
            }
            
            view.timescale.on(value => {
                slider.value = `${value}`;
                text.value = `${value}`;
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });

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
            ${FeatureWrapper("Render Distance").open().bind("wrapper")}
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
        const change = () => {
            if (!active) return;
            text.value = slider.value;

            const view = v();
            if (view === undefined) return;
            const camera = view.renderer.get("Camera");
            if (camera === undefined) return;

            camera.renderDistance(parseFloat(slider.value));
        };
        slider.addEventListener("mousemove", change);
        slider.addEventListener("change", change);

        v.on((view) => {
            if (view === undefined) {
                return;
            }
            
            view.renderer.watch("Camera").on(camera => {
                if (camera === undefined) return;
                
                camera.renderDistance.on(value => {
                    slider.value = `${value}`;
                    text.value = `${value}`;
                });
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });

        text.addEventListener("keyup", () => {
            slider.value = text.value;

            const view = v();
            if (view === undefined) return;
            const camera = view.renderer.get("Camera");
            if (camera === undefined) return;

            camera.renderDistance(parseFloat(text.value));
        });

        setInputFilter(text, function(value) { return /^-?\d*[.,]?\d*$/.test(value); });

        return bindings.wrapper;
    },
    (v, active) => {
        const [bindings, frag] = html`
            ${FeatureWrapper("Follow Player").open().bind("wrapper")}
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
            }, { signal: dispose.signal });

            view.api.on((api) => {
                if (!active()) return;

                if (api === undefined) {
                    dropdown.options([]);
                    return;
                }

                const all = api.get("Vanilla.Player");
                if (all === undefined) {
                    dropdown.options([]);
                    return;
                }

                const players: [key: string, value: any][] = [];
                for (const player of all.values()) {
                    players.push([
                        player.nickname,
                        player.slot
                    ]);
                }
                dropdown.options(players);
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });

        return bindings.wrapper;
    },
    (v) => {
        const [bindings, frag] = html`
            ${FeatureWrapper("Dimension").open().bind("wrapper")}
                <div class="${style.row}" style="
                flex-direction: row;
                gap: 20px;
                align-items: center;
                ">
                    <span style="flex: 1; padding-top: 1px;">Relative Rotation</span>
                    ${Toggle().bind("toggle")}
                </div>
            ${FeatureWrapper.close}
        `.dom<{
            wrapper: Macro<typeof FeatureWrapper>;
            toggle: Macro<typeof Toggle>;
        }>();

        const { toggle } = bindings;

        toggle.value.on((value) => {
            const view = v();
            if (view === undefined) return;
            const controls = view.renderer.get("Controls");
            if (controls === undefined) return;

            controls.relativeRot(value);
        });

        v.on((view) => {
            if (view === undefined) {
                return;
            }
            
            view.renderer.watch("Controls").on(controls => {
                if (controls === undefined) return;
                
                controls.relativeRot.on(value => {
                    toggle.value(value);
                });
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });

        return bindings.wrapper;
    },
    (v) => {
        const [bindings, frag] = html`
            ${FeatureWrapper("Dimension").open().bind("wrapper")}
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
            }, { signal: dispose.signal });

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
    
                    const dimensions: [key: string, value: any][] = [];
                    for (const dimension of map.keys()) {
                        dimensions.push([
                            dimension === 0 ? `Reality` : `Dimension ${dimension}`,
                            dimension
                        ]);
                    }
                    dropdown.options(dimensions);
                }, { signal: dispose.signal });
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });

        return bindings.wrapper;
    },
    (v) => {
        const [bindings, frag] = html`
            ${FeatureWrapper("Transparent Resource Containers").open().bind("wrapper")}
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
            ${FeatureWrapper("Debug Resource Containers").open().bind("wrapper")}
                <div class="${style.row}" style="
                flex-direction: row;
                gap: 20px;
                align-items: center;
                ">
                    <span style="flex: 1; padding-top: 1px;">Debug Resource Containers</span>
                    ${Toggle().bind("toggle")}
                </div>
            ${FeatureWrapper.close}
        `.dom<{
            wrapper: Macro<typeof FeatureWrapper>;
            toggle: Macro<typeof Toggle>;
        }>();

        const { toggle } = bindings;

        toggle.value.on((value) => {
            ResourceContainerModel.debug(value);
        });

        ResourceContainerModel.debug.on((value) => {
            toggle.value(value);
        });

        return bindings.wrapper;
    },
    (v) => {
        const [bindings, frag] = html`
            ${FeatureWrapper("Show Enemy Info").open().bind("wrapper")}
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
            EnemyModelWrapper.showInfo(value);
        });

        EnemyModelWrapper.showInfo.on((value) => {
            toggle.value(value);
        });

        return bindings.wrapper;
    },
    (v) => {
        const [bindings, frag] = html`
            ${FeatureWrapper("Colour Enemy Based on Aggro").open().bind("wrapper")}
                <div class="${style.row}" style="
                flex-direction: row;
                gap: 20px;
                align-items: center;
                ">
                    <span style="flex: 1; padding-top: 1px;">Colour Enemy Based on Aggro</span>
                    ${Toggle().bind("toggle")}
                </div>
            ${FeatureWrapper.close}
        `.dom<{
            wrapper: Macro<typeof FeatureWrapper>;
            toggle: Macro<typeof Toggle>;
        }>();

        const { toggle } = bindings;

        toggle.value.on((value) => {
            EnemyModelWrapper.aggroColour(value);
        });

        EnemyModelWrapper.aggroColour.on((value) => {
            toggle.value(value);
        });

        return bindings.wrapper;
    },
    (v) => {
        const [bindings, frag] = html`
            ${FeatureWrapper("Show Fog Repeller Radius").open().bind("wrapper")}
                <div class="${style.row}" style="
                flex-direction: row;
                gap: 20px;
                align-items: center;
                ">
                    <span style="flex: 1; padding-top: 1px;">Show Fog Repeller Radius</span>
                    ${Toggle().bind("toggle")}
                </div>
            ${FeatureWrapper.close}
        `.dom<{
            wrapper: Macro<typeof FeatureWrapper>;
            toggle: Macro<typeof Toggle>;
        }>();

        const { toggle } = bindings;

        toggle.value.on((value) => {
            FogSphereModel.show(value);
        });

        FogSphereModel.show.on((value) => {
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

    public active = signal(false);

    constructor(dom: Node[], bindings: any) {
        super(dom, bindings);

        this.features = [];
        for (const feature of features) {
            const f = feature(this.view, this.active);
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
}, () => html`
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
        z-index: 100;
        ">
            <input m-id="search" placeholder="Search ..." class="${style.search}" type="text" spellcheck="false" autocomplete="false"/>
        </div>
        <div m-id="body" class="${style.body}">
        </div>
    </div>
    `);