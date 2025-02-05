using HarmonyLib;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;

namespace Vanilla.StatTracker {
    [ReplayData("Vanilla.Accuracy", "0.0.1")]
    internal class rAccuracy : ReplayEvent {
        public byte slot;
        public Identifier gear;

        public byte hit;
        public byte crit;
        public byte total;

        public rAccuracy(int slot, Identifier gear, int hit, int crit, int total) {
            this.slot = (byte)slot;
            this.gear = gear;

            this.hit = (byte)hit;
            this.crit = (byte)crit;
            this.total = (byte)total;
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(slot, buffer);
            BitHelper.WriteBytes(gear, buffer);

            BitHelper.WriteBytes(hit, buffer);
            BitHelper.WriteBytes(crit, buffer);
            BitHelper.WriteBytes(total, buffer);
        }
    }

    // - Patch local receiveBullet damage
    // - Check player matches local
    // - Hits + 1 per call to receive bullet damage
    // - Crit + 1 per call with weak point
    //
    // - Patch local shotgunfire and bulletfire
    // - Total + num bullets fired per shotgunfire or bulletfire call
    //
    // - For guns with penetration count hit if atleast 1 enemy is hit
    // - count crit if any of those hits was to weak point
    //
    // - Send the delta (change in hit,crit,total) each tick as an event and broadcast (if there were any changes)
    // - for a given player+weapon combo
    //
    // - TODO: Make sure to support bots with same logic
    //   - For this reason tracking needs to support multiple players although only the local player needs tracking

    [HarmonyPatch]
    internal static class AccuracyManager {
        private class AccuracyPlayerData {
            private Dictionary<ushort, AccuracyGearData> gears = new Dictionary<ushort, AccuracyGearData>();
        }

        private class AccuracyGearData {
            public Identifier gear;
            public uint hit;
            public uint crit;
            public uint total;
        }

        private static Dictionary<long, AccuracyPlayerData> players = new Dictionary<long, AccuracyPlayerData>();

        [HarmonyPatch]
        private static class Patches {

        }

        [ReplayInit]
        private static void Init() {
        }

        [ReplayTick]
        private static void Tick() {

        }
    }
}
