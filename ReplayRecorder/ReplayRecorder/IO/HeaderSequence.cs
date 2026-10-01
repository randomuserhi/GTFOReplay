namespace ReplayRecorder.IO {
    // A header type can emit several records (one per map surface). Completion
    // means every registered type has emitted, including explicit section ends.
    internal sealed class HeaderSequence {
        private readonly HashSet<Type> registered;
        private readonly HashSet<Type> pending;
        public bool Complete => pending.Count == 0;

        public HeaderSequence(IEnumerable<Type> types) {
            registered = new HashSet<Type>(types);
            pending = new HashSet<Type>(registered);
        }

        public bool Write(Type type, Action write) {
            if (Complete) throw new InvalidOperationException($"All headers are already complete: {type.FullName}");
            if (!registered.Contains(type)) throw new InvalidDataException($"Unregistered header: {type.FullName}");
            write();
            pending.Remove(type);
            return Complete;
        }
    }
}
