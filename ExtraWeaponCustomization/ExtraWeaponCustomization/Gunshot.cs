using EWC.CustomWeapon.Enums;
using EWC.Utils;
using UnityEngine;
using Vanilla.Events;

namespace ReplayRecorder.EWC {
    internal class rEWCGunShot {
        internal static class Hooks {
            public static void Trigger(HitData hit, Vector3 start, Vector3 end, WeaponType weaponType) {
                Replay.Trigger(new rGunshot(hit.owner, hit.damage, start, end, weaponType.HasFlag(WeaponType.Sentry), false));
            }
        }
    }
}
