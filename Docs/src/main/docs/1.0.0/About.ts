RHU.require(new Error(), { 
    docs: "docs", rhuDocuscript: "docuscript",
}, function({
    docs, rhuDocuscript,
}) {
    docs.jit = () => docuscript<RHUDocuscript.Language, RHUDocuscript.FuncMap>((lib, include) => {
        const { 
            p, br, link, h1, ul
        } = lib;
        const { 
            cb 
        } = include({ cb: "code:block" });
       
        p(
            "Temporary Docs for GTFOReplay:",
            link("https://github.com/randomuserhi/GTFOReplay", "here"), "."
        );
        br();

        h1("Controls");

        cb(["javascript"], `function test() { return "hello" };`);
    }, rhuDocuscript);
});