import { html, Macro, MacroElement } from "@esm/@/rhu/macro.js";
import { effect, Signal, signal } from "@esm/@/rhu/signal.js";
import type { View } from "@esm/@root/main/routes/player/components/view/index.js";
import { pageStyles } from "./lib.js";

const style = pageStyles;

const versionInfo = new Map<string, string>();
versionInfo.set("0.0.1", `Initial Release`);
versionInfo.set("0.0.2", `- Added Squid Boss Tumours`);
versionInfo.set("0.0.3", `- Fix door locks sometimes being on the wrong side
- Enemy max health is now recorded instead of being hard coded for better modded support`);
versionInfo.set("0.0.4", `- Fixed items being in the wrong dimension
- Added dimension filter to item search
- Teleporting to an item now also brings you to the right dimension`);   
versionInfo.set("0.0.5", `- Fixed bulkhead keys not having serial numbers
- Added door punch effect
- Fixed checkpoints sometimes bricking replays`);    
versionInfo.set("0.0.6", `- Improved algorithm for generating map navmesh
- Hybrids now have spikey heads for visual clarity
- Configurable render distance for enemies`); 
versionInfo.set("0.0.7", `- OldBulkheadSounds compatibility layer
- Chargers and Shooters now have custom heads for visual clarity
- Lockout 2 compatibility layer for custom weapon systems`);    
versionInfo.set("0.0.8", `- Mines now use a proper Identifier for modded support
- Thrown items are now shown
- Added ability to change module folder to swap parser for modded content
- Hot reloading support for rendering, changes to the parser requires reloading the replay`);    

export const Info = Macro(class Info extends MacroElement {
    public view = signal<Macro<typeof View> | undefined>(undefined);

    private isMaster: Signal<string>;
    private isMasterText: HTMLDivElement;
    private isNotMasterText: HTMLDivElement;

    private version: Signal<string>;
    private versionText: Signal<string>;

    private compatibilityText: HTMLDivElement;

    constructor(dom: Node[], bindings: any) {
        super(dom, bindings);

        this.view.on((view) => {
            if (view === undefined) return;

            this.isMaster.on((value) => {
                if (value) {
                    this.isMasterText.style.display = "block";
                    this.isNotMasterText.style.display = "none";
                } else {
                    this.isNotMasterText.style.display = "block";
                    this.isMasterText.style.display = "none";
                }
            });

            this.version.on((value) => {
                const text = versionInfo.get(value);
                if (text !== undefined) this.versionText(text);
            });

            view.replay.on((replay) => {
                if (replay === undefined) return;

                const _header = replay.watch("ReplayRecorder.Header");
                const _metadata = replay.watch("Vanilla.Metadata");
                effect(() => {
                    const header = _header();
                    if (header === undefined) return;
                    
                    this.isMaster(`${header.isMaster.toString().toUpperCase()}`);
                    
                    let version = "0.0.1";
                    const metadata = _metadata();
                    if (metadata !== undefined) version = metadata.version;
                    this.version(`${version}`);

                    // TODO(randomuserhi): Make more maintainable
                    const compatability: Node[] = [];
                    if (metadata !== undefined) {
                        if (metadata.compatibility_OldBulkheadSound === true) {
                            const [_, frag] = html`
                                <a href="https://thunderstore.io/c/gtfo/p/DarkEmperor/OldBulkheadSound/">OldBulkheadSounds</a>
                                <ul style="margin-left: 10px;">
                                    <li>- Alert blame may be incorrect for sound events triggered on security doors opening</li>
                                    <li>- Can't patch 'LG_SecurityDoor.OnDoorIsOpened' due to NativeDetour vs Harmony</li>
                                </ul>
                                `.dom();
                            compatability.push(frag);
                        }
                    }
                    if (compatability.length === 0) this.compatibilityText.innerHTML = "None";
                    else this.compatibilityText.replaceChildren(...compatability);
                }, [_header, _metadata]);
            });
        });
    }
}, html`
    <div class="${style.wrapper}">
        <div style="margin-bottom: 20px;">
            <h1>REPLAY INFORMATION</h1>
            <p>Metadata of the current replay</p>
        </div>
        <div m-id="body" class="${style.body}">
            <div class="${style.row}">
                <div class="${style.row}" style="
                flex-direction: row;
                gap: 20px;
                align-items: center;
                margin-bottom: 10px;
                font-size: 20px;
                ">
                    <span>Is Master</span>
                    <div style="flex: 1"></div>
                    <span>${Macro.signal("isMaster")}</span>
                </div>
                <div m-id="isMasterText" style="display: none; margin-left: 10px;">
                    This replay was recorded by the HOST player. This allows for additional information such as:
                    <ul>
                        <li>- Kills / assists</li>
                        <li>- Full medal tracking</li>
                        <li>- Enemy health tracking</li>
                        <li>- Player stat tracking</li>
                        <li>- Alert blame</li>
                    </ul>
                </div>
                <div m-id="isNotMasterText" style="display: none; margin-left: 10px;">
                    This replay was recorded by a CLIENT player. This has limited features:
                    <ul>
                        <li>- No kill / assist tracking</li>
                        <li>- Partial medal tracking (Note that some medals may be awarded incorrectly)</li>
                        <li>- No enemy health tracking</li>
                        <li>- No player stat tracking</li>
                        <li>- No alert blame </li>
                    </ul>
                </div>
            </div>
            <div class="${style.row}">
                <div class="${style.row}" style="
                flex-direction: row;
                gap: 20px;
                align-items: center;
                margin-bottom: 10px;
                font-size: 20px;
                ">
                    <span>Version</span>
                    <div style="flex: 1"></div>
                    <span>${Macro.signal("version")}</span>
                </div>
                <div style="margin-left: 10px;">
                    ${Macro.signal("versionText")}
                </div>
            </div>
            <div class="${style.row}">
                <div class="${style.row}" style="
                flex-direction: row;
                gap: 20px;
                align-items: center;
                margin-bottom: 10px;
                font-size: 20px;
                ">
                    <span>Compatibility</span>
                </div>
                <div m-id="compatibilityText" style="margin-left: 10px;">
                </div>
            </div>
        </div>
    </div>
    `);