RHU.require(new Error(), {
    docs: "docs", rhuDocuscript: "docuscript",
}, function ({ docs, rhuDocuscript, }) {
    docs.jit = () => docuscript((lib, include) => {
        const { p, br, h1, h2, img } = lib;
        const { cb, ic } = include({ cb: "code:block", ic: "code:inline" });
        p("This document outlines the binary format of the replay file for people that want to make their own replay visualisers.");
        br();
        h1("Key Datastructures");
        h2("Vectors");
        p("Vectors are simply 3 floating point values packed together:");
        img("Vector.png", "50%");
        h2("Quaternions");
        p("Quaternions consist of 4 floating point values packed together:");
        img("Quaternion.png", "80%");
        br();
        p("However, this replay mod packs quaternions into a smaller datastructure by utilising the fact that normalized quaternions always have a magnitude of 1. This way", " the largest component can be omitted and recalculated by subtracting all the existing components from 1. We store which component of the quaternion is missing by using a single byte:");
        img("QuaternionPacked.png", "80%");
        p("Above, the index ", ic([], "i"), " represents the missing component and ", ic([], "a,b,c"), " represent the remaining components of the quarternion.");
        br();
        p("Here are how the quarternions can be unpacked when parsing:");
        img("QuaternionPackedExamples.png", "80%");
        h2("Half Precision");
        p("To reduce size of replays, many values are stored in half precision. This is simply a 16-bit floating point value instead of 32-bit. I perform this conversion by doing the following:", cb(["csharp"], `[MethodImpl(MethodImplOptions.AggressiveInlining)]
private static unsafe uint AsUInt(float x) {
    return *(uint*)&x;
}
[MethodImpl(MethodImplOptions.AggressiveInlining)]
private static unsafe float AsFloat(uint x) {
    return *(float*)&x;
}

// NOTE:: These Half <-> Float conversions do not account for Infinity or NaN!

[MethodImpl(MethodImplOptions.AggressiveInlining)]
public static float HalfToFloat(ushort x) {
    // IEEE-754 16-bit floating-point format (without infinity): 1-5-10, exp-15, +-131008.0, +-6.1035156E-5, +-5.9604645E-8, 3.311 digits
    int e = (x & 0x7C00) >> 10; // exponent
    int m = (x & 0x03FF) << 13; // mantissa
    int v = (int)(AsUInt((float)m) >> 23); // evil log2 bit hack to count leading zeros in denormalized format
    return AsFloat((uint)((x & 0x8000) << 16 | Convert.ToInt32(e != 0) * ((e + 112) << 23 | m) | (Convert.ToInt32(e == 0) & Convert.ToInt32(m != 0)) * ((v - 37) << 23 | ((m << (150 - v)) & 0x007FE000)))); // sign : normalized : denormalized
}
[MethodImpl(MethodImplOptions.AggressiveInlining)]
public static ushort FloatToHalf(float x) {
    // IEEE-754 16-bit floating-point format (without infinity): 1-5-10, exp-15, +-131008.0, +-6.1035156E-5, +-5.9604645E-8, 3.311 digits
    uint b = AsUInt(x) + 0x00001000; // round-to-nearest-even: add last bit after truncated mantissa
    uint e = (b & 0x7F800000) >> 23; // exponent
    uint m = b & 0x007FFFFF; // mantissa; in line below: 0x007FF000 = 0x00800000-0x00001000 = decimal indicator flag - initial rounding
    return (ushort)((b & 0x80000000) >> 16 | Convert.ToInt32(e > 112) * ((((e - 112) << 10) & 0x7C00) | m >> 13) | (Convert.ToInt32(e < 113) & Convert.ToInt32(e > 101)) * ((((0x007FF000 + m) >> (int)(125 - e)) + 1) >> 1) | Convert.ToUInt32(e > 143) * 0x7FFF); // sign : normalized : denormalized : saturate
}`));
        br();
        p("Half precision Vectors or Quaternions utilise 16-bit floats instead of 32-bit floats.");
        h1("Structure");
        p("The basic structure of the replay file consists of the map followed by stored snapshots taken by the game:");
        img("Structure.png", "50%");
        h1("Map Information");
        img("MapByteStructure.png", "70%");
        h2("Map Geometry");
        p("To be written...");
        h2("Doors");
        p("To be written...");
        h2("Ladders");
        p("To be written...");
        h2("Terminals");
        p("To be written...");
        h2("Containers");
        p("To be written...");
        h1("Snapshots");
        p("To be written...");
        h2("Events");
        p("To be written...");
        h2("Dynamics");
        p("To be written...");
        h2("Dynamic Properties");
        p("To be written...");
    }, rhuDocuscript);
});
