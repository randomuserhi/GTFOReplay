using API;
using Agents;
using Enemies;
using ReplayRecorder.Enemies.Patches;

namespace ReplayRecorder.Enemies
{
    public class rEnemyAgent : ISerializable
    {
        public EnemyAgent agent;
        public int instanceID;

        public rEnemyAgent(EnemyAgent agent)
        {
            this.agent = agent;
            instanceID = agent.GetInstanceID();
        }

        public const int SizeOf = sizeof(int);
        private byte[] buffer = new byte[SizeOf];
        public void Serialize(FileStream fs)
        {
            int index = 0;
            BitHelper.WriteBytes(instanceID, buffer, ref index);
            fs.Write(buffer);
        }
    }

    public static partial class Enemy
    {
        public static rEB_States toRState(EB_States state)
        {
            switch (state)
            {
                case EB_States.Patrolling:
                case EB_States.Patrolling_Investigate:
                case EB_States.FollowingGroup:
                case EB_States.FollowingGroup_MoveToNode:
                    return rEB_States.Patrolling;
                case EB_States.InCombat:
                case EB_States.InCombat_MoveToPoint:
                case EB_States.InCombat_MoveToTarget:
                case EB_States.InCombat_MoveToNextNode:
                case EB_States.InCombat_MoveToNextNode_PathBlocked:
                case EB_States.InCombat_MoveToNextNode_PathOpen:
                case EB_States.InCombat_MoveToNextNode_DestroyDoor:
                case EB_States.InCombat_ChargedAttack:
                case EB_States.Incombat_GraphTraversal_Flyer:
                case EB_States.Incombat_FlyOutOfBoss_Flyer:
                case EB_States.InCombat_Dash:
                case EB_States.InCombat_HeldPlayer:
                case EB_States.InCombat_AfterHeldPlayer:
                case EB_States.InCombat_Consume:
                case EB_States.InCombat_SpitOut:
                case EB_States.InCombat_Stagger:
                case EB_States.SquidBoss_Hibernating:
                case EB_States.SquidBoss_Intro:
                case EB_States.SquidBoss_Combat:
                case EB_States.SquidBoss_Raging:
                case EB_States.SquidBoss_Spawning:
                case EB_States.SquidBoss_Cooldown:
                    return rEB_States.InCombat;
                default:
                    return rEB_States.Hibernating;
            }
        }
        public static rEB_States toRState(AgentMode state)
        {
            switch (state)
            {
                case AgentMode.Scout:
                case AgentMode.Patrolling:
                    return rEB_States.Patrolling;
                case AgentMode.Agressive:
                    return rEB_States.InCombat;
                default:
                    return rEB_States.Hibernating;
            }
        }
        public enum rEB_States
        {
            Hibernating,
            Patrolling,
            InCombat,
            StuckInGlue
        }

        public static rES_States toRState(ES_StateEnum state)
        {
            switch (state)
            {
                case ES_StateEnum.StuckInGlue:
                    return rES_States.StuckInGlue;
                default:
                    return rES_States.Default;
            }
        }
        public enum rES_States
        {
            Default,
            StuckInGlue
        }

        public struct EnemyState : ISerializable
        {
            private rEnemyAgent enemy;
            private byte state;

            public EnemyState(rEnemyAgent enemy, byte state)
            {
                this.enemy = enemy;
                this.state = state;
            }

            public const int SizeOf = sizeof(int) + 1;
            private byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs)
            {
                int index = 0;
                BitHelper.WriteBytes(enemy.instanceID, buffer, ref index);
                BitHelper.WriteBytes(state, buffer, ref index);
                fs.Write(buffer);
            }
        }

        public static void BehaviourStateChange(EnemyAgent enemy, rEB_States state)
        {
            int instance = enemy.GetInstanceID();
            if (enemies.ContainsKey(instance))
            {
                APILogger.Debug($"Enemy [{instance}] behaviour state changed to {state}");
                SnapshotManager.AddEvent(GameplayEvent.Type.EnemyBehaviourChangeState, new EnemyState(enemies[instance], (byte)state));
            }
            else APILogger.Error("Can't change state of enemy that was not tracked.");
        }

        public static void LocomotionStateChange(EnemyAgent enemy, rES_States state)
        {
            int instance = enemy.GetInstanceID();
            if (enemies.ContainsKey(instance))
            {
                APILogger.Debug($"Enemy [{instance}] locomotion state changed to {state}");
                SnapshotManager.AddEvent(GameplayEvent.Type.EnemyLocomotionChangeState, new EnemyState(enemies[instance], (byte)state));
            }
            else APILogger.Error("Can't change state of enemy that was not tracked.");
        }

        public struct SpawnEnemy : ISerializable
        {
            private rEnemyAgent enemy;
            private byte type;
            private rEB_States state;

            public SpawnEnemy(rEnemyAgent enemy, AgentMode mode)
            {
                this.enemy = enemy;
                state = toRState(mode);
                type = GTFOSpecification.GetEnemyType(enemy.agent.EnemyData.name);
            }

            public const int SizeOf = sizeof(int) + 2;
            private byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs)
            {
                int index = 0;
                BitHelper.WriteBytes(enemy.instanceID, buffer, ref index);
                BitHelper.WriteBytes((byte)state, buffer, ref index);
                BitHelper.WriteBytes((byte)type, buffer, ref index);
                fs.Write(buffer);
            }
        }

        public static Dictionary<int, rEnemyAgent> enemies = new Dictionary<int, rEnemyAgent>();
        public static void OnSpawnEnemy(EnemyAgent enemy, AgentMode mode)
        {
            rEnemyAgent rEnemy = new rEnemyAgent(enemy);
            enemies.Add(rEnemy.instanceID, rEnemy);

            APILogger.Debug($"[{rEnemy.instanceID}] was spawned ({enemy.EnemyData.name})");
            SnapshotManager.AddEvent(GameplayEvent.Type.SpawnEnemy, new SpawnEnemy(rEnemy, mode));
            SnapshotManager.AddDynamicObject(new SnapshotManager.DynamicObject(rEnemy.instanceID, new SnapshotManager.rAgent(enemy)));
        }
        public static void OnDespawnEnemy(EnemyAgent enemy)
        {
            int instanceID = enemy.GetInstanceID();
            if (!enemies.ContainsKey(instanceID)) return; // enemy may have been removed since it died
            rEnemyAgent rEnemy = enemies[instanceID];
            enemies.Remove(instanceID);

            APILogger.Debug($"[{rEnemy.instanceID}] was despawned");
            SnapshotManager.AddEvent(GameplayEvent.Type.DespawnEnemy, rEnemy);
            SnapshotManager.RemoveDynamicObject(instanceID);
        }
        public static void DeadEnemy(EnemyAgent enemy)
        {
            int instance = enemy.GetInstanceID();
            if (!enemies.ContainsKey(instance))
            {
                APILogger.Error($"Enemy {instance} was never spawned");
                return;
            }
            rEnemyAgent rEnemy = enemies[instance];
            enemies.Remove(instance);

            APILogger.Debug($"[{rEnemy.instanceID}] died, cleaning tongues...");
            Patches.EnemyTonguePatches.RemoveTongue(instance);

            SnapshotManager.AddEvent(GameplayEvent.Type.EnemyDead, rEnemy);
            SnapshotManager.RemoveDynamicObject(instance);
        }

        public static void Reset()
        {
            EnemyDetectionPatches.Reset();

            enemies.Clear();
            pellets.Clear();
            tongueOwners.Clear();
            tongues.Clear();
        }
    }
}
