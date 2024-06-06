using HarmonyLib;
using LevelGeneration;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;

namespace Vanilla.StaticItems {
    internal class rLadder {
        public readonly byte dimension;

        private LG_Ladder ladder;
        public Vector3 top {
            get => ladder.m_ladderTop;
        }
        public float height {
            get => ladder.m_height;
        }
        public Quaternion rotation {
            get => ladder.gameObject.transform.rotation;
        }

        public rLadder(byte dimension, LG_Ladder ladder) {
            this.dimension = dimension;
            this.ladder = ladder;
        }
    }

    [HarmonyPatch]
    [ReplayData("Vanilla.Map.Ladders", "0.0.1")]
    internal class rLadders : ReplayHeader {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(LG_BuildLadderAIGNodeJob), nameof(LG_BuildLadderAIGNodeJob.Build))]
            [HarmonyPostfix]
            private static void Ladder_OnBuild(LG_BuildLadderAIGNodeJob __instance) {
                LG_Ladder ladder = __instance.m_ladder;
                if (ladder.m_enemyClimbingOnly) return;

                rLadders.ladders.Add(new rLadder((byte)__instance.m_dimensionIndex, ladder));
            }
        }

        [ReplayOnElevatorStop]
        private static void Trigger() {
            Replay.Trigger(new rLadders());
        }

        [ReplayInit]
        private static void Init() {
            ladders.Clear();
        }

        internal static List<rLadder> ladders = new List<rLadder>();

        public override void Write(ByteBuffer buffer) {
            // TODO(randomuserhi): Throw error on too many ladders
            BitHelper.WriteBytes((ushort)ladders.Count, buffer);

            foreach (rLadder ladder in ladders) {
                BitHelper.WriteBytes(ladder.dimension, buffer);
                BitHelper.WriteBytes(ladder.top, buffer);
                BitHelper.WriteHalf(ladder.rotation, buffer);
                BitHelper.WriteHalf(ladder.height, buffer);
            }
            ladders.Clear();
        }
    }
}
