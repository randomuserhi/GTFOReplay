﻿using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.BepInEx;
using ReplayRecorder.Snapshot;

namespace ReplayRecorder.Core {
    [ReplayData("ReplayRecorder.EndOfHeader", "0.0.1")]
    internal class EndOfHeader : ReplayEvent {
        public override void Write(FileStream fs) {
            BitHelper.WriteBytes(SnapshotManager.types[typeof(EndOfHeader)], fs);
        }
    }

    [ReplayData("ReplayRecorder.Header", "0.0.1")]
    internal class HeaderData : ReplayHeader {
        [ReplayInit]
        private static void Init() {
            Replay.Trigger(new HeaderData());
        }

        public override void Write(FileStream fs) {
            BitHelper.WriteBytes(Module.Version, fs);
            BitHelper.WriteBytes(SNetwork.SNet.IsMaster ? (byte)1 : (byte)0, fs);
        }
    }
}