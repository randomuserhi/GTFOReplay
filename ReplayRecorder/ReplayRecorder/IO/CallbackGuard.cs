namespace ReplayRecorder.IO {
    internal static class CallbackGuard {
        public static void Run(string operation, Action action, Action<string, Exception> report) {
            try { action(); }
            catch (Exception error) { report(operation, error); }
        }
        public static void Invoke(string operation, Action? callbacks, Action<string, Exception> report) {
            if (callbacks == null) return;
            foreach (Action callback in callbacks.GetInvocationList()) {
                Run($"{operation}/{callback.Method.DeclaringType?.FullName}.{callback.Method.Name}", callback, report);
            }
        }

        public static void Invoke<T>(string operation, Action<T>? callbacks, T argument, Action<string, Exception> report) {
            if (callbacks == null) return;
            foreach (Action<T> callback in callbacks.GetInvocationList()) {
                Run($"{operation}/{callback.Method.DeclaringType?.FullName}.{callback.Method.Name}", () => callback(argument), report);
            }
        }
    }
}
