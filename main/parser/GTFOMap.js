;
(function () {
    let meshToCanvas = (mesh, scale) => {
        let vertex = mesh.vertices[mesh.indices[0]];
        let min = { x: vertex.x, y: -vertex.z, z: 0 };
        let max = { x: vertex.x, y: -vertex.z, z: 0 };
        for (let i = 1; i < mesh.indices.length; ++i) {
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
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < mesh.indices.length;) {
            ctx.beginPath();
            let index = mesh.indices[i++];
            ctx.moveTo((mesh.vertices[index].x - min.x) * scale, (-mesh.vertices[index].z - min.y) * scale);
            for (let j = 0; j < 2; ++j) {
                let index = mesh.indices[i++];
                let pos = mesh.vertices[index];
                ctx.lineTo((pos.x - min.x) * scale, (-pos.z - min.y) * scale);
            }
            ctx.closePath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#000";
            ctx.fillStyle = "#000";
            ctx.fill();
            ctx.stroke();
        }
        return { canvas: canvas, position: { x: min.x * scale, y: min.y * scale, z: 0 } };
    };
    let GTFOMap = window.GTFOMap = function (meshes, doors, ladders, terminals, containers) {
        this.meshes = meshes;
        this.doors = doors;
        this.ladders = ladders;
        this.terminals = terminals;
        this.containers = containers;
        this.surfaces = [];
        for (let i = 0; i < this.meshes.length; ++i) {
            let img = meshToCanvas(meshes[i], GTFOReplaySettings.scale);
            if (img.canvas.width != 0 && img.canvas.height != 0)
                this.surfaces.push(img);
        }
    };
    GTFOMap.parse = function (bytes, reader) {
        console.log("loading map...");
        let nSurfaces = BitHelper.readUShort(bytes, reader);
        console.log(`Found ${nSurfaces} surfaces.`);
        let meshes = new Array(nSurfaces);
        for (let i = 0; i < nSurfaces; ++i) {
            let nVertices = BitHelper.readUShort(bytes, reader);
            let nIndices = BitHelper.readUInt(bytes, reader);
            meshes[i] = {
                vertices: BitHelper.readVectorArray(bytes, reader, nVertices),
                indices: BitHelper.readUShortArray(bytes, reader, nIndices)
            };
        }
        let nDoors = BitHelper.readUShort(bytes, reader);
        console.log(`Found ${nDoors} doors.`);
        let doors = new Array(nDoors);
        for (let i = 0; i < nDoors; ++i) {
            let d = GTFODoor.parse(bytes, reader);
            doors[i] = d;
        }
        let nLadders = BitHelper.readUShort(bytes, reader);
        console.log(`Found ${nLadders} ladders.`);
        let ladders = new Array(nLadders);
        for (let i = 0; i < nLadders; ++i) {
            let l = GTFOLadder.parse(bytes, reader);
            ladders[i] = l;
        }
        let nTerminals = BitHelper.readUShort(bytes, reader);
        console.log(`Found ${nTerminals} terminals.`);
        let terminals = new Array(nTerminals);
        for (let i = 0; i < nTerminals; ++i) {
            let t = GTFOTerminal.parse(bytes, reader);
            terminals[i] = t;
        }
        let nContainers = BitHelper.readUShort(bytes, reader);
        console.log(`Found ${nContainers} resource containers.`);
        let containers = new Array(nContainers);
        for (let i = 0; i < nContainers; ++i) {
            let t = GTFOContainer.parse(bytes, reader);
            containers[i] = t;
        }
        return new GTFOMap(meshes, doors, ladders, terminals, containers);
    };
})();
