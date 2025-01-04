// NOTE(randomuserhi): Need to make sure that all vanilla modules load, thus wrap them all in a Promise

const includes = [
    import("./parser/explosion.js"),
    import("./parser/projectile.js"),
    import("./parser/damage.js"),
    import("./renderer/explosion.js"),
    import("./renderer/projectile.js"),
];
await Promise.all(includes);

export { };

