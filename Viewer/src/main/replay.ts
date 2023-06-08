interface replay extends HTMLDivElement
{
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

interface Vector
{
    x: number;
    y: number;
    z: number;
}

interface Mesh
{
    vertices: Vector[];
    indices: number[];
}

RHU.import(RHU.module({ trace: new Error(),
    name: "Replay Display", hard: ["RHU.Macro"],
    callback: function()
    {
        let { RHU } = window.RHU.require(window, this);

        let replay = function(this: replay)
        {
            this.ctx = this.canvas.getContext("2d")!;
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
                    old.x = this.mouse.x;

                    this.camera.y += old.y - this.mouse.y;
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

                    //let scale = this.camera.scale;
                    this.camera.scale -= e.deltaY * 0.002;
                    if (this.camera.scale < 0.01) this.camera.scale = 0.01;
                }
            });

            let meshes: Mesh[] = [];
            let contacts: number[] = [];
            let currentLoaded = 0;
            let onload = () => {
                console.log("Loaded!");

                let drawMesh = (mesh: Mesh) => {
                    this.ctx.save();

                    this.ctx.translate(-this.camera.x, -this.camera.y);
                    this.ctx.scale(this.camera.scale, this.camera.scale);

                    for (let i = 0; i < mesh.indices.length;)
                    {
                        this.ctx.beginPath();
                        let index = mesh.indices[i++];
                        this.ctx.moveTo(mesh.vertices[index].x, -mesh.vertices[index].z);
                        for (let j = 0; j < 2; ++j)
                        {
                            let index = mesh.indices[i++];
                            let pos = mesh.vertices[index];
                            this.ctx.lineTo(pos.x, -pos.z);
                        }
                        this.ctx.closePath();
                        this.ctx.lineWidth = 1 / this.camera.scale;
                        this.ctx.strokeStyle = "#000"
                        this.ctx.fillStyle = "#000";
                        this.ctx.fill();
                        this.ctx.stroke();
                    }
                    
                    this.ctx.restore();
                };
                
                let update = () => {
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    for (let i = 0; i < contacts.length; ++i)
                    {
                        drawMesh(meshes[contacts[i]]);
                    }
                    //drawPolyLoop(polyLoop);
                    //drawEdgeSet();
                    requestAnimationFrame(update);
                }
                update();
            };
            this.file.addEventListener("change", (e: any) => {
                try 
                {
                    let files = e.target.files;
                    if (!files.length) {
                        console.warn('No file selected!');
                        return;
                    }
                    let loaded = files.length;
                    for (let file of files)
                    {
                        let reader = new FileReader();
                        reader.onload = (event) => {
                            if (RHU.exists(event.target))
                            {
                                let json = JSON.parse(event.target.result as string) as
                                {
                                    contacts: number[],
                                    surfaces: {
                                        vertices: number[],
                                        indices: number[]
                                    }[]
                                };
                                contacts = json.contacts;
                                for (let surface of json.surfaces)
                                {
                                    let vertices: Vector[] = [];
                                    for (let i = 0; i < surface.vertices.length;)
                                    {
                                        vertices.push(
                                            {
                                                x: surface.vertices[i++],
                                                y: surface.vertices[i++],
                                                z: surface.vertices[i++]
                                            }
                                        );
                                    }
                                    meshes.push({
                                        vertices: vertices,
                                        indices: surface.indices
                                    });
                                }
                                if (++currentLoaded === loaded)
                                {
                                    onload();
                                }
                            }
                        };
                        reader.onprogress = (event) => {
                            console.log(`${event.loaded / event.total}`);
                        }
                        reader.readAsText(file);
                    }
                } 
                catch (err) 
                {
                    console.error(err);
                }
            });
        } as replayConstructor;
        RHU.Macro(replay, "replay", //html
            `
                <input rhu-id="file" type="file" accept="application/json"/>
                <canvas rhu-id="canvas" width="1920" height="1080"></canvas>
            `, {
                element: //html
                `<div></div>`
            });
    }
}));