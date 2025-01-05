using Agents;
using Enemies;
using Player;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;

namespace ReplayRecorder.ExtraWeaponCustomization {
    [ReplayData("EWC.Damage", "0.0.1")]
    internal class rEWCDamage : ReplayEvent {
        internal static class Hooks {
            public static void Explosive(float damage, EnemyAgent enemy, PlayerAgent? player) {
                if (player == null) return;
                Replay.Trigger(new rEWCDamage(Type.Explosive, damage, player, enemy));
            }

            public static void DoT(float damage, EnemyAgent enemy, PlayerAgent? player) {
                if (player == null) return;
                Replay.Trigger(new rEWCDamage(Type.DoT, damage, player, enemy));
            }
        }

        public enum Type {
            Explosive,
            DoT
        }

        private Type type;

        private float damage;
        private ushort source;
        private ushort target;

        public rEWCDamage(Type type, float damage, ushort source, ushort target) {
            this.type = type;
            this.damage = damage;
            this.source = source;
            this.target = target;
        }

        public rEWCDamage(Type type, float damage, Agent source, Agent target) {
            this.type = type;
            this.damage = damage;
            this.source = source.GlobalID;
            this.target = target.GlobalID;
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes((byte)type, buffer);
            BitHelper.WriteBytes(source, buffer);
            BitHelper.WriteBytes(target, buffer);
            BitHelper.WriteHalf(damage, buffer);
        }
    }
}
