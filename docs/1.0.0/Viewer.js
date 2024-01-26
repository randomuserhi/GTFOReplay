RHU.require(new Error(), {
    docs: "docs", rhuDocuscript: "docuscript",
}, function ({ docs, rhuDocuscript, }) {
    docs.jit = () => docuscript((lib, include) => {
        const { p, h1, h2, ul, frag, i } = lib;
        const { cb, ic } = include({ cb: "code:block", ic: "code:inline" });
        h1("Disclaimer");
        p("The replay viewer is very much in its infancy, and thus many of its controls or features are locked behind browser DevConsole commands. Controls that require the DevConsole are tagged with '[Dev]'. If you are not familiar with this I advise waiting until a UI is implemented.");
        h1("Time Controls");
        ul(frag(ic([], `Up`), `/`, ic([], `Down`), " - Skip 10 seconds."), frag(ic([], `Left`), `/`, ic([], `Right`), " - Skip 5 seconds."), frag(ic([], `Space`), " - Pause the replay."), frag(ic([], `Mouse Scroll`), " - Zoom in/out."), frag(ic([], `Left Mouse Drag`), " - Panning the camera."));
        h2("[Dev] Time Controls");
        cb(["javascript"], `replay.time = 0; // set the time of the replay (ms)`);
        cb(["javascript"], `replay.timescale = 0.5; // set the speed of replay`);
        h1("[Dev] Viewing Different Dimensions");
        cb(["javascript"], `replay.currentDimension = 0; // change dimension being viewed`);
        h1("[Dev] Visual Tracers");
        cb(["javascript"], `replay.visualTracers = false; // disable visual tracers to see what players actually hit`);
        ul("Visual shots are purely aesthetic and are non-representative of whether a player hit an enemy or not. They are the stored rendered shots the game shows you from your teammates.", frag("By setting this to ", ic([], "false"), " you can see exactly what players hit and exact damage events recorded, but you cannot see missed shots etc..."), i("NOTE: If you are not hosting the lobby, you cannot utilise non-visual tracers as these can only be recorded by host."));
        h1("[Dev] Calculating statistics");
        h2("Calculate total bullet damage.");
        p("Requires the replay to have been recorded from host-player such that damage events are present.");
        cb(["javascript"], `let slot = 0; // change slot to get different player (slot [0, 1, 2, 3]) correspond to slots in lobby
// there are other events u can watch like "enemyMeleeDamage"
let events = current.timeline.filter(e => e.type === "event" && e.detail.type === "enemyBulletDamage");
let totalDamage = 0;
for (let event of events) {
    // u can change the check to see sentry damage etc...
    if (event.detail.detail.slot === slot && !event.detail.detail.sentry)
        totalDamage += event.detail.detail.damage;
}
console.log(totalDamage);`);
        h1("Issues + Work Arounds");
        h2("Enemy projectiles don't dissappear!");
        p("This is a bug that may occure if the replay fails to add the ", ic([], "despawnPellet"), " event. To get around this, prior loading your replay, type the following into DevConsole:");
        cb(["javascript"], `GTFOReplaySettings.maxProjectileLifetime = 5000;`);
        p("This will enforce that projectiles can only exist for 5 seconds.");
    }, rhuDocuscript);
});
