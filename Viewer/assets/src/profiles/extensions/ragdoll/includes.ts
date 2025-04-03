// NOTE(randomuserhi): Need to make sure that all vanilla modules load, thus wrap them all in a Promise

const includes = [
    import("./parser/ragdoll.js"),
];
await Promise.all(includes);

export { };

