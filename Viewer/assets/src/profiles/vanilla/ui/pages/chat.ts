import { Mutable } from "@/rhu/html.js";
import { html } from "@esm/@/rhu/html.js";
import { Signal, signal } from "@esm/@/rhu/signal.js";
import { Style } from "@esm/@/rhu/style.js";
import type { View } from "@esm/@root/main/routes/player/components/view/index.js";
import { getPlayerChatColor } from "../../datablocks/player/player.js";
import { Factory } from "../../library/factory.js";
import { dispose } from "../main.js";
import { pageStyles } from "./lib.js";

const style = pageStyles;

const messageStyle = Style(({ css }) => {
    const wrapper = css.class`
    display: flex;
    flex-direction: column;
    `;

    const left = css.class`
    justify-content: left;
    align-items: start;
    `;

    const right = css.class`
    justify-content: right;
    align-items: end;
    `;

    const text = css.class`
    background-color: #43434c;
    color:rgb(163, 163, 163);
    padding: 7px 10px 5px 10px;
    border-radius: 1em;
    max-width: 100%;
    `;

    const acked = css.class``;
    css`
    ${wrapper}${acked} ${text} {
        background-color: #43434c;
        color: #ffffff;
    }
    `;
    
    return {
        wrapper,
        text,
        left,
        right,
        acked
    };
});

export const Chat = () => {
    interface Chat {
        readonly view: Signal<html<typeof View> | undefined>;
        readonly active: Signal<boolean>;
    }
    interface Private {
        readonly chat: HTMLInputElement;
        readonly list: HTMLDivElement;
    }

    type MessageState = "fromGame" | "sentNoAck" | "sentAck";
    const sentMessages = new Map<number, Signal<MessageState>>();

    const dom = html<Mutable<Private & Chat>>/**//*html*/`
        <div class="${style.wrapper}" style="display: flex; flex-direction: column; height: 100%; padding: 0;">
            <div style="margin-bottom: 20px; padding: 20px;">
                <h1>Chat</h1>
                <p>Allows spectators to chat during live view. If the connected player has chat muted, messages will not be sent.</p>
            </div>
            <ul m-id="list" style="
                display: flex;
                flex-direction: column;
                flex: 1;
                overflow: auto;
                gap: 10px;
                padding: 20px;
                font-size: 14px;
            ">
            </ul>
            <div style="
            position: sticky; 
            padding: 40px 20px; 
            bottom: 0px; 
            background-color: #1f1f29;
            z-index: 100;
            ">
                <input m-id="chat" class="${style.search}" type="text" spellcheck="false" autocomplete="false"/>
            </div>
        </div>
        `;
    html(dom).box();

    dom.view = signal<html<typeof View> | undefined>(undefined);
    dom.active = signal(false);
    
    let lastUser: bigint | string | undefined = undefined;
    
    dom.chat.addEventListener("keydown", async (e) => {
        if (e.key !== 'Enter' && e.keyCode !== 13) return;
        if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;

        const message = dom.chat.value.replace(/<\/?[^>]+(>|$)/g, "").trim();
        if (message.length === 0) return;
        else if (message.length > 150) return; // TODO(randomuserhi): message too long error

        const m = html`
        <li m-id="item" class="${messageStyle.wrapper} ${messageStyle.right}">
            <div class="${messageStyle.text}">
                ${new Text(message)}
            </div>
        </li>
        `;
        const doScroll = dom.list.offsetHeight + dom.list.scrollTop >= dom.list.scrollHeight;
        dom.list.append(...m);
        if (doScroll) {
            dom.list.scroll({ top: dom.list.scrollHeight });
        }

        lastUser = undefined;
        
        const state = signal<MessageState>("sentNoAck");
        state.on((v) => {
            if (v === "sentAck") {
                m.item.classList.add(`${messageStyle.acked}`);
            }
        }, { signal: dispose.signal });

        dom.chat.value = "";
        
        sentMessages.set(await window.api.invoke("sendChatMessage", message), state);
    });

    const spectatorNameRegex = /> \[(.*)\]/;
    const onInGameMessage = window.api.on("inGameMessage", (steamId: bigint, message: string) => {
        message = message.trim();
        if (message.length === 0) return;

        const replay = dom.view()?.replay();
        const snapshot = dom.view()?.snapshot;
        if (snapshot === undefined || replay === undefined) return;

        const api = replay.api(snapshot);
        const players = api.getOrDefault("Vanilla.Player.Snet", Factory("Map"));
        const player = players.get(steamId)!;
        if (player === undefined) return;

        let m: html;

        if (message[0] === ">") {
            // From spectator, probably (could be impersonated)

            const match = message.match(spectatorNameRegex);
            let spectator = undefined;
            if (match !== null) {
                spectator = match[1];
            }

            m = html`
            <li class="${messageStyle.wrapper} ${messageStyle.left} ${messageStyle.acked}">
                ${spectator === undefined || lastUser === spectator ? "" : /*html*/`
                <div style="font-size: 10px; padding: 5px;">
                    ${new Text(`${spectator} (${player.nickname})`)}
                </div>`}
                <div class="${messageStyle.text}">
                    ${new Text(match !== null ? message.replace(match[0], "").trim() : message.replace(">", "").trim())}
                </div>
            </li>
            `;

            lastUser = spectator;
        } else {
            // From player
            const colors = getPlayerChatColor(player.slot);

            m = html`
            <li class="${messageStyle.wrapper} ${messageStyle.left}">
                ${lastUser === steamId ? "" : /*html*/`
                <div style="font-size: 10px; padding: 5px;">
                    ${new Text(player.nickname)}
                </div>`}
                <div class="${messageStyle.text}" style="background-color: ${colors.back}; color: ${colors.front};">
                    ${new Text(message)}
                </div>
            </li>
            `;

            lastUser = steamId;
        }
        
        const doScroll = dom.list.offsetHeight + dom.list.scrollTop >= dom.list.scrollHeight;
        dom.list.append(...m);
        if (doScroll) {
            dom.list.scroll({ top: dom.list.scrollHeight });
        }
    });
    const ackInGameMessage = window.api.on("ackInGameMessage", (messageId: number) => {
        if (!sentMessages.has(messageId)) return;
        const m = sentMessages.get(messageId)!;
        sentMessages.delete(messageId);

        m("sentAck");
    });
    dispose.signal.addEventListener("abort", () => {
        window.api.off("inGameMessage", onInGameMessage);
        window.api.off("ackInGameMessage", ackInGameMessage);
    });

    return dom as html<Chat>;
};