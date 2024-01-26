RHU.require(new Error(), { 
    docs: "docs", rhuDocuscript: "docuscript",
}, function({
    docs, rhuDocuscript,
}) {
    docs.jit = () => docuscript<RHUDocuscript.Language, RHUDocuscript.FuncMap>((lib) => {
        const { 
            p, br
        } = lib;
       
        p(
            "This document outlines the binary format of the replay file for people that want to make their own replay visualisers."
        );
        br();

        p(
            "TO BE WRITTEN. PLEASE BE PATIENT :P"
        );
        
    }, rhuDocuscript);
});