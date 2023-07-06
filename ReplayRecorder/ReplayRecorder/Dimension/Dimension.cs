using API;
using Player;

namespace ReplayRecorder.Dimensions
{
    public static class Dimensions
    {
        // NOTE(randomuserhi): This method gets the dimension the current player is in.
        //                     In the future if players can be split (players in different dimensions)
        //                     then this method will cause a lot of logic fail.
        public static eDimensionIndex CurrentDimension()
        {
            PlayerAgent player = PlayerManager.GetLocalPlayerAgent();
            if (player == null)
            {
                APILogger.Error("Player was null when getting dimension, this should not happen.");
                return eDimensionIndex.Reality;
            }
            return player.m_dimensionIndex;
        }
    }
}
