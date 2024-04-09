namespace ReplayRecorder {
    internal class BufferPool {
        private Stack<ByteBuffer> pool = new Stack<ByteBuffer>();
        private readonly object lockObj = new Object();
        private int size = 0;
        public int Size => size;

        public ByteBuffer Checkout() {
            lock (lockObj) {
                if (pool.Count == 0) {
                    size++;
                    return new ByteBuffer();
                }
                return pool.Pop();
            }
        }

        public void Release(ByteBuffer buffer) {
            lock (lockObj) {
                buffer.Clear();
                pool.Push(buffer);
            }
        }
    }
}
