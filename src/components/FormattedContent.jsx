import React from 'react';
import { 
  Bookmark, 
  ChevronRight, 
  ExternalLink
} from 'lucide-react';

/**
 * Converts text containing:
 * - *LINK(label)->http... shortcut
 * - [label](http...) markdown links
 * - raw http:// or https:// URLs
 * into styled clickable links / buttons
 */
export function renderTextWithLinks(text) {
  if (!text || typeof text !== 'string') return text;

  // Regex matches:
  // 1. *LINK(label)->url
  // 2. [label](url)
  // 3. raw url
  const combinedRegex = /(\*LINK\([^)]+\)\s*->\s*https?:\/\/[^\s,)]+|\[[^\]]+\]\(https?:\/\/[^\s,)]+\)|https?:\/\/[^\s,)]+)/gi;
  const parts = text.split(combinedRegex);

  if (parts.length === 1) return text;

  return parts.map((part, index) => {
    if (!part) return null;

    // 1. *LINK(label)->url shortcut
    const linkShortcutMatch = part.match(/^\*LINK\(([^)]+)\)\s*->\s*(https?:\/\/[^\s,)]+)$/i);
    if (linkShortcutMatch) {
      const label = linkShortcutMatch[1].trim();
      const url = linkShortcutMatch[2].trim();
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="formatted-shortcut-link-btn"
          title={`Open ${label}`}
        >
          <span>{label}</span>
          <ExternalLink size={12} />
        </a>
      );
    }

    // 2. [label](url) markdown link
    const mdLinkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s,)]+)\)$/i);
    if (mdLinkMatch) {
      const label = mdLinkMatch[1].trim();
      const url = mdLinkMatch[2].trim();
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="formatted-shortcut-link-btn"
          title={`Open ${label}`}
        >
          <span>{label}</span>
          <ExternalLink size={12} />
        </a>
      );
    }

    // 3. Raw URL
    if (/^https?:\/\//i.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="formatted-url-link"
        >
          <span>{part}</span>
          <ExternalLink size={11} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '2px' }} />
        </a>
      );
    }

    return part;
  });
}

/**
 * Splits a table line by $ (preferred), #, or , (comma)
 */
function splitTableRow(line) {
  if (line.includes('$')) {
    return line.split('$').map(c => c.trim());
  }
  if (line.includes('#')) {
    return line.split('#').map(c => c.trim());
  }
  if (line.includes(',')) {
    return line.split(',').map(c => c.trim());
  }
  return [line.trim()];
}

/**
 * Parses structured description text containing:
 * - Headings:
 *     H1: Main Title | H1--> Title | <h1>Title</h1> | # Title
 *     H2: Sub-Heading | H2--> Title | <h2>Title</h2> | ## Title
 *     H3: Paragraph Header | H3--> Title | <h3>Title</h3> | ### Title
 * - Dividers:
 *     --- (horizontal separator line) | --- | ----- (line) | <hr>
 * - Tables (Green Tables):
 *     table:
 *     Organization$TNPSC
 *     Post Name$Combined Technical Services
 *     Apply Link$https://apply.tnpscexams.in/
 *     OR
 *     <table>
 *     1#Label#Value
 *     2#Label#Value
 *     </table>
 *     OR
 *     Key$Value lines
 * - URLs:
 *     https:// in tables or text convert into clickable links
 * - Regular paragraphs
 */
