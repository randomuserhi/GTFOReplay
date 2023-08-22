using Player;
using Enemies;
using API;

namespace ReplayRecorder.Enemies
{
    public static partial class Enemy
    {
        public struct EnemyAlert : ISerializable
        {
            private rEnemyAgent enemy;
            private byte player;

            public EnemyAlert(rEnemyAgent enemy, PlayerAgent? player)
            {
                this.enemy = enemy;
                if (player != null)
                    this.player = (byte)player.PlayerSlotIndex;
                else
                    this.player = 255;
            }

            public const int SizeOf = sizeof(int) + 1;
            private byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs)
            {
                int index = 0;
                BitHelper.WriteBytes(enemy.instanceID, buffer, ref index);
                BitHelper.WriteBytes(player, buffer, ref index);
                fs.Write(buffer);
            }
        }

        public struct EnemyScream : ISerializable
        {
            private rEnemyAgent enemy;
            private bool scout;

            public EnemyScream(rEnemyAgent enemy, bool scout)
            {
                this.enemy = enemy;
                this.scout = scout;
            }

            public const int SizeOf = sizeof(int) + 1;
            private byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs)
            {
                int index = 0;
                BitHelper.WriteBytes(enemy.instanceID, buffer, ref index);
                BitHelper.WriteBytes(scout ? (byte)1 : (byte)0, buffer, ref index);
                fs.Write(buffer);
            }
        }

        public static void EnemyAlerted(EnemyAgent enemy, PlayerAgent? player = null)
        {
            if (!SnapshotManager.active) return;

            int instance = enemy.GetInstanceID();
            if (enemies.ContainsKey(instance))
            {
                APILogger.Debug($"Enemy [{instance}] was alerted");
                SnapshotManager.AddEvent(GameplayEvent.Type.EnemyAlerted, new EnemyAlert(enemies[instance], player));
            }
            else APILogger.Error("Can't alert enemy that was not tracked.");
        }

        public static void EnemyScreamed(EnemyAgent enemy, bool scout = false)
        {
            if (!SnapshotManager.active) return;

            int instance = enemy.GetInstanceID();
            if (enemies.ContainsKey(instance))
            {
                APILogger.Debug($"Enemy [{instance}] screamed");
                SnapshotManager.AddEvent(GameplayEvent.Type.EnemyScreamed, new EnemyScream(enemies[instance], scout));
            }
            else APILogger.Error("Screaming enemy was not tracked.");
        }
    }
}
