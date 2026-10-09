/**
 * Helper utility to robustly parse document requirements into separate individual items.
 * Handles:
 * - Numbered lists inline: "1. Applicant Photo 2. Smart Card 3. Death Certificate 4. Aadhar 5, Widow cert 6, passbook"
 * - Newline-separated lists:
 *   a
 *   b
 *   c
 * - Bulleted lists: "- a", "* b", "• c"
 * - Comma / semicolon separated lists: "a, b, c"
 * - Pre-existing arrays with mixed/clumped strings
 */
export function parseDocumentList(raw) {
  if (!raw) return [];
  const rawList = Array.isArray(raw) ? raw : [raw];
  const results = [];

  for (const item of rawList) {
    if (typeof item !== 'string') {
      if (item) results.push(String(item).trim());
      continue;
    }

    // Split by newlines first
    const lines = item.split(/\r?\n/);
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Check for inline numbering patterns like "1. Photo 2. Card 3. Cert 4, Other 5) More"
      const hasInlineNumbers = /(?:^|\s+)(?:\d+[\.\,\)\-]\s*|\([0-9]+\)\s*|[a-zA-Z][\.\)]\s+)/.test(trimmedLine);
      
      if (hasInlineNumbers) {
        const parts = trimmedLine
          .split(/(?:^|\s+)(?:\d+[\.\,\)\-]\s*|\([0-9]+\)\s*|[a-zA-Z][\.\)]\s+)/)
          .map(s => s.trim().replace(/^[\d+]+[\.\,\)\-]\s*/, '').replace(/^[a-zA-Z][\.\)]\s*/, '').replace(/^[-•*]\s*/, '').trim())
          .filter(Boolean);

        if (parts.length > 0) {
          results.push(...parts);
          continue;
        }
      }

      // Check for comma or semicolon separated list (only if it doesn't look like a single parenthetical note)
      if ((trimmedLine.includes(',') || trimmedLine.includes(';')) && !trimmedLine.includes('(')) {
        const parts = trimmedLine
          .split(/[,;]\s*/)
          .map(s => s.trim().replace(/^[\d+]+[\.\,\)\-]\s*/, '').replace(/^[-•*]\s*/, '').trim())
          .filter(Boolean);
        if (parts.length > 1) {
          results.push(...parts);
          continue;
        }
      }

      // Clean single line (remove leading bullets or single numbers)
      const cleaned = trimmedLine
        .replace(/^[\d+]+[\.\,\)\-]\s*/, '')
        .replace(/^[a-zA-Z][\.\)]\s*/, '')
        .replace(/^[-•*]\s*/, '')
        .trim();

      if (cleaned) {
        results.push(cleaned);
      }
    }
  }

  // Deduplicate while preserving order
  return Array.from(new Set(results));
}