export function parseFormattedContent(text) {
  if (!text || typeof text !== 'string') return [];

  const lines = text.split(/\r?\n/);
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Skip empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Divider lines: ---, --- (horizontal separator line), ----- (line), <hr>, etc.
    if (
      /^---+/i.test(trimmed) || 
      /^<hr\s*\/?>$/i.test(trimmed) ||
      /^===+/i.test(trimmed)
    ) {
      blocks.push({ type: 'divider' });
      i++;
      continue;
    }

    // 2. HTML Headings: <h1>...</h1>, <h2>...</h2>, <h3>...</h3>, <h4>...</h4>
    const hHtmlMatch = trimmed.match(/^<h([1-4])>(.*?)<\/h\1>$/i);
    if (hHtmlMatch) {
      blocks.push({
        type: 'heading',
        level: parseInt(hHtmlMatch[1], 10),
        text: hHtmlMatch[2].trim()
      });
      i++;
      continue;
    }

    // 3. Prefix Headings: H1: Title | H1--> Title | H2: Title | H3: Title
    const hPrefixMatch = trimmed.match(/^H([1-4])\s*(?:-->|:|-)\s*(.*)$/i);
    if (hPrefixMatch) {
      blocks.push({
        type: 'heading',
        level: parseInt(hPrefixMatch[1], 10),
        text: hPrefixMatch[2].trim()
      });
      i++;
      continue;
    }

    // 4. Markdown Headings: # Title, ## Title, ### Title
    const hMdMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (hMdMatch) {
      blocks.push({
        type: 'heading',
        level: hMdMatch[1].length,
        text: hMdMatch[2].trim()
      });
      i++;
      continue;
    }

    // 5. Explicit HTML Table: <table> ... </table>
    if (/^<table\b[^>]*>/i.test(trimmed)) {
      const tableRows = [];
      i++;
      while (i < lines.length && !/<\/table>/i.test(lines[i])) {
        const rowLine = lines[i].trim();
        if (rowLine) {
          const cells = splitTableRow(rowLine);
          if (cells.length > 0 && cells.some(c => c.length > 0)) {
            tableRows.push(cells);
          }
        }
        i++;
      }
      if (i < lines.length && /<\/table>/i.test(lines[i])) {
        i++; // skip </table>
      }
      if (tableRows.length > 0) {
        blocks.push({ type: 'table', rows: tableRows });
      }
      continue;
    }

    // 6. Explicit "table:" keyword followed by lines separated by $ (or , or #)
    if (/^table\s*:\s*$/i.test(trimmed)) {
      const tableRows = [];
      i++;
      while (i < lines.length) {
        const rowLine = lines[i].trim();
        if (!rowLine) break; // empty line terminates table
        // if next line is another section or divider, stop table
        if (
          /^---+/i.test(rowLine) || 
          /^<h[1-4]>/i.test(rowLine) || 
          /^H[1-4]\s*(?:-->|:)/i.test(rowLine) || 
          /^#{1,4}\s+/i.test(rowLine) ||
          /^<table\b/i.test(rowLine)
        ) {
          break;
        }
        if (rowLine.includes('$') || rowLine.includes('#') || rowLine.includes(',')) {
          const cells = splitTableRow(rowLine);
          tableRows.push(cells);
          i++;
        } else {
          break;
        }
      }
      if (tableRows.length > 0) {
        blocks.push({ type: 'table', rows: tableRows });
      }
      continue;
    }

    // 7. Standalone delimited table rows (separated by $ or #)
    // e.g. Organization$TNPSC or 1#Label#Value
    if (trimmed.includes('$') || (trimmed.includes('#') && !trimmed.startsWith('#'))) {
      const tableRows = [];
      while (i < lines.length) {
        const rowLine = lines[i].trim();
        if (!rowLine || (!rowLine.includes('$') && !rowLine.includes('#'))) break;
        if (
          /^---+/i.test(rowLine) || 
          /^<h[1-4]>/i.test(rowLine) || 
          /^H[1-4]\s*(?:-->|:)/i.test(rowLine) || 
          /^#{1,4}\s+/i.test(rowLine) ||
          /^<table\b/i.test(rowLine)
        ) {
          break;
        }
        const cells = splitTableRow(rowLine);
        tableRows.push(cells);
        i++;
      }
      if (tableRows.length > 0) {
        blocks.push({ type: 'table', rows: tableRows });
      }
      continue;
    }

    // 8. Regular text paragraph
    const pLines = [trimmed];
    i++;
    while (i < lines.length) {
      const nextLine = lines[i].trim();
      if (!nextLine) break;
      if (
        /^---+/i.test(nextLine) ||
        /^<h[1-4]>/i.test(nextLine) ||
        /^H[1-4]\s*(?:-->|:)/i.test(nextLine) ||
        /^#{1,4}\s+/i.test(nextLine) ||
        /^<table\b/i.test(nextLine) ||
        /^table\s*:/i.test(nextLine) ||
        nextLine.includes('$') ||
        (nextLine.includes('#') && !nextLine.startsWith('#'))
      ) {
        break;
      }
      pLines.push(nextLine);
      i++;
    }

    blocks.push({
      type: 'paragraph',
      text: pLines.join('\n')
    });
  }

  return blocks;
}

export default function FormattedContent({ content, className = '' }) {
  if (!content) return null;

  const blocks = parseFormattedContent(content);
  if (blocks.length === 0) return null;

  return (
    <div className={`formatted-content-root ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'heading') {
          const { level, text } = block;
          if (level === 1) {
            return (
              <h2 key={idx} className="formatted-heading-1">
                <Bookmark size={18} color="var(--primary-color)" />
                <span>{renderTextWithLinks(text)}</span>
              </h2>
            );
          }
          if (level === 2) {
            return (
              <h3 key={idx} className="formatted-heading-2">
                <span>{renderTextWithLinks(text)}</span>
              </h3>
            );
          }
          if (level === 3) {
            return (
              <h4 key={idx} className="formatted-heading-3">
                <ChevronRight size={15} color="var(--primary-color)" />
                <span>{renderTextWithLinks(text)}</span>
              </h4>
            );
          }
          return (
            <h5 key={idx} className="formatted-heading-4">
              {renderTextWithLinks(text)}
            </h5>
          );
        }

        if (block.type === 'divider') {
          return <div key={idx} className="formatted-divider" />;
        }

        if (block.type === 'table') {
          const rows = block.rows;
          if (!rows || rows.length === 0) return null;

          // Determine column count from the row with the most cells
          const maxCols = Math.max(...rows.map(r => r.length));

          // Check if first row is explicitly a header
          const firstRow = rows[0];
          const hasExplicitHeader = 
            isNaN(Number(firstRow[0])) && 
            rows.length > 1 && 
            firstRow.some(cell => /label|name|item|field|title|value|info|details|no|id|type|parameter/i.test(cell));

          const headerRow = hasExplicitHeader ? firstRow : null;
          const bodyRows = hasExplicitHeader ? rows.slice(1) : rows;

          return (
            <div key={idx} className="formatted-table-wrapper">
              <table className="formatted-table">
                {headerRow && (
                  <thead>
                    <tr>
                      {headerRow.map((cell, cIdx) => (
                        <th key={cIdx}>
                          {cell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {bodyRows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => {
                        const isFirstCol = cIdx === 0;
                        const isShortBadge = isFirstCol && cell.length <= 3 && !isNaN(Number(cell));
                        const isUrlCell = /^https?:\/\//i.test(cell);

                        return (
                          <td 
                            key={cIdx} 
                            className={isFirstCol ? 'formatted-table-col-label' : ''}
                          >
                            {isShortBadge ? (
                              <span className="formatted-table-col-badge">
                                {cell}
                              </span>
                            ) : isUrlCell ? (
                              <a
                                href={cell}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="formatted-table-link-btn"
                              >
                                <span>{cell}</span>
                                <ExternalLink size={12} />
                              </a>
                            ) : (
                              renderTextWithLinks(cell)
                            )}
                          </td>
                        );
                      })}
                      {/* Fill empty cells if row has fewer cells than maxCols */}
                      {row.length < maxCols && Array.from({ length: maxCols - row.length }).map((_, emptyIdx) => (
                        <td key={`empty-${emptyIdx}`}>-</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.type === 'paragraph') {
          return (
            <p key={idx} className="formatted-paragraph">
              {renderTextWithLinks(block.text)}
            </p>
          );
        }

        return null;
      })}
    </div>
  );
}
