interface replay extends HTMLDivElement
{
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    file: HTMLInputElement;

    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;

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

interface Mesh
{
    vertices: Float32Array;
    indices: number[];
}

RHU.import(RHU.module({ trace: new Error(),
    name: "Replay Display", hard: ["RHU.Macro"],
    callback: function () 
    {
        let { RHU } = window.RHU.require(window, this);
        let replay: replayConstructor = function (this: replay) {
            this.mouse = {
                x: 0,
                y: 0,
                left: false,
                right: false
            };
            let origin = { x: 0, y: 0 };
            let old = { x: 0, y: 0 };
            window.addEventListener("keydown", (e) => {
                let fwd = new THREE.Vector3(0, 0, -1);
                fwd.applyQuaternion(this.camera.quaternion);
                switch (e.keyCode) 
                {
                case 68:
                    break;
                case 65:
                    break;
                case 87:
                    e.preventDefault();
                    this.camera.position.x += fwd.x;
                    this.camera.position.y += fwd.y;
                    this.camera.position.z += fwd.z;
                    break;
                case 83:
                    e.preventDefault();
                    this.camera.position.x -= fwd.x;
                    this.camera.position.y -= fwd.y;
                    this.camera.position.z -= fwd.z;
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
                    let deltaY = this.mouse.x - old.x;
                    let deltaX = this.mouse.y - old.y;
                    
                    this.camera.rotation.y += deltaY * 0.001;
                    this.camera.rotation.x += deltaX * 0.001;
                    
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
                }
            });
            let meshes: Mesh[] = [];
            let doors: {pos: THREE.Vector3, rot: THREE.Quaternion}[] = [];
            let currentLoaded = 0;
            let onload = () => {
                console.log("Loaded!");

                this.scene = new THREE.Scene();
                this.scene.background = new THREE.Color(0xffffff);
                
                this.camera = new THREE.PerspectiveCamera(75, this.canvas.width / this.canvas.height, 0.1, 1000);
                this.camera.rotation.order = "YXZ";
                
                this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.BasicShadowMap;
                
                // add lights
                const ambient = new THREE.AmbientLight(0xFFFFFF, 0.01);
                this.scene.add(ambient);
                const light = new THREE.DirectionalLight(0xFFFFFF, 1);
                light.position.y = 100;
                // TODO(randomuserhi): Setup better using bounding box of surfaces
                light.shadow.mapSize.x = 1000;
                light.shadow.mapSize.y = 1000;
                light.shadow.camera.left = -1000;
                light.shadow.camera.right = 1000;
                light.shadow.camera.top = 1000;
                light.shadow.camera.bottom = -1000;
                light.shadow.camera.far = 200;
                light.shadow.camera.near = 0.1;
                light.castShadow = true;
                this.scene.add(light);
                
                const helper = new THREE.CameraHelper(light.shadow.camera)
                this.scene.add(helper)

                for (let i = 0; i < doors.length; ++i)
                {
                    const geometry = new THREE.BoxGeometry(2, 1, 1.5);
                    const material = new THREE.MeshStandardMaterial({
                        color: 0x00ff00,
                    });
                    
                    const door = new THREE.Mesh(geometry, material);
                    door.position.set(doors[i].pos.x, doors[i].pos.y, doors[i].pos.z);
                    door.rotation.setFromQuaternion(doors[i].rot);
                    this.scene.add(door);
                }

                for (let i = 0; i < meshes.length; ++i) 
                {
                    const geometry = new THREE.BufferGeometry();
                    
                    geometry.setIndex(meshes[i].indices);
                    geometry.setAttribute("position", new THREE.BufferAttribute(meshes[i].vertices, 3));

                    const material = new THREE.MeshStandardMaterial({
                        color: 0x999999,
                        side: THREE.DoubleSide
                    });
                    
                    const surface = new THREE.Mesh(geometry, material);
                    surface.castShadow = true;
                    surface.receiveShadow = true;
                    this.scene.add(surface);
                }
                let update = () => {
                    this.renderer.render(this.scene, this.camera);
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
                                            vertices: new Float32Array(BitHelper.readVectorArray(bytes, reader, nVertices)),
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
