(() => {
    const ref = { target: undefined };
    RHU.module(new Error(), "App", {}, function () {
        const App = () => {
            if (!ref.target)
                throw new Error("App does not exist!");
            return ref.target;
        };
        return App;
    });
    RHU.module(new Error(), "main", {
        Macro: "rhu/macro", Style: "rhu/style",
        theme: "main/theme",
        navbar: "components/organisms/navbar",
        docpages: "components/organisms/docpages",
    }, function ({ Macro, Style, theme, navbar, docpages, }) {
        const style = Style(({ style }) => {
            const spacer = style.class `
            position: relative;

            width: 100%;
            height: var(--Navbar_height);
            `;
            style `
            :root {
                --font-family: "IBM Plex Sans";
                --font-size: 1rem;
            }

            body {
                font-family: var(--font-family);
                font-size: var(--font-size);
            }
            `;
            return {
                spacer,
            };
        });
        Macro((() => {
            const appmount = function () {
                ref.target = this;
                this.classList.toggle(`${theme}`, true);
                this.body.replaceChildren(document.createMacro(docpages));
            };
            return appmount;
        })(), "App", `
            ${navbar}
            <div class="${style.spacer}"></div>
            <div rhu-id="body">
            </div>
            `, {
            element: `<div class="${theme}"></div>`
        });
    });
})();
