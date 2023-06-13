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

interface Quaternion
{
    x: number;
    y: number;
    z: number;
    w: number;
}

interface Mesh
{
    vertices: Vector[];
    indices: number[];
}

RHU.import(RHU.module({ trace: new Error(),
    name: "Replay Display", hard: ["RHU.Macro"],
    callback: function () 
    {
        let { RHU } = window.RHU.require(window, this);
        let replay: replayConstructor = function (this: replay) {
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

                    let oldx = this.mouse.x + this.camera.x;
                    let deltax = oldx / scale * this.camera.scale;
                    this.camera.x += deltax - oldx;

                    let oldy = this.mouse.y + this.camera.y;
                    let deltay = oldy / scale * this.camera.scale;
                    this.camera.y += deltay - oldy;
                }
            });
            let meshes: Mesh[] = [];
            let doors: {pos: Vector, rot: Quaternion}[] = [];
            let currentLoaded = 0;
            let onload = () => {
                console.log("Loaded!");
                let meshToCanvas = (mesh: Mesh): { canvas: HTMLCanvasElement, position: Vector } => {
                    let vertex = mesh.vertices[mesh.indices[0]];
                    let min: Vector = { x: vertex.x, y: -vertex.z, z: 0 };
                    let max: Vector = { x: vertex.x, y: -vertex.z, z: 0 };
                    for (let i = 1; i < mesh.indices.length; ++i)
                    {
                        vertex = mesh.vertices[mesh.indices[i]];
                        if (vertex.x < min.x)
                            min.x = vertex.x;
                        else if (vertex.x > max.x)
                            max.x = vertex.x;

                        if (-vertex.z < min.y)
                            min.y = -vertex.z;
                        else if (-vertex.z > max.y)
                            max.y = -vertex.z;
                    }
                    let scale = 30;
                    let canvas = document.createElement("canvas");
                    canvas.width = (max.x - min.x) * scale;
                    canvas.height = (max.y - min.y) * scale;

                    let ctx = canvas.getContext("2d")!;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    for (let i = 0; i < mesh.indices.length;)
                    {
                        ctx.beginPath();
                        let index = mesh.indices[i++];
                        ctx.moveTo((mesh.vertices[index].x - min.x) * scale, (-mesh.vertices[index].z - min.y) * scale);
                        for (let j = 0; j < 2; ++j)
                        {
                            let index = mesh.indices[i++];
                            let pos = mesh.vertices[index];
                            ctx.lineTo((pos.x - min.x) * scale, (-pos.z - min.y) * scale);
                        }
                        ctx.closePath();
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = "#000"
                        ctx.fillStyle = "#000";
                        ctx.fill();
                        ctx.stroke();
                    }

                    return { canvas: canvas, position: { x: min.x * scale, y: min.y * scale, z: 0 } };
                };

                let surfaces: { canvas: HTMLCanvasElement, position: Vector }[] = [];
                for (let i = 0; i < meshes.length; ++i)
                {
                    let img = meshToCanvas(meshes[i]);
                    if (img.canvas.width != 0 && img.canvas.height != 0)
                        surfaces.push(img);
                }

                let update = () => {
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    this.ctx.save();
                    this.ctx.translate(-this.camera.x, -this.camera.y);
                    this.ctx.scale(this.camera.scale, this.camera.scale);
                    for (let i = 0; i < surfaces.length; ++i)
                        this.ctx.drawImage(surfaces[i].canvas, surfaces[i].position.x, surfaces[i].position.y);
                    this.ctx.restore();
                    requestAnimationFrame(update);
                };
                update();
            };
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
                                let bytes: DataView = new DataView(event.target.result);
                                console.log(bytes);
                                let reader: Reader = new Reader();
                                let nDimensions = BitHelper.readByte(bytes, reader); // number of dimensions

                                for (let j = 0; j < nDimensions; ++j)
                                {
                                    let dimension = BitHelper.readByte(bytes, reader); // dimension
                                    let nSurfaces = BitHelper.readUShort(bytes, reader); // number of surfaces

                                    // For debugging only read 1 dimension
                                    for (let i = 0; i < nSurfaces; ++i)
                                    {
                                        let nVertices = BitHelper.readUShort(bytes, reader); // number of vertices
                                        let nIndices = BitHelper.readUInt(bytes, reader); // number of indices
                                        meshes.push({
                                            vertices: BitHelper.readVectorArray(bytes, reader, nVertices),
                                            indices: BitHelper.readUShortArray(bytes, reader, nIndices)
                                        });
                                    }

                                    // doors
                                    let nDoors = BitHelper.readUShort(bytes, reader);
                                    for (let i = 0; i < nDoors; ++i)
                                    {
                                        let type = BitHelper.readByte(bytes, reader);
                                        let size = BitHelper.readByte(bytes, reader);
                                        let healthMax = BitHelper.readByte(bytes, reader);

                                        let position = BitHelper.readVector(bytes, reader);
                                        let rotation = BitHelper.readHalfQuaternion(bytes, reader);

                                        doors.push({
                                            pos: position,
                                            rot: rotation
                                        });
                                    }
                                }
                                
                                /*let surfaces = JSON.parse(event.target.result);
                                for (let surface of surfaces) 
                                {
                                    meshes.push({
                                        vertices: new Float32Array(surface.vertices),
                                        indices: surface.indices
                                    });
                                }*/

                                if (++currentLoaded === loaded) 
                                {
                                    onload();
                                }
                            }
                        };
                        reader.onprogress = (event) => {
                            console.log(`${event.loaded / event.total}`);
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
        RHU.Macro(replay, "replay", //html
            `
            <input rhu-id="file" type="file"/> <!-- TODO(randomuserhi): Specific accept clause -->
            <canvas rhu-id="canvas" width="1920" height="1080"></canvas>
            `, {
            element: //html
                `<div></div>`
            });
    }
}));
