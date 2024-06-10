using HarmonyLib;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using UnityEngine;

namespace Vanilla.Enemy {
    [ReplayData("Vanilla.Enemy.Spitters.State", "0.0.1")]
    internal class rSpitter : ReplayDynamic {
        public Vector3 position;
        public Quaternion rotation;
        public byte dimension;
        public float scale;

        private InfectionSpitter spitter;

        public rSpitter(InfectionSpitter spitter) : base(spitter.m_spitterIndex) {
            this.spitter = spitter;
            position = spitter.transform.position;
            rotation = spitter.transform.rotation;
            dimension = (byte)spitter.m_courseNode.m_dimension.DimensionIndex;
            scale = spitter.transform.localScale.x;
        }

        public override bool Active => spitter != null;
        public override bool IsDirty => _state != state;

        private InfectionSpitter.eSpitterState state => spitter.m_currentState;
        private InfectionSpitter.eSpitterState _state = InfectionSpitter.eSpitterState.Frozen;

        public override void Write(ByteBuffer buffer) {
            _state = state;
            BitHelper.WriteBytes((byte)_state, buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
        }
    }

    [ReplayData("Vanilla.Enemy.Spitter.Explode", "0.0.1")]
    internal class rSpitterExplode : Id {
        public rSpitterExplode(int id) : base(id) {
        }
    }

    [HarmonyPatch]
    [ReplayData("Vanilla.Enemy.Spitters", "0.0.1")]
    internal class rSpitters : ReplayHeader {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(InfectionSpitter), nameof(InfectionSpitter.AssignCourseNode))]
            [HarmonyPostfix]
            private static void Postfix_Setup(InfectionSpitter __instance) {
                spitters.Add(__instance.m_spitterIndex, new rSpitter(__instance));
            }

            [HarmonyPatch(typeof(InfectionSpitter), nameof(InfectionSpitter.DoExplode))]
            [HarmonyPostfix]
            private static void Postfix_Explode(InfectionSpitter __instance) {
                Replay.Trigger(new rSpitterExplode(__instance.m_spitterIndex));
            }
        }

        [ReplayOnElevatorStop]
        private static void Init() {
            Replay.Trigger(new rSpitters());
            foreach (rSpitter spitter in spitters.Values) {
                Replay.Spawn(spitter);
            }
            spitters.Clear();
        }

        private static Dictionary<ushort, rSpitter> spitters = new Dictionary<ushort, rSpitter>();

        public override void Write(ByteBuffer buffer) {
            // TODO(randomuserhi): Error handling on spitter count
            BitHelper.WriteBytes((ushort)spitters.Count, buffer);
            foreach (rSpitter spitter in spitters.Values) {
                BitHelper.WriteBytes(spitter.id, buffer);
                BitHelper.WriteBytes(spitter.dimension, buffer);
                BitHelper.WriteBytes(spitter.position, buffer);
                BitHelper.WriteHalf(spitter.rotation, buffer);
                BitHelper.WriteHalf(spitter.scale, buffer);
            }
        }
    }
}
