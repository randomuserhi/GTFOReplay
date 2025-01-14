import { html, Mutable } from "@esm/@/rhu/html.js";
import { Signal, signal } from "@esm/@/rhu/signal.js";
import type { View } from "@esm/@root/main/routes/player/components/view/index.js";
import Fuse from "@esm/fuse.js";
import { FogSphereModel } from "../../renderer/dynamicitems/fogsphere.js";
import { EnemyModelWrapper } from "../../renderer/enemy/lib.js";
import { ResourceContainerModel } from "../../renderer/map/resourcecontainers.js";
import { ExplosionEffectModel } from "../../renderer/player/mine.js";
import { PlayerModel } from "../../renderer/player/model.js";
import { Dropdown } from "../components/dropdown.js";
import { Toggle } from "../components/toggle.js";
import { dispose } from "../main.js";
import { pageStyles, setInputFilter } from "./lib.js";

const style = pageStyles;

export const FeatureWrapper = (tag: string) => {
    interface Public {
        readonly tag: string
    }
    interface Private {
        readonly body: HTMLDivElement;
    }

    const dom = html<Mutable<Private & Public>>/**//*html*/`
        <div m-id="body"></div>
        `;
    html(dom).box().children((children) => {
        dom.body.append(...children);
    });
	
    dom.tag = tag;

    return dom;
};

const featureList: ((v: Signal<html<typeof View> | undefined>, active: Signal<boolean>) => html<typeof FeatureWrapper>)[] = [
    (v) => {
        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            slider: HTMLInputElement;
            text: HTMLInputElement;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Timescale")).bind("wrapper")}
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
            ${html.close()}
        `;

        const { text, slider } = dom;

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

        return dom.wrapper;
    },
    (v) => {
        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            text: HTMLInputElement;
            slider: HTMLInputElement;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Render Distance")).bind("wrapper")}
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
            ${html.close()}
        `;

        const { text, slider } = dom;

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

        return dom.wrapper;
    },
    (v, active) => {
        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            dropdown: html<typeof Dropdown>;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Follow Player")).bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    <span style="flex: 1; padding-top: 1px;">Follow Player</span>
                    ${html.bind(Dropdown(), "dropdown").transform(d => d.wrapper.style.width = "100%")}
                </div>
            ${html.close()}
        `;
        
        const { dropdown } = dom;
        
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

        return dom.wrapper;
    },
    (v) => {
        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            toggle: html<typeof Toggle>;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Dimension")).bind("wrapper")}
                <div class="${style.row}" style="
                flex-direction: row;
                gap: 20px;
                align-items: center;
                ">
                    <span style="flex: 1; padding-top: 1px;">Relative Rotation</span>
                    ${html.bind(Toggle(), "toggle")}
                </div>
            ${html.close()}
        `;

        const { toggle } = dom;

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

        return dom.wrapper;
    },
    (v) => {
        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            dropdown: html<typeof Dropdown>;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Dimension")).bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    <span style="flex: 1; padding-top: 1px;">Dimension</span>
                    ${html.bind(Dropdown(), "dropdown").transform(d => d.wrapper.style.width = "100%")}
                </div>
            ${html.close()}
        `;
        
        const { dropdown } = dom;
        
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

        return dom.wrapper;
    },
    (v) => {
        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            toggle: html<typeof Toggle>;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Transparent Resource Containers")).bind("wrapper")}
                <div class="${style.row}" style="
                flex-direction: row;
                gap: 20px;
                align-items: center;
                ">
                    <span style="flex: 1; padding-top: 1px;">Transparent Resource Containers</span>
                    ${html.bind(Toggle(), "toggle")}
                </div>
            ${html.close()}
        `;

        const { toggle } = dom;

        toggle.value.on((value) => {
            ResourceContainerModel.transparent(value);
        });

        ResourceContainerModel.transparent.on((value) => {
            toggle.value(value);
        });

        return dom.wrapper;
    },
    (v) => {
        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            toggle: html<typeof Toggle>;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Debug Resource Containers")).bind("wrapper")}
                <div class="${style.row}" style="
                flex-direction: row;
                gap: 20px;
                align-items: center;
                ">
                    <span style="flex: 1; padding-top: 1px;">Debug Resource Containers</span>
                    ${html.bind(Toggle(), "toggle")}
                </div>
            ${html.close()}
        `;

        const { toggle } = dom;

        toggle.value.on((value) => {
            ResourceContainerModel.debug(value);
        });

        ResourceContainerModel.debug.on((value) => {
            toggle.value(value);
        });

        return dom.wrapper;
    },
    (v) => {
        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            toggle: html<typeof Toggle>;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Show Enemy Info")).bind("wrapper")}
                <div class="${style.row}" style="
                flex-direction: row;
                gap: 20px;
                align-items: center;
                ">
                    <span style="flex: 1; padding-top: 1px;">Show Enemy Info</span>
                    ${html.bind(Toggle(), "toggle")}
                </div>
            ${html.close()}
        `;

        const { toggle } = dom;

        toggle.value.on((value) => {
            EnemyModelWrapper.showInfo(value);
        });

        EnemyModelWrapper.showInfo.on((value) => {
            toggle.value(value);
        });

        return dom.wrapper;
    },
    (v) => {
        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            toggle: html<typeof Toggle>;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Colour Enemy Based on Aggro")).bind("wrapper")}
                <div class="${style.row}" style="
                flex-direction: row;
                gap: 20px;
                align-items: center;
                ">
                    <span style="flex: 1; padding-top: 1px;">Colour Enemy Based on Aggro</span>
                    ${html.bind(Toggle(), "toggle")}
                </div>
            ${html.close()}
        `;

        const { toggle } = dom;

        toggle.value.on((value) => {
            EnemyModelWrapper.aggroColour(value);
        });

        EnemyModelWrapper.aggroColour.on((value) => {
            toggle.value(value);
        });

        return dom.wrapper;
    },
    (v) => {
        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            toggle: html<typeof Toggle>;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Show Fog Repeller Radius")).bind("wrapper")}
                <div class="${style.row}" style="
                flex-direction: row;
                gap: 20px;
                align-items: center;
                ">
                    <span style="flex: 1; padding-top: 1px;">Show Fog Repeller Radius</span>
                    ${html.bind(Toggle(), "toggle")}
                </div>
            ${html.close()}
        `;

        const { toggle } = dom;

        toggle.value.on((value) => {
            FogSphereModel.show(value);
        });

        FogSphereModel.show.on((value) => {
            toggle.value(value);
        });

        return dom.wrapper;
    },
    (v) => {
        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            toggle: html<typeof Toggle>;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Show Explosion Radius")).bind("wrapper")}
                <div class="${style.row}" style="
                flex-direction: row;
                gap: 20px;
                align-items: center;
                ">
                    <span style="flex: 1; padding-top: 1px;">Show Explosion Radius</span>
                    ${html.bind(Toggle(), "toggle")}
                </div>
            ${html.close()}
        `;

        const { toggle } = dom;

        toggle.value.on((value) => {
            ExplosionEffectModel.showRadius(value);
        });

        ExplosionEffectModel.showRadius.on((value) => {
            toggle.value(value);
        });

        return dom.wrapper;
    },
    (v) => {
        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            toggle: html<typeof Toggle>;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Show Flashlight Line of Sight")).bind("wrapper")}
                <div class="${style.row}" style="
                flex-direction: row;
                gap: 20px;
                align-items: center;
                ">
                    <span style="flex: 1; padding-top: 1px;">Show Flashlight Line of Sight</span>
                    ${html.bind(Toggle(), "toggle")}
                </div>
            ${html.close()}
        `;

        const { toggle } = dom;

        toggle.value.on((value) => {
            PlayerModel.showFlashlightLineOfSight(value);
        });

        PlayerModel.showFlashlightLineOfSight.on((value) => {
            toggle.value(value);
        });

        return dom.wrapper;
    },
];

export const Settings = () => {
    interface Settings {
        readonly view: Signal<html<typeof View> | undefined>;
        readonly active: Signal<boolean>
    }
    interface Private {
        readonly body: HTMLDivElement;
        readonly search: HTMLInputElement;
    }

    const dom = html<Mutable<Private & Settings>>/**//*html*/`
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
        `;
    html(dom).box();
    
    dom.view = signal<html<typeof View> | undefined>(undefined);
    dom.active = signal(false);

    const features: html<typeof FeatureWrapper>[] = [];
    const fuse = new Fuse(features, {
        keys: ["tag"]
    });

    for (const feature of featureList) {
        const f = feature(dom.view, dom.active);
        features.push(f);

        dom.body.append(...f);
    }

    dom.search.addEventListener("keyup", () => {
        let value = dom.search.value;
        value = value.trim();
        if (value.length === 0) {
            html.replaceChildren(dom.body, ...features);
            return;
        }
        const results = fuse.search(value).map((n) => n.item);
        html.replaceChildren(dom.body, ...results);
    });

    return dom as html<Settings>;
};