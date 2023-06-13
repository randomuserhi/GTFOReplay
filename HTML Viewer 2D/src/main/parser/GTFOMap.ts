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
    doors: GTFODoor[];
    
    meshes: Mesh[];
}
interface GTFOMapConstructor
{
    new(meshes: Mesh[], doors: GTFODoor[]): GTFOMap;
    prototype: GTFOMap;

    parse(bytes: DataView, reader: Reader): GTFOMap;
}

(function() {

    let meshToCanvas = (mesh: Mesh): GTFOSurface => {
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

    let GTFOMap: GTFOMapConstructor = window.GTFOMap = function(this: GTFOMap, meshes: Mesh[], doors: GTFODoor[])
    {
        this.meshes = meshes;
        this.doors = doors;

        this.surfaces = [];
        for (let i = 0; i < this.meshes.length; ++i)
        {
            let img: GTFOSurface = meshToCanvas(meshes[i]);
            if (img.canvas.width != 0 && img.canvas.height != 0)
                this.surfaces.push(img);
        }
    } as Function as GTFOMapConstructor;

    GTFOMap.parse = function(bytes: DataView, reader: Reader): GTFOMap
    {
        let nSurfaces = BitHelper.readUShort(bytes, reader); // number of surfaces
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
        let doors: GTFODoor[] = new Array(nDoors);
        for (let i = 0; i < nDoors; ++i) doors[i] = GTFODoor.parse(bytes, reader);

        return new GTFOMap(meshes, doors);
    }

})();