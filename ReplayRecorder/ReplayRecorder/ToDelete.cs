using Agents;
using API;
using Enemies;
using HarmonyLib;
using Player;
using SNetwork;
using UnityEngine;

namespace ReplayRecorder {
    [HarmonyPatch]
    public class EnemyController : MonoBehaviour {
        [HarmonyPatch]
        internal static class Patches {
            public static bool DontRecurse = false;

            [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnSpawn))]
            [HarmonyPostfix]
            private static void Postfix_OnSpawn(EnemySync __instance, pEnemySpawnData spawnData) {
                if (!SNet.IsMaster) return;

                // Dont allow control of snatcher / fliers
                //
                // snatchers can't spit out players after control
                // fliers just cant be controlled with current logic

                EnemyAgent agent = __instance.m_agent;

                // No controlling pouncers - they are broken
                if (agent.GetComponent<PouncerBehaviour>() != null) return;

                EnemyController controller = agent.gameObject.AddComponent<EnemyController>();
                controller.AssignAgent(agent);
            }

            // Update controllers matching the update rate of behaviour states.
            //
            // This is because updating navmesh targets needs to be ran at a slower rate
            // otherwise enemies get stuck.
            // 
            // In game, the update rate is 5 times per second, controlled by EnemyBehaviour.m_updatebehaviour.
            [HarmonyPatch(typeof(EnemyBehaviour), nameof(EnemyBehaviour.UpdateState))]
            [HarmonyPrefix]
            private static void Prefix_UpdateState(EnemyBehaviour __instance) {
                if (DontRecurse) return;
                if (__instance.m_updatebehaviour >= Clock.Time || !controllers.TryGetValue(__instance.m_ai.m_enemyAgent.GlobalID, out var controller)) return;

                controller.UpdateBehaviour();
            }

            [HarmonyPatch(typeof(EB_InCombat_MoveToPoint), nameof(EB_InCombat_MoveToPoint.UpdateBehaviour))]
            [HarmonyPrefix]
            private static bool Prefix_UpdateBehaviour(EB_InCombat_MoveToPoint __instance) {
                return DisableWhenControlledPatch(__instance.m_ai);
            }

            [HarmonyPatch(typeof(EB_InCombat_MoveToPoint_Flyer), nameof(EB_InCombat_MoveToPoint_Flyer.UpdateBehaviour))]
            [HarmonyPrefix]
            private static bool Prefix_FlyerUpdateBehaviour(EB_InCombat_MoveToPoint_Flyer __instance) {
                return DisableWhenControlledPatch(__instance.m_ai);
            }

            private static bool DisableWhenControlledPatch(EnemyAI ai) {
                if (!SNet.IsMaster) return true;
                if (!controllers.TryGetValue(ai.m_enemyAgent.GlobalID, out var controller) || !controller.IsControlled) return true;

                // Only disable behaviour updates if type is not attack
                return controller.commandBuffer.Peek().type == Command.Type.Attack;
            }

