// Streaming PNG writer backed by OPFS: encodes RGBA rows band-by-band into a
// truecolor (RGB, filter 0) PNG without ever holding the full image in
// memory. CompressionStream("deflate") emits exactly the zlib stream PNG's
// IDAT expects; chunk framing and CRCs are done here.

const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const IDAT_CHUNK_TARGET = 1 << 19; // 512KB per IDAT chunk

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(chunks: Uint8Array[]): number {
  let c = 0xffffffff;
  for (const chunk of chunks) {
    for (let i = 0; i < chunk.length; i++) {
      c = CRC_TABLE[(c ^ chunk[i]) & 0xff] ^ (c >>> 8);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function u32be(value: number): Uint8Array<ArrayBuffer> {
  return new Uint8Array([
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ]);
}

function chunkBytes(
  type: string,
  data: Uint8Array<ArrayBuffer>,
): Uint8Array<ArrayBuffer>[] {
  const typeBytes = new Uint8Array([...type].map((ch) => ch.charCodeAt(0)));
  return [
    u32be(data.length),
    typeBytes,
    data,
    u32be(crc32([typeBytes, data])),
  ];
}

export function streamingSupported(): boolean {
  return (
    typeof CompressionStream === "function" &&
    typeof navigator !== "undefined" &&
    typeof navigator.storage?.getDirectory === "function" &&
    typeof FileSystemFileHandle !== "undefined" &&
    "createWritable" in FileSystemFileHandle.prototype
  );
}

const OPFS_PREFIX = "upscale-stream-";

// Best-effort removal of files left behind by past sessions. Only files
// older than a day are touched: results are disk-backed and OPFS is shared
// across tabs, so an aggressive sweep here would delete another tab's
// not-yet-downloaded result.
const STALE_AFTER_MS = 24 * 60 * 60 * 1000;

export async function cleanupStaleStreamFiles(): Promise<void> {
  try {
    const dir = await navigator.storage.getDirectory();
    const candidates: string[] = [];
    for await (const name of (
      dir as FileSystemDirectoryHandle & { keys(): AsyncIterable<string> }
    ).keys()) {
      if (name.startsWith(OPFS_PREFIX)) candidates.push(name);
    }
    const cutoff = Date.now() - STALE_AFTER_MS;
    await Promise.all(
      candidates.map(async (name) => {
        try {
          const file = await (await dir.getFileHandle(name)).getFile();
          if (file.lastModified < cutoff) await dir.removeEntry(name);
        } catch {
          /* locked or vanished — leave it */
        }
      }),
    );
  } catch {
    // OPFS unavailable — nothing to clean.
  }
}

export class StreamingPngEncoder {
  private constructor(
    private readonly width: number,
    private readonly height: number,
    private readonly writable: FileSystemWritableFileStream,
    private readonly handle: FileSystemFileHandle,
    private readonly deflateWriter: WritableStreamDefaultWriter<BufferSource>,
    private readonly pumpDone: Promise<void>,
  ) {}

  private rowsWritten = 0;

  static async create(
    width: number,
    height: number,
  ): Promise<StreamingPngEncoder> {
    const dir = await navigator.storage.getDirectory();
    const handle = await dir.getFileHandle(
      `${OPFS_PREFIX}${crypto.randomUUID()}.png`,
      { create: true },
    );
    const writable = await handle.createWritable();

    for (const part of [PNG_SIGNATURE]) await writable.write(part);
    // IHDR: 8-bit, color type 2 (truecolor RGB), default everything else.
    const ihdr = new Uint8Array(13);
    ihdr.set(u32be(width), 0);
    ihdr.set(u32be(height), 4);
    ihdr.set([8, 2, 0, 0, 0], 8);
    for (const part of chunkBytes("IHDR", ihdr)) await writable.write(part);

    const deflate = new CompressionStream("deflate");
    const deflateWriter = deflate.writable.getWriter();

    // Pump: read compressed zlib bytes, frame them into IDAT chunks, append
    // to the OPFS file. Runs until the deflate writer is closed in finish().
    const pumpDone = (async () => {
      const reader = deflate.readable.getReader();
      let pending: Uint8Array<ArrayBuffer>[] = [];
      let pendingSize = 0;
      const flush = async () => {
        if (pendingSize === 0) return;
        const data = new Uint8Array(pendingSize);
        let offset = 0;
        for (const part of pending) {
          data.set(part, offset);
          offset += part.length;
        }
        pending = [];
        pendingSize = 0;
        for (const part of chunkBytes("IDAT", data)) await writable.write(part);
      };
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        pending.push(value as Uint8Array<ArrayBuffer>);
        pendingSize += value.length;
        if (pendingSize >= IDAT_CHUNK_TARGET) await flush();
      }
      await flush();
    })();

    // Mark the pump's rejection as handled — writeRows/finish observe it by
    // racing against it, which would otherwise leave an unhandledrejection.
    void pumpDone.catch(() => {});

    return new StreamingPngEncoder(
      width,
      height,
      writable,
      handle,
      deflateWriter,
      pumpDone,
    );
  }

  // rgba holds `rows` full scanlines (width*4 bytes each); converted here to
  // filter-0 RGB scanlines and fed to the zlib stream with backpressure.
  // Every await races the pump: if an OPFS write fails, the pump stops
  // draining the deflate stream, backpressure makes this write pend forever,
  // and only the race surfaces the underlying error instead of hanging.
  async writeRows(rgba: Uint8ClampedArray, rows: number): Promise<void> {
    const { width } = this;
    const out = new Uint8Array(rows * (1 + width * 3));
    let o = 0;
    for (let y = 0; y < rows; y++) {
      out[o++] = 0; // filter type: None
      let p = y * width * 4;
      for (let x = 0; x < width; x++) {
        out[o++] = rgba[p];
        out[o++] = rgba[p + 1];
        out[o++] = rgba[p + 2];
        p += 4;
      }
    }
    this.rowsWritten += rows;
    await Promise.race([this.deflateWriter.write(out), this.pumpDone]);
  }

  async finish(): Promise<File> {
    if (this.rowsWritten !== this.height) {
      throw new Error(
        `PNG stream incomplete: ${this.rowsWritten}/${this.height} rows`,
      );
    }
    await Promise.race([this.deflateWriter.close(), this.pumpDone]);
    await this.pumpDone;
    for (const part of chunkBytes("IEND", new Uint8Array(0))) {
      await this.writable.write(part);
    }
    await this.writable.close();
    return this.handle.getFile();
  }

  // Abort path: kill both streams and delete the partial file. abort() (not
  // close()) on the deflate writer — close() would compress and flush the
  // remaining data into a file we are about to delete, and hangs if the
  // pump is already dead.
  async abort(): Promise<void> {
    try {
      await this.deflateWriter.abort();
    } catch {
      /* already broken */
    }
    await this.pumpDone.catch(() => {});
    try {
      await this.writable.abort();
    } catch {
      /* already closed */
    }
    try {
      const dir = await navigator.storage.getDirectory();
      await dir.removeEntry(this.handle.name);
    } catch {
      /* best effort */
    }
  }
}
