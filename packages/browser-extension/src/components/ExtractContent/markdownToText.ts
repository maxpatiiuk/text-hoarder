import { parse, Renderer, type Tokens } from 'marked';
import { htmlDecode } from './documentToSimpleDocument';

export class TextRenderer extends Renderer {
  override code({ text }: Tokens.Code): string {
    return text.trimEnd() + '\n';
  }
  override blockquote({ tokens }: Tokens.Blockquote): string {
    return this.parser.parse(tokens);
  }

  override html(): string {
    return '';
  }

  override heading({ tokens }: Tokens.Heading): string {
    return this.parser.parseInline(tokens) + '\n';
  }

  override hr(): string {
    return '';
  }

  override list({ items }: Tokens.List): string {
    return '\n' + items.map(this.listitem, this).join('').trimEnd() + '\n\n';
  }

  override listitem(item: Tokens.ListItem): string {
    let itemBody = '';
    if (item.task) {
      const checkbox = this.checkbox({ checked: !!item.checked });
      if (item.loose) {
        if (item.tokens[0]?.type === 'paragraph') {
          item.tokens[0].text = checkbox + ' ' + item.tokens[0].text;
          if (
            item.tokens[0].tokens &&
            item.tokens[0].tokens.length > 0 &&
            item.tokens[0].tokens[0].type === 'text'
          ) {
            item.tokens[0].tokens[0].text =
              checkbox + ' ' + item.tokens[0].tokens[0].text;
            item.tokens[0].tokens[0].escaped = true;
          }
        } else {
          item.tokens.unshift({
            type: 'text',
            raw: checkbox + ' ',
            text: checkbox + ' ',
            escaped: true,
          });
        }
      } else {
        itemBody += checkbox + ' ';
      }
    }

    itemBody += this.parser.parse(item.tokens, !!item.loose);

    return `${itemBody}\n`;
  }

  override checkbox({ checked }: Tokens.Checkbox): string {
    return checked ? '(checked)' : '';
  }

  override paragraph({ tokens }: Tokens.Paragraph): string {
    return `${this.parser.parseInline(tokens)}\n`;
  }

  override table(token: Tokens.Table): string {
    let header = '';

    let cell = '';
    for (let j = 0; j < token.header.length; j++) {
      cell += this.tablecell(token.header[j]);
    }
    header += this.tablerow({ text: cell });

    let body = '';
    for (let j = 0; j < token.rows.length; j++) {
      const row = token.rows[j];

      cell = '';
      for (let k = 0; k < row.length; k++) {
        cell += this.tablecell(row[k]);
      }

      body += this.tablerow({ text: cell });
    }

    return header + body;
  }

  override tablerow({ text }: Tokens.TableRow): string {
    return `${text.trim()}\n`;
  }

  override tablecell(token: Tokens.TableCell): string {
    return this.parser.parseInline(token.tokens) + ' ';
  }

  override strong({ tokens }: Tokens.Strong): string {
    return this.parser.parseInline(tokens);
  }

  override em({ tokens }: Tokens.Em): string {
    return this.parser.parseInline(tokens);
  }

  override codespan({ text }: Tokens.Codespan): string {
    return text;
  }

  override br(): string {
    return '\n';
  }

  override del({ tokens }: Tokens.Del): string {
    return this.parser.parseInline(tokens);
  }

  override link({ tokens }: Tokens.Link): string {
    return this.parser.parseInline(tokens);
  }

  override image({ text }: Tokens.Image): string {
    return text;
  }

  override text(token: Tokens.Text | Tokens.Escape): string {
    return 'tokens' in token && token.tokens
      ? this.parser.parseInline(token.tokens)
      : token.text;
  }
}

/**
 * Convert markdown to text.
 */
export function markdownToText(markdown: string): string {
  const unmarked = parse(markdown, {
    renderer: new TextRenderer(),
  }) as string;
  // If original markdown string had &lt; marked won't unescape it
  const unescaped = htmlDecode(unmarked);
  const trimmed = unescaped.trim();
  return trimmed;
}
