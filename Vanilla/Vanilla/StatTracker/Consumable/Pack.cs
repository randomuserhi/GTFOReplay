using Agents;
using API;
using GameData;
using Gear;
using HarmonyLib;
using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.SNetUtils;
using SNetwork;
using UnityEngine;

namespace Vanilla.StatTracker.Consumable {
    [HarmonyPatch]
    [ReplayData("Vanilla.StatTracker.Pack", "0.0.1")]
    public class rPack : ReplayEvent {
        [HarmonyPatch]
        private class Patches {
            private static PlayerAgent? sourcePackUser = null;

            [HarmonyPatch(typeof(ResourcePackFirstPerson), nameof(ResourcePackFirstPerson.ApplyPackBot))]
            [HarmonyPrefix]
            public static void ApplyPackBot(PlayerAgent ownerAgent, PlayerAgent receiverAgent, ItemEquippable resourceItem) {
                if (!SNet.IsMaster) return;

                switch (resourceItem.ItemDataBlock.persistentID) {
                case 102u: // medi
                case 101u: // ammo
                case 127u: // tool
                case 132u: // disinfect
                    sourcePackUser = ownerAgent;
                    break;
                }
            }

            [HarmonyPatch(typeof(ResourcePackFirstPerson), nameof(ResourcePackFirstPerson.ApplyPack))]
            [HarmonyPrefix]
            public static void ApplyPackFirstPerson(ResourcePackFirstPerson __instance) {
                if (!SNet.IsMaster) return;

                switch (__instance.m_packType) {
                case eResourceContainerSpawnType.AmmoWeapon:
                case eResourceContainerSpawnType.AmmoTool:
                case eResourceContainerSpawnType.Health:
                case eResourceContainerSpawnType.Disinfection:
                    sourcePackUser = __instance.Owner;
                    break;
                }
            }

            // TODO(randomuserhi): Check last equipped healing item or something...
            [HarmonyPatch(typeof(Dam_PlayerDamageBase), nameof(Dam_PlayerDamageBase.ReceiveAddHealth))]
            [HarmonyPrefix]
            public static void Postfix_ReceiveAddHealth(Dam_PlayerDamageBase __instance, pAddHealthData data) {
                if (!SNet.IsMaster) return;

                float gain = data.health.Get(__instance.HealthMax);
                float healing = Mathf.Min(__instance.Health + gain, __instance.HealthMax) - __instance.Health;
                if (healing > 0) {
                    Agent? source;
                    if (sourcePackUser == null)
                        data.source.TryGet(out source);
                    else
                        source = sourcePackUser;

                    if (source != null) {
                        PlayerAgent? player = source.TryCast<PlayerAgent>();
                        if (player != null) {
                            APILogger.Debug($"Player {player.Owner.NickName} used healing item on {__instance.Owner.Owner.NickName}.");
                            Sync.Trigger(new rPack(rPack.Type.HealingItem, source, __instance.Owner));
                        }
                    }
                }

                sourcePackUser = null;
            }

            [HarmonyPatch(typeof(PlayerBackpackManager), nameof(PlayerBackpackManager.ReceiveAmmoGive))]
            [HarmonyPostfix]
            public static void ReceiveAmmoGive(PlayerBackpackManager __instance, pAmmoGive data) {
                if (!SNet.IsMaster) return;

                SNet_Player player;
                if (data.targetPlayer.TryGetPlayer(out player)) {
                    PlayerDataBlock block = GameDataBlockBase<PlayerDataBlock>.GetBlock(1u);
                    float standardAmount = data.ammoStandardRel * (float)block.AmmoStandardResourcePackMaxCap;
                    float specialAmount = data.ammoSpecialRel * (float)block.AmmoSpecialResourcePackMaxCap;

                    rPack.Type type;
                    if (standardAmount > 0 && specialAmount > 0) {
                        type = rPack.Type.Ammo;
                    } else {
                        type = rPack.Type.Tool;
                    }

                    PlayerAgent target = player.PlayerAgent.Cast<PlayerAgent>();
                    if (sourcePackUser != null) {
                        APILogger.Debug($"Player {sourcePackUser.Owner.NickName} used {type} on {target.Owner.NickName}.");
                        Sync.Trigger(new rPack(type, sourcePackUser, target));
                    } else if (SNetUtils.TryGetSender(__instance.m_giveAmmoPacket.m_packet, out SNet_Player? sender)) {
                        APILogger.Debug($"Player {sender.NickName} used {type} on {target.Owner.NickName}.");
                        Sync.Trigger(new rPack(type, sender.PlayerAgent.Cast<PlayerAgent>(), target));
                    } else {
                        APILogger.Debug($"Player {target.Owner.NickName} used {type}.");
                        Sync.Trigger(new rPack(type, target, target));
                    }
                }

                sourcePackUser = null;
            }

            // TODO(randomuserhi): Test if TryGetLastSender solution actually works
            // NOTE(randomuserhi): It doesnt fucking work :(
            [HarmonyPatch(typeof(Dam_PlayerDamageBase), nameof(Dam_PlayerDamageBase.ModifyInfection))]
            [HarmonyPostfix]
            public static void ModifyInfection(Dam_PlayerDamageBase __instance, pInfection data, bool sync, bool updatePageMap) {
                if (!SNet.IsMaster) return;

                if (data.effect == pInfectionEffect.DisinfectionPack) {
                    PlayerAgent target = __instance.Owner;
                    if (sourcePackUser != null) {
                        APILogger.Debug($"Player {sourcePackUser.Owner.NickName} used disinfect pack on {target.Owner.NickName}.");
                        Sync.Trigger(new rPack(Type.Disinfect, sourcePackUser, target));
                    } else if (SNetUtils.TryGetSender(__instance.m_receiveModifyInfectionPacket, out SNet_Player? sender)) {
                        APILogger.Debug($"Player {sender.NickName} used disinfect pack on {target.Owner.NickName}.");
                        Sync.Trigger(new rPack(Type.Disinfect, sender.PlayerAgent.Cast<PlayerAgent>(), target));
                    } else {
                        APILogger.Debug($"Player {target.Owner.NickName} used disinfect pack.");
                        Sync.Trigger(new rPack(Type.Disinfect, target, target));
                    }
                }

                sourcePackUser = null;
            }
        }

        public enum Type {
            Ammo,
            Tool,
            HealingItem,
            Disinfect
        }

        public Type type;

        public ushort source;
        public ushort target;

        public rPack(Type type, Agent source, Agent target) {
            this.type = type;
            this.source = source.GlobalID;
            this.target = target.GlobalID;
        }

        public rPack(Type type, ushort source, ushort target) {
            this.type = type;
            this.source = source;
            this.target = target;
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes((byte)type, buffer);
            BitHelper.WriteBytes(source, buffer);
            BitHelper.WriteBytes(target, buffer);
        }

        private static class Sync {
            const string eventName = "Vanilla.StatTracker.Pack";

            [ReplayPluginLoad]
            private static void Load() {
                RNet.Register(eventName, OnReceive);
            }

            private static ByteBuffer packet = new ByteBuffer();

            public static void Trigger(rPack pack) {
                Replay.Trigger(pack);

                ByteBuffer packet = Sync.packet;
                packet.Clear();

                BitHelper.WriteBytes((byte)pack.type, packet);
                BitHelper.WriteBytes(pack.source, packet);
                BitHelper.WriteBytes(pack.target, packet);

                RNet.Trigger(eventName, packet);
            }

            private static void OnReceive(ulong sender, ArraySegment<byte> packet) {
                int index = 0;

                Type type = (Type)BitHelper.ReadByte(packet, ref index);
                ushort source = BitHelper.ReadUShort(packet, ref index);
                ushort target = BitHelper.ReadUShort(packet, ref index);

                Replay.Trigger(new rPack(type, source, target));
            }
        }
    }
}