            [HarmonyPatch(typeof(EB_InCombat), nameof(EB_InCombat.TryAttacks))]
            [HarmonyPrefix]
            private static bool Prefix_TryAttacks(EB_InCombat __instance, ref bool __result) {
                if (!SNet.IsMaster) return true;
                EnemyAI ai = __instance.m_ai;
                if (!controllers.TryGetValue(ai.m_enemyAgent.GlobalID, out var controller) || !controller.IsControlled) return true;

                if (controller.commandBuffer.Peek().type == Command.Type.Attack) {
                    // Allow attacks
                    return true;
                } else {
                    // Disable attacks for other commands
                    __result = false;
                    return false;
                }
            }
            [HarmonyPatch(typeof(EB_InCombat), nameof(EB_InCombat.TryStrafe))]
            [HarmonyPrefix]
            private static bool Prefix_TryStrafe(EB_InCombat __instance, ref bool __result) {
                if (!SNet.IsMaster) return true;
                EnemyAI ai = __instance.m_ai;
                if (!controllers.TryGetValue(ai.m_enemyAgent.GlobalID, out var controller) || !controller.IsControlled) return true;

                if (controller.commandBuffer.Peek().type == Command.Type.Attack) {
                    if ((ai.Abilities.HasAbility(AgentAbility.Melee) && !ai.Abilities.IsAbilityReady(AgentAbility.Melee)) ||
                        (ai.Abilities.HasAbility(AgentAbility.Ranged) && !ai.Abilities.IsAbilityReady(AgentAbility.Ranged))) {
                        // Allow strafing if abilities are on cooldown
                        return true;
                    }
                    // No strafing if abilities are not on cooldown
                    __result = false;
                    return false;
                } else {
                    // Disable strafing completely for other commands
                    __result = false;
                    return false;
                }
            }
            [HarmonyPatch(typeof(EB_InCombat), nameof(EB_InCombat.TryScream))]
            [HarmonyPrefix]
            private static bool Prefix_TryScream(EB_InCombat __instance, ref bool __result) {
                if (!SNet.IsMaster) return true;
                EnemyAI ai = __instance.m_ai;
                if (!controllers.TryGetValue(ai.m_enemyAgent.GlobalID, out var controller) || !controller.IsControlled) return true;

                // Do not allow screams if under control
                __result = false;
                return false;
            }

            /*[HarmonyPatch(typeof(EB_InCombatFlyer), nameof(EB_InCombatFlyer.TryAttacks))]
            [HarmonyPrefix]
            private static bool Prefix_FlyerTryAttacks(EB_InCombat __instance, ref bool __result) {
                return InCombatPatch(__instance.m_ai, ref __result);
            }*/
        }

        // List of all controllers, mapped by globalid.
        public static Dictionary<int, EnemyController> controllers = new Dictionary<int, EnemyController>();

        private int globalId;

#pragma warning disable CS8618 
        private EnemyAgent agent;
        private EnemyAI ai;
        private EnemyLocomotion locomotion;
        private EnemyBehaviour behaviour;
        private EnemyBehaviourData behaviourData;
#pragma warning restore CS8618

        public class Command {
            public enum Type {
                Move,
                Attack
            }

            public Type type;

            public PlayerAgent? target = null;

            public Vector3 position;
            public Vector3 destination;

            public Command(Vector3 pos) {
                type = Type.Move;
                position = pos;
                destination = pos;
            }

            public Command(PlayerAgent target) {
                type = Type.Attack;
                this.target = target;
            }
        }

        // TODO(randomuserhi): Support other commands - right now only a buffer of movement commands
        public Queue<Command> commandBuffer = new Queue<Command>();

        // Setup controller
        public void AssignAgent(EnemyAgent agent) {
            this.agent = agent;
            globalId = this.agent.GlobalID;
            locomotion = agent.Locomotion;
            ai = agent.AI;
            behaviour = ai.m_behaviour;
            behaviourData = ai.m_behaviourData;
            controllers.Add(globalId, this);
        }

        // Destruct controller
        private void OnDestroy() {
            controllers.Remove(globalId);
        }

        // Test methods
        public void AddPosition(Vector3 pos) {
            commandBuffer.Enqueue(new Command(pos));
        }

        public void AddTarget(PlayerAgent target) {
            commandBuffer.Enqueue(new Command(target));
        }

        public void ClearCommands() {
            if (commandBuffer.Count > 0) {
                commandBuffer.Clear();

                // Important or enemy may freeze waiting for advance timer
                behaviourData.m_advanceTimer = 0.0f;

                // Important or enemy might not be in the right state
                Patches.DontRecurse = true;
                behaviour.ChangeState(EB_States.InCombat);
                Patches.DontRecurse = false;
            }
        }

        // NavMesh.SamplePosition(target, out hit, float.PositiveInfinity, 1)

        // Is enemy under manual controll?
        public bool IsControlled => agent.m_alive && commandBuffer.Count > 0;

        public void UpdateBehaviour() {
            if (!IsControlled) return;

            // Perform move command
            Command command = commandBuffer.Peek();

            switch (command.type) {
            case Command.Type.Move:
                MoveCommand(command);
                break;
            case Command.Type.Attack:
                AttackCommand(command);
                break;
            }
        }

        private void AttackCommand(Command command) {
            // Set agent to aggressive
            if (ai.Mode != AgentMode.Agressive) {
                ai.Mode = AgentMode.Agressive;
                ai.ModeChange();
            }

            // Awake enemy if asleep
            EB_Hibernating? state = behaviour.m_currentState.TryCast<EB_Hibernating>();
            if (state != null) {
                locomotion.ChangeState(ES_StateEnum.PathMove);

                Patches.DontRecurse = true;
                behaviour.ChangeState(EB_States.InCombat);
                Patches.DontRecurse = false;
            }

            // Always advance towards player
            behaviourData.m_advanceTimer = 0.0f;

            if (command.target == null) return;

            // Set target
            if (ai.m_target == null || ai.m_target.m_agent == null || ai.m_target.m_agent.GlobalID != command.target.GlobalID) {
                ai.SetTarget(command.target);
            }

            // Dequeue command if they are dead
            if (!command.target.Alive) {
                commandBuffer.Dequeue();
                APILogger.Debug("Target dead!");
            }
        }

        private void MoveCommand(Command command) {
            // Allow hitreact and ladders
            switch (locomotion.CurrentStateEnum) {
            case ES_StateEnum.Hitreact:
            case ES_StateEnum.HitReactFlyer:
            case ES_StateEnum.FloaterHitReact:
            case ES_StateEnum.ClimbLadder:
            case ES_StateEnum.Jump:
                return;
            }

            // Set agent to aggressive
            if (ai.Mode != AgentMode.Agressive) {
                ai.Mode = AgentMode.Agressive;
                ai.ModeChange();
            }

            if (ai.m_target == null || !ai.m_target.m_hasLineOfSight) {
                ai.m_enemyAgent.TargetLookDir = (command.destination - ai.transform.position).normalized;
            } else {
                ai.m_enemyAgent.TargetLookDir = ai.m_target.m_dir;
            }

            // Set state to move to goal
            if (locomotion.CurrentStateEnum != ES_StateEnum.PathMove) {
                locomotion.ChangeState(ES_StateEnum.PathMove);
            }
            EB_InCombat_MoveToPoint? state = behaviour.m_currentState.TryCast<EB_InCombat_MoveToPoint>();
            if (state == null) {
                Patches.DontRecurse = true;
                behaviour.ChangeState(EB_States.InCombat);
                behaviour.m_updatebehaviour = 0;
                behaviour.UpdateState();

                behaviour.ChangeState(EB_States.InCombat_MoveToTarget);
                behaviour.m_updatebehaviour = 0;
                behaviour.UpdateState();

                behaviour.ChangeState(EB_States.InCombat_MoveToPoint);
                Patches.DontRecurse = false;
            }

            // Set pathing goal
            if (ai.m_navMeshAgent.isOnNavMesh) {

                // if enemy and destination are on the same course node
                ai.m_navMeshAgent.destination = command.position;
                command.destination = ai.m_navMeshAgent.destination;

                // TODO(randomuserhi): Handle when enemy is not in same course node / path is blocked
                //                     needs to path to nearest location within course node etc...
                //                     Refer to in-game methods that handle this sort of thing
                //                     EB_InCombat_MoveToNextNode etc...
                //
                //                     I essentially have to write this behaviour manually as the existing
                //                     coursenode navigation stuff won't work for this
            }

            // TODO(randomuserhi)
            // Dequeue move action if close enough
            /*if ((agent.transform.position - target.destination).sqrMagnitude < 4) {
                commandBuffer.Dequeue();
                APILogger.Debug("Destination reached!");
            }*/
        }
    }
}
