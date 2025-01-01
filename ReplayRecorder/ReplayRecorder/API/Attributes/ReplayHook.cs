namespace ReplayRecorder.API.Attributes {
    /// <summary>
    /// Hook a method to a given replay object.
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public class ReplayHook : Attribute {
        public Type type { get; set; }
        public bool triggerOnlyWhenDirty { get; set; }

        /// <summary>
        /// Hook a method to a given dynamic.
        /// </summary>
        /// <param name="type">Type to hook onto.</param>
        /// <param name="triggerOnlyWhenDirty">Trigger only when the object is dirty (Not applicable to events).</param>
        public ReplayHook(Type type, bool triggerOnlyWhenDirty = true) {
            this.type = type;
            this.triggerOnlyWhenDirty = triggerOnlyWhenDirty;
        }
    }

    /// <summary>
    /// Hook a method to a given dynamic.
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public class ReplaySpawnHook : Attribute {
        public Type type { get; set; }

        /// <summary>
        /// Hook a method to a given dynamic.
        /// </summary>
        /// <param name="type">Type to hook onto.</param>
        public ReplaySpawnHook(Type type) {
            this.type = type;
        }
    }

    /// <summary>
    /// Hook a method to a given dynamic.
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public class ReplayDespawnHook : Attribute {
        public Type type { get; set; }

        /// <summary>
        /// Hook a method to a given dynamic.
        /// </summary>
        /// <param name="type">Type to hook onto.</param>
        public ReplayDespawnHook(Type type) {
            this.type = type;
        }
    }
}
