RHU.require(new Error(), {
    docs: "docs", rhuDocuscript: "docuscript",
}, function ({ docs, rhuDocuscript, }) {
    docs.jit = () => docuscript((lib) => {
        const { p } = lib;
        p("As I make updates, old replays may become incompatable with new viewers. To remedy this, if you wish to keep old replays watchable, you must keep their respective viewers.");
    }, rhuDocuscript);
});
