import { BoxGeometry, CylinderGeometry, SphereGeometry } from "@esm/three";

export const Box = new BoxGeometry(1, 1, 1);
export const Cylinder = new CylinderGeometry(1, 1, 1, 10, 10).translate(0, 0.5, 0).rotateX(Math.PI * 0.5);
export const Sphere = new SphereGeometry(1, 10, 10);

export const UnityCylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10).rotateX(Math.PI * 0.5);