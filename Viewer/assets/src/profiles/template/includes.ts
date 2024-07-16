// NOTE(randomuserhi): Need to make sure that all vanilla modules load, thus wrap them all in a Promise

module.manual = true;

const includes = [
    import("../vanilla/includes.js")
];
Promise.all(includes).then(() => {
    module.ready();
});

export { };
