(() => {
    const _module_ = "docuscript/lists";
    RHU.module(new Error(), `${_module_}/@style`, { Style: "rhu/style", root: "docuscript/@style" }, function ({ Style, root }) {
        const style = Style(({ style }) => {
            style `
                ${root.body} ol {
                    counter-reset: list-item;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                ${root.body} ol>li {
                    display: flex;
                    gap: 1rem;
                }
                ${root.body} ol>li::before {
                    content: counter(list-item) ") ";
                    counter-increment: list-item;
                }
                `;
            style `
                ${root.body} ul {
                    margin-top: 0.5rem;
                }
                ${root.body} ul>li {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 0.5rem;
                }
                ${root.body} ul>li::before {
                    content: "•";
                }
                `;
        });
        return style;
    });
})();
