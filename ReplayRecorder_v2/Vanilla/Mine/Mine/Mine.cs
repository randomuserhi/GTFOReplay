using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using UnityEngine;

namespace Vanilla.Mine {
    internal struct MineTransform : IReplayTransform {
        private MineDeployerInstance mine;
        private MineDeployerInstance_Detect_Laser? laser;

        public bool active => mine != null;
        public byte dimensionIndex => (byte)mine.CourseNode.m_dimension.DimensionIndex;
        public Vector3 position => mine.transform.position;
        public Quaternion rotation => laser == null ? mine.transform.rotation : Quaternion.LookRotation(laser.m_lineRendererAlign.forward);

        public MineTransform(MineDeployerInstance mine) {
            this.mine = mine;
            laser = mine.m_detection.TryCast<MineDeployerInstance_Detect_Laser>();
        }
    }

    [ReplayData("Vanilla.Mine", "0.0.1")]
    internal class rMine : DynamicTransform {
        public enum Type {
            Explosive,
            Cfoam
        }
        private Type type;

        public PlayerAgent owner;
        private MineDeployerInstance_Detect_Laser? laser;

        public override bool Active {
            get {
                if (!transform.active && Replay.Has<rMine>(Id)) {
                    Replay.Despawn(Replay.Get<rMine>(Id));
                }
                return base.Active;
            }
        }
        public override bool IsDirty => base.IsDirty || length != oldLength;

        private float length => laser == null ? 0 : laser.DetectionRange;
        private float oldLength = 0;

        public rMine(PlayerAgent player, MineDeployerInstance mine, Type type) : base(mine.gameObject.GetInstanceID(), new MineTransform(mine)) {
            laser = mine.m_detection.TryCast<MineDeployerInstance_Detect_Laser>();
            this.type = type;
            this.owner = player;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteHalf(length, buffer);

            oldLength = length;
        }

        public override void Spawn(ByteBuffer buffer) {
            base.Spawn(buffer);
            BitHelper.WriteBytes((byte)type, buffer);
            BitHelper.WriteBytes(owner.GlobalID, buffer);
        }
    }

    [ReplayData("Vanilla.Mine.Detonate", "0.0.1")]
    internal class rMineDetonate : Id {
        private ushort trigger;
        private bool shot;
        public rMineDetonate(MineDeployerInstance mine, ushort trigger, bool shot = false) : base(mine.gameObject.GetInstanceID()) {
            this.trigger = trigger;
            this.shot = shot;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteBytes(trigger, buffer);
            BitHelper.WriteBytes(shot, buffer);
        }
    }

}
