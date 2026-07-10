export function normalizeArgPhone(raw: string): string {
  let n = raw.replace(/\D/g, "");
  if (n.startsWith("5491") && n.length === 13) return n;
  if (n.startsWith("549") && n.length === 13) return n;
  if (n.startsWith("54") && n.length === 12) return "549" + n.slice(3);
  if (n.length === 10) return "549" + n;
  if (n.length === 11 && n.startsWith("0")) return "549" + n.slice(1);
  return n;
}
