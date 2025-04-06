using HarmonyLib;
using LevelGeneration;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;

namespace Vanilla.Events {
    [ReplayData("Vanilla.Pings", "0.0.1")]
    [HarmonyPatch]
    public class rPing : ReplayDynamic {
        public class rNavMarker {
            public int instance;
            public SyncedNavMarkerWrapper sync;
            public NavMarker marker;
            public eNavMarkerStyle style = eNavMarkerStyle.TerminalPing;

            public rNavMarker(SyncedNavMarkerWrapper sync) {
                this.sync = sync;
                marker = sync.m_marker;
                instance = marker.GetInstanceID();
            }
        }

        [HarmonyPatch]
        private static class Patches {
            public static Dictionary<int, rNavMarker> navMarkers = new Dictionary<int, rNavMarker>();

            [HarmonyPatch(typeof(SyncedNavMarkerWrapper), nameof(SyncedNavMarkerWrapper.Setup))]
            [HarmonyPostfix]
            private static void Postfix_Setup(SyncedNavMarkerWrapper __instance) {
                navMarkers.Add(__instance.m_marker.GetInstanceID(), new rNavMarker(__instance));
            }

            [HarmonyPatch(typeof(NavMarker), nameof(NavMarker.SetStyle))]
            [HarmonyPostfix]
            private static void Postfix_Setup(NavMarker __instance, eNavMarkerStyle style) {
                int instance = __instance.GetInstanceID();
                if (navMarkers.ContainsKey(instance)) navMarkers[instance].style = style;
            }

            [ReplayOnHeaderCompletion]
            private static void Init() {
                foreach (var navMarker in navMarkers.Values) {
                    Replay.Spawn(new rPing(navMarker));
                }
            }
        }
        public override bool Active => navMarker != null;

        public override bool IsDirty => _dimension != dimension || _position != position || _visible != visible || _style != style;

        private bool visible => navMarker.marker.IsVisible;
        private eNavMarkerStyle style => navMarker.style;
        private Vector3 position => navMarker.sync.transform.position;
        private byte dimension => (byte)Dimension.GetDimensionFromPos(position).DimensionIndex;

        private bool _visible;
        private eNavMarkerStyle _style;
        private Vector3 _position;
        private byte _dimension;

        private rNavMarker navMarker;

        public rPing(rNavMarker navMarker) : base(navMarker.marker.GetInstanceID()) {
            this.navMarker = navMarker;
        }

        public override void Write(ByteBuffer buffer) {
            _visible = visible;
            _style = style;
            _position = position;
            _dimension = dimension;

            BitHelper.WriteBytes(_dimension, buffer);
            BitHelper.WriteBytes(_position, buffer);
            BitHelper.WriteBytes(_visible, buffer);
            BitHelper.WriteBytes((byte)_style, buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            BitHelper.WriteBytes((byte)(navMarker.sync.m_playerIndex < 0 ? byte.MaxValue : navMarker.sync.m_playerIndex), buffer);
            Write(buffer);
        }
    }
}
