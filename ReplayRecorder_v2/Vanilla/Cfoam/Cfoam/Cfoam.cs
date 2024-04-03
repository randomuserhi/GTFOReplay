using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using UnityEngine;

namespace Vanilla.Cfoam {
    internal struct CfoamTransform : IReplayTransform {
        private GlueGunProjectile projectile;

        public bool active => projectile != null;
        private byte dimension;
        public byte dimensionIndex => dimension;
        public Vector3 position => projectile.transform.position;
        public Quaternion rotation => projectile.transform.rotation;

        public CfoamTransform(GlueGunProjectile projectile, byte dimension) {
            this.projectile = projectile;
            this.dimension = dimension;
        }
    }

    [ReplayData("Vanilla.Cfoam", "0.0.1")]
    internal class rCfoam : DynamicPosition {
        private GlueGunProjectile projectile;

        public override bool Active {
            get {
                if (Replay.Has<rCfoam>(Id)) {
                    if (!transform.active || (projectile.m_landed && scale < 0.2f)) {
                        Replay.Despawn(Replay.Get<rCfoam>(Id));
                    }
                }
                return base.Active;
            }
        }
        public override bool IsDirty => base.IsDirty || oldScale != scale;

        private float scale => projectile.transform.localScale.x;
        private float oldScale = 0;

        public rCfoam(GlueGunProjectile projectile, byte dimension) : base(projectile.GetInstanceID(), new CfoamTransform(projectile, dimension)) {
            this.projectile = projectile;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteHalf(scale, buffer);

            oldScale = scale;
        }

        public override void Spawn(ByteBuffer buffer) {
            base.Spawn(buffer);
            BitHelper.WriteHalf(scale, buffer);

            oldScale = scale;
        }
    }
}
