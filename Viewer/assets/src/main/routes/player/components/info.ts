import { Constructor, Macro } from "@/rhu/macro.js";
import { Style } from "@/rhu/style.js";
import { player } from "..";

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
    transition: all ease-in-out 100ms;
    `;
    style`
    ${toggle}:hover {
        --color: #bfb9eb;
    }
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

export interface info extends HTMLDivElement {
    player: player;
    init(player: player): void;
    update(): void;
    reset(): void;

    isMaster: HTMLSpanElement;
    isMasterText: HTMLDivElement;
    isNotMasterText: HTMLDivElement;

    version: HTMLSpanElement;
    versionText: HTMLDivElement;
}

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "routes/player.info": info;
    }
}

const versionInfo = new Map<string, string>();
versionInfo.set("0.0.1", `Initial Release`);
versionInfo.set("0.0.2", `- Fix door locks sometimes being on the wrong side
- Enemy max health is now recorded instead of being hard coded for better modded support`);

export const info = Macro((() => {
    const info = function(this: info) {
    } as Constructor<info>;

    info.prototype.init = function(player) {
        this.player = player;
    };

    info.prototype.update = function() { 
    };

    info.prototype.reset = function() {
        const replay = this.player.replay;
        if (replay === undefined) return;

        const header = replay.get("ReplayRecorder.Header")!;

        this.isMaster.innerText = `${header.isMaster.toString().toUpperCase()}`;
        if (header.isMaster) {
            this.isMasterText.style.display = "block";
            this.isNotMasterText.style.display = "none";
        } else {
            this.isNotMasterText.style.display = "block";
            this.isMasterText.style.display = "none";
        }

        const metadata = replay.get("Vanilla.Metadata");
        let version = "0.0.1";
        if (metadata !== undefined) version = metadata.version;
        this.version.innerText = `${version}`;
        const versionText = versionInfo.get(version);
        if (versionText !== undefined) this.versionText.innerText = versionText;
    };

    return info;
})(), "routes/player.info", //html
`
    <div style="margin-bottom: 20px;">
        <h1>REPLAY INFORMATION</h1>
        <p>Metadata of the current replay</p>
    </div>
    <div rhu-id="body" class="${style.body}">
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
                <span rhu-id="isMaster"></span>
            </div>
            <div rhu-id="isMasterText" style="display: none; margin-left: 10px;">
                This replay was recorded by the HOST player. This allows for additional information such as:
                <ul>
                    <li>- Kills / assists</li>
                    <li>- Full medal tracking</li>
                    <li>- Enemy health tracking</li>
                    <li>- Player stat tracking</li>
                    <li>- Alert blame</li>
                </ul>
            </div>
            <div rhu-id="isNotMasterText" style="display: none; margin-left: 10px;">
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
                <span rhu-id="version"></span>
            </div>
            <div rhu-id="versionText" style="margin-left: 10px;">
            </div>
        </div>
    </div>
    `, {
    element: //html
        `<div class="${style.wrapper}"></div>`
});