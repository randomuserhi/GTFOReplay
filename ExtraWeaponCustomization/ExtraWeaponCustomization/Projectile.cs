using EWC.CustomWeapon.Properties.Traits.CustomProjectile.Components;
using LevelGeneration;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using UnityEngine;

namespace ReplayRecorder.ExtraWeaponCustomization {
    internal struct ProjectileTransform : IReplayTransform {
        private EWCProjectileComponentBase projectile;
        private byte dimension;

        public byte dimensionIndex => dimension;
        public bool active => projectile != null;
        public Vector3 position => projectile.transform.position;
        public Quaternion rotation => projectile.transform.rotation;

        public ProjectileTransform(EWCProjectileComponentBase projectile) {
            this.projectile = projectile;
            dimension = (byte)Dimension.GetDimensionFromPos(projectile.transform.position).DimensionIndex;
        }
    }

    [ReplayData("EWC.Projectile", "0.0.1")]
    internal class rEWCProjectile : DynamicTransform {
        internal static class Hooks {
            public static void OnSpawn(EWCProjectileComponentBase projectile) {
                Replay.Spawn(new rEWCProjectile(projectile));
            }

            public static void OnDespawn(EWCProjectileComponentBase projectile) {
                Replay.Despawn(new rEWCProjectile(projectile));
            }
        }

        EWCProjectileComponentBase projectile;

        public rEWCProjectile(EWCProjectileComponentBase projectile) : base(projectile.SyncID, new ProjectileTransform(projectile)) {
            this.projectile = projectile;
        }

        public override void Spawn(ByteBuffer buffer) {
            base.Spawn(buffer);
            BitHelper.WriteBytes((byte)projectile.PlayerIndex, buffer);
            BitHelper.WriteHalf(projectile.Settings.ModelScale, buffer);
        }
    }
}
