namespace Vanilla.Enemy {
    // Boolean values live in the mask; optional bytes only accompany changed numeric fields.
    internal struct EnemyStateCodec {
        private bool initialized;
        private byte consumed, target, stagger;
        public int Write(Span<byte> output, bool tagged, bool canStagger, byte newConsumed, byte newTarget, byte newStagger) {
            byte mask = (byte)((tagged ? 1 : 0) | (canStagger ? 2 : 0));
            int count = 1;
            if (!initialized || consumed != newConsumed) { mask |= 4; output[count++] = newConsumed; }
            if (!initialized || target != newTarget) { mask |= 8; output[count++] = newTarget; }
            if (!initialized || stagger != newStagger) { mask |= 16; output[count++] = newStagger; }
            output[0] = mask;
            initialized = true;
            consumed = newConsumed; target = newTarget; stagger = newStagger;
            return count;
        }
    }
}
