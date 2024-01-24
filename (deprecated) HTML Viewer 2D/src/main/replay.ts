interface replay extends HTMLDivElement
{
    resize(): void;
    onload(): void;
    update(t: number): void;

    visualTracers: boolean;
    currentDimension: number;
    prev: number;
    play: boolean;
    time: number;
    timescale: number;
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

// TODO(randomuserhi): Mad re-write of renderer pass
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

            this.visualTracers = true;
            this.currentDimension = 0;
            this.play = true;
            this.time = 0;
            this.timescale = 1;
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
                    this.camera.scale -= e.deltaY * 0.002 * this.camera.scale;
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
                                    this.file.style.display = "none";
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
            let computed = getComputedStyle(this);
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
            let delta = (t - this.prev) * this.timescale;
            this.prev = t;
            if (this.play && this.time <= this.replay.timeline[this.replay.timeline.length - 1].time) this.time += delta;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle="#3f484e";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.save();

            this.ctx.translate(-this.camera.x, -this.camera.y);
            this.ctx.scale(this.camera.scale, this.camera.scale);

            // Draw Map => perhaps move to a seperate function => TODO(randomuserhi): Manage different dimensions
            let dimension = this.replay.dimensions.get(this.currentDimension)!;
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

            // Draw ladders
            for (let ladder of map.ladders)
            {
                this.ctx.save();

                let q1: Quaternion = ladder.rotation;
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

                this.ctx.translate(ladder.top.x, -ladder.top.z);
                this.ctx.rotate(euler.y);

                const width = 40;
                const height = 15;
            
                this.ctx.fillStyle = "rgba(151, 170, 148, 1)";
                this.ctx.fillRect(-width / 2, -height / 4, width, height / 2);
                this.ctx.fillStyle = "rgba(151, 170, 148, 1)";
                this.ctx.fillRect(-width / 2, -height / 2, 10, height);
                this.ctx.fillRect(width / 2 - 10, -height / 2, 10, height);
                this.ctx.restore();
            }

            // Draw Terminals
            for (let terminal of map.terminals)
            {
                this.ctx.save();

                let q1: Quaternion = terminal.rotation;
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

                this.ctx.translate(terminal.position.x, -terminal.position.z);
                this.ctx.rotate(euler.y);

                const width = 40;
                const height = 40;
            
                this.ctx.fillStyle = "rgba(151, 170, 148, 0.5)";
                this.ctx.strokeStyle = "rgba(151, 170, 148, 1)";
                this.ctx.lineWidth = 4;
                this.ctx.beginPath();
                this.ctx.rect(-width / 2, -height / 2, width, height);
                this.ctx.stroke();
                this.ctx.fill();
                this.ctx.restore();
            }

            // Draw Resource Containers
            for (let container of map.containers)
            {
                this.ctx.save();

                let q1: Quaternion = container.rotation;
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

                this.ctx.translate(container.position.x, -container.position.z);
                this.ctx.rotate(euler.y);

                const width = 30;
                const height = 20;
            
                const state: string = "closed";
                switch (state)
                {
                    case "open":
                        this.ctx.fillStyle = "rgba(197, 112, 0, 0.5)";
                        this.ctx.fillRect(-width / 2, -height / 2, width, height);
                        this.ctx.fillStyle = "rgb(197, 112, 0)";
                        this.ctx.fillRect(-width / 2, -height / 2, 10, height);
                        this.ctx.fillRect(width / 2 - 10, -height / 2, 10, height);
                        break;
                    default:
                        this.ctx.fillStyle = "rgb(197, 112, 0)";
                        this.ctx.fillRect(-width / 2, -height / 2, width, height);
                        break;
                }
                this.ctx.restore();
            }

            // Draw mines
            let mines = [...snapshot.mines.values()].filter(m => m.dimensionIndex === dimension.index);
            for (let mine of mines)
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
            let tracers = snapshot.tracers.filter(t => t.dimensionIndex === dimension.index);
            for (let tracer of tracers)
            {
                if (this.visualTracers) {
                    if (tracer.type == "damage") continue;
                } else {
                    if (tracer.type == "visual") continue;
                }

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

            // Draw trails
            for (let kv of snapshot.trails)
            {
                let trail = kv[1];
                let points = trail.points.filter(p => p.dimensionIndex === dimension.index);
                if (points.length < 1) continue;

                let fadeAmount = 1 / points.length;
                let fade = 0;
                let color = "255, 255, 255"
                for (let i = 1; i < points.length; ++i)
                {
                    this.ctx.beginPath();
                    this.ctx.moveTo(points[i - 1].position.x, -points[i - 1].position.z);
                    this.ctx.lineTo(points[i].position.x, -points[i].position.z);

                    this.ctx.lineWidth = 2;
                    let grd = this.ctx.createLinearGradient(points[i - 1].position.x, -points[i - 1].position.z,points[i].position.x, -points[i].position.z);
                    grd.addColorStop(0,`rgba(${color}, ${fade})`);
                    grd.addColorStop(1,`rgba(${color}, ${fade += fadeAmount})`);
                    this.ctx.strokeStyle = grd;
                    this.ctx.stroke();
                }
                
                let dynamic = snapshot.dynamics.get(kv[0]);
                if (RHU.exists(dynamic)) 
                {
                    let last = points.length - 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(points[last].position.x, -points[last].position.z);
                    this.ctx.lineTo(dynamic.position.x, -dynamic.position.z);

                    this.ctx.lineWidth = 2;
                    let grd = this.ctx.createLinearGradient(points[last].position.x, -points[last].position.z,dynamic.position.x,-dynamic.position.z);
                    grd.addColorStop(0,`rgba(${color}, 1)`);
                    grd.addColorStop(1,`rgba(${color}, 1)`);
                    this.ctx.strokeStyle = grd;
                    this.ctx.stroke();
                }                
            }

            // Draw dynamics
            let dynamics = [...snapshot.dynamics].filter(d => d[1].dimensionIndex === dimension.index);
            // sort so glue is always at the bottom
            // TODO(randomuserhi): sort players and dead players
            dynamics.sort(d => {
                if (snapshot.glue.has(d[0])) return -1;
                else return 1;
            });
            for (let kv of dynamics)
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
                
                if (snapshot.pellets.has(instance))
                {
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, 0);
                    //this.ctx.bezierCurveTo(10, -15, -10, -15, 0, 0);
                    this.ctx.bezierCurveTo(-10, 15, 10, 15, 0, 0);
                    this.ctx.fillStyle = "#edbc66";
                    this.ctx.fill();
                }
                else if (snapshot.glue.has(instance))
                {
                    this.ctx.beginPath();
                    // divide by 2 since scale is width, but we wait radius which is half the width
                    this.ctx.arc(0, 0, dynamic.scale / 2, 0, 2 * Math.PI);
                    this.ctx.fillStyle = "#f5f5d5";
                    this.ctx.fill();
                }
                else
                { 
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
                    else if (snapshot.sentries.has(instance))
                    {
                        let sentry = snapshot.sentries.get(instance)!;
                        let p = snapshot.snet.get(sentry.owner)!;
                        let colors: string[] = [
                            "194, 31, 78",
                            "24, 147, 94",
                            "32, 85, 140",
                            "122, 26, 142"
                        ];
                        this.ctx.fillStyle = `rgba(${colors[p.slot]},1)`;

                        const width = 15;
                        const height = 30;
                        this.ctx.fillRect(-width / 2, -height / 2, width, height);
                    }
                    else if (snapshot.enemies.has(instance))
                    {
                        let color: string;
                        let enemy = snapshot.enemies.get(instance)!;
                        let charger = enemy.type.includes("Charger");
                        if (enemy.locomotionState == "StuckInGlue") {
                            if (charger) color = "163, 133, 64";
                            else color = "222, 200, 104";
                        }
                        else if (enemy.behaviourState == "InCombat") {
                            if (charger) color = "130, 0, 0";
                            else color = "255, 0, 0";
                        }
                        else if (enemy.behaviourState == "Patrolling") {
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
                            case "Flyer":
                            case "Big Flyer":
                                {
                                    if (enemy.type == "Flyer")
                                    {
                                        this.ctx.save();
                                        this.ctx.scale(0.8, 0.8);
                                    }

                                    let oldfill = this.ctx.fillStyle;
                                    
                                    let len = 50;
                                    let thickness = 5;
                                    
                                    let dir: Vector = {
                                        x: -Math.sin(euler.y - Math.PI),
                                        y: 0,
                                        z: -Math.cos(euler.y - Math.PI),
                                    };
                                    let dot = dir.x * dynamic.velocity.x + 0 + dir.z * dynamic.velocity.z;
                                    let proj: Vector = {
                                        x: dot * dir.x,
                                        y: 0,
                                        z: dot * dir.z
                                    };

                                    let magnitude = Math.sqrt(proj.x * proj.x + proj.z * proj.z);
                                    let l = magnitude / 500;
                                    if (l < 0) l = 0;
                                    else if (l > 1) l = 1;
                                    if (dot < 0) l *= -1;

                                    let grd = this.ctx.createLinearGradient(-len, 0, len, 0);
                                    let color = "150,0,0";
                                    grd.addColorStop(0,`rgba(${color}, 0)`);
                                    grd.addColorStop(0.3,`rgba(${color}, 1)`);
                                    grd.addColorStop(0.7,`rgba(${color}, 1)`);
                                    grd.addColorStop(1,`rgba(${color}, 0)`);

                                    let sweep = l * Math.PI / 3;
                                    {
                                        this.ctx.save();
                                        this.ctx.rotate(- sweep);

                                        this.ctx.beginPath();
                                        this.ctx.moveTo(-len, 0);
                                        this.ctx.lineTo(0, thickness);
                                        this.ctx.lineTo(0, -thickness);
                                        this.ctx.closePath();
                                        this.ctx.fillStyle = grd;
                                        this.ctx.fill();

                                        this.ctx.restore();
                                    }
                                    {
                                        this.ctx.save();
                                        this.ctx.rotate(sweep);

                                        this.ctx.beginPath();
                                        this.ctx.moveTo(len, 0);
                                        this.ctx.lineTo(0, thickness);
                                        this.ctx.lineTo(0, -thickness);
                                        this.ctx.closePath();
                                        this.ctx.fillStyle = grd;
                                        this.ctx.fill();

                                        this.ctx.restore();
                                    }

                                    grd = this.ctx.createLinearGradient(-len, 0, len, 0);
                                    color = "190,0,0";
                                    grd.addColorStop(0,`rgba(${color}, 0)`);
                                    grd.addColorStop(0.3,`rgba(${color}, 1)`);
                                    grd.addColorStop(0.7,`rgba(${color}, 1)`);
                                    grd.addColorStop(1,`rgba(${color}, 0)`);

                                    len = 40;
                                    sweep = l * Math.PI / 2;
                                    {
                                        this.ctx.save();
                                        this.ctx.rotate(-Math.PI / 6 - sweep);

                                        this.ctx.beginPath();
                                        this.ctx.moveTo(-len, 0);
                                        this.ctx.lineTo(0, thickness);
                                        this.ctx.lineTo(0, -thickness);
                                        this.ctx.closePath();
                                        this.ctx.fillStyle = grd;
                                        this.ctx.fill();

                                        this.ctx.restore();
                                    }
                                    {
                                        this.ctx.save();
                                        this.ctx.rotate(Math.PI / 6 + sweep);

                                        this.ctx.beginPath();
                                        this.ctx.moveTo(len, 0);
                                        this.ctx.lineTo(0, thickness);
                                        this.ctx.lineTo(0, -thickness);
                                        this.ctx.closePath();
                                        this.ctx.fillStyle = grd;
                                        this.ctx.fill();

                                        this.ctx.restore();
                                    }
                                    sweep = l * Math.PI / 2;
                                    {
                                        this.ctx.save();
                                        this.ctx.rotate(Math.PI / 6 - sweep);

                                        this.ctx.beginPath();
                                        this.ctx.moveTo(-len, 0);
                                        this.ctx.lineTo(0, thickness);
                                        this.ctx.lineTo(0, -thickness);
                                        this.ctx.closePath();
                                        this.ctx.fillStyle = grd;
                                        this.ctx.fill();

                                        this.ctx.restore();
                                    }
                                    {
                                        this.ctx.save();
                                        this.ctx.rotate(- Math.PI / 6 + sweep);

                                        this.ctx.beginPath();
                                        this.ctx.moveTo(len, 0);
                                        this.ctx.lineTo(0, thickness);
                                        this.ctx.lineTo(0, -thickness);
                                        this.ctx.closePath();
                                        this.ctx.fillStyle = grd;
                                        this.ctx.fill();

                                        this.ctx.restore();
                                    }

                                    this.ctx.fillStyle = oldfill;

                                    if (enemy.type == "Flyer")
                                    {
                                        this.ctx.beginPath();
                                        this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
                                    }
                                    else polygon(this.ctx, 20, 5);

                                    if (enemy.type == "Flyer") this.ctx.restore();
                                }
                                break;
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
                            case "Immortal Tank":
                                polygon(this.ctx, 30, 6);
                                this.ctx.fillStyle = "#ffe92e";
                                break;
                            case "Tank":
                                polygon(this.ctx, 30, 6);
                                break;
                            case "Big Mother":
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

                    // draw targetting
                    if (snapshot.enemies.has(instance))
                    {
                        let enemy = snapshot.enemies.get(instance)!;
                        if (enemy.behaviourState === "InCombat") {
                            if (RHU.exists(enemy.target)) {
                                this.ctx.beginPath();
                                this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
                                let colors: string[] = [
                                    "194, 31, 78",
                                    "24, 147, 94",
                                    "32, 85, 140",
                                    "122, 26, 142"
                                ];
                                this.ctx.fillStyle = `rgba(${colors[enemy.target]},1)`;
                                this.ctx.strokeStyle = "white";
                                this.ctx.stroke();
                                this.ctx.fill();
                            }
                        }
                    }
                }

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

                // debug velocity
                /*let velScale = 0.1;
                this.ctx.beginPath();
                this.ctx.moveTo(dynamic.position.x, -dynamic.position.z);
                this.ctx.lineTo(dynamic.position.x + (dynamic.velocity.x * velScale), -dynamic.position.z-(dynamic.velocity.z * velScale));
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = "#00ff00";
                this.ctx.stroke();*/
            }

            // Draw tongues
            let tongues = [...snapshot.tongues.values()].filter(t => t.dimensionIndex === dimension.index);
            for (let tongue of tongues)
            {
                if (tongue.spline.length < 1) continue;

                this.ctx.beginPath();
                let pos: Vector = {
                    x: tongue.spline[0].x,
                    y: tongue.spline[0].y,
                    z: tongue.spline[0].z
                }
                this.ctx.moveTo(pos.x, -pos.z);
                let end = Math.ceil(tongue.spline.length * tongue.lerp);
                let xc = 0;
                let yc = 0;
                for (let i = 1; i < end; ++i)
                {
                    let l = tongue.spline.length * tongue.lerp - i;
                    if (l > 1) l = 1;

                    xc = pos.x;
                    yc = -pos.z;

                    pos.x += tongue.spline[i].x * l;
                    pos.y += tongue.spline[i].y * l;
                    pos.z += tongue.spline[i].z * l;

                    if (i % 2 == 0)
                    {
                        this.ctx.quadraticCurveTo(xc, yc, pos.x, -pos.z);
                    }
                }
                this.ctx.lineTo(pos.x, -pos.z);
                this.ctx.lineWidth = 4;
                this.ctx.strokeStyle = "white";
                this.ctx.stroke();
            }

            // Draw hits
            let hits = snapshot.hits.filter(h => h.dimensionIndex === dimension.index);
            for (let hit of hits)
            {
                if (hit.time > snapshot.time)
                {
                    console.warn("This should not happen");
                    continue;
                }

                let t = (snapshot.time - hit.time) / GTFOReplaySettings.hitLingerTime;

                this.ctx.beginPath();
                this.ctx.arc(hit.pos.x, -hit.pos.z, 12 * t, 0, 2 * Math.PI);
                this.ctx.lineWidth = 1 + 3 * (1 - t);
                this.ctx.strokeStyle = `rgba(${hit.color}, 1)`;
                this.ctx.stroke();
            }

            // Draw crosses
            let bezier = RHU.Bezier(.81,-0.11,.58,1.1);
            let crosses = snapshot.cross.filter(c => c.dimensionIndex === dimension.index);
            for (let cross of crosses)
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
                this.ctx.strokeStyle = `${cross.color}`
                this.ctx.stroke();

                this.ctx.restore();
            }

            // draw alerts
            let alerts = snapshot.alerts.filter(a => { 
                let e = snapshot.dynamics.get(a.instance);
                if (e == null) return false;
                return e.dimensionIndex === dimension.index;
            });
            for (let alert of alerts)
            {
                if (alert.time > snapshot.time)
                {
                    console.warn("This should not happen");
                    continue;
                }

                let dyn = snapshot.dynamics.get(alert.instance);
                if (dyn == null) 
                {
                    console.warn("This should not happen");
                    continue;
                }

                this.ctx.save();
                this.ctx.translate(dyn.position.x + alert.offset.x, -dyn.position.z + alert.offset.z);

                this.ctx.beginPath();
                this.ctx.arc(0, 0, 7, 0, 2 * Math.PI);
                this.ctx.fillStyle = alert.color;
                this.ctx.fill();

                this.ctx.beginPath();
                this.ctx.moveTo(-3, -15);
                this.ctx.lineTo(3, -15);
                this.ctx.lineTo(7, -50);
                this.ctx.lineTo(-7, -50);
                this.ctx.closePath();
                this.ctx.fillStyle = alert.color;
                this.ctx.fill();

                /*this.ctx.font = "30px Oxanium bold";
                let text = `!`;
                let metrics = this.ctx.measureText(text);
                this.ctx.fillStyle = alert.color;
                this.ctx.fillText(text, -metrics.width / 2, 0);*/

                this.ctx.restore();
            }

            // draw screams
            let screams = snapshot.screams.filter(s => { 
                let e = snapshot.dynamics.get(s.instance);
                if (e == null) return false;
                return e.dimensionIndex === dimension.index;
            });
            for (let scream of screams)
            {
                if (scream.time > snapshot.time)
                {
                    console.warn("This should not happen");
                    continue;
                }

                let dyn = snapshot.dynamics.get(scream.instance);
                if (dyn == null) 
                {
                    console.warn("This should not happen");
                    continue;
                }

                this.ctx.save();
                this.ctx.translate(dyn.position.x, -dyn.position.z);

                let t = (snapshot.time - scream.time) / GTFOReplaySettings.screamLingerTime;

                for (let i = 0; i < 3; ++i)
                {
                    let _t = t - 0.1 * i;
                    if (_t < 0) continue;

                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, 500 * _t, 0, 2 * Math.PI);
                    this.ctx.lineWidth = 5 + 10 * (1 - _t);
                    this.ctx.strokeStyle = `rgba(${scream.color}, ${(3 - i) / 3 * (1 - t)})`;
                    this.ctx.stroke();
                }

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
            <input rhu-id="file" type="file" style="position: absolute; top: 0px;"/> <!-- TODO(randomuserhi): Specific accept clause -->
            <canvas style="
                display: block;
                box-sizing: border-box;
                width: 100%;
                height: 100%;
            " rhu-id="canvas" width="1920" height="1080"></canvas>
            <canvas style="display: none;"></canvas>
            `, {
            element: //html
                `<div></div>`
            });
    }
}));
