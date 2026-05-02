function parseCellContent(cell: Element): string {
  return Array.from(cell.childNodes)
    .map(processNode)
    .join('')
    .trim()
    .replace(/\|/g, '\\|')
    .replace(/\n+/g, ' ');
}

function parseTable(tableEl: Element): string {
  const rows = Array.from(tableEl.querySelectorAll('tr'));
  if (!rows.length) return '';

  const data = rows.map(row =>
    Array.from(row.querySelectorAll('td, th')).map(parseCellContent)
  );

  if (!data.length || !data[0].length) return '';

  const cols = Math.max(...data.map(r => r.length));
  const normalized = data.map(row => {
    const padded = [...row];
    while (padded.length < cols) padded.push('');
    return padded;
  });

  return [
    '| ' + normalized[0].join(' | ') + ' |',
    '| ' + Array(cols).fill('---').join(' | ') + ' |',
    ...normalized.slice(1).map(row => '| ' + row.join(' | ') + ' |'),
  ].join('\n');
}

function processNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  const inner = () => Array.from(el.childNodes).map(processNode).join('');

  switch (tag) {
    case 'h1': return `# ${inner().trim()}\n\n`;
    case 'h2': return `## ${inner().trim()}\n\n`;
    case 'h3': return `### ${inner().trim()}\n\n`;
    case 'h4': return `#### ${inner().trim()}\n\n`;
    case 'h5': return `##### ${inner().trim()}\n\n`;
    case 'h6': return `###### ${inner().trim()}\n\n`;
    case 'p': {
      const text = inner().trim();
      return text ? `${text}\n\n` : '';
    }
    case 'strong':
    case 'b': return `**${inner()}**`;
    case 'em':
    case 'i': return `*${inner()}*`;
    case 'br': return '\n';
    case 'ul': {
      const items = Array.from(el.children).filter(c => c.tagName.toLowerCase() === 'li');
      return items.map(li => `- ${processNode(li).trim()}`).join('\n') + '\n\n';
    }
    case 'ol': {
      const items = Array.from(el.children).filter(c => c.tagName.toLowerCase() === 'li');
      return items.map((li, i) => `${i + 1}. ${processNode(li).trim()}`).join('\n') + '\n\n';
    }
    case 'li': return inner();
    case 'table': return '\n\n' + parseTable(el) + '\n\n';
    case 'thead':
    case 'tbody':
    case 'tfoot':
    case 'tr':
    case 'td':
    case 'th': return inner();
    case 'a': {
      const href = el.getAttribute('href');
      const text = inner();
      return href ? `[${text}](${href})` : text;
    }
    case 'code': return `\`${inner()}\``;
    case 'pre': return `\`\`\`\n${el.textContent || ''}\n\`\`\`\n\n`;
    default: return inner();
  }
}

export function htmlToMarkdown(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const markdown = Array.from(doc.body.childNodes).map(processNode).join('');
  return markdown.replace(/\n{3,}/g, '\n\n').trim();
}
