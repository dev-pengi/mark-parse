export class MarkdownParser {
    public parse(markdown: string): string {
        const lines: string[] = markdown.split('\n');
        let html = '';
        let isInList = false;
        let isInCodeBlock = false;
        let isInBlockQuote = false;
        let listIndentLevel = 0;

        for (const line of lines) {
            if (line.startsWith('#')) {
                const level = Math.min(line.indexOf(' '), 6);

                if (level > 0) {
                    const headingText = line.slice(level + 1);
                    html += `<h${level}>${this.formatInlineElements(headingText)}</h${level}>`;
                }
            } else if (line.match(/^(\s*)([-*]+|\d+\.)\s(.+)/)) {
                const [, indent, listMarker, listItemText] = line.match(/^(\s*)([-*]+|\d+\.)\s(.+)/) ?? [];
                const indentLevel = indent?.length / 2 ?? 0;

                if (indentLevel === listIndentLevel) {
                    if (!isInList) {
                        html += '<ul>';
                        isInList = true;
                    }

                    html += `<li>${this.formatInlineElements(listItemText)}</li>`;
                } else if (indentLevel > listIndentLevel) {
                    if (!isInList) {
                        html += '<ul>';
                        isInList = true;
                    }

                    html += '<ul><li>' + this.formatInlineElements(listItemText);
                    listIndentLevel++;
                } else if (indentLevel < listIndentLevel) {
                    html += '</li></ul>'.repeat(listIndentLevel - indentLevel) + `<li>${this.formatInlineElements(listItemText)}`;
                    listIndentLevel = indentLevel;
                }
            } else if (line.startsWith('```')) {
                if (isInCodeBlock) {
                    html += '</code></pre>';
                    isInCodeBlock = false;
                } else {
                    html += '<pre><code>';
                    isInCodeBlock = true;
                }
            } else if (line.startsWith('`')) {
                html += '<code>' + this.escapeHtml(line.slice(1));
            } else if (line.startsWith('---') || line.startsWith('***') || line.startsWith('___')) {
                html += '<hr>';
            } else if (line.startsWith('>')) {
                if (!isInBlockQuote) {
                    html += '<blockquote>';
                    isInBlockQuote = true;
                }

                html += this.formatInlineElements(line.slice(1));
                html += '<br>';
            } else {
                if (isInList) {
                    html += '</ul>';
                    isInList = false;
                    listIndentLevel = 0;
                }

                if (isInCodeBlock) {
                    html += this.escapeHtml(line) + '\n';
                } else if (isInBlockQuote) {
                    html += this.formatInlineElements(line);
                    html += '<br>';
                } else if (line.trim().length > 0) {
                    html += `<p>${this.formatInlineElements(line)}</p>`;
                }
            }
        }

        if (isInList) {
            html += '</ul>'.repeat(listIndentLevel);
        }

        if (isInCodeBlock) {
            html += '</code></pre>';
        }

        if (isInBlockQuote) {
            html += '</blockquote>';
        }

        return html;
    }

    private formatInlineElements(text: string): string {
        let formattedText = text;

        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
        formattedText = formattedText.replace(/__(.*?)__/g, '<u>$1</u>');
        formattedText = formattedText.replace(/~~(.*?)~~/g, '<s>$1</s>');

        return formattedText;
    }

    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/\n/g, '<br>');
    }
}
