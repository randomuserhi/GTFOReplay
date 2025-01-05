using EWC.Utils;
using UnityEngine;
using Vanilla.Events;

namespace ReplayRecorder.ExtraWeaponCustomization {
    internal class rEWCGunShot {
        internal static class Hooks {
            public static void Trigger(HitData hit, Vector3 start, Vector3 end) {
                Replay.Trigger(new rGunshot(hit.owner, hit.damage, start, end, false, false));
            }
        }
    }
}
