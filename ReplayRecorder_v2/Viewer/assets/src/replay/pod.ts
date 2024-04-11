export interface Vector {
    x: number;
    y: number;
    z: number;
}

export namespace Vec {
    export function zero(): Vector {
        return {
            x: 0,
            y: 0,
            z: 0
        };
    }
    export function length(v: Vector): number {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }
    export function dist(a: Vector, b: Vector): number {
        const x = a.x - b.x;
        const y = a.y - b.y;
        const z = a.z - b.z;
        return Math.sqrt(x * x + y * y + z * z);
    }
    export function lerp(result: Vector, a: Vector, b: Vector, lerp: number): Vector {
        lerp = Math.clamp01(lerp);
        result.x = a.x + (b.x - a.x) * lerp;
        result.y = a.y + (b.y - a.y) * lerp;
        result.z = a.z + (b.z - a.z) * lerp;
        return result;
    }
    export function mid(result: Vector, a: Vector, b: Vector): Vector {
        result.x = (a.x + b.x) / 2;
        result.y = (a.y + b.y) / 2;
        result.z = (a.z + b.z) / 2;
        return result;
    }
    export function add(result: Vector, a: Vector, b: Vector): Vector {
        result.x = a.x + b.x;
        result.y = a.y + b.y;
        result.z = a.z + b.z;
        return result;
    }
    export function sub(result: Vector, a: Vector, b: Vector): Vector {
        result.x = a.x - b.x;
        result.y = a.y - b.y;
        result.z = a.z - b.z;
        return result;
    }
    export function dot(a: Vector, b: Vector): number {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }
    export function cmul(result: Vector, a: Vector, b: Vector): Vector {
        result.x = a.x * b.x;
        result.y = a.y * b.y;
        result.z = a.z * b.z;
        return result;
    }
    export function scale(result: Vector, a: Vector, b: number): Vector {
        result.x = a.x * b;
        result.y = a.y * b;
        result.z = a.z * b;
        return result;
    }
}

export interface Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
}

export namespace Quat {
    export function identity(): Quaternion {
        return {
            w: 1,
            x: 0,
            y: 0,
            z: 0
        };
    }
    export function normalize(result: Quaternion, a: Quaternion): Quaternion {
        const length = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z + a.w * a.w);
        result.x = a.x / length;
        result.y = a.y / length;
        result.z = a.z / length;
        result.w = a.w / length;
        return result;
    }
    export function euler(a: Quaternion): Vector {
        const euler: Vector = {x: 0, y: 0, z: 0};
        const sqw = a.w*a.w;
        const sqx = a.x*a.x;
        const sqy = a.y*a.y;
        const sqz = a.z*a.z;
        const unit = sqx + sqy + sqz + sqw; // if normalised is one, otherwise is correction factor
        const test = a.x*a.y + a.z*a.w;
        if (test > 0.499*unit) { // singularity at north pole
            euler.y = 2 * Math.atan2(a.x,a.w);
            euler.x = Math.PI/2;
            euler.z = 0;
        } else if (test < -0.499*unit) { // singularity at south pole
            euler.y = -2 * Math.atan2(a.x,a.w);
            euler.x = -Math.PI/2;
            euler.z = 0;
        } else {
            euler.y = Math.atan2(2*a.y*a.w-2*a.x*a.z , sqx - sqy - sqz + sqw);
            euler.x = Math.asin(2*test/unit);
            euler.z = Math.atan2(2*a.x*a.w-2*a.y*a.z , -sqx + sqy - sqz + sqw);
        }
        return euler;
    }
    export function slerp(result: Quaternion, a: Quaternion, b: Quaternion, lerp: number) {
        lerp = Math.clamp01(lerp);
        
        const cosHalfTheta = a.w * b.w + a.x * b.x + a.y * b.y + a.z * b.z;
        if (cosHalfTheta < 0) {
            // flip the quarternion if they face opposite directions to prevent slerp going the long way
            a.x = -a.x;
            a.y = -a.y;
            a.z = -a.z;
            a.w = -a.w;
        }
        if (Math.abs(cosHalfTheta) >= 1.0) {
            return {
                w: a.w,
                x: a.x,
                y: a.y,
                z: a.z
            };
        }
        const halfTheta = Math.acos(cosHalfTheta);
        const sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);
        if (Math.abs(sinHalfTheta) < 0.001) {
            result.w = (a.w * 0.5 + b.w * 0.5);
            result.x = (a.x * 0.5 + b.x * 0.5);
            result.y = (a.y * 0.5 + b.y * 0.5);
            result.z = (a.z * 0.5 + b.z * 0.5);
            return result;
        }
        const ratioA = Math.sin((1 - lerp) * halfTheta) / sinHalfTheta;
        const ratioB = Math.sin(lerp * halfTheta) / sinHalfTheta;
        result.w = (a.w * ratioA + b.w * ratioB);
        result.x = (a.x * ratioA + b.x * ratioB);
        result.y = (a.y * ratioA + b.y * ratioB);
        result.z = (a.z * ratioA + b.z * ratioB);
        const length = Math.sqrt(result.x * result.x + result.y * result.y + result.z * result.z + result.w * result.w);
        result.x /= length;
        result.y /= length;
        result.z /= length;
        result.w /= length;
        return result;
    }
}