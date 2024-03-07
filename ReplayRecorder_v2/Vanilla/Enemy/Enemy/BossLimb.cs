using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using UnityEngine;

namespace Vanilla.Enemy {
    public struct LimbTransform : IReplayTransform {
        private Dam_EnemyDamageLimb limb;
        public bool active => limb != null;
        public byte dimensionIndex => (byte)limb.m_base.Owner.m_dimensionIndex;
        public Vector3 position => limb.transform.position;
        public Quaternion rotation => Quaternion.identity;

        public LimbTransform(Dam_EnemyDamageLimb limb) {
            this.limb = limb;
        }
    }

    [ReplayData("Vanilla.Enemy.LimbCustom", "0.0.1")]
    internal class rLimbCustom : DynamicPosition {
        public Dam_EnemyDamageLimb_Custom limb;

        public override bool IsDirty => rEnemyModel.tick == 0 && base.IsDirty;

        public rLimbCustom(Dam_EnemyDamageLimb_Custom limb) : base(limb.GetInstanceID(), new LimbTransform(limb)) {
            this.limb = limb;
        }

        public override void Spawn(ByteBuffer buffer) {
            base.Spawn(buffer);
            BitHelper.WriteBytes(limb.m_base.Owner.GlobalID, buffer);
            BitHelper.WriteHalf(limb.transform.localScale.x, buffer);
        }
    }
}
