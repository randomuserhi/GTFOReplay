RHU.module(new Error(), "components/atoms/dropdown", {
    Macro: "rhu/macro", style: "components/atoms/dropdown/style",
}, function ({ Macro, style, }) {
    const dropdown = Macro((() => {
        const dropdown = function () {
            this.classList.add(`${style.wrapper}`);
        };
        dropdown.prototype.setOptions = function (options, selected) {
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
            }
            else if (options.length > 0) {
                this.value = options[0].value;
            }
        };
        return dropdown;
    })(), "atoms/dropdown", ``, {
        element: `<select></select>`
    });
    return dropdown;
});
