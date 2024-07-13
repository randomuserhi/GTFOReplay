module.manual = true;
export const __header__ = "__header___"; 

const headers = [
    import("../vanilla/datablocks/enemy/animation.js"),
    import("../vanilla/datablocks/enemy/enemy.js"),
    import("../vanilla/datablocks/enemy/handles.js"),
    import("../vanilla/datablocks/gear/animation.js"),
    import("../vanilla/datablocks/gear/models.js"),
    import("../vanilla/datablocks/items/item.js"),
    import("../vanilla/datablocks/lib.js"),
    import("../vanilla/datablocks/player/animation.js"),
    import("../vanilla/datablocks/player/model.js"),
    import("../vanilla/datablocks/player/player.js"),
    import("../vanilla/datablocks/stickfigure.js"),
];
Promise.all(headers).then(() => {
    const datablocks = [ 
        import("./datablocks/enemy/enemy.js"),
        import("./datablocks/gear/models.js"),
        import("./datablocks/items/item.js"),
        import("./datablocks/stickfigure.js"),
    ];
    return Promise.all(datablocks);
}).then(() => {
    module.ready();
});