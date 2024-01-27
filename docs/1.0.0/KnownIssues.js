RHU.require(new Error(), {
    docs: "docs", rhuDocuscript: "docuscript",
}, function ({ docs, rhuDocuscript, }) {
    docs.jit = () => docuscript((lib) => {
        const { p, h1, } = lib;
        p("Due to limitations from how the original game functions, there are compromises that had to be made. These are some known issues as a result of said compromises:");
        h1("Mine laser doesnt show up with client-generated replays.");
        p("This bug has since been fixed and will be available next patch.");
        h1("Non-local Player Shots are Inaccurate");
        p("The recorded visual shots for sentries (on clients) or non-local players will always be inaccurate as the game does not know of the original shot made by other players.", " It simply just knows that they made a shot and so executes the shot in the direction they are supposedly facing in your local game. This is why you can either", " visualise these visual tracers or the actual damage events (if available).");
        h1("C-Foam doesn't shown when shot over gaps.");
        p("Since GTFO has a problem with C-Foam falling through floors, the replay discards any C-Foam blobs that do not have supporting geometry below it. For this reason, C-Foam fired over", " gaps does not get recorded.");
    }, rhuDocuscript);
});
