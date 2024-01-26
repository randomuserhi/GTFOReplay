RHU.require(new Error(), {
    docs: "docs", rhuDocuscript: "docuscript",
}, function ({ docs, rhuDocuscript, }) {
    docs.jit = () => docuscript((lib) => {
        const { p, h1, ul, frag, br, b } = lib;
        p("This is the road map of features that I plan to implement and are currently working on.");
        h1("Currently Working On");
        ul(frag("Config setting to change replay save location."), frag("Config setting to format replay file names."), frag("Tracking player information (inventory, ammo counts, health, infection)."));
        h1("TODO");
        b("Backend");
        ul(frag("Heavy Objective Item Tracking."), frag("Pack / consumable item locations + usage."), frag("Open / Closed states of storage containers."), frag("Calculate enemy HP in viewer using damage events."), frag("Datablocks to customise enemy types recorded."), frag("Scan information (players in scan, progress)."), frag("Scout tentacles."), frag("Syncing information if other players in lobby share the same mod (Helps alleviate host-only replays)."));
        br();
        b("Frontend (Viewer)");
        ul(frag("Migrate to webgl."), frag("Timeline controls."), frag("Show player stats on click."), frag("Record tools for content creators."), frag("Camera tracking / directed camera."), frag("Datablocks to customise viewer and specify GTFO information (enemy hp, icons etc...)."), frag("Webserver middleware to allow real-time viewing of replays."), frag("Stat Tracker Integration."));
    }, rhuDocuscript);
});
