import { deflateRawSync } from 'node:zlib';

export interface ZipEntry {
	path: string;
	data: Uint8Array;
	/** Store without compression. Required for an EPUB's `mimetype` entry. */
	store?: boolean;
}

const crcTable = (() => {
	const table = new Uint32Array(256);
	for (let index = 0; index < 256; index += 1) {
		let value = index;
		for (let bit = 0; bit < 8; bit += 1) {
			value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
		}
		table[index] = value >>> 0;
	}
	return table;
})();

/** CRC-32 as required by the ZIP format. */
export function crc32(data: Uint8Array): number {
	let crc = 0xffffffff;
	for (const byte of data) {
		crc = (crc >>> 8) ^ (crcTable[(crc ^ byte) & 0xff] as number);
	}
	return (crc ^ 0xffffffff) >>> 0;
}

class ByteWriter {
	private chunks: Uint8Array[] = [];
	length = 0;

	push(chunk: Uint8Array): void {
		this.chunks.push(chunk);
		this.length += chunk.length;
	}

	uint16(value: number): void {
		this.push(new Uint8Array([value & 0xff, (value >>> 8) & 0xff]));
	}

	uint32(value: number): void {
		this.push(
			new Uint8Array([
				value & 0xff,
				(value >>> 8) & 0xff,
				(value >>> 16) & 0xff,
				(value >>> 24) & 0xff
			])
		);
	}

	toUint8Array(): Uint8Array {
		const output = new Uint8Array(this.length);
		let offset = 0;
		for (const chunk of this.chunks) {
			output.set(chunk, offset);
			offset += chunk.length;
		}
		return output;
	}
}

// 1980-01-01T00:00:00, the earliest representable DOS timestamp. Fixed so archives are
// byte-identical across builds.
const dosTime = 0;
const dosDate = 0x21;

/**
 * Writes a deterministic ZIP archive with no external dependency.
 * Identical input always produces byte-identical output.
 */
export function createZip(entries: readonly ZipEntry[]): Uint8Array {
	const encoder = new TextEncoder();
	const body = new ByteWriter();
	const central = new ByteWriter();

	for (const entry of entries) {
		const name = encoder.encode(entry.path);
		const checksum = crc32(entry.data);
		const compressed = entry.store ? entry.data : new Uint8Array(deflateRawSync(entry.data));
		const method = entry.store ? 0 : 8;
		const offset = body.length;

		body.uint32(0x04034b50);
		body.uint16(20);
		body.uint16(0);
		body.uint16(method);
		body.uint16(dosTime);
		body.uint16(dosDate);
		body.uint32(checksum);
		body.uint32(compressed.length);
		body.uint32(entry.data.length);
		body.uint16(name.length);
		body.uint16(0);
		body.push(name);
		body.push(compressed);

		central.uint32(0x02014b50);
		central.uint16(20);
		central.uint16(20);
		central.uint16(0);
		central.uint16(method);
		central.uint16(dosTime);
		central.uint16(dosDate);
		central.uint32(checksum);
		central.uint32(compressed.length);
		central.uint32(entry.data.length);
		central.uint16(name.length);
		central.uint16(0);
		central.uint16(0);
		central.uint16(0);
		central.uint16(0);
		central.uint32(0);
		central.uint32(offset);
		central.push(name);
	}

	const centralBytes = central.toUint8Array();
	const end = new ByteWriter();
	end.uint32(0x06054b50);
	end.uint16(0);
	end.uint16(0);
	end.uint16(entries.length);
	end.uint16(entries.length);
	end.uint32(centralBytes.length);
	end.uint32(body.length);
	end.uint16(0);

	const output = new ByteWriter();
	output.push(body.toUint8Array());
	output.push(centralBytes);
	output.push(end.toUint8Array());
	return output.toUint8Array();
}
