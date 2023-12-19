using API;
using Enemies;
using Player;

namespace ReplayRecorder.Enemies {
    internal static partial class Enemy {
        public struct EnemyTargetEvent : ISerializable {
            public rEnemyAgent enemy;
            public byte player;

            public EnemyTargetEvent(rEnemyAgent enemy, PlayerAgent? player) {
                this.enemy = enemy;
                if (player != null)
                    this.player = (byte)player.PlayerSlotIndex;
                else
                    this.player = 255;
            }

            public const int SizeOf = sizeof(int) + 1;
            private byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs) {
                int index = 0;
                BitHelper.WriteBytes(enemy.instanceID, buffer, ref index);
                BitHelper.WriteBytes(player, buffer, ref index);
                fs.Write(buffer);
            }
        }

        // TODO(randomuserhi) => Only log if the target changes => testing needed to see if this is called every frame or not
        public static void EnemyTargetSet(EnemyAgent enemy, PlayerAgent? player = null) {
            if (!SnapshotManager.active) return;

            int instance = enemy.GetInstanceID();
            if (enemies.ContainsKey(instance)) {
                APILogger.Debug($"Enemy [{instance}] is targetting [{(player != null ? player.PlayerName : "unknown.")}]");
                SnapshotManager.AddEvent(GameplayEvent.Type.EnemyTargetSet, new EnemyTargetEvent(enemies[instance], player));
            } else APILogger.Error("Can't set target of enemy that was not tracked.");
        }
    }
}
