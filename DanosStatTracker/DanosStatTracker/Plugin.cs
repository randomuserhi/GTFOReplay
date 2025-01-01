using API;
using BepInEx;
using BepInEx.Unity.IL2CPP;
using DanosStatTracker.Data;
using HarmonyLib;
using Player;
using ReplayRecorder;
using ReplayRecorder.API.Attributes;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using UnityEngine;

namespace DanosStatTracker.BepInEx;

[BepInPlugin(Module.GUID, Module.Name, Module.Version)]
public class Plugin : BasePlugin {
    public override void Load() {
        APILogger.Log("Plugin is loaded!");
        harmony = new Harmony(Module.GUID);
        harmony.PatchAll();

        APILogger.Log("Debug is " + (ConfigManager.Debug ? "Enabled" : "Disabled"));

        if (ConfigManager.Enable) {
            Replay.RegisterAll();
        }
    }

    [ReplayOnElevatorStop]
    private static void OnElevatorStop() {
        pActiveExpedition expdata = RundownManager.GetActiveExpeditionData();
        if ((expdata.tier == eRundownTier.TierA) && (expdata.expeditionIndex == 0)) { }

        var rundownString = AchievementManager.GetCurrentRundownName().ToString();
        var expeditionTier = expdata.tier.ToString();
        var expeditionIndex = expdata.expeditionIndex.ToString();
        var sessionid = expdata.sessionGUID.m_data.ToString();

        DanosRunDownDataStore currentRunDownDataStore = new DanosRunDownDataStore {
            st = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
            rid = rundownString,
            en = expeditionTier,
            ei = expeditionIndex,
            rsg = sessionid,
            msid = (long)PlayerManager.GetLocalPlayerAgent().Owner.Lookup,
        };

        DanosStaticStore.currentRunDownDataStore = currentRunDownDataStore;
    }

    [ReplayOnExpeditionEnd]
    private static void OnExpeditionEnd() {
        try {
            if (DanosStaticStore.currentRunDownDataStore == null) {
                APILogger.Error("No rundown data store to export.");
                return;
            }
            var options = new JsonSerializerOptions {
                WriteIndented = true, // Optional, for readability
                Converters = { new OneDecimalJsonConverter() }
            };
            // Set the end timestamp
            DanosStaticStore.currentRunDownDataStore.et = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

            // Serialize to JSON
            string json = JsonSerializer.Serialize(DanosStaticStore.currentRunDownDataStore, options);

            // Write to file
            string filePath = Path.Combine(Application.persistentDataPath, "RunDownData.json");
            File.WriteAllText(filePath, json);

            APILogger.Debug($"Rundown data exported to {filePath}");

            // Post data to API but await it in a non async method
            PostDataToAPI(json).Wait();
        } catch (Exception ex) {
            APILogger.Error($"Error exporting rundown data: {ex.Message}");
        }
    }

    private static async Task PostDataToAPI(string json) {
        try {
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls13;

            using HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpContent content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync("https://gtfoapi.splitstats.io/api/rundown/upload", content);

            if (response.IsSuccessStatusCode) {
                APILogger.Debug("Data posted to API successfully.");
            } else {
                APILogger.Debug($"Error posting data to API: {response.StatusCode}");
            }
        } catch (Exception ex) {
            APILogger.Error($"Error posting data to API: {ex.Message}");
            if (ex.InnerException != null) {
                APILogger.Error($"Inner Exception: {ex.InnerException.Message}");
            }
        }
    }

    private static Harmony? harmony;
}