using System.Reflection;
using System.Text;

namespace ReplayRecorder {
    public static class Utils {
        public const BindingFlags AnyBindingFlags = BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Static | BindingFlags.Instance;

        public static string RemoveInvalidCharacters(string content, char replace = '_', bool isFullPath = true) {
            if (string.IsNullOrEmpty(content))
                return content;

            char[] invalidCharacters = Path.GetInvalidFileNameChars();
            var idx = content.IndexOfAny(invalidCharacters);
            if (idx >= 0) {
                var sb = new StringBuilder(content);
                while (idx >= 0) {
                    if (!isFullPath || (sb[idx] != ':' && sb[idx] != '\\' && sb[idx] != '/'))
                        sb[idx] = replace;
                    idx = content.IndexOfAny(invalidCharacters, idx + 1);
                }
                return sb.ToString();
            }
            return content;
        }
    }
}
