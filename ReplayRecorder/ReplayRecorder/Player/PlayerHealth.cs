using Player;

namespace ReplayRecorder.Player {
    internal class PlayerHealth {
        public struct rPlayerQuantity : ISerializable {
            private byte player;
            private float value;

            public rPlayerQuantity(PlayerAgent player, float value) {
                this.player = (byte)player.PlayerSlotIndex;
                this.value = value;
            }

            public const int SizeOf = 1 + sizeof(ushort);
            private byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs) {
                int index = 0;
                BitHelper.WriteBytes(player, buffer, ref index);
                BitHelper.WriteHalf(value, buffer, ref index);

                fs.Write(buffer);
            }
        }

        public static void OnHealthChange(PlayerAgent player, float value) {

        }

        public static void OnInfectionChange(PlayerAgent player, float value) {

        }
    }
}
