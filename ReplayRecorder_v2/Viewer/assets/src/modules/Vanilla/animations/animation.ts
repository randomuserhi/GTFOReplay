
export interface Anim<T> {
    frames: T[];
    duration: number;
    rate: number;
}

const diff_i = {x: 0, y: 0};
const diff_j = {x: 0, y: 0};

export function isAnimBlend<T>(obj: Anim<T> | AnimBlend<T>): obj is AnimBlend<T> {
    return Object.prototype.isPrototypeOf.call(AnimBlend.prototype, obj);
}

export class AnimTimer {
    time: number;
    lastUpdate: number;
    loop: boolean;

    isPlaying: boolean;

    constructor(loop: boolean) {
        this.time = 0;
        this.lastUpdate = 0;
        this.loop = loop;
        this.isPlaying = false;
    }

    public reset(time: number) {
        this.lastUpdate = time;
        this.time = 0;
    }

    public update(time: number) {
        if (this.isPlaying) {
            this.time = time - this.lastUpdate;
        } else {
            this.time = this.lastUpdate;
        }
        this.time /= 1000;
    }

    public pause(time: number) {
        this.lastUpdate = time;
        this.isPlaying = false;
    }

    public play(time: number) {
        if (this.isPlaying) return;
        
        this.lastUpdate = time;
        this.isPlaying = true;
    }
}

// NOTE: uses Cartesian Rune Skovbo Johansen's Gradient Band Interpolation
export class AnimBlend<T> {
    point: { x: number, y: number };
    points: {
        anim: Anim<T> | AnimBlend<T>,
        x: number,
        y: number
    }[]; 
    readonly duration: number;

    constructor(points: {
        anim: Anim<T> | AnimBlend<T>,
        x: number,
        y: number
    }[]) {
        this.point = {
            x: 0,
            y: 0
        };
        this.points = points;
        this.duration = Math.max(...points.map(p => p.anim.duration));
    }

    // Implementation from https://www.shadertoy.com/view/XlKXWR
    public sample(): {anim: Anim<T> | AnimBlend<T>, weight: number}[] {
        let totalWeight: number = 0;
        const weights = [];
 
        for (let i = 0; i < this.points.length; ++i) {
            const point_i = this.points[i];
            diff_i.x = this.point.x - point_i.x;
            diff_i.y = this.point.y - point_i.y;
            
            let weight = 1.0;

            for (let j = 0; j < this.points.length; ++j) {
                if (j === i) continue;

                const point_j = this.points[j];
                diff_j.x = point_j.x - point_i.x;
                diff_j.y = point_j.y - point_i.y;

                const sqrlength = diff_j.x * diff_j.x + diff_j.y * diff_j.y;
                let newWeight = (diff_i.x * diff_j.x + diff_i.y * diff_j.y) / sqrlength;
                newWeight = 1.0 - newWeight;
                newWeight = Math.clamp01(newWeight);
                
                if (isNaN(newWeight)) continue;

                weight = Math.min(weight, newWeight);
            }

            if (weight > 0) {
                weights.push({ anim: point_i.anim, weight: weight });
            }
            totalWeight += weight;
        }

        for (let i = 0; i < weights.length; ++i) {
            weights[i].weight /= totalWeight;
        }
        return weights;
    }
}