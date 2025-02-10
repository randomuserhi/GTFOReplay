using EWC.CustomWeapon.Properties.Effects;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;

namespace ReplayRecorder.EWC {
    [ReplayData("EWC.Explosion", "0.0.1")]
    internal class rEWCExplosion : ReplayEvent {
        internal static class Hooks {
            public static void Trigger(Vector3 position, Explosive explosion) {
                Replay.Trigger(new rEWCExplosion(position, explosion));
            }
        }

        private Vector3 position;
        private Explosive explosion;

        public rEWCExplosion(Vector3 position, Explosive explosion) {
            this.position = position;
            this.explosion = explosion;
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(position, buffer);
            BitHelper.WriteHalf(explosion.InnerRadius, buffer);
            BitHelper.WriteHalf(explosion.Radius, buffer);
        }
    }
}
