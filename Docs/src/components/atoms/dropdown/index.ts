declare namespace RHU {
    interface Modules {
        "components/atoms/dropdown": Macro.Template<"atoms/dropdown">;
    }

    namespace Macro {
        interface TemplateMap {
            "atoms/dropdown": Atoms.Dropdown;
        }
    }
}

declare namespace Atoms {
    interface Dropdown extends HTMLSelectElement {
        setOptions<T extends string>(options: { label: T, value: string }[], selected?: T): void;
    }
}

RHU.module(new Error(), "components/atoms/dropdown", { 
    Macro: "rhu/macro", style: "components/atoms/dropdown/style",
}, function({ 
    Macro, style,
}) {
    const dropdown = Macro((() => {
        const dropdown = function(this: Atoms.Dropdown) {
            this.classList.add(`${style.wrapper}`);
        } as RHU.Macro.Constructor<Atoms.Dropdown>;
        dropdown.prototype.setOptions = function<T extends string>(options: { label: T, value: string }[], selected?: T) {
            const fragment = new DocumentFragment();
            for (const option of options) {
                const el = document.createElement("option");
                el.value = option.value;
                el.label = option.label;
                fragment.append(el);
            }
            this.replaceChildren(fragment);

            if (selected) {
                this.value = selected;
            } else if (options.length > 0) {
                this.value = options[0].value;
            }
        };

        return dropdown;
    })(), "atoms/dropdown", //html
    ``, {
        element: //html
            `<select></select>`
    });

    return dropdown;
});