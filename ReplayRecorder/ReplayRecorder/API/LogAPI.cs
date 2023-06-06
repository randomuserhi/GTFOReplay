using BepInEx.Logging;

namespace API
{
    /* Ripped from GTFO-API */
    internal static class APILogger
    {
        private static readonly ManualLogSource logger;

        static APILogger()
        {
            logger = new ManualLogSource("RandB-API");
            Logger.Sources.Add(logger);
        }
        private static string Format(string module, object msg) => $"[{module}]: {msg}";

        public static void Info(string module, object data) => logger.LogMessage(Format(module, data));
        public static void Verbose(string module, object data)
        {
#if DEBUG
            logger.LogDebug(Format(module, data));
#endif
        }
        public static void Debug(string module, object data) => logger.LogDebug(Format(module, data));
        public static void Warn(string module, object data) => logger.LogWarning(Format(module, data));
        public static void Error(string module, object data) => logger.LogError(Format(module, data));
    }
}