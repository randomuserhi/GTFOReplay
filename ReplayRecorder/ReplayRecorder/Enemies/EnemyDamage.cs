using Agents;
using Player;
using Enemies;
using API;

namespace ReplayRecorder.Enemies
{
    public class EnemyDamage
    {
        public struct rEnemyDamage : ISerializable
        {
            private rEnemyAgent enemy;
            private float damage;
            private byte source;

            public rEnemyDamage(rEnemyAgent enemy, float damage, PlayerAgent source)
            {
                this.enemy = enemy;
                this.damage = damage;
                this.source = (byte)source.PlayerSlotIndex;
            }

            public const int SizeOf = sizeof(int) + sizeof(ushort) + 1;
            private byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs)
            {
                int index = 0;
                BitHelper.WriteBytes(enemy.instanceID, buffer, ref index);
                BitHelper.WriteHalf(damage, buffer, ref index);
                BitHelper.WriteBytes(source, buffer, ref index);
                fs.Write(buffer);
            }
        }

        public static void OnBulletDamage(EnemyAgent receiver, PlayerAgent source, float damage)
        {
            //if (damage <= 0) return;
            int instance = receiver.GetInstanceID();
            if (!Enemy.enemies.ContainsKey(instance))
            {
                APILogger.Error("(EnemyBulletDamage) Enemy instance was not found.");
                return;
            }
            rEnemyAgent rEnemy = Enemy.enemies[instance];
            APILogger.Debug($"{source.Owner.NickName} did {damage} bullet damage to [{instance}].");
            SnapshotManager.AddEvent(GameplayEvent.Type.EnemyBulletDamage, new rEnemyDamage(rEnemy, damage, source));
        }

        public static void OnMeleeDamage(EnemyAgent receiver, PlayerAgent source, float damage)
        {
            //if (damage <= 0) return;
            int instance = receiver.GetInstanceID();
            if (!Enemy.enemies.ContainsKey(instance))
            {
                APILogger.Error("(EnemyMeleeDamage) Enemy instance was not found.");
                return;
            }
            rEnemyAgent rEnemy = Enemy.enemies[instance];
            APILogger.Debug($"{source.Owner.NickName} did {damage} melee damage to [{instance}].");
            SnapshotManager.AddEvent(GameplayEvent.Type.EnemyMeleeDamage, new rEnemyDamage(rEnemy, damage, source));
        }
    }
}
