RHU.module(new Error(), "docuscript/code/@components/molecules/codeblock", {
    Macro: "rhu/macro", style: "docuscript/code/@components/molecules/codeblock/style",
}, function ({ Macro, }) {
    const codeblock = Macro((() => {
        const codeblock = function () {
        };
        codeblock.prototype.setLanguage = function (language) {
            if (language) {
                this.code.classList.toggle(language, true);
            }
            else {
                this.code.classList.toggle("language-plaintext", true);
            }
            hljs.highlightElement(this.code);
        };
        codeblock.prototype.append = function (...args) {
            return HTMLElement.prototype.append.call(this.code, ...args);
        };
        return codeblock;
    })(), "docuscript/molecules/codeblock", `
        <pre><code rhu-id="code"></code></pre>
        `, {
        element: `<div></div>`
    });
    return codeblock;
});
