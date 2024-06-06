/// BufferPool.cs
///
/// Manages a pool of pre-allocated buffers used through the codebase to minimize
/// garbage collections and allocations.

namespace ReplayRecorder {
    internal class BufferPool {
        private Stack<ByteBuffer> pool = new Stack<ByteBuffer>();
        private readonly object lockObj = new Object();
        private int size = 0;
        private int inUse = 0;
        public int Size => size;
        public int InUse => inUse;

        public void Shrink(int count) {
            while (pool.Count > count) {
                pool.Pop();
                --size;
            }
        }

        public ByteBuffer Checkout() {
            lock (lockObj) {
                ++inUse;
                if (pool.Count == 0) {
                    ++size;
                    return new ByteBuffer();
                }
                return pool.Pop();
            }
        }

        public void Release(ByteBuffer buffer) {
            lock (lockObj) {
                if (inUse != 0) {
                    --inUse;
                } else {
                    ++size;
                }
                buffer.Clear();
                pool.Push(buffer);
            }
        }
    }
}
