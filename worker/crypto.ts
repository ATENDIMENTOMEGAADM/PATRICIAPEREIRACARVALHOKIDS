// Senhas com PBKDF2 (limite de iterações do Workers) e chaves de integração cifradas com AES-GCM.
const encoder = new TextEncoder();
const ITERATIONS = 100000;
const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (value: string) => Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

export const randomToken = () => b64(crypto.getRandomValues(new Uint8Array(32)));
export async function sha256(value: string) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)))].map(n => n.toString(16).padStart(2, '0')).join('');
}
async function derive(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256));
}
export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${ITERATIONS}$${b64(salt)}$${b64(await derive(password, salt, ITERATIONS))}`;
}
export async function verifyPassword(password: string, encoded: string | undefined) {
  const parts = (encoded || '').split('$'), valid = parts.length === 4 && parts[0] === 'pbkdf2';
  // Mesmo custo para usuário inexistente, para não revelar quais e-mails existem.
  const salt = valid ? unb64(parts[2]) : new Uint8Array(16), iterations = valid ? Number(parts[1]) : ITERATIONS;
  const actual = await derive(password, salt, iterations), expected = valid ? unb64(parts[3]) : new Uint8Array(32);
  let diff = actual.length ^ expected.length;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ (expected[i] ?? 0);
  return valid && diff === 0;
}
async function aesKey(secret: string) {
  return crypto.subtle.importKey('raw', await crypto.subtle.digest('SHA-256', encoder.encode(secret)), 'AES-GCM', false, ['encrypt', 'decrypt']);
}
export async function encryptSecret(value: string, secret: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await aesKey(secret), encoder.encode(value)));
  return `v1.${b64(iv)}.${b64(data)}`;
}
export async function decryptSecret(value: string, secret: string) {
  const [version, iv, data] = value.split('.');
  if (version !== 'v1') throw new Error('Formato de chave cifrada desconhecido.');
  return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(iv) }, await aesKey(secret), unb64(data)));
}
