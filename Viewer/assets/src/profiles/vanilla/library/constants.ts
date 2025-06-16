import { Color, Quaternion, Vector3 } from "@esm/three";

export const zeroQ = new Quaternion();
export const zeroS = new Vector3(1, 1, 1);
export const zeroV = new Vector3(0, 0, 0);
export const upV = new Vector3(0, 1, 0);
export const downV = new Vector3(0, -1, 0);
export const leftV = new Vector3(-1, 0, 0);
export const rightV = new Vector3(1, 0, 0);
export const forwardV = new Vector3(0, 0, 1);
export const backwardV = new Vector3(0, 0, -1);

export const white = new Color(0xffffff);
export const black = new Color(0x111111);