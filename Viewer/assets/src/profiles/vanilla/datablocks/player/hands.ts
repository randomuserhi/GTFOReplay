import { Anim } from "../../library/animations/lib.js";
import type { AvatarLike } from "../../library/animations/lib.js";
import { HumanFingerJoints } from "../../renderer/animations/player-fingers.js";
import type { GearFoldAnimation } from "../../renderer/animations/gearfold.js";
import { GearAnimDatablock } from "../gear/animation.js";

type Hand = { idle: string; reload?: string };
type Pair = { left: Hand; right: Hand };
interface Package {
    version: number;
    gear: Record<string, Pair>;
    melee: Record<"hammer" | "spear" | "knife" | "bat", Pair>;
    poses: Record<string, { rate: number; duration: number; frames: AvatarLike<HumanFingerJoints>[] }>;
}
const response = await fetch(new URL("../player-animations/hands.json", module.baseURI));
if (!response.ok) throw new Error(`Could not load player hand animations: ${response.status}`);
const data: Package = await response.json();
if (data.version !== 1) throw new Error("Unsupported player hand animation package.");
const poses = new Map(Object.entries(data.poses).map(([key, clip]) => {
    const joints = HumanFingerJoints.filter(joint => joint.startsWith(key.startsWith("Left_Hand.") ? "left" : "right"));
    return [key, { animation: new Anim(joints, clip.rate, clip.duration, clip.frames), mask: { joints: Object.fromEntries(joints.map(joint => [joint, true])) } }] as const;
}));
for (const name of Object.keys(data.gear)) {
    const animation = GearAnimDatablock[name as keyof typeof GearAnimDatablock];
    if (!animation) throw new Error(`Hand animation references an unknown weapon animation: ${name}`);
}

export function sampleHands(fold: GearFoldAnimation | undefined, melee: keyof Package["melee"] | undefined, reload?: number) {
    // ASL can instantiate separate module graphs; animation identity is its source name.
    const pair = melee ? data.melee[melee] : fold?.name ? data.gear[fold.name] : undefined;
    if (!pair) return [];
    return [pair.left, pair.right].map(hand => {
        const name = reload !== undefined && hand.reload ? hand.reload : hand.idle;
        const { animation: clip, mask } = poses.get(name)!;
        // Idle grips never play body movement; reload fingers follow recorded progress.
        return { frame: clip.sample(reload !== undefined && hand.reload ? Math.min(0.999999, Math.max(0, reload)) * clip.duration : 0), mask };
    });
}
