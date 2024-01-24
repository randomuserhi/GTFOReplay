RHU.require(new Error(), {
    docs: "docs", rhuDocuscript: "docuscript",
}, function ({ docs, rhuDocuscript, }) {
    docs.jit = () => docuscript((lib, include) => {
        const { p, br, link, h1, h, ul, frag } = lib;
        const { cb, ic } = include({ cb: "code:block", ic: "code:inline" });
        p("Temporary Docs for GTFOReplay: ", link("https://github.com/randomuserhi/GTFOReplay", "here"), ".");
        br();
        h1("Controls");
        ul(frag(ic([], `Up`), `/`, ic([], `Down`), " - Skip 10 seconds."), frag(ic([], `Left`), `/`, ic([], `Right`), " - Skip 5 seconds."));
        h1("Dev Console Tricks");
        cb(["javascript"], `replay.time = 0; // set the time of the replay (ms)`);
        br();
        cb(["javascript"], `replay.timescale = 0.5; // set the speed of replay`);
        br();
        cb(["javascript"], `replay.visualTracers = false; // disable visual tracers to see what players actually hit`);
        ul("Visual shots are purely aesthetic and are non-representative of whether a player hit an enemy or not.", frag("By setting this to ", ic([], "false"), " you can see exactly what players hit, but you cannot see missed shots etc..."));
        br();
        cb(["javascript"], `replay.currentDimension = 0; // change dimension being viewed`);
        br();
        cb(["javascript"], `// calculate bullet damage done by a player in a given slot
let slot = 0; // change slot to get different player (slot [0, 1, 2, 3]) correspond to slots in lobby
// there are other events u can watch like "enemyMeleeDamage"
let events = current.timeline.filter(e => e.type === "event" && e.detail.type === "enemyBulletDamage");
let totalDamage = 0;
for (let event of events) {
    // u can change the check to see sentry damage etc...
    if (event.detail.detail.slot === slot && !event.detail.detail.sentry)
        totalDamage += event.detail.detail.damage;
}
console.log(totalDamage);`);
        cb(["javascript"], `// calculate bullet damage done by a player in a given slot
let slot = 0; // change slot to get different player (slot [0, 1, 2, 3]) correspond to slots in lobby
// there are other events u can watch like "enemyMeleeDamage"
let events = current.timeline.filter(e => e.type === "event" && e.detail.type === "enemyBulletDamage");
let totalDamage = 0;
for (let event of events) {
    // u can change the check to see sentry damage etc...
    if (event.detail.detail.slot === slot && !event.detail.detail.sentry)
        totalDamage += event.detail.detail.damage;
}
console.log(totalDamage);`);
        br();
        h1("Issues + Work Arounds");
        h(2, "Enemy projectiles don't dissappear!");
        p("This is a bug that may occure if the replay fails to add the ", ic([], "despawnPellet"), " event. To get around this, prior loading your replay, type the following into DevConsole:");
        cb(["javascript"], `GTFOReplaySettings.maxProjectileLifetime = 5000;`);
        p("This will enforce that projectiles can only exist for 5 seconds.");
    }, rhuDocuscript);
});
