export class MarkdownParser {
    parse(markdown: string): string {
        const lines = markdown.split('\n');
        let html = '';
        let isInList = false;
        let isInSublist = false;
        let isInCodeBlock = false;
        let isInSingleLineCode = false;
        let isInBlockQuote = false;

        for (const line of lines) {
            if (line.startsWith('#')) {
                const level = Math.min(line.indexOf(' '), 6);

                if (level > 0) {
                    const headingText = line.slice(level + 1);
                    html += `<h${level}>${this.formatInlineElements(headingText)}</h${level}>`;
                }
            } else if (line.startsWith('*') || line.startsWith('-')) {
                const listMarker = line.startsWith('*') ? '*' : '-';
                const listItemText = line.slice(1).trim();

                if (!isInList) {
                    html += '<ul>';
                    isInList = true;
                }

                if (!isInSublist && line.startsWith(' ')) {
                    html += '<ul>';
                    isInSublist = true;
                } else if (!line.startsWith(' ') && isInSublist) {
                    html += '</li></ul>';
                    isInSublist = false;
                }

                html += `<li>${this.formatInlineElements(listItemText)}</li>`;
            } else if (line.match(/^\d+\./)) {
                const listItemText = line.replace(/^\d+\./, '').trim();

                if (!isInList) {
                    html += '<ol>';
                    isInList = true;
                }

                if (!isInSublist && line.startsWith(' ')) {
                    html += '<ol>';
                    isInSublist = true;
                } else if (!line.startsWith(' ') && isInSublist) {
                    html += '</li></ol>';
                    isInSublist = false;
                }

                html += `<li>${this.formatInlineElements(listItemText)}</li>`;
            } else if (line.startsWith('```')) {
                if (isInCodeBlock) {
                    html += '</code></pre>';
                    isInCodeBlock = false;
                } else {
                    html += '<pre><code>';
                    isInCodeBlock = true;
                }
            } else if (line.startsWith('`')) {
                if (isInSingleLineCode) {
                    html += '</code>';
                    isInSingleLineCode = false;
                } else {
                    html += '<code>';
                    isInSingleLineCode = true;
                }
                html += this.escapeHtml(line.slice(1));
            } else if (line.startsWith('---') || line.startsWith('***') || line.startsWith('___')) {
                html += '<hr>';
            } else if (line.startsWith('>')) {
                if (!isInBlockQuote) {
                    html += '<blockquote>';
                    isInBlockQuote = true;
                }

                html += this.formatInlineElements(line.slice(1));
                html += '<br>';
            } else if (line.trim().length === 0) {
                // Ignore empty lines
                continue;
            } else {
                if (isInList) {
                    html += '</ul>';
                    isInList = false;
                }

                if (isInSublist) {
                    html += '</li></ul>';
                    isInSublist = false;
                }

                if (isInCodeBlock) {
                    html += this.escapeHtml(line) + '\n';
                } else if (isInSingleLineCode) {
                    html += this.escapeHtml(line) + '</code>';
                    isInSingleLineCode = false;
                } else if (isInBlockQuote) {
                    html += this.formatInlineElements(line);
                    html += '<br>';
                } else {
                    html += `<p>${this.formatInlineElements(line)}</p>`;
                }
            }
        }

        if (isInList) {
            html += '</ul>';
        }

        if (isInSublist) {
            html += '</li></ul>';
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
            .replace(/'/g, '&#039;');
    }
}