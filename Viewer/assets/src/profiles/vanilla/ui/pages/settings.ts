import { ui, uiText, uiAttribute } from "@esm/@root/main/i18n.js";
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
        readonly body: HTMLDivElement;
    }
    interface Private {
    }

    const dom = html<Mutable<Private & Public>>/**//*html*/`
        <div m-id="body" class="setting-row"></div>
        `;
    html(dom).box().children((children) => {
        dom.body.append(...children);
    });
	
    Object.defineProperty(dom, "tag", { get: () => `${tag} ${ui(tag)}` });

    return dom;
};

const featureList: ((v: Signal<html<typeof View> | undefined>, active: Signal<boolean>) => html<typeof FeatureWrapper>)[] = [
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
                    <span>${uiText("Render Distance")}</span>
                    <div class="${style.row}" style="
                    flex-direction: row;
                    gap: 20px;
                    align-items: center;
                    ">
                        <input m-id="slider" aria-label="${ui("Render Distance")}" style="
                        flex: 1;
                        " type="range" min="50" max="500" value="100" step="10" />
                        <input m-id="text" aria-label="${ui("Render Distance")}" style="
                        width: 50px;
                        " class="${style.search}" type="text" spellcheck="false" autocomplete="false" value="1"/>
                    </div>
                </div>
            ${html.close()}
        `;

        const { text, slider } = dom;

        const change = () => {
            text.value = slider.value;

            const view = v();
            if (view === undefined) return;
            const camera = view.renderer.get("Camera");
            if (camera === undefined) return;

            camera.renderDistance(parseFloat(slider.value));
        };
        slider.addEventListener("input", change);
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
            const value = Number(text.value.replace(",", "."));
            if (!text.value.trim() || !Number.isFinite(value)) return;
            slider.value = String(Math.min(Number(slider.max), Math.max(Number(slider.min), value)));

            const view = v();
            if (view === undefined) return;
            const camera = view.renderer.get("Camera");
            if (camera === undefined) return;

            camera.renderDistance(Number(slider.value));
        });

        setInputFilter(text, function(value) { return /^-?\d*[.,]?\d*$/.test(value); });

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
                    <span style="flex: 1; padding-top: 1px;">${uiText("Relative Rotation")}</span>
                    ${html.bind(Toggle("Relative Rotation"), "toggle")}
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
                    <span style="flex: 1; padding-top: 1px;">${uiText("Dimension")}</span>
                    ${html.bind(Dropdown("Dimension"), "dropdown").transform(d => d.wrapper.style.width = "100%")}
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
                            dimension === 0 ? ui("Reality") : ui("Dimension {{dimension}}", { dimension }),
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
                    <span style="flex: 1; padding-top: 1px;">${uiText("Transparent Resource Containers")}</span>
                    ${html.bind(Toggle("Transparent Resource Containers"), "toggle")}
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
                    <span style="flex: 1; padding-top: 1px;">${uiText("Debug Resource Containers")}</span>
                    ${html.bind(Toggle("Debug Resource Containers"), "toggle")}
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

        v.on((view) => {
            if (view === undefined) return;

            view.replay.on((replay) => {
                if (replay === undefined) return;

                replay.watch("Vanilla.Metadata").on((metadata) => {
                    if (metadata === undefined) return;

                    dom.wrapper.body.style.display = metadata?.compatibility_NoArtifact ? "none" : "block";

                    if (metadata?.compatibility_NoArtifact) {
                        toggle.value(false);
                    }
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
            ${html.open(FeatureWrapper("Show Enemy Info")).bind("wrapper")}
                <div class="${style.row}" style="
                flex-direction: row;
                gap: 20px;
                align-items: center;
                ">
                    <span style="flex: 1; padding-top: 1px;">${uiText("Show Enemy Info")}</span>
                    ${html.bind(Toggle("Show Enemy Info"), "toggle")}
                </div>
            ${html.close()}
        `;

        const { toggle } = dom;

        EnemyModelWrapper.showInfo.on((value) => {
            toggle.value(value);
        });

        toggle.value.on((value) => {
            EnemyModelWrapper.showInfo(value);
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
                    <span style="flex: 1; padding-top: 1px;">${uiText("Colour Enemy Based on Aggro")}</span>
                    ${html.bind(Toggle("Colour Enemy Based on Aggro"), "toggle")}
                </div>
            ${html.close()}
        `;

        const { toggle } = dom;

        EnemyModelWrapper.aggroColour.on((value) => {
            toggle.value(value);
        });

        toggle.value.on((value) => {
            EnemyModelWrapper.aggroColour(value);
        });

        return dom.wrapper;
    },
    (v) => {
        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            toggle: html<typeof Toggle>;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Show Enemy Ragdolls")).bind("wrapper")}
                <div class="${style.row}" style="
                flex-direction: row;
                gap: 20px;
                align-items: center;
                ">
                    <span style="flex: 1; padding-top: 1px;">${uiText("Show Enemy Ragdolls")}</span>
                    ${html.bind(Toggle("Show Enemy Ragdolls"), "toggle")}
                </div>
            ${html.close()}
        `;

        const { toggle } = dom;

        EnemyModelWrapper.showRagdolls.on((value) => {
            toggle.value(value);
        });

        toggle.value.on((value) => {
            EnemyModelWrapper.showRagdolls(value);
        });

        v.on((view) => {
            if (view === undefined) return;

            view.replay.on((replay) => {
                if (replay === undefined) return;

                replay.watch("Vanilla.Metadata").on((metadata) => {
                    if (metadata === undefined) return;

                    dom.wrapper.body.style.display = metadata?.recordEnemyRagdolls ? "block" : "none";

                    if (metadata?.compatibility_NoArtifact) {
                        toggle.value(false);
                    }
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
            ${html.open(FeatureWrapper("Show Fog Repeller Radius")).bind("wrapper")}
                <div class="${style.row}" style="
                flex-direction: row;
                gap: 20px;
                align-items: center;
                ">
                    <span style="flex: 1; padding-top: 1px;">${uiText("Show Fog Repeller Radius")}</span>
                    ${html.bind(Toggle("Show Fog Repeller Radius"), "toggle")}
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
                    <span style="flex: 1; padding-top: 1px;">${uiText("Show Explosion Radius")}</span>
                    ${html.bind(Toggle("Show Explosion Radius"), "toggle")}
                </div>
            ${html.close()}
        `;

        const { toggle } = dom;

        ExplosionEffectModel.showRadius.on((value) => {
            toggle.value(value);
        });

        toggle.value.on((value) => {
            ExplosionEffectModel.showRadius(value);
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
                    <span style="flex: 1; padding-top: 1px;">${uiText("Show Flashlight Line of Sight")}</span>
                    ${html.bind(Toggle("Show Flashlight Line of Sight"), "toggle")}
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
            <div class="settings-search">
                <input m-id="search" placeholder="${ui("Search ...")}" class="${style.search}" type="text" spellcheck="false" autocomplete="false"/>
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


    }

    const grouped = () => {
        const groups = [["Camera", 0, 3], ["Resource containers", 3, 5], ["Enemies", 5, 8], ["Overlays", 8, features.length]] as const;
        dom.body.replaceChildren();
        for (const [title, start, end] of groups) {
            const section = document.createElement("section"); section.className = "settings-group";
            const heading = html`<h2>${uiText(title)}</h2>`; section.append(...heading);
            for (const feature of features.slice(start, end)) section.append(...feature);
            dom.body.append(section);
        }
    };
    grouped();
    uiAttribute(dom.search, "placeholder", "Search ...", dispose.signal);
    dom.search.addEventListener("keyup", () => {
        let value = dom.search.value;
        value = value.trim();
        if (value.length === 0) {
            grouped();
            return;
        }
        fuse.setCollection(features);
        const results = fuse.search(value).map((n) => n.item);
        html.replaceChildren(dom.body, ...results);
    });

    return dom as html<Settings>;
};
