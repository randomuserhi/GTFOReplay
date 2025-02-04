namespace ReplayRecorder.API.Attributes {
    /// <summary>
    /// Triggers a static method when a player is despawned.
    /// 
    /// Synonymous with ReplayPlayerManager.OnPlayerDespawn
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public class ReplayOnPlayerDespawn : Attribute {
        public ReplayOnPlayerDespawn() {

        }
    }
}
