interface replay extends HTMLDivElement
{
    resize(): void;
    onload(): void;
    update(): void;

    replay: GTFOReplay;

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    file: HTMLInputElement;

    camera: {
        x: number,
        y: number,
        scale: number
    }

    mouse: {
        x: number,
        y: number,
        
        left: boolean,
        right: boolean
    }
}
interface replayConstructor extends RHU.Macro.Constructor<replay>
{
    
}

declare namespace RHU { namespace Macro {
    interface TemplateMap
    {
        "replay": replay;
    }
}}

RHU.import(RHU.module({ trace: new Error(),
    name: "Replay Display", hard: ["RHU.Macro"],
    callback: function () 
    {
        let { RHU } = window.RHU.require(window, this);
        let replay: replayConstructor = function (this: replay) {
            this.ctx = this.canvas.getContext("2d")!;

            window.addEventListener("resize", () => { this.resize(); });

            this.camera = {
                x: 0,
                y: 0,
                scale: 1
            };

            this.mouse = {
                x: 0,
                y: 0,
                left: false,
                right: false
            };
            let origin = { x: 0, y: 0 };
            let old = { x: 0, y: 0 };
            window.addEventListener("keydown", (e) => {
                switch (e.keyCode) 
                {
                case 68:
                    break;
                case 65:
                    break;
                case 87:
                    break;
                case 83:
                    break;
                }
            });
            this.canvas.addEventListener("mousedown", (e) => {
                e.preventDefault();
                if (e.button === 0)
                    this.mouse.left = true;
                else if (e.button === 2)
                    this.mouse.right = true;

                old.x = this.mouse.x;
                old.y = this.mouse.y;
                origin.x = this.mouse.x;
                origin.y = this.mouse.y;
            });
            this.canvas.addEventListener("mousemove", (e) => {
                e.preventDefault();
                let rect = this.canvas.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
                
                if (this.mouse.left) 
                {
                    this.camera.x += old.x - this.mouse.x;
                    this.camera.y += old.y - this.mouse.y;

                    old.x = this.mouse.x;
                    old.y = this.mouse.y;
                }
            });
            this.canvas.addEventListener("mouseup", (e) => {
                e.preventDefault();
                if (e.button === 0)
                    this.mouse.left = false;
                else if (e.button === 2)
                    this.mouse.right = false;
            });
            this.canvas.addEventListener("wheel", (e) => {
                if (true) 
                {
                    e.preventDefault();

                    let scale = this.camera.scale;
                    this.camera.scale -= e.deltaY * 0.002;
                    if (this.camera.scale < 0.01)
                    this.camera.scale = 0.01;

                    // Move camera based on where you are zooming
                    let oldx = this.mouse.x + this.camera.x;
                    let deltax = oldx / scale * this.camera.scale;
                    this.camera.x += deltax - oldx;

                    let oldy = this.mouse.y + this.camera.y;
                    let deltay = oldy / scale * this.camera.scale;
                    this.camera.y += deltay - oldy;
                }
            });

            let currentLoaded = 0;
            this.file.addEventListener("change", (e: any) => {
                try 
                {
                    let files = e.target.files;
                    if (!files.length) 
                    {
                        console.warn('No file selected!');
                        return;
                    }
                    let loaded = files.length;
                    for (let file of files) {
                        let reader = new FileReader();
                        reader.onload = (event: any) => {
                            if (RHU.exists(event.target)) 
                            {
                                this.replay = new GTFOReplay(event.target.result);

                                if (++currentLoaded === loaded) 
                                {
                                    this.onload();
                                }
                            }
                        };
                        reader.onprogress = (event) => {
                            console.log(`${event.loaded / event.total * 100}`);
                        };
                        reader.readAsArrayBuffer(file);
                    }
                }
                catch (err) 
                {
                    console.error(err);
                }
            });
        } as Function as replayConstructor;
        replay.prototype.resize = function()
        {
            let computed = getComputedStyle(this.canvas);
            this.canvas.width = parseInt(computed.width);
            this.canvas.height = parseInt(computed.height);
        };
        replay.prototype.onload = function()
        {
            this.resize();
            this.update();
        };
        replay.prototype.update = function()
        {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.save();
            
            this.ctx.translate(-this.camera.x, -this.camera.y);
            this.ctx.scale(this.camera.scale, this.camera.scale);
            
            // Draw Map => perhaps move to a seperate function
            let dimension = this.replay.dimensions.get(0)!;
            let map = dimension.map;
            for (let i = 0; i < map.surfaces.length; ++i)
                this.ctx.drawImage(map.surfaces[i].canvas, map.surfaces[i].position.x, map.surfaces[i].position.y);
           
            this.ctx.restore();

            requestAnimationFrame(() => { this.update(); });
        };
        RHU.Macro(replay, "replay", //html
            `
            <input rhu-id="file" type="file"/> <!-- TODO(randomuserhi): Specific accept clause -->
            <canvas style="
                width: 100%;
                height: 100%;
            " rhu-id="canvas" width="1920" height="1080"></canvas>
            `, {
            element: //html
                `<div></div>`
            });
    }
}));
