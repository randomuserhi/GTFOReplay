RHU.require(new Error(), { 
    docs: "docs", rhuDocuscript: "docuscript",
}, function({
    docs, rhuDocuscript,
}) {
    docs.jit = () => docuscript<RHUDocuscript.Language, RHUDocuscript.FuncMap>((lib, include) => {
        const { 
            p, br, link, h1, ul, frag, img, pl, i
        } = lib;
        const { 
            cb, ic
        } = include({ cb: "code:block", ic: "code:inline" });
       
        p(
            "GTFOReplay is a mod that records full game replays of your matches so that you can watch them over in post."
        );
    }, rhuDocuscript);
});