interface Vector {
    x: number;
    y: number;
    z: number;
}

/* exported Vec */
namespace Vec {
    export function lerp(a: Vector, b: Vector, lerp: number): Vector {
        return {
            x: a.x + (b.x - a.x) * lerp,
            y: a.y + (b.y - a.y) * lerp,
            z: a.z + (b.z - a.z) * lerp
        };
    }
    export function add(a: Vector, b: Vector): Vector {
        return {
            x: a.x + b.x,
            y: a.y + b.y,
            z: a.z + b.z
        };
    }
    export function sub(a: Vector, b: Vector): Vector {
        return {
            x: a.x - b.x,
            y: a.y - b.y,
            z: a.z - b.z
        };
    }
    export function dot(a: Vector, b: Vector): number {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }
    export function cmul(a: Vector, b: Vector): Vector {
        return {
            x: a.x * b.x,
            y: a.y * b.y,
            z: a.z * b.z
        };
    }
    export function scale(a: Vector, b: number): Vector {
        return {
            x: a.x * b,
            y: a.y * b,
            z: a.z * b
        };
    }
}

interface Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
}
/* exported Quat */
namespace Quat {
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
    export function slerp(a: Quaternion, b: Quaternion, lerp: number) {
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
            return {
                w: (a.w * 0.5 + b.w * 0.5),
                x: (a.x * 0.5 + b.x * 0.5),
                y: (a.y * 0.5 + b.y * 0.5),
                z: (a.z * 0.5 + b.z * 0.5)
            };
        }
        const ratioA = Math.sin((1 - lerp) * halfTheta) / sinHalfTheta;
        const ratioB = Math.sin(lerp * halfTheta) / sinHalfTheta;
        return {
            w: (a.w * ratioA + b.w * ratioB),
            x: (a.x * ratioA + b.x * ratioB),
            y: (a.y * ratioA + b.y * ratioB),
            z: (a.z * ratioA + b.z * ratioB)
        };
    }
}

/* exported Math */
interface Math {
    clamp(value: number, min: number, max: number): number;
    clamp01(value: number): number;
}

Math.clamp = function (value, min, max) {
    return Math.min(max, Math.max(value, min));
};
Math.clamp01 = function (value) {
    return Math.clamp(value, 0, 1);
};
