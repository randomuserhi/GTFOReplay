using GameData;
using HarmonyLib;
using LevelGeneration;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;

namespace Vanilla.Objectives {
    [ReplayData("Vanilla.Objectives.Reactor", "0.0.1")]
    internal class rReactor : ReplayDynamic {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(LG_WardenObjective_Reactor), nameof(LG_WardenObjective_Reactor.OnBuildDone))]
            [HarmonyPostfix]
            private static void Postfix_OnBuildDone(LG_WardenObjective_Reactor __instance) {
                if (!__instance.m_isWardenObjective) return;

                Replay.Spawn(new rReactor(__instance));
            }
        }

        public override bool Active => core != null;
        public override bool IsDirty =>
            core.m_currentWaveData != null &&
            (status != _status ||
            wave != _wave ||
            waveDuration != _waveDuration ||
            waveProgress != _waveProgress);

        private LG_WardenObjective_Reactor core;

        public rReactor(LG_WardenObjective_Reactor core) : base(core.m_stateReplicator.Replicator.Key) {
            this.core = core;
            var reactorWaves = WardenObjectiveManager.Current.m_activeWardenObjectives[core.OriginLayer].ReactorWaves;
            terminalSerials = new ushort[reactorWaves.Count];
            for (int i = 0; i < terminalSerials.Length; i++) {
                ReactorWaveData data = reactorWaves[i];

                if (data.HasVerificationTerminal && ushort.TryParse(data.VerificationTerminalSerial.Trim().ToUpper().Replace("TERMINAL_", ""), out ushort serial)) {
                    terminalSerials[i] = serial;
                } else {
                    terminalSerials[i] = ushort.MaxValue;
                }
            }
        }

        private ushort[] terminalSerials;
        private byte _status => (byte)core.m_currentState.status;
        private byte status = 0;
        private byte _wave => (byte)(core.m_currentWaveCount - 1);
        private byte wave = 0;
        private float _waveDuration => core.m_currentDuration;
        private float waveDuration = 0;
        private byte _waveProgress => (byte)(byte.MaxValue * Mathf.Clamp01(core.m_currentWaveProgress));
        private byte waveProgress = 0;

        public override void Write(ByteBuffer buffer) {
            status = _status;
            wave = _wave;
            waveDuration = _waveDuration;
            waveProgress = _waveProgress;

            BitHelper.WriteBytes(status, buffer);
            BitHelper.WriteBytes(wave, buffer);
            BitHelper.WriteHalf(waveDuration, buffer);
            BitHelper.WriteBytes(waveProgress, buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            BitHelper.WriteBytes((ushort)core.m_serialNumber, buffer);
            BitHelper.WriteBytes((byte)core.OriginLayer, buffer);
            BitHelper.WriteBytes(core.m_terminal.GetInstanceID(), buffer);
            BitHelper.WriteBytes((byte)core.m_waveCountMax, buffer);
            // TODO(randomuserhi): Throw error if m_overrideCodes.length != m_waveCountMax && terminalSerials.length != m_waveCountMax
            for (int i = 0; i < core.m_waveCountMax; ++i) {
                BitHelper.WriteBytes(terminalSerials[i], buffer);
                BitHelper.WriteBytes(core.m_overrideCodes[i], buffer);
            }
        }
    }
}
