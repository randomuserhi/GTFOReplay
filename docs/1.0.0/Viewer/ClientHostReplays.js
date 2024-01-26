RHU.require(new Error(), {
    docs: "docs", rhuDocuscript: "docuscript",
}, function ({ docs, rhuDocuscript, }) {
    docs.jit = () => docuscript((lib) => {
        const { p, br, ul, frag, b } = lib;
        p("If you are hosting a lobby, the replay can benefit from more contextual information and thus the host-generated replays can be more accurate and have more enabled features.");
        br();
        p("The following features do not function when viewing a client-generated replay:", ul(frag(b("Alert Blame"), " - You cannot see what player alerted an enemy."), frag(b("True Damage Events"), " - You cannot see actual enemy / player damage events (Refer to Visual Tracers). As a consequence, you cannot see melee strikes from players.")));
    }, rhuDocuscript);
});
