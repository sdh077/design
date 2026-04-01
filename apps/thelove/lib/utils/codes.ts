export function normalizeInviteCode(code: string) {
  return code.trim().toUpperCase();
}

export function createInviteCode() {
  const head = Math.random().toString(36).slice(2, 6).toUpperCase();
  const tail = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LOVE-${head}${tail}`;
}
