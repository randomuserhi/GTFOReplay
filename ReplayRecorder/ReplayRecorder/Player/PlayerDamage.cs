using API;
using Enemies;
using Player;
using ReplayRecorder.Enemies;

namespace ReplayRecorder.Player {
    internal class PlayerDamage {
        public struct rPlayerDamage : ISerializable {
            private byte player;
            private int? source = null;
            private float damage;

            public rPlayerDamage(PlayerAgent player, float damage, int source) {
                this.player = (byte)player.PlayerSlotIndex;
                this.source = source;
                this.damage = damage;
            }

            public rPlayerDamage(PlayerAgent player, float damage) {
                this.player = (byte)player.PlayerSlotIndex;
                this.damage = damage;
            }

            public const int SizeOf = 1 + sizeof(ushort) + sizeof(int);
            public const int SizeOfNoSource = 1 + sizeof(ushort);
            private byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs) {
                int index = 0;
                BitHelper.WriteBytes(player, buffer, ref index);
                BitHelper.WriteHalf(damage, buffer, ref index);

                if (this.source != null) {
                    BitHelper.WriteBytes(source.Value, buffer, ref index);
                    fs.Write(buffer);
                } else fs.Write(buffer, 0, SizeOfNoSource);
            }
        }

        public struct rFriendlyFire : ISerializable {
            private byte player;
            private byte source;
            private float damage;

            public rFriendlyFire(PlayerAgent player, float damage, PlayerAgent source) {
                this.player = (byte)player.PlayerSlotIndex;
                this.source = (byte)source.PlayerSlotIndex;
                this.damage = damage;
            }

            public const int SizeOf = 1 + sizeof(ushort) + 1;
            private byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs) {
                int index = 0;
                BitHelper.WriteBytes(player, buffer, ref index);
                BitHelper.WriteHalf(damage, buffer, ref index);
                BitHelper.WriteBytes(source, buffer, ref index);
                fs.Write(buffer);
            }
        }

        public static void OnFallDamage(PlayerAgent player, float damage) {
            //if (damage <= 0) return;
            APILogger.Debug($"{player.Owner.NickName} took {damage} fall damage.");
            SnapshotManager.AddEvent(GameplayEvent.Type.PlayerFallDamage, new rPlayerDamage(player, damage));
        }

        public static void OnMeleeDamage(PlayerAgent player, float damage, EnemyAgent source) {
            //if (damage <= 0) return;
            int instance = source.GetInstanceID();
            if (!Enemy.enemies.ContainsKey(instance)) {
                APILogger.Error("(PlayerMeleeDamage) Enemy instance was not found.");
                return;
            }
            APILogger.Debug($"{player.Owner.NickName} took {damage} melee damage from [{instance}].");
            SnapshotManager.AddEvent(GameplayEvent.Type.PlayerMeleeDamage, new rPlayerDamage(player, damage, instance));
        }

        public static void OnTongueDamage(PlayerAgent player, float damage, EnemyAgent source, MovingEnemyTentacleBase tongue) {
            //if (damage <= 0) return;
            int instance = source.GetInstanceID();
            if (!Enemy.enemies.ContainsKey(instance)) {
                APILogger.Error("(PlayerTongueDamage) Enemy instance was not found.");
                return;
            }
            APILogger.Debug($"{player.Owner.NickName} took {damage} tongue damage from [{instance}].");
            SnapshotManager.AddEvent(GameplayEvent.Type.PlayerTongueDamage, new rPlayerDamage(player, damage, instance));
            SnapshotManager.AddEvent(GameplayEvent.Type.SetTongue, new Enemy.TongueEvent(tongue));
        }

        public static void OnPelletDamage(PlayerAgent player, float damage, EnemyAgent source) {
            //if (damage <= 0) return;
            int instance = source.GetInstanceID();
            if (!Enemy.enemies.ContainsKey(instance)) {
                APILogger.Error("(PlayerPelletDamage) Enemy instance was not found.");
                return;
            }
            APILogger.Debug($"{player.Owner.NickName} took {damage} pellet damage from [{instance}].");
            SnapshotManager.AddEvent(GameplayEvent.Type.PlayerPelletDamage, new rPlayerDamage(player, damage, instance));
        }

        public static void OnBulletDamage(PlayerAgent player, float damage, PlayerAgent source) {
            //if (damage <= 0) return;
            APILogger.Debug($"{player.Owner.NickName} took {damage} bullet damage from [{source.Owner.NickName}].");
            SnapshotManager.AddEvent(GameplayEvent.Type.PlayerBulletDamage, new rFriendlyFire(player, damage, source));
        }

        public static void OnMineDamage(PlayerAgent player, PlayerAgent source, float damage) {
            //if (damage <= 0) return;
            APILogger.Debug($"{player.Owner.NickName} took {damage} mine damage from [{source.Owner.NickName}].");
            SnapshotManager.AddEvent(GameplayEvent.Type.PlayerMineDamage, new rFriendlyFire(player, damage, source));
        }

        public struct rPlayerDodge : ISerializable {
            private byte player;
            private int source;

            public rPlayerDodge(PlayerAgent player, int source) {
                this.player = (byte)player.PlayerSlotIndex;
                this.source = source;
            }

            public const int SizeOf = 1 + sizeof(int);
            private byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs) {
                int index = 0;
                BitHelper.WriteBytes(player, buffer, ref index);
                BitHelper.WriteBytes(source, buffer, ref index);
                fs.Write(buffer);
            }
        }

        public static void OnPelletDodge(PlayerAgent player, int source) {
            APILogger.Debug($"{player.Owner.NickName} dodged projectile from [{source}]");
            SnapshotManager.AddEvent(GameplayEvent.Type.PlayerPelletDodge, new rPlayerDodge(player, source));
        }

        public static void OnTongueDodge(PlayerAgent player, int source, MovingEnemyTentacleBase tongue) {
            APILogger.Debug($"{player.Owner.NickName} dodged tongue from [{source}]");
            SnapshotManager.AddEvent(GameplayEvent.Type.PlayerTongueDodge, new rPlayerDodge(player, source));
            SnapshotManager.AddEvent(GameplayEvent.Type.SetTongue, new Enemy.TongueEvent(tongue));
        }
    }
}
