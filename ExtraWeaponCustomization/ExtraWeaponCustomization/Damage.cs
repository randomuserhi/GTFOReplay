using Agents;
using Enemies;
using EWC.CustomWeapon.Enums;
using Player;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;

namespace ReplayRecorder.EWC {
    [ReplayData("EWC.Damage", "0.0.2")]
    internal class rEWCDamage : ReplayEvent {
        internal static class Hooks {
            public static void Shrapnel(float damage, EnemyAgent enemy, Dam_EnemyDamageLimb limb, PlayerAgent? player, OwnerType ownerType) {
                if (player == null) return;
                Sync.Trigger(new rEWCDamage(Type.Shrapnel, damage, player, enemy, ownerType.HasFlag(OwnerType.Sentry)));
            }

            public static void Explosive(float damage, EnemyAgent enemy, Dam_EnemyDamageLimb limb, PlayerAgent? player, OwnerType ownerType) {
                if (player == null) return;
                Sync.Trigger(new rEWCDamage(Type.Explosive, damage, player, enemy, ownerType.HasFlag(OwnerType.Sentry)));
            }

            public static void DoT(float damage, EnemyAgent enemy, Dam_EnemyDamageLimb limb, PlayerAgent? player, OwnerType ownerType) {
                if (player == null) return;
                Sync.Trigger(new rEWCDamage(Type.DoT, damage, player, enemy, ownerType.HasFlag(OwnerType.Sentry)));
            }
        }

        public enum Type {
            Explosive,
            DoT,
            Shrapnel
        }

        private Type type;

        private float damage;
        private ushort source;
        private ushort target;
        private bool isSentry;

        public rEWCDamage(Type type, float damage, ushort source, ushort target, bool isSentry) {
            this.type = type;
            this.damage = damage;
            this.source = source;
            this.target = target;
            this.isSentry = isSentry;
        }

        public rEWCDamage(Type type, float damage, Agent source, Agent target, bool isSentry) {
            this.type = type;
            this.damage = damage;
            this.source = source.GlobalID;
            this.target = target.GlobalID;
            this.isSentry = isSentry;
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes((byte)type, buffer);
            BitHelper.WriteBytes(source, buffer);
            BitHelper.WriteBytes(target, buffer);
            BitHelper.WriteHalf(damage, buffer);
            BitHelper.WriteBytes(isSentry, buffer);
        }

        private static class Sync {
            const string eventName = "EWC.Damage";

            [ReplayPluginLoad]
            private static void Load() {
                RNet.Register(eventName, OnReceive);
            }

            private static ByteBuffer packet = new ByteBuffer();

            public static void Trigger(rEWCDamage damage) {
                Replay.Trigger(damage);

                ByteBuffer packet = Sync.packet;
                packet.Clear();

                BitHelper.WriteBytes((byte)damage.type, packet);
                BitHelper.WriteBytes(damage.source, packet);
                BitHelper.WriteBytes(damage.target, packet);
                BitHelper.WriteHalf(damage.damage, packet);
                BitHelper.WriteBytes(damage.isSentry, packet);

                RNet.Trigger(eventName, packet);
            }

            private static void OnReceive(ulong sender, ArraySegment<byte> packet) {
                int index = 0;

                Type type = (Type)BitHelper.ReadByte(packet, ref index);
                ushort source = BitHelper.ReadUShort(packet, ref index);
                ushort target = BitHelper.ReadUShort(packet, ref index);
                float damage = BitHelper.ReadHalf(packet, ref index);
                bool isSentry = BitHelper.ReadBool(packet, ref index);

                Replay.Trigger(new rEWCDamage(type, damage, source, target, isSentry));
            }
        }
    }
}
