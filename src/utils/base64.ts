export function abToB64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

export function b64ToAb(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes.buffer;
}

export function u8ToB64(u8: Uint8Array): string {
  return abToB64(u8.buffer);
}

export function b64ToU8(b64: string): Uint8Array {
  return new Uint8Array(b64ToAb(b64));
}
