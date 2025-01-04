using API;
using BepInEx;
using BepInEx.Unity.IL2CPP;
using DanosStatTracker.Data;
using HarmonyLib;
using ReplayRecorder;
using ReplayRecorder.API.Attributes;
using SNetwork;
using System.Text.Json;

namespace DanosStatTracker.BepInEx;

[BepInPlugin(Module.GUID, Module.Name, Module.Version)]
[BepInDependency(ReplayRecorder.BepInEx.Module.GUID, BepInDependency.DependencyFlags.HardDependency)]
[BepInDependency("danos.GTFOStats", BepInDependency.DependencyFlags.SoftDependency)]
public class Plugin : BasePlugin {
    public override void Load() {
        APILogger.Log("Plugin is loaded!");
        harmony = new Harmony(Module.GUID);
        harmony.PatchAll();

        APILogger.Log("Debug is " + (ConfigManager.Debug ? "Enabled" : "Disabled"));

        if (ConfigManager.Enable) {
            if (IL2CPPChainloader.Instance.Plugins.TryGetValue("danos.GTFOStats", out _)) {
                APILogger.Debug("Danos-GTFOStats is installed, GTFOReplay will provide additional data.");

                GTFOStats.Data.DanosStaticStore.RegisterJsonContributor(GenerateReplayJson);

                Replay.RegisterAll();
            }
        }
    }

    [ReplayOnElevatorStop]
    private static void OnElevatorStop() {
        DanosRunDownDataStore currentRunDownDataStore = new DanosRunDownDataStore();
        currentRunDownDataStore.replayData.isMaster = SNet.IsMaster;

        DanosStaticStore.currentRunDownDataStore = currentRunDownDataStore;

        APILogger.Debug("DanosStaticStore Created.");
    }

    private static bool isMaster = false;
    private static string GenerateReplayJson() {
        try {
            if (DanosStaticStore.currentRunDownDataStore == null) {
                APILogger.Error($"Unable to generate Danos JSON, datastore was null.");
                return string.Empty;
            }

            var options = new JsonSerializerOptions {
                WriteIndented = true,
                Converters = { new OneDecimalJsonConverter() }
            };

            if (!DanosStaticStore.currentRunDownDataStore.replayData.isMaster) {
                DanosStaticStore.currentRunDownDataStore.replayData.masterStats = null!;
            }

            return JsonSerializer.Serialize(DanosStaticStore.currentRunDownDataStore, options);
        } catch (Exception ex) {
            APILogger.Error($"Error generating replay data JSON: {ex.Message}");
            return string.Empty;
        }
    }

    private static Harmony? harmony;
}