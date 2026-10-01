import { BufferGeometry, Float32BufferAttribute, Matrix4, Mesh, Vector3 } from "@esm/three";

type Point = {x:number; y:number; z:number};
type Footprint = {polygon:Point[]; minY:number; maxY:number; minX:number; maxX:number; minZ:number; maxZ:number};
const cellSize = 8;
const tolerance = 1.25;
const cross = (a:Point,b:Point,c:Point) => (b.x-a.x)*(c.z-a.z)-(b.z-a.z)*(c.x-a.x);

function hull(points:Point[]) {
    points.sort((a,b)=>a.x-b.x || a.z-b.z);
    const unique=points.filter((p,i)=>!i || p.x!==points[i-1].x || p.z!==points[i-1].z);
    const half=(input:Point[])=>{
        const result:Point[]=[];
        for(const p of input){while(result.length>1 && cross(result[result.length-2],result[result.length-1],p)<=0)result.pop();result.push(p);}
        return result;
    };
    return [...half(unique).slice(0,-1),...half(unique.slice().reverse()).slice(0,-1)];
}

// Subtract a convex support prism. Boundary triangles are split, never left
// crossing a stair merely because one of their corners has no native support.
function subtract(polygon:Point[], floor:Footprint) {
    const planes:((p:Point)=>number)[]=[p=>p.y-floor.minY,p=>floor.maxY-p.y];
    floor.polygon.forEach((a,i)=>{const b=floor.polygon[(i+1)%floor.polygon.length];planes.push(p=>cross(a,b,p));});
    const outside:Point[][]=[];
    let inside=polygon;
    for(const distance of planes){
        if(inside.length<3)break;
        const keep:Point[]=[],cut:Point[]=[];
        for(let i=0;i<inside.length;i++){
            const a=inside[i],b=inside[(i+1)%inside.length],da=distance(a),db=distance(b);
            if(da>=0)keep.push(a);else cut.push(a);
            if((da>=0)!==(db>=0)){
                const t=da/(da-db),p={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t};
                keep.push(p);cut.push(p);
            }
        }
        if(cut.length>=3)outside.push(cut);
        inside=keep;
    }
    return outside;
}

export async function buildNavigationFallback(floors:{geometry:BufferGeometry; dimension:number; matrices:Float32Array}[], maps:Map<number,Mesh[]>, cancelled:()=>boolean) {
    const cells=new Map<string,Set<Footprint>>(),matrix=new Matrix4(),point=new Vector3();
    let slice=performance.now(),before=0,after=0;
    async function yieldIfNeeded(){if(performance.now()-slice>=8){await new Promise(resolve=>setTimeout(resolve,0));slice=performance.now();}}
    for(const mesh of floors){
        const positions=mesh.geometry.getAttribute("position");
        for(let instance=0;instance<mesh.matrices.length/16;instance++){
            if(cancelled())return {before,after};
            matrix.fromArray(mesh.matrices, instance * 16);
            const points:Point[]=[];
            let minY=Infinity,maxY=-Infinity,minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;
            for(let i=0;i<positions.count;i++){
                point.fromBufferAttribute(positions,i).applyMatrix4(matrix);points.push({x:point.x,y:point.y,z:point.z});
                minX=Math.min(minX,point.x);maxX=Math.max(maxX,point.x);minZ=Math.min(minZ,point.z);maxZ=Math.max(maxZ,point.z);
                minY=Math.min(minY,point.y);maxY=Math.max(maxY,point.y);
            }
            const polygon=hull(points);if(polygon.length<3)continue;
            const floor={polygon,minY:minY-tolerance,maxY:maxY+tolerance,minX,maxX,minZ,maxZ};
            for(let x=Math.floor(minX/cellSize);x<=Math.floor(maxX/cellSize);x++)for(let z=Math.floor(minZ/cellSize);z<=Math.floor(maxZ/cellSize);z++){
                const key=`${mesh.dimension}/${x}/${z}`;
                if(!cells.has(key))cells.set(key,new Set());cells.get(key)!.add(floor);
            }
            await yieldIfNeeded();
        }
    }
    for(const [dimension,meshes] of maps)for(const mesh of meshes){
        const geometry=mesh.geometry,positions=geometry.getAttribute("position"),index=geometry.index;
        if(!index)throw Error("Navigation triangles require an index.");
        const vertices:number[]=[];
        for(let i=0;i<index.count;i+=3){
            if(cancelled())return {before,after};
            const triangle=Array.from({length:3},(_,n)=>{point.fromBufferAttribute(positions,index.getX(i+n));return {x:point.x,y:point.y,z:point.z};});
            before++;
            const minX=Math.min(...triangle.map(p=>p.x)),maxX=Math.max(...triangle.map(p=>p.x));
            const minZ=Math.min(...triangle.map(p=>p.z)),maxZ=Math.max(...triangle.map(p=>p.z));
            const minY=Math.min(...triangle.map(p=>p.y)),maxY=Math.max(...triangle.map(p=>p.y));
            const candidates=new Set<Footprint>();
            for(let x=Math.floor(minX/cellSize);x<=Math.floor(maxX/cellSize);x++)for(let z=Math.floor(minZ/cellSize);z<=Math.floor(maxZ/cellSize);z++)
                for(const floor of cells.get(`${dimension}/${x}/${z}`)??[])if(floor.maxY>=minY&&floor.minY<=maxY&&floor.maxX>=minX&&floor.minX<=maxX&&floor.maxZ>=minZ&&floor.minZ<=maxZ)candidates.add(floor);
            let fragments=[triangle];
            for(const floor of candidates){
                fragments=fragments.flatMap(polygon=>subtract(polygon,floor));
                if(!fragments.length)break;
                await yieldIfNeeded();
            }
            for(const polygon of fragments)for(let j=1;j+1<polygon.length;j++){
                if(Math.abs(cross(polygon[0],polygon[j],polygon[j+1]))<1e-8)continue;
                for(const p of [polygon[0],polygon[j],polygon[j+1]])vertices.push(p.x,p.y,p.z);
                after++;
            }
            await yieldIfNeeded();
        }
        if(cancelled())return {before,after};
        const result=new BufferGeometry();result.setAttribute("position",new Float32BufferAttribute(vertices,3));result.computeVertexNormals();
        mesh.geometry=result;geometry.dispose();
    }
    return {before,after};
}
