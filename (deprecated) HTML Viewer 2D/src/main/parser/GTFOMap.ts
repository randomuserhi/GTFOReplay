declare var GTFOMap: GTFOMapConstructor
interface Window
{
    GTFOMap: GTFOMapConstructor;
}

interface GTFOSurface 
{
    canvas: HTMLCanvasElement;
    position: Vector;
};

interface GTFOMap
{
    surfaces: GTFOSurface[];
    doors: Map<number, GTFODoor>;
    ladders: Map<number, GTFOLadder>;
    terminals: Map<number, GTFOTerminal>;
    
    meshes: Mesh[];
}
interface GTFOMapConstructor
{
    new(meshes: Mesh[], doors: Map<number, GTFODoor>, ladders: Map<number, GTFOLadder>, terminals: Map<number, GTFOTerminal>): GTFOMap;
    prototype: GTFOMap;

    parse(bytes: DataView, reader: Reader): GTFOMap;
}

(function() {

    let meshToCanvas = (mesh: Mesh, scale: number): GTFOSurface => {
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

    let GTFOMap: GTFOMapConstructor = window.GTFOMap = function(this: GTFOMap, meshes: Mesh[], doors: Map<number, GTFODoor>, ladders: Map<number, GTFOLadder>, terminals: Map<number, GTFOTerminal>)
    {
        this.meshes = meshes;
        this.doors = doors;
        this.ladders = ladders;
        this.terminals = terminals;

        this.surfaces = [];
        for (let i = 0; i < this.meshes.length; ++i)
        {
            let img: GTFOSurface = meshToCanvas(meshes[i], GTFOReplaySettings.scale);
            if (img.canvas.width != 0 && img.canvas.height != 0)
                this.surfaces.push(img);
        }
    } as Function as GTFOMapConstructor;

    GTFOMap.parse = function(bytes: DataView, reader: Reader): GTFOMap
    {
        console.log("loading map...");
        let nSurfaces = BitHelper.readUShort(bytes, reader); // number of surfaces
        console.log(`Found ${nSurfaces} surfaces.`);
        let meshes: Mesh[] = new Array(nSurfaces);

        // For debugging only read 1 dimension
        for (let i = 0; i < nSurfaces; ++i)
        {
            let nVertices = BitHelper.readUShort(bytes, reader); // number of vertices
            let nIndices = BitHelper.readUInt(bytes, reader); // number of indices
            meshes[i] = {
                vertices: BitHelper.readVectorArray(bytes, reader, nVertices),
                indices: BitHelper.readUShortArray(bytes, reader, nIndices)
            };
        }

        // doors
        let nDoors = BitHelper.readUShort(bytes, reader);
        console.log(`Found ${nDoors} doors.`);
        let doors: Map<number, GTFODoor> = new Map();
        for (let i = 0; i < nDoors; ++i) 
        {
            let d = GTFODoor.parse(bytes, reader);
            doors.set(d.id, d);
        }

        // ladders
        let nLadders = BitHelper.readUShort(bytes, reader);
        console.log(`Found ${nLadders} ladders.`);
        let ladders: Map<number, GTFOLadder> = new Map();
        for (let i = 0; i < nLadders; ++i) 
        {
            let l = GTFOLadder.parse(bytes, reader);
            ladders.set(l.id, l);
        }

        // terminals
        let nTerminals = BitHelper.readUShort(bytes, reader);
        console.log(`Found ${nTerminals} terminals.`);
        let terminals: Map<number, GTFOTerminal> = new Map();
        for (let i = 0; i < nTerminals; ++i) 
        {
            let t = GTFOTerminal.parse(bytes, reader);
            terminals.set(t.id, t);
        }

        return new GTFOMap(meshes, doors, ladders, terminals);
    }

})();