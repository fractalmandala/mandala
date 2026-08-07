// Pure TypeScript TOTP / 2FA Keypass generation utility (Rule 3 & 4 compliant Svelte 5)

function decodeBase32(base32: string): Uint8Array {
	const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
	const clean = base32.toUpperCase().replace(/\s/g, '').replace(/=+$/, '');
	const bytes = new Uint8Array(Math.floor((clean.length * 5) / 8));
	let val = 0;
	let bits = 0;
	let byteIdx = 0;

	for (let i = 0; i < clean.length; i++) {
		const idx = base32chars.indexOf(clean[i]);
		if (idx === -1) {
			continue;
		}
		val = (val << 5) | idx;
		bits += 5;
		if (bits >= 8) {
			bytes[byteIdx++] = (val >> (bits - 8)) & 255;
			bits -= 8;
		}
	}
	return bytes;
}

function sha1(message: Uint8Array): Uint8Array {
	const h = new Uint32Array([0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0]);
	
	const l = message.length;
	const bitLen = l * 8;
	const paddingLen = (l % 64 < 56) ? (56 - l % 64) : (120 - l % 64);
	const padded = new Uint8Array(l + paddingLen + 8);
	padded.set(message);
	padded[l] = 0x80;
	
	const view = new DataView(padded.buffer);
	view.setUint32(padded.length - 4, bitLen);
	
	const w = new Uint32Array(80);
	for (let offset = 0; offset < padded.length; offset += 64) {
		for (let i = 0; i < 16; i++) {
			w[i] = view.getUint32(offset + i * 4);
		}
		for (let i = 16; i < 80; i++) {
			const val = w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16];
			w[i] = (val << 1) | (val >>> 31);
		}
		
		let a = h[0];
		let b = h[1];
		let c = h[2];
		let d = h[3];
		let e = h[4];
		
		for (let i = 0; i < 80; i++) {
			let f = 0;
			let k = 0;
			if (i < 20) {
				f = (b & c) | (~b & d);
				k = 0x5a827999;
			} else if (i < 40) {
				f = b ^ c ^ d;
				k = 0x6ed9eba1;
			} else if (i < 60) {
				f = (b & c) | (b & d) | (c & d);
				k = 0x8f1bbcdc;
			} else {
				f = b ^ c ^ d;
				k = 0xca62c1d6;
			}
			
			const temp = (((a << 5) | (a >>> 27)) + f + e + k + w[i]) | 0;
			e = d;
			d = c;
			c = (b << 30) | (b >>> 2);
			b = a;
			a = temp;
		}
		
		h[0] = (h[0] + a) | 0;
		h[1] = (h[1] + b) | 0;
		h[2] = (h[2] + c) | 0;
		h[3] = (h[3] + d) | 0;
		h[4] = (h[4] + e) | 0;
	}
	
	const result = new Uint8Array(20);
	const resView = new DataView(result.buffer);
	resView.setUint32(0, h[0]);
	resView.setUint32(4, h[1]);
	resView.setUint32(8, h[2]);
	resView.setUint32(12, h[3]);
	resView.setUint32(16, h[4]);
	return result;
}

function hmacSha1(key: Uint8Array, message: Uint8Array): Uint8Array {
	let activeKey = key;
	if (key.length > 64) {
		activeKey = sha1(key);
	}
	const paddedKey = new Uint8Array(64);
	paddedKey.set(activeKey);
	
	const ipad = new Uint8Array(64);
	const opad = new Uint8Array(64);
	for (let i = 0; i < 64; i++) {
		ipad[i] = paddedKey[i] ^ 0x36;
		opad[i] = paddedKey[i] ^ 0x5c;
	}
	
	const inner = new Uint8Array(64 + message.length);
	inner.set(ipad);
	inner.set(message, 64);
	const innerHash = sha1(inner);
	
	const outer = new Uint8Array(64 + 20);
	outer.set(opad);
	outer.set(innerHash, 64);
	return sha1(outer);
}

export function generateTOTP(secret: string, timeStep = 30, codeLength = 6): string {
	try {
		if (!secret) return '';
		const cleanSecret = secret.replace(/\s+/g, '').replace(/-/g, '');
		const key = decodeBase32(cleanSecret);
		
		const epoch = Math.floor(Date.now() / 1000);
		const counter = Math.floor(epoch / timeStep);
		
		const msg = new Uint8Array(8);
		const view = new DataView(msg.buffer);
		const hi = Math.floor(counter / 0x100000000);
		const lo = counter & 0xffffffff;
		view.setUint32(0, hi);
		view.setUint32(4, lo);
		
		const hmac = hmacSha1(key, msg);
		
		const offset = hmac[19] & 0xf;
		const code = ((hmac[offset] & 0x7f) << 24) |
					 ((hmac[offset + 1] & 0xff) << 16) |
					 ((hmac[offset + 2] & 0xff) << 8) |
					 (hmac[offset + 3] & 0xff);
					 
		let otp = (code % Math.pow(10, codeLength)).toString();
		while (otp.length < codeLength) {
			otp = '0' + otp;
		}
		return otp;
	} catch (e) {
		console.error('Error generating TOTP:', e);
		return '';
	}
}
