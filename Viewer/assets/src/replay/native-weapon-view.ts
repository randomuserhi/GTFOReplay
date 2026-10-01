import { Box3, Euler, Matrix4, Quaternion, Vector3, type Object3D, type Mesh, type Vector3Like } from "three";

const reachAxis=new Vector3(),reachCentre=new Vector3(),reachRadial=new Vector3();
/** Smallest whole-body translation that keeps both native wrist targets reachable. */
export function solveBodyReach(out:Vector3, right:Vector3, left:Vector3, rightReach:number, leftReach:number) {
    const r=right.length(),l=left.length();out.set(0,0,0);
    if(r<=rightReach && l<=leftReach)return out;
    out.copy(right).multiplyScalar(Math.max(0,1-rightReach/r));
    if(out.distanceTo(left)<=leftReach)return out;
    out.copy(left).multiplyScalar(Math.max(0,1-leftReach/l));
    if(out.distanceTo(right)<=rightReach)return out;
    const distance=reachAxis.subVectors(left,right).length();
    if(distance>rightReach+leftReach)throw Error('Native wrist contacts exceed both arm reaches');
    reachAxis.divideScalar(distance);
    const along=(rightReach*rightReach-leftReach*leftReach+distance*distance)/(2*distance);
    reachCentre.copy(right).addScaledVector(reachAxis,along);
    reachRadial.copy(reachCentre).negate().addScaledVector(reachAxis,reachCentre.dot(reachAxis));
    const radius=Math.sqrt(Math.max(0,rightReach*rightReach-along*along));
    return out.copy(reachCentre).addScaledVector(reachRadial.normalize(),radius);
}

type Clip = { duration:number; times:number[]; tracks:{position?:number[][];quaternion?:number[][]} };
export type WeaponViewData = {
    version:number;
    settings:Record<string,WeaponViewSettings>;
    reloads:Record<string,{duration:number;events:{time:number;state:string}[]}>;
    states:Record<string,{clip:string;speed:number;loop:boolean}>;
    clips:Record<string,Clip>;
    bendGoals:{left:number[];right:number[]};
    wristOffsets:Record<'left'|'right',{position:number[];rotation:Vector3Like}>;
    player:{cameraHeight:number;armsOffset:Vector3Like};
};
export type WeaponViewSettings = {
    persistentID:number; localPosHip:Vector3Like; localRotHip:Vector3Like;
    bodyOffsetLocal:Vector3Like; bodyRotationOffsetLocal:Vector3Like; ItemCameraFOVDefault:number;
};

/** Native datablock IDs select the pose; replay time also makes seeks deterministic. */
export class WeaponView {
    get player() {return this.data.player;}
    hipCeiling=0;
    get bendGoals() {return this.data.bendGoals;}
    get wristOffsets() {return this.data.wristOffsets;}
    readonly settings:WeaponViewSettings;
    private readonly events:{time:number;state:string;end:number}[] = [];
    private duration=0;
    private readonly euler=new Euler(0,0,0,'YXZ');
    private readonly movement=new Quaternion();
    private readonly next=new Quaternion();
    private readonly offset=new Vector3();
    private readonly end=new Vector3();
    constructor(private data:WeaponViewData, components:{c:number;v:number}[]) {
        const id=components.find(c=>c.c===4)?.v;
        this.settings=data.settings[String(id)];
        if (!this.settings) throw Error(`Missing native FPS settings ${id}`);
        for (const comp of components) {
            const reload=data.reloads[`${comp.c}:${comp.v}`];
            if (!reload) continue;
            this.events.push(...reload.events.map(event=>({...event,end:0})));this.duration=Math.max(this.duration,reload.duration);
        }
        this.events.sort((a,b)=>a.time-b.time);
        for(let i=0;i<this.events.length;i++)this.events[i].end=this.events.slice(i+1).find(e=>e.time>this.events[i].time)?.time ?? this.duration;
    }
    /** Cache only the idle ceiling for presentation; geometry never drives the arms. */
    measure(root:Object3D, nativeScale:number) {
        root.updateWorldMatrix(true,true);
        const inverse=root.matrixWorld.clone().invert(),matrix=new Matrix4(),bounds=new Box3();
        root.traverse(node=>{
            const mesh=node as Mesh;if(!mesh.isMesh)return;
            mesh.geometry.computeBoundingBox();
            matrix.multiplyMatrices(inverse,mesh.matrixWorld);
            bounds.union(mesh.geometry.boundingBox!.clone().applyMatrix4(matrix));
        });
        const position=new Vector3(),rotation=new Quaternion(),point=new Vector3();
        const idle=this.data.clips[this.data.states.idle.clip];
        for(const time of idle.times) {
            this.sample(position,rotation,time);
            for(const x of [bounds.min.x,bounds.max.x]) for(const y of [bounds.min.y,bounds.max.y]) for(const z of [bounds.min.z,bounds.max.z])
                this.hipCeiling=Math.max(this.hipCeiling,point.set(x,y,z).multiplyScalar(nativeScale).applyQuaternion(rotation).add(position).y);
        }
    }
    /** Unity Euler uses Z-X-Y application order, reflected across X. */
    rotation(out:Quaternion, degrees:Vector3Like) {
        return out.setFromEuler(this.euler.set(degrees.x*Math.PI/180,-degrees.y*Math.PI/180,-degrees.z*Math.PI/180,'YXZ'));
    }
    sample(position:Vector3, rotation:Quaternion, seconds:number, reload?:number) {
        const p=this.settings.localPosHip;
        position.set(-p.x,p.y,p.z);this.rotation(rotation,this.settings.localRotHip);
        let state='idle',t=seconds,phase:number|undefined;
        if (reload!==undefined) {
            const time=reload*this.duration;
            state='empty';t=0;
            for (let i=0;i<this.events.length;i++) {
                const event=this.events[i];if(event.time>time)break;
                state=event.state;
                phase=event.end>event.time ? (time-event.time)/(event.end-event.time) : 1;
            }
        }
        const info=this.data.states[state],clip=this.data.clips[info.clip];
        // Replay records reload duration, not the FPS Animator's speed. Normalize
        // the selected native action to its recorded segment, like part/finger
        // clips, so a longer authored clip cannot be cut off mid-recovery.
        if(phase!==undefined)t=phase*clip.duration;
        t*=info.speed;
        t=info.loop && clip.duration>0 ? ((t%clip.duration)+clip.duration)%clip.duration : Math.max(0,Math.min(t,clip.duration));
        const times=clip.times;let lo=0,hi=times.length-1;
        while (lo+1<hi) {const mid=(lo+hi)>>1;if(times[mid]<=t)lo=mid;else hi=mid;}
        const blend=times[hi]===times[lo]?0:Math.max(0,Math.min(1,(t-times[lo])/(times[hi]-times[lo])));
        const tracks=clip.tracks;
        if(tracks.position) position.add(this.offset.fromArray(tracks.position[lo]).lerp(this.end.fromArray(tracks.position[hi]),blend));
        if(tracks.quaternion) rotation.multiply(this.movement.fromArray(tracks.quaternion[lo]).slerp(this.next.fromArray(tracks.quaternion[hi]),blend));
    }
}
