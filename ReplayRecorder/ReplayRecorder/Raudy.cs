using System.Runtime.CompilerServices;
using System.Text;
using UnityEngine;

namespace ReplayRecorder
{
    internal static class Raudy
    {
        public static long Now => ((DateTimeOffset)DateTime.Now).ToUnixTimeMilliseconds();
    }

    internal static partial class BitHelper
    {
        // https://github.com/dotnet/runtime/blob/20c8ae6457caa652a34fc42ff5f92b6728231039/src/libraries/System.Private.CoreLib/src/System/Buffers/Binary/Reader.cs

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static uint RotateLeft(uint value, int offset)
            => (value << offset) | (value >> (32 - offset));

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static uint RotateRight(uint value, int offset)
            => (value >> offset) | (value << (32 - offset));

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static long ReverseEndianness(long value) => (long)ReverseEndianness((ulong)value);

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static int ReverseEndianness(int value) => (int)ReverseEndianness((uint)value);

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static short ReverseEndianness(short value) => (short)ReverseEndianness((ushort)value);

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static ushort ReverseEndianness(ushort value)
        {
            // Don't need to AND with 0xFF00 or 0x00FF since the final
            // cast back to ushort will clear out all bits above [ 15 .. 00 ].
            // This is normally implemented via "movzx eax, ax" on the return.
            // Alternatively, the compiler could elide the movzx instruction
            // entirely if it knows the caller is only going to access "ax"
            // instead of "eax" / "rax" when the function returns.

            return (ushort)((value >> 8) + (value << 8));
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static uint ReverseEndianness(uint value)
        {
            // This takes advantage of the fact that the JIT can detect
            // ROL32 / ROR32 patterns and output the correct intrinsic.
            //
            // Input: value = [ ww xx yy zz ]
            //
            // First line generates : [ ww xx yy zz ]
            //                      & [ 00 FF 00 FF ]
            //                      = [ 00 xx 00 zz ]
            //             ROR32(8) = [ zz 00 xx 00 ]
            //
            // Second line generates: [ ww xx yy zz ]
            //                      & [ FF 00 FF 00 ]
            //                      = [ ww 00 yy 00 ]
            //             ROL32(8) = [ 00 yy 00 ww ]
            //
            //                (sum) = [ zz yy xx ww ]
            //
            // Testing shows that throughput increases if the AND
            // is performed before the ROL / ROR.

            return RotateRight(value & 0x00FF00FFu, 8) // xx zz
                + RotateLeft(value & 0xFF00FF00u, 8); // ww yy
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static ulong ReverseEndianness(ulong value)
        {
            return ((ulong)ReverseEndianness((uint)value) << 32)
                + ReverseEndianness((uint)(value >> 32));
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static unsafe void _WriteBytes(byte* source, int size, byte[] destination, ref int index)
        {
            for (int i = 0; i < size;)
            {
                destination[index++] = source[i++];
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static unsafe void WriteBytes(byte value, byte[] destination, ref int index)
        {
            destination[index++] = value;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static unsafe void WriteBytes(ulong value, byte[] destination, ref int index)
        {
            if (!BitConverter.IsLittleEndian) value = ReverseEndianness(value);
            _WriteBytes((byte*)&value, sizeof(ulong), destination, ref index);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static unsafe void WriteBytes(uint value, byte[] destination, ref int index)
        {
            if (!BitConverter.IsLittleEndian) value = ReverseEndianness(value);
            _WriteBytes((byte*)&value, sizeof(uint), destination, ref index);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static unsafe void WriteBytes(ushort value, byte[] destination, ref int index)
        {
            if (!BitConverter.IsLittleEndian) value = ReverseEndianness(value);
            _WriteBytes((byte*)&value, sizeof(ushort), destination, ref index);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static unsafe void WriteBytes(long value, byte[] destination, ref int index)
        {
            if (!BitConverter.IsLittleEndian) value = ReverseEndianness(value);
            _WriteBytes((byte*)&value, sizeof(long), destination, ref index);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static unsafe void WriteBytes(int value, byte[] destination, ref int index)
        {
            if (!BitConverter.IsLittleEndian) value = ReverseEndianness(value);
            _WriteBytes((byte*)&value, sizeof(int), destination, ref index);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static unsafe void WriteBytes(short value, byte[] destination, ref int index)
        {
            if (!BitConverter.IsLittleEndian) value = ReverseEndianness(value);
            _WriteBytes((byte*)&value, sizeof(short), destination, ref index);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static unsafe void WriteBytes(float value, byte[] destination, ref int index)
        {
            int to32 = *((int*)&value);
            if (!BitConverter.IsLittleEndian) to32 = ReverseEndianness(to32);
            _WriteBytes((byte*)&to32, sizeof(int), destination, ref index);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static unsafe void WriteBytes(string value, byte[] destination, ref int index)
        {
            byte[] temp = Encoding.UTF8.GetBytes(value);
            WriteBytes((ushort)temp.Length, destination, ref index);
            Array.Copy(temp, 0, destination, index, temp.Length);
            index += temp.Length;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static unsafe void WriteBytes(byte[] buffer, byte[] destination, ref int index)
        {
            WriteBytes((ushort)buffer.Length, destination, ref index);
            Array.Copy(buffer, 0, destination, index, buffer.Length);
            index += buffer.Length;
        }

        public const int SizeOfHalf = sizeof(ushort);
        // Special function to halve precision of float
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void WriteHalf(float value, byte[] destination, ref int index)
        {
            WriteBytes(FloatToHalf(value), destination, ref index);
        }

        // https://stackoverflow.com/questions/1659440/32-bit-to-16-bit-floating-point-conversion

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static unsafe uint AsUInt(float x)
        {
            return *(uint*)&x;
        }
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static unsafe float AsFloat(uint x)
        {
            return *(float*)&x;
        }

        // NOTE:: These Half <-> Float conversions do not account for Infinity or NaN!

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static float HalfToFloat(ushort x)
        {
            // IEEE-754 16-bit floating-point format (without infinity): 1-5-10, exp-15, +-131008.0, +-6.1035156E-5, +-5.9604645E-8, 3.311 digits
            int e = (x & 0x7C00) >> 10; // exponent
            int m = (x & 0x03FF) << 13; // mantissa
            int v = (int)(AsUInt((float)m) >> 23); // evil log2 bit hack to count leading zeros in denormalized format
            return AsFloat((uint)((x & 0x8000) << 16 | Convert.ToInt32(e != 0) * ((e + 112) << 23 | m) | (Convert.ToInt32(e == 0) & Convert.ToInt32(m != 0)) * ((v - 37) << 23 | ((m << (150 - v)) & 0x007FE000)))); // sign : normalized : denormalized
        }
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static ushort FloatToHalf(float x)
        {
            // IEEE-754 16-bit floating-point format (without infinity): 1-5-10, exp-15, +-131008.0, +-6.1035156E-5, +-5.9604645E-8, 3.311 digits
            uint b = AsUInt(x) + 0x00001000; // round-to-nearest-even: add last bit after truncated mantissa
            uint e = (b & 0x7F800000) >> 23; // exponent
            uint m = b & 0x007FFFFF; // mantissa; in line below: 0x007FF000 = 0x00800000-0x00001000 = decimal indicator flag - initial rounding
            return (ushort)((b & 0x80000000) >> 16 | Convert.ToInt32(e > 112) * ((((e - 112) << 10) & 0x7C00) | m >> 13) | (Convert.ToInt32(e < 113) & Convert.ToInt32(e > 101)) * ((((0x007FF000 + m) >> (int)(125 - e)) + 1) >> 1) | Convert.ToUInt32(e > 143) * 0x7FFF); // sign : normalized : denormalized : saturate
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static byte ReadByte(byte[] source, ref int index)
        {
            return source[index++];
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static unsafe ulong ReadULong(byte[] source, ref int index)
        {
            fixed (byte* converted = source)
            {
                byte* ptr = converted + index;
                index += sizeof(ulong);

                ulong result = *(ulong*)ptr;
                if (!BitConverter.IsLittleEndian)
                {
                    result = ReverseEndianness(result);
                }
                return result;
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static unsafe long ReadLong(byte[] source, ref int index)
        {
            fixed (byte* converted = source)
            {
                byte* ptr = converted + index;
                index += sizeof(long);

                long result = *(long*)ptr;
                if (!BitConverter.IsLittleEndian)
                {
                    result = ReverseEndianness(result);
                }
                return result;
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static unsafe uint ReadUInt(byte[] source, ref int index)
        {
            fixed (byte* converted = source)
            {
                byte* ptr = converted + index;
                index += sizeof(uint);

                uint result = *(uint*)ptr;
                if (!BitConverter.IsLittleEndian)
                {
                    result = ReverseEndianness(result);
                }
                return result;
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static unsafe int ReadInt(byte[] source, ref int index)
        {
            fixed (byte* converted = source)
            {
                byte* ptr = converted + index;
                index += sizeof(int);

                int result = *(int*)ptr;
                if (!BitConverter.IsLittleEndian)
                {
                    result = ReverseEndianness(result);
                }
                return result;
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static unsafe ushort ReadUShort(byte[] source, ref int index)
        {
            fixed (byte* converted = source)
            {
                byte* ptr = converted + index;
                index += sizeof(ushort);

                ushort result = *(ushort*)ptr;
                if (!BitConverter.IsLittleEndian)
                {
                    result = ReverseEndianness(result);
                }
                return result;
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static unsafe short ReadShort(byte[] source, ref int index)
        {
            fixed (byte* converted = source)
            {
                byte* ptr = converted + index;
                index += sizeof(short);

                short result = *(short*)(ptr);
                if (!BitConverter.IsLittleEndian)
                {
                    result = ReverseEndianness(result);
                }
                return result;
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static float ReadHalf(byte[] source, ref int index)
        {
            return HalfToFloat(ReadUShort(source, ref index));
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static unsafe float ReadFloat(byte[] source, ref int index)
        {
            fixed (byte* converted = source)
            {
                byte* ptr = converted + index;
                index += sizeof(float);
                
                if (!BitConverter.IsLittleEndian)
                {
                    int value = ReverseEndianness(*(int*)ptr);
                    return *((float*)&value);
                }
                return *(float*)ptr;
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static string ReadString(byte[] source, ref int index)
        {
            int length = ReadUShort(source, ref index);
            string temp = Encoding.UTF8.GetString(source, index, length);
            index += length;
            return temp;
        }

        // UNITY BitHelper functions:

        public const int SizeOfVector3 = sizeof(float) * 3;
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void WriteBytes(Vector3 value, byte[] destination, ref int index)
        {
            WriteBytes(value.x, destination, ref index);
            WriteBytes(value.y, destination, ref index);
            WriteBytes(value.z, destination, ref index);
        }

        public const int SizeOfQuaternion = 1 + sizeof(float) * 3;
        public static void WriteBytes(Quaternion value, byte[] destination, ref int index)
        {
            float largest = value.x;
            byte i = 0;
            if (value.y > largest)
            {
                largest = value.y;
                i = 1;
            }
            if (value.z > largest)
            {
                largest = value.z;
                i = 2;
            }
            if (value.w > largest)
            {
                largest = value.w;
                i = 3;
            }

            WriteBytes(i, destination, ref index);
            switch (i)
            {
                case 0:
                    if (value.x >= 0)
                    {
                        WriteBytes(value.y, destination, ref index);
                        WriteBytes(value.z, destination, ref index);
                        WriteBytes(value.w, destination, ref index);
                    }
                    else
                    {
                        WriteBytes(-value.y, destination, ref index);
                        WriteBytes(-value.z, destination, ref index);
                        WriteBytes(-value.w, destination, ref index);
                    }
                    break;
                case 1:
                    if (value.y >= 0)
                    {
                        WriteBytes(value.x, destination, ref index);
                        WriteBytes(value.z, destination, ref index);
                        WriteBytes(value.w, destination, ref index);
                    }
                    else
                    {
                        WriteBytes(-value.x, destination, ref index);
                        WriteBytes(-value.z, destination, ref index);
                        WriteBytes(-value.w, destination, ref index);
                    }
                    break;
                case 2:
                    if (value.z >= 0)
                    {
                        WriteBytes(value.x, destination, ref index);
                        WriteBytes(value.y, destination, ref index);
                        WriteBytes(value.w, destination, ref index);
                    }
                    else
                    {
                        WriteBytes(-value.x, destination, ref index);
                        WriteBytes(-value.y, destination, ref index);
                        WriteBytes(-value.w, destination, ref index);
                    }
                    break;
                case 3:
                    if (value.w >= 0)
                    {
                        WriteBytes(value.x, destination, ref index);
                        WriteBytes(value.y, destination, ref index);
                        WriteBytes(value.z, destination, ref index);
                    }
                    else
                    {
                        WriteBytes(-value.x, destination, ref index);
                        WriteBytes(-value.y, destination, ref index);
                        WriteBytes(-value.z, destination, ref index);
                    }
                    break;
            }
        }

        public static Vector3 ReadVector3(byte[] source, ref int index)
        {
            return new Vector3(ReadFloat(source, ref index), ReadFloat(source, ref index), ReadFloat(source, ref index));
        }

        public static Quaternion ReadQuaternion(byte[] source, ref int index)
        {
            byte i = ReadByte(source, ref index);
            float x = 0, y = 0, z = 0, w = 0;
            switch (i)
            {
                case 0:
                    y = ReadFloat(source, ref index);
                    z = ReadFloat(source, ref index);
                    w = ReadFloat(source, ref index);
                    x = Mathf.Sqrt(1f - y * y - z * z - w * w);
                    break;
                case 1:
                    x = ReadFloat(source, ref index);
                    z = ReadFloat(source, ref index);
                    w = ReadFloat(source, ref index);
                    y = Mathf.Sqrt(1f - x * x - z * z - w * w);
                    break;
                case 2:
                    x = ReadFloat(source, ref index);
                    y = ReadFloat(source, ref index);
                    w = ReadFloat(source, ref index);
                    z = Mathf.Sqrt(1f - x * x - y * y - w * w);
                    break;
                case 3:
                    x = ReadFloat(source, ref index);
                    y = ReadFloat(source, ref index);
                    z = ReadFloat(source, ref index);
                    w = Mathf.Sqrt(1f - x * x - y * y - z * z);
                    break;
            }
            return new Quaternion(x, y, z, w);
        }

        public const int SizeOfHalfVector3 = SizeOfHalf * 3;
        public static void WriteHalf(Vector3 value, byte[] destination, ref int index)
        {
            WriteHalf(value.x, destination, ref index);
            WriteHalf(value.y, destination, ref index);
            WriteHalf(value.z, destination, ref index);
        }

        public const int SizeOfHalfQuaternion = 1 + SizeOfHalf * 3;
        // TODO:: This is using a byte + 3 16-Float, but I should use 3 bits + 3 15-Float
        public static void WriteHalf(Quaternion value, byte[] destination, ref int index)
        {
            float largest = value.x;
            byte i = 0;
            if (value.y > largest)
            {
                largest = value.y;
                i = 1;
            }
            if (value.z > largest)
            {
                largest = value.z;
                i = 2;
            }
            if (value.w > largest)
            {
                largest = value.w;
                i = 3;
            }

            WriteBytes(i, destination, ref index);
            switch (i)
            {
                case 0:
                    if (value.x >= 0)
                    {
                        WriteHalf(value.y, destination, ref index);
                        WriteHalf(value.z, destination, ref index);
                        WriteHalf(value.w, destination, ref index);
                    }
                    else
                    {
                        WriteHalf(-value.y, destination, ref index);
                        WriteHalf(-value.z, destination, ref index);
                        WriteHalf(-value.w, destination, ref index);
                    }
                    break;
                case 1:
                    if (value.y >= 0)
                    {
                        WriteHalf(value.x, destination, ref index);
                        WriteHalf(value.z, destination, ref index);
                        WriteHalf(value.w, destination, ref index);
                    }
                    else
                    {
                        WriteHalf(-value.x, destination, ref index);
                        WriteHalf(-value.z, destination, ref index);
                        WriteHalf(-value.w, destination, ref index);
                    }
                    break;
                case 2:
                    if (value.z >= 0)
                    {
                        WriteHalf(value.x, destination, ref index);
                        WriteHalf(value.y, destination, ref index);
                        WriteHalf(value.w, destination, ref index);
                    }
                    else
                    {
                        WriteHalf(-value.x, destination, ref index);
                        WriteHalf(-value.y, destination, ref index);
                        WriteHalf(-value.w, destination, ref index);
                    }
                    break;
                case 3:
                    if (value.w >= 0)
                    {
                        WriteHalf(value.x, destination, ref index);
                        WriteHalf(value.y, destination, ref index);
                        WriteHalf(value.z, destination, ref index);
                    }
                    else
                    {
                        WriteHalf(-value.x, destination, ref index);
                        WriteHalf(-value.y, destination, ref index);
                        WriteHalf(-value.z, destination, ref index);
                    }
                    break;
            }
        }

        public static Vector3 ReadHalfVector3(byte[] source, ref int index)
        {
            return new Vector3(ReadHalf(source, ref index), ReadHalf(source, ref index), ReadHalf(source, ref index));
        }

        // TODO:: This is using a byte + 3 16-Float, but I should use 3 bits + 3 15-Float
        public static Quaternion ReadHalfQuaternion(byte[] source, ref int index)
        {
            byte i = ReadByte(source, ref index);
            float x = 0, y = 0, z = 0, w = 0;
            switch (i)
            {
                case 0:
                    y = ReadHalf(source, ref index);
                    z = ReadHalf(source, ref index);
                    w = ReadHalf(source, ref index);
                    x = Mathf.Sqrt(1f - y * y - z * z - w * w);
                    break;
                case 1:
                    x = ReadHalf(source, ref index);
                    z = ReadHalf(source, ref index);
                    w = ReadHalf(source, ref index);
                    y = Mathf.Sqrt(1f - x * x - z * z - w * w);
                    break;
                case 2:
                    x = ReadHalf(source, ref index);
                    y = ReadHalf(source, ref index);
                    w = ReadHalf(source, ref index);
                    z = Mathf.Sqrt(1f - x * x - y * y - w * w);
                    break;
                case 3:
                    x = ReadHalf(source, ref index);
                    y = ReadHalf(source, ref index);
                    z = ReadHalf(source, ref index);
                    w = Mathf.Sqrt(1f - x * x - y * y - z * z);
                    break;
            }
            return new Quaternion(x, y, z, w);
        }
    }
}
