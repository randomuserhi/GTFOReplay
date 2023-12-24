declare namespace RHU {
    interface Modules {
        "webgl2": glConstruct;
    }
}

interface glConstruct {
    new (ctx: WebGL2RenderingContext): gl;
}

interface gl {

}

RHU.module(new Error(), "webgl2", { 
}, function() {
    const gl = function(this: gl) {

    } as unknown as glConstruct;

    return gl;
});