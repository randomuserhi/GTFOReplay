using System.Reflection;

namespace ReplayRecorder {
    internal static class Utils {
        public const BindingFlags AnyBindingFlags = BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Static | BindingFlags.Instance;
    }
}
