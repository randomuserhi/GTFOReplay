namespace ReplayRecorder {
    internal class BufferPool {
        private Stack<ByteBuffer> pool = new Stack<ByteBuffer>();
        private readonly object lockObj = new Object();
        private int size = 0;
        private int inUse = 0;
        public int Size => size;
        public int InUse => inUse;

        public ByteBuffer Checkout() {
            lock (lockObj) {
                if (pool.Count == 0) {
                    ++size;
                    ++inUse;
                    return new ByteBuffer();
                }
                return pool.Pop();
            }
        }

        public void Release(ByteBuffer buffer) {
            lock (lockObj) {
                --inUse;
                buffer.Clear();
                pool.Push(buffer);
            }
        }
    }
}
