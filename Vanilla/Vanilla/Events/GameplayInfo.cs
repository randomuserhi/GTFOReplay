using ChainedPuzzles;
using HarmonyLib;
using LevelGeneration;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;

namespace Vanilla.Events {
    // Record game-provided text, rather than reconstructing objectives from expedition names.
    [ReplayData("Vanilla.Gameplay.Info", "0.0.1")]
    internal class rGameplayInfo : ReplayEvent {
        private readonly string channel, title, text;
        private readonly int id;
        private static readonly Dictionary<string, string> previous = new();
        private static readonly Dictionary<ushort, int> waves = new();
        private static readonly HashSet<int> usedTerminals = new();
        private static float nextSample;

        private rGameplayInfo(string channel, int id, string title, string text) {
            this.channel = channel; this.id = id; this.title = title; this.text = text;
        }

        internal static void Publish(string channel, int id, string title, string text, bool deduplicate = true) {
            if (!Replay.Active) return;
            title = Clean(title); text = Clean(text);
            string key = $"{channel}:{id}", value = title + "\n" + text;
            if (deduplicate && text.Length == 0 && !previous.ContainsKey(key)) return;
            if (deduplicate && previous.TryGetValue(key, out var old) && old == value) return;
            previous[key] = value;
            Replay.Trigger(new rGameplayInfo(channel, id, title, text));
        }

        private static string Clean(string? text) {
            text = System.Text.RegularExpressions.Regex.Replace(text ?? "", "<[^>]*>", "").Trim();
            return text.Length > 4096 ? text[..4096] : text;
        }

        [ReplayOnStartRecording]
        private static void Reset(string _) { previous.Clear(); waves.Clear(); usedTerminals.Clear(); nextSample = 0; }

        [ReplayTick]
        private static void SampleHUD() {
            if (!Replay.Active || Time.unscaledTime < nextSample) return;
            nextSample = Time.unscaledTime + .25f;
            var layer = GuiManager.PlayerLayer;
            if (layer == null) return;
            var objectives = layer.m_wardenObjective;
            if (objectives != null) {
                string current = "";
                if (objectives.m_progressionObjectives != null) foreach (var objective in objectives.m_progressionObjectives) {
                    if (objective == null) continue;
                    var lines = new[] { Clean(objective.m_header?.text), Clean(objective.m_text?.text) };
                    var text = string.Join("\n", lines.Where(line => line.Length > 0));
                    if (text.Length > 0) current = text;
                }
                Publish("Objective", 0, "Mission", current);
            }
            var timer = layer.m_objectiveTimer;
            Publish("Timer", 0, timer == null ? "" : timer.CurrentTimerTitle,
                timer?.m_timerText != null && timer.m_timerText.gameObject.activeInHierarchy ? timer.m_timerText.text : "");
            var intel = layer.m_wardenIntel?.m_intelText;
            Publish("Intel", 0, "Warden intel", intel != null && intel.gameObject.activeInHierarchy ? intel.text : "");
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(channel, buffer); BitHelper.WriteBytes(id, buffer);
            BitHelper.WriteBytes(title, buffer); BitHelper.WriteBytes(text, buffer);
        }

        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(ChainedPuzzleInstance), nameof(ChainedPuzzleInstance.OnStateChange))]
            [HarmonyPostfix]
            private static void Alarm(ChainedPuzzleInstance __instance) {
                if (__instance.Data == null || !__instance.Data.TriggerAlarmOnActivate) return;
                Publish("Alarm", __instance.GetInstanceID(), __instance.Data.PublicAlarmName,
                    __instance.IsActive && !__instance.IsSolved ? "Active" : "");
            }

            [HarmonyPatch(typeof(SurvivalWave), nameof(SurvivalWave.StartWave))]
            [HarmonyPostfix]
            private static void Wave(SurvivalWave __instance) {
                if (!Replay.Active) return;
                waves.TryGetValue(__instance.EventID, out int count);
                waves[__instance.EventID] = ++count;
                Publish("Wave", __instance.EventID, $"Enemy wave {count}", "Observed wave start", false);
            }

            [HarmonyPatch(typeof(SurvivalWave), nameof(SurvivalWave.StopEvent))]
            [HarmonyPostfix]
            private static void StopWave(SurvivalWave __instance) {
                Publish("Wave", __instance.EventID, "Wave event stopped", "");
                waves.Remove(__instance.EventID);
            }

            [HarmonyPatch(typeof(SurvivalWave), nameof(SurvivalWave.OnDespawn))]
            [HarmonyPostfix]
            private static void DespawnWave(SurvivalWave __instance) => StopWave(__instance);

            [HarmonyPatch(typeof(LG_ComputerTerminalCommandInterpreter), nameof(LG_ComputerTerminalCommandInterpreter.ReceiveCommand))]
            [HarmonyPrefix]
            private static void Command(LG_ComputerTerminalCommandInterpreter __instance, TERM_Command __0, string __1, string __2) {
                if (!Replay.Active || __instance.m_terminal == null) return;
                int id = __instance.m_terminal.m_serialNumber;
                usedTerminals.Add(id);
                Publish("Terminal", id, $"TERMINAL_{id}", $"> {__1}", false);
            }

            [HarmonyPatch(typeof(LG_ComputerTerminalCommandInterpreter), nameof(LG_ComputerTerminalCommandInterpreter.AddOutput),
                new System.Type[] { typeof(TerminalLineType), typeof(string), typeof(float), typeof(TerminalSoundType), typeof(TerminalSoundType) })]
            [HarmonyPostfix]
            private static void Output(LG_ComputerTerminalCommandInterpreter __instance, string __1) {
                if (__instance.m_terminal == null) return;
                int id = __instance.m_terminal.m_serialNumber;
                if (usedTerminals.Contains(id) && !string.IsNullOrWhiteSpace(__1)) Publish("Terminal", id, $"TERMINAL_{id}", __1, false);
            }
        }
    }
}
