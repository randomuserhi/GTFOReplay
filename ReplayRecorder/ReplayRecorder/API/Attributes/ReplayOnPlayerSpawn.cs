namespace ReplayRecorder.API.Attributes {
    /// <summary>
    /// Triggers a static method when a player is spawned.
    /// 
    /// Synonymous with ReplayPlayerManager.OnPlayerSpawn
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public class ReplayOnPlayerSpawn : Attribute {
        public ReplayOnPlayerSpawn() {

        }
    }
}
