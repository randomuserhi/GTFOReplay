namespace Vanilla.Map {
    // Persisted values are independent of GTFO's native enum numbering.
    internal enum FloorTheme : byte {
        Unknown = 0, Mining = 1, Storage = 2, Tech = 3, Service = 4,
        GardensLab = 5, GardensForest = 6, Desert = 7, Refinery = 8,
        DigSite = 9, Jungle = 10, TechLab = 11, Gardens = 12
    }

    internal static class FloorThemeCodec {
        public static FloorTheme FromSource(string? dimensionGeomorph, string? geomorph, int? complex, int? subComplex) {
            if (Contains(dimensionGeomorph, "jungle")) return FloorTheme.Jungle;
            if (Contains(dimensionGeomorph, "desert")) return FloorTheme.Desert;
            // Static dimensions can borrow an ordinary geomorph while their
            // generated zone uses a default SubComplex. Its native prefab name
            // is the more specific evidence in that case.
            var explicitTheme = FromGeomorph(dimensionGeomorph) ?? FromGeomorph(geomorph);
            if (explicitTheme != null) return explicitTheme.Value;
            if (Contains(dimensionGeomorph, "/Dimensions/")) return FloorTheme.Unknown;
            // Native Expedition.SubComplex values are independent of persisted
            // themes. All=5 and Plug_SubComplex_Transition=8 identify no surface
            // family, even when the dimension's broad Complex is known.
            if (subComplex == null || subComplex < 0 || subComplex > 12) return FloorTheme.Unknown;
            switch (subComplex) {
            case 0: return FloorTheme.DigSite;
            case 1: return FloorTheme.Refinery;
            case 2: return FloorTheme.Storage;
            case 3: return FloorTheme.Tech;
            case 4: return FloorTheme.TechLab;
            case 5: case 8: return FloorTheme.Unknown;
            case 6: return complex == 1 ? FloorTheme.Service : FloorTheme.Unknown;
            case 7: case 12: return complex == 0 ? FloorTheme.Mining : FloorTheme.Unknown;
            case 9: case 10: return complex == 2 ? FloorTheme.Tech : FloorTheme.Unknown;
            case 11: return FloorTheme.Gardens;
            }
            return FloorTheme.Unknown;
        }

        private static bool Contains(string? source, string text) => source?.Contains(text, StringComparison.OrdinalIgnoreCase) == true;

        private static FloorTheme? FromGeomorph(string? source) {
            if (Contains(source, "_mining_dig_site_")) return FloorTheme.DigSite;
            if (Contains(source, "_mining_refinery_")) return FloorTheme.Refinery;
            if (Contains(source, "_mining_storage_")) return FloorTheme.Storage;
            if (Contains(source, "_tech_data_center_")) return FloorTheme.Tech;
            if (Contains(source, "_tech_lab_") || Contains(source, "_elevator_shaft_lab_")) return FloorTheme.TechLab;
            if (Contains(source, "_service_gardens_")) return FloorTheme.Gardens;
            return null;
        }
    }
}
