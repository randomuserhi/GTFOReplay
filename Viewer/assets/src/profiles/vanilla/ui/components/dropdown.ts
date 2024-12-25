import { html, Mutable } from "@esm/@/rhu/html.js";
import { signal, Signal } from "@esm/@/rhu/signal.js";
import { Style } from "@esm/@/rhu/style.js";

const style = Style(({ css }) => {
    const wrapper = css.class`
    position: relative;

    display: flex;
    flex-direction: column;
    flex-shrink: 0;

    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    `;
    css`
    ${wrapper}:focus {
        outline: none;
    }
    `;

    const active = css.class``;

    const body = css.class`
    width: 100%;
    display: none;
    flex-direction: column;
    position: absolute;
    top: 33px;
    max-height: 300px;
    overflow-y: auto;
    overflow-x: none;
    `;

    css`
    ${wrapper}${active} {
        z-index: 1000;
    }

    ${body}::-webkit-scrollbar-track {
        background-color: #12121a;
        border-style: none;
        border-radius: 0;
    }

    ${wrapper}${active} ${body} {
        display: flex;
    }
    `;

    const item = css.class`
    display: flex;
    flex-direction: column;
    flex-shrink: 0;

    width: 100%;
    height: 33px;
    padding: 7px 10px;
    
    color: white;
    background-color: #12121a;

    cursor: pointer;
    `;
    css`
    ${item}:hover {
        background-color: #313145;
    }
        
    ${wrapper}>${item} {
        border-radius: 3px;
    }
    ${wrapper}${active}>${item} {
        border-radius: 3px 3px 0 0;
    }

    ${wrapper}${active}>${body}:last-child {
        border-radius: 0 0 3px 3px;
    }
    `;

    return {
        wrapper,
        body,
        item,
        active
    };
});

export const Item = () => {
    interface Item {
        key: Signal<string>;
        value: any;
        readonly button: HTMLSpanElement;
    }
    interface Private {
    }

    const key = signal("");

    const dom = html<Mutable<Private & Item>>/**//*html*/`
        <span m-id="button" class="${style.item}">${key}</span>
		`;
    html(dom).box();

    dom.key = key;
    dom.value = undefined;

    return dom as html<Item>;
};

export const Dropdown = () => {
    interface Dropdown {
        value: Signal<any>;
        options: Signal<[key: string, value: any][]>;
        readonly wrapper: HTMLDivElement;
    }
    interface Private {
        readonly select: HTMLDivElement;
    }

    const active = signal(false);
    const selected = signal("");
    const valueMap = new Map<any, string>();
    const _value = signal<any>(undefined);

    const options = signal<[key: string, value: any][]>([], (a, b) => {
        if (a === undefined && b === undefined) return true;
        if (a === undefined || b === undefined) return false;
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; ++i) {
            if (a[i][0] !== b[i][1]) return false; // TODO(randomuserhi): allow for custom equality
        }
        return true;
    });
    const list = html.map(options, (values) => values, (kv, el) => {
        const [key, value] = kv;
        if (el === undefined) {
            const el = Item();
            active(false);
            el.value = value;
            el.key(key);
            el.button.addEventListener("click", () => {
                active(false);
                _value(el.value);
            });
            return el;
        } else {
            el.value = value;
            el.key(key);
            return el;
        }
    });

    const dom = html<Mutable<Private & Dropdown>>/**//*html*/`
        <div m-id="wrapper" class="${style.wrapper}" tabindex="-1">
            <span m-id="select" class="${style.item}">${selected}</span>
            <div class="${style.body}">
                ${list}
            </div>
        </div>
        `;
    html(dom).box();

    dom.value = _value;
    dom.options = options;

    dom.options.on((values) => {
        valueMap.clear();

        for (const [key, value] of values) {
            valueMap.set(value, key);
        }

        const value = dom.value();
        if (!valueMap.has(value)) selected("");
        else selected(valueMap.get(value)!);
    });

    active.guard = (active) => {
        if (dom.options().length === 0) return false;
        return active;
    }; 

    active.on((active) => {
        if (active) dom.wrapper.classList.add(`${style.active}`);
        else dom.wrapper.classList.remove(`${style.active}`);
    });

    dom.select.addEventListener("click", () => {
        active(!active());
    });

    dom.wrapper.addEventListener("blur", () => {
        active(false);
    });

    dom.value.on((value) => {
        if (!valueMap.has(value)) selected("");
        else selected(valueMap.get(value)!);
    });

    return dom as html<Dropdown>;
};