interface replay extends HTMLDivElement
{
    resize(): void;
    onload(): void;
    update(t: number): void;

    prev: number;
    play: boolean;
    time: number;
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

interface Window
{
    replay: replay; // for debugging
}

RHU.import(RHU.module({ trace: new Error(),
    name: "Replay Display", hard: ["RHU.Macro", "RHU.Bezier"],
    callback: function () 
    {
        let { RHU } = window.RHU.require(window, this);

        let icons: Record<string, HTMLImageElement> = {}
        for (let item of GTFOSpecification.items)
        {
            let img = document.createElement("img");
            img.src = `./icons/items/${item}.webp`;
            img.onerror = () => {
                img.toggleAttribute("data-failed", true);
            }
            icons[item] = img;
        }

        let replay: replayConstructor = function (this: replay) {
            window.replay = this;

            this.play = true;
            this.time = 0;
            this.prev = 0;

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
                    case 37:
                        this.time -= 1000;
                        e.preventDefault();
                        break;
                    case 39:
                        this.time += 1000;
                        e.preventDefault();
                        break;

                    case 38:
                        this.time += 10000;
                        e.preventDefault();
                        break;
                    case 40:
                        this.time -= 10000;
                        e.preventDefault();
                        break;

                    case 32:
                        this.play = !this.play;
                        e.preventDefault();
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
            this.time = 0;
            this.prev = 0;
            this.update(0);
        };
        replay.prototype.update = function(t: number)
        {
            let delta = t - this.prev;
            this.prev = t;
            if (this.play && this.time <= this.replay.timeline[this.replay.timeline.length - 1].time) this.time += delta;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle="#3f484e";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.save();

            this.ctx.translate(-this.camera.x, -this.camera.y);
            this.ctx.scale(this.camera.scale, this.camera.scale);

            // Draw Map => perhaps move to a seperate function => TODO(randomuserhi): Manage different dimensions
            let dimension = this.replay.dimensions.get(0)!;
            let map = dimension.map;
            for (let i = 0; i < map.surfaces.length; ++i)
                this.ctx.drawImage(map.surfaces[i].canvas, map.surfaces[i].position.x, map.surfaces[i].position.y);

            // Get snapshot
            let snapshot = this.replay.getSnapshot(this.time);
            
            // Draw snapshot => perhaps move to a seperate function

            // Draw doors
            for (let door of map.doors)
            {
                this.ctx.save();

                let q1: Quaternion = door.rotation;
                let euler: Vector = {x: 0, y: 0, z: 0};
                let sqw = q1.w*q1.w;
                let sqx = q1.x*q1.x;
                let sqy = q1.y*q1.y;
                let sqz = q1.z*q1.z;
                let unit = sqx + sqy + sqz + sqw; // if normalised is one, otherwise is correction factor
                let test = q1.x*q1.y + q1.z*q1.w;
                if (test > 0.499*unit) 
                { // singularity at north pole
                    euler.y = 2 * Math.atan2(q1.x,q1.w);
                    euler.x = Math.PI/2;
                    euler.z = 0;
                }
                else if (test < -0.499*unit) 
                { // singularity at south pole
                    euler.y = -2 * Math.atan2(q1.x,q1.w);
                    euler.x = -Math.PI/2;
                    euler.z = 0;
                }
                else
                {
                    euler.y = Math.atan2(2*q1.y*q1.w-2*q1.x*q1.z , sqx - sqy - sqz + sqw);
                    euler.x = Math.asin(2*test/unit);
                    euler.z = Math.atan2(2*q1.x*q1.w-2*q1.y*q1.z , -sqx + sqy - sqz + sqw);
                }

                this.ctx.translate(door.position.x, -door.position.z);
                this.ctx.rotate(euler.y)

                let state: GTFODoorState = "closed";
                if (RHU.exists(snapshot.doors.has(door.id)))
                    state = snapshot.doors.get(door.id)!;

                const width = door.size == "small" ? 100 : 200;
                const height = 20;
                
                switch (state)
                {
                    case "destroyed":
                        this.ctx.fillStyle = "rgba(50, 50, 50, 0.5)";
                        this.ctx.fillRect(-width / 2, -height / 2, width, height);
                        this.ctx.fillStyle = "rgba(50, 50, 50, 1)";
                        this.ctx.fillRect(-width / 2, -height / 2, 10, height);
                        this.ctx.fillRect(width / 2 - 10, -height / 2, 10, height);
                        break;
                    case "open":
                        this.ctx.fillStyle = "rgba(50, 50, 50, 0.8)";
                        this.ctx.fillRect(-width / 2, -height / 2, width, height);
                        if (door.type == "weak") this.ctx.fillStyle = "#00cc00";
                        else this.ctx.fillStyle = "#cc0000";
                        this.ctx.fillRect(-width / 2, -height / 2, 10, height);
                        this.ctx.fillRect(width / 2 - 10, -height / 2, 10, height);
                        break;
                    case "glued":
                        this.ctx.fillStyle = "#0000cc";
                        this.ctx.fillRect(-width / 2, -height / 2, width, height);
                        break;
                    default:
                        if (door.type == "weak") this.ctx.fillStyle = "#00cc00";
                        else this.ctx.fillStyle = "#cc0000";
                        this.ctx.fillRect(-width / 2, -height / 2, width, height);
                        break;
                }
                this.ctx.restore();
            }

            // Draw mines
            for (let mine of snapshot.mines.values())
            {
                this.ctx.save();

                let q1: Quaternion = mine.rotation;
                let euler: Vector = {x: 0, y: 0, z: 0};
                let sqw = q1.w*q1.w;
                let sqx = q1.x*q1.x;
                let sqy = q1.y*q1.y;
                let sqz = q1.z*q1.z;
                let unit = sqx + sqy + sqz + sqw; // if normalised is one, otherwise is correction factor
                let test = q1.x*q1.y + q1.z*q1.w;
                if (test > 0.499*unit) 
                { // singularity at north pole
                    euler.y = 2 * Math.atan2(q1.x,q1.w);
                    euler.x = Math.PI/2;
                    euler.z = 0;
                }
                else if (test < -0.499*unit) 
                { // singularity at south pole
                    euler.y = -2 * Math.atan2(q1.x,q1.w);
                    euler.x = -Math.PI/2;
                    euler.z = 0;
                }
                else
                {
                    euler.y = Math.atan2(2*q1.y*q1.w-2*q1.x*q1.z , sqx - sqy - sqz + sqw);
                    euler.x = Math.asin(2*test/unit);
                    euler.z = Math.atan2(2*q1.x*q1.w-2*q1.y*q1.z , -sqx + sqy - sqz + sqw);
                }

                this.ctx.translate(mine.position.x, -mine.position.z);
                this.ctx.rotate(euler.y);

                const width = 10;
                const height = 20;

                switch (mine.type)
                {
                    case "C-foam Mine":
                        this.ctx.fillStyle = "#0000ff";
                        break;
                    default:
                        this.ctx.fillStyle = "#ff0000";
                        break;
                }
                this.ctx.fillRect(-height / 2, -width / 2, height, width);

                // https://gamedev.stackexchange.com/questions/28395/rotating-vector3-by-a-quaternion
                let dir: Vector = {
                    x: 0,
                    y: 0,
                    z: mine.length
                }
                let dotuv = q1.x * dir.x + q1.y * dir.y + q1.z * dir.z;
                let dotuu = q1.x * q1.x + q1.y * q1.y + q1.z * q1.z;
                let crossuv: Vector = {
                    x: q1.y * dir.z - q1.z * dir.y,
                    y: - q1.x * dir.z + q1.z * dir.x,
                    z: q1.x * dir.y - q1.y * dir.x
                };
                let laser: Vector = {
                    x: 2 * dotuv * q1.x + (q1.w * q1.w - dotuu) * dir.x + 2 * q1.w * crossuv.x,
                    y: 2 * dotuv * q1.y + (q1.w * q1.w - dotuu) * dir.y + 2 * q1.w * crossuv.y,
                    z: 2 * dotuv * q1.z + (q1.w * q1.w - dotuu) * dir.z + 2 * q1.w * crossuv.z
                };
                let length = Math.sqrt(laser.x * laser.x + laser.z * laser.z);

                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(0, length);
                this.ctx.lineWidth = 4;
                let grd = this.ctx.createLinearGradient(0,0,0,length);
                grd.addColorStop(0,"rgba(255, 0, 0, 0.8)");
                grd.addColorStop(1,"rgba(255, 0, 0, 0)");
                this.ctx.strokeStyle = grd;
                this.ctx.stroke();

                this.ctx.restore();
            }

            // Draw tracers
            for (let tracer of snapshot.tracers)
            {
                if (tracer.time > snapshot.time)
                {
                    console.warn("This should not happen");
                    continue;
                }

                let bonusLinger = tracer.damage * 500;
                if (bonusLinger > 500) bonusLinger = 500;
                else if (bonusLinger < 0) bonusLinger = 0;

                let alpha = (snapshot.time - tracer.time) / (GTFOReplaySettings.tracerLingerTime + bonusLinger);
                if (alpha < 0) continue;
                else if (alpha > 1) alpha = 1;
                alpha = 1 - alpha;

                let width = tracer.damage * 7;
                if (width < 1) width = 1;
                else if (width > 7) width = 7;

                this.ctx.beginPath();
                this.ctx.moveTo(tracer.a.x, -tracer.a.z);
                this.ctx.lineTo(tracer.b.x, -tracer.b.z);
                this.ctx.lineWidth = width;
                this.ctx.strokeStyle = `rgba(${tracer.color}, ${alpha})`
                this.ctx.stroke();
            }

            // Draw dynamics
            for (let kv of snapshot.dynamics)
            {
                let instance = kv[0];
                let dynamic = kv[1];

                this.ctx.save();

                // get euler angles
                let q1: Quaternion = dynamic.rotation;
                let euler: Vector = {x: 0, y: 0, z: 0};
                let sqw = q1.w*q1.w;
                let sqx = q1.x*q1.x;
                let sqy = q1.y*q1.y;
                let sqz = q1.z*q1.z;
                let unit = sqx + sqy + sqz + sqw; // if normalised is one, otherwise is correction factor
                let test = q1.x*q1.y + q1.z*q1.w;
                if (test > 0.499*unit) 
                { // singularity at north pole
                    euler.y = 2 * Math.atan2(q1.x,q1.w);
                    euler.x = Math.PI/2;
                    euler.z = 0;
                }
                else if (test < -0.499*unit) 
                { // singularity at south pole
                    euler.y = -2 * Math.atan2(q1.x,q1.w);
                    euler.x = -Math.PI/2;
                    euler.z = 0;
                }
                else
                {
                    euler.y = Math.atan2(2*q1.y*q1.w-2*q1.x*q1.z , sqx - sqy - sqz + sqw);
                    euler.x = Math.asin(2*test/unit);
                    euler.z = Math.atan2(2*q1.x*q1.w-2*q1.y*q1.z , -sqx + sqy - sqz + sqw);
                }

                this.ctx.translate(dynamic.position.x, -dynamic.position.z);
                this.ctx.rotate(euler.y);
                
                if (snapshot.players.has(instance))
                {
                    let p = snapshot.snet.get(snapshot.players.get(instance)!)!;
                    let colors: string[] = [
                        "194, 31, 78",
                        "24, 147, 94",
                        "32, 85, 140",
                        "122, 26, 142"
                    ];
                    this.ctx.fillStyle = `rgba(${colors[p.slot]},${p.alive ? "1" : "0.5"})`;

                    // Draw equipped item above player
                    /*let img = icons[p.equipped];
                    let ratio = img.height / img.width;
                    let width = 70;
                    if (!img.hasAttribute("data-failed")) this.ctx.drawImage(img, -width / 2, -80, width, width * ratio);*/

                    // Draw player
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, -25);
                    this.ctx.lineTo(-20, 12);
                    this.ctx.lineTo(20, 12);
                    this.ctx.closePath();
                }
                else if (snapshot.enemies.has(instance))
                {
                    let color: string;
                    let enemy = snapshot.enemies.get(instance)!;
                    let charger = enemy.type.includes("Charger");
                    if (enemy.state == "InCombat") {
                        if (charger) color = "130, 0, 0";
                        else color = "255, 0, 0";
                    }
                    else if (enemy.state == "Patrolling") {
                        if (charger) color = "0, 0, 190";
                        else color = "0, 0, 255";
                    }
                    else if (charger) color = "80, 80, 80";
                    else color = "136, 136, 136";
                    this.ctx.fillStyle = `rgba(${color}, ${enemy.type.includes("Shadow") ? 0.3 : 1})`;

                    let polygon = function(ctx: CanvasRenderingContext2D, radius: number, sides: number) 
                    {
                        if (sides < 3) return;
                        ctx.save();
                        ctx.rotate(-Math.PI / 2);
                        ctx.beginPath();
                        var a = ((Math.PI * 2)/sides);
                        ctx.moveTo(radius,0);
                        for (var i = 1; i < sides; i++) 
                        {
                            ctx.lineTo(radius*Math.cos(a*i),radius*Math.sin(a*i));
                        }
                        ctx.closePath();
                        ctx.restore();
                    }

                    if (charger) this.ctx.scale(1.05, 1.05);
                    switch (enemy.type)
                    {
                        case "Baby":
                            this.ctx.scale(0.6, 0.6);
                        case "Charger":
                        case "Shadow":
                        case "Striker":
                            this.ctx.beginPath();
                            this.ctx.moveTo(0, -25);
                            this.ctx.lineTo(-20, 12);
                            this.ctx.lineTo(20, 12);
                            this.ctx.closePath();
                            break;
                        case "Big Charger":
                        case "Big Shadow":
                        case "Big Striker":
                            polygon(this.ctx, 25, 4);
                            break;
                        case "Tank":
                            polygon(this.ctx, 30, 6);
                            break;
                        case "Mother":
                            this.ctx.scale(1, 1.3);
                            polygon(this.ctx, 25, 6);
                            break;
                        case "Big Shooter":
                            this.ctx.beginPath();
                            this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
                            break;
                        case "Shooter":
                            this.ctx.beginPath();
                            this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
                            break;
                        case "Snatcher":
                            this.ctx.scale(1, 1.3);
                        case "Charger Scout":
                        case "Shadow Scout":
                        case "Scout":
                            polygon(this.ctx, 20, 8);
                            break;
                        case "Hybrid":
                            polygon(this.ctx, 25, 5);
                            break;
                        default:
                            polygon(this.ctx, 20, 5);
                            this.ctx.fillStyle = "#ffe92e";
                            break;
                    }
                }
                this.ctx.fill();

                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(0, -25);
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = "#ffffff";
                this.ctx.stroke();

                // TODO(randomuserhi): Clean this up with the above code
                /*if (snapshot.players.has(instance))
                {
                    let p = snapshot.snet.get(snapshot.players.get(instance)!)!;
                    let colors: string[] = [
                        "194, 31, 78",
                        "24, 147, 94",
                        "32, 85, 140",
                        "122, 26, 142"
                    ];

                    // Draw player name
                    this.ctx.font = "10px Oxanium";
                    let text = `${p.name}`;
                    let metrics = this.ctx.measureText(text);
                    this.ctx.fillStyle = "#000";
                    this.ctx.fillRect(-metrics.width / 2, -10, metrics.width, 15);
                    this.ctx.fillStyle = `rgba(${colors[p.slot]},${p.alive ? "1" : "0.5"})`;
                    this.ctx.fillText(text, - metrics.width / 2, 0);
                }*/

                this.ctx.restore();
            }

            // Draw crosses
            let bezier = RHU.Bezier(.81,-0.11,.58,1.1);
            for (let cross of snapshot.cross)
            {
                if (cross.time > snapshot.time)
                {
                    console.warn("This should not happen");
                    continue;
                }

                let t = (snapshot.time - cross.time) / (GTFOReplaySettings.crossLingerTime + cross.deviation);
                const size = 15;

                let dx = 0;
                let dy = 0;
                let scale = 1;
                if (t < 0.15)
                {
                    t = t / 0.15;
                    scale = 1 + 5 * bezier(1 - t);
                
                    let i = Math.round(t * (cross.shake.length - 1));
                    dx = cross.shake[i][0];
                    dy = cross.shake[i][1];
                }
                else
                {
                    t -= 0.15;
                    t = t / (1 - 0.15);
                    let c = Math.sin(2 * Math.PI * ((6/2) * t * t + 2 * t));
                    if (c < 0) continue;
                }

                this.ctx.save();
                this.ctx.translate(cross.pos.x + dx, -cross.pos.z + dy);
                this.ctx.scale(scale, scale);

                this.ctx.beginPath();
                this.ctx.moveTo(-size, -size);
                this.ctx.lineTo(size, size);
                this.ctx.moveTo(size, -size);
                this.ctx.lineTo(-size, size);
                this.ctx.lineWidth = 4;
                this.ctx.strokeStyle = `#ff0000`
                this.ctx.stroke();

                this.ctx.restore();
            }

            /*{
                this.ctx.save();

                this.ctx.translate(28, -391);

                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(0, -25);
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = "#ff0000";
                this.ctx.stroke();

                this.ctx.restore();
            }*/
           
            this.ctx.restore();

            /*this.ctx.font = "20px Oxanium";
            let text = `${(this.mouse.x + this.camera.x).toFixed(2)}, ${(-this.mouse.y - this.camera.y).toFixed(2)}`;
            let metrics = this.ctx.measureText(text);
            this.ctx.fillStyle = "#ff0000";
            this.ctx.fillText(text, this.mouse.x - metrics.width / 2, this.mouse.y - 20);*/

            requestAnimationFrame((t) => { this.update(t); });
        };
        RHU.Macro(replay, "replay", //html
            `
            <input rhu-id="file" type="file"/> <!-- TODO(randomuserhi): Specific accept clause -->
            <canvas style="
                width: 100%;
                height: 100%;
            " rhu-id="canvas" width="1920" height="1080"></canvas>
            <canvas style=""></canvas>
            `, {
            element: //html
                `<div></div>`
            });
    }
}));
