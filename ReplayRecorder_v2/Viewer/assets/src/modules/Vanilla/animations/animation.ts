import { QuaternionLike, Vector3Like } from "three";

interface Human<T> {
    hip: T;

    leftUpperLeg: T;
    leftLowerLeg: T;

    rightUpperLeg: T;
    rightLowerLeg: T;

    spine0: T;
    spine1: T;
    spine2: T;

    leftShoulder: T;
    leftUpperArm: T;
    leftLowerArm: T;

    rightShoulder: T;
    rightUpperArm: T;
    rightLowerArm: T;

    neck: T;
    head: T;
}

export type SkeletonStructure = Human<Vector3Like>;
export const defaultHumanStructure: SkeletonStructure = {hip:{x:0,y:1.04,z:0},leftUpperLeg:{x:-0.09999999,y:0,z:0},leftLowerLeg:{x:-1.776357E-17,y:-0.49,z:0},rightUpperLeg:{x:-0.09999999,y:0,z:0},rightLowerLeg:{x:-1.776357E-17,y:-0.49,z:0},spine0:{x:0,y:0.11,z:0},spine1:{x:0,y:0.11,z:0},spine2:{x:0,y:0.11,z:0},leftShoulder:{x:-0.03,y:0.19,z:0},leftUpperArm:{x:-0.18,y:-2.842171E-16,z:0},leftLowerArm:{x:-0.33,y:-4.662936E-16,z:0},rightShoulder:{x:0.03,y:0.19,z:0},rightUpperArm:{x:0.18,y:0,z:0},rightLowerArm:{x:0.33,y:0,z:0},neck:{x:0,y:0.275,z:0.02499937},head:{x:0,y:0.09999999,z:0}}; 

export interface Anim {
    frames: Human<QuaternionLike>[];
    duration: number;
    rate: number;
}