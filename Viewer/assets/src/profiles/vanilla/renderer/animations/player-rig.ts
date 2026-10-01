import { FingerRig } from "../models/stickfigure.js";
import { QuaternionLike, Vector3Like } from "@esm/three";
import { HumanFingerJoints } from "./player-fingers.js";

const response = await fetch(new URL("../player-animations/rig.json", module.baseURI));
if (!response.ok) throw new Error(`Could not load the player finger rig: ${response.status}`);
const reference: Omit<FingerRig, "joints"> & {
    meleeGrips: Record<"hammer" | "spear" | "knife" | "bat", Record<"left" | "right", { pos: Vector3Like; rot: QuaternionLike }>>;
} = await response.json();
export const playerRig: FingerRig = { joints: HumanFingerJoints, positions: reference.positions, rotations: reference.rotations };
export const playerMeleeGrips = reference.meleeGrips;
