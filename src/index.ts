import prettier from 'prettier';

export interface MarkdownParserOptions {
    parseList?: boolean;
    parseCodeBlock?: boolean;
    parseBlockQuote?: boolean;
    parseHeading?: boolean;
    parseInlineCode?: boolean;
    parseHorizontalRule?: boolean;
    parseBold?: boolean;
    parseItalic?: boolean;
    parseUnderline?: boolean;
    parseStrikethrough?: boolean;
    parseLink?: boolean;
    parseImage?: boolean;
    formatHTML?: boolean;
}

export class MarkdownParser {
    private options: MarkdownParserOptions;

    constructor(options: MarkdownParserOptions = {}) {
        this.options = {
            parseList: options.parseList !== undefined ? options.parseList : true,
            parseCodeBlock: options.parseCodeBlock !== undefined ? options.parseCodeBlock : true,
            parseBlockQuote: options.parseBlockQuote !== undefined ? options.parseBlockQuote : true,
            parseHeading: options.parseHeading !== undefined ? options.parseHeading : true,
            parseInlineCode: options.parseInlineCode !== undefined ? options.parseInlineCode : true,
            parseHorizontalRule: options.parseHorizontalRule !== undefined ? options.parseHorizontalRule : true,
            parseBold: options.parseBold !== undefined ? options.parseBold : true,
            parseItalic: options.parseItalic !== undefined ? options.parseItalic : true,
            parseUnderline: options.parseUnderline !== undefined ? options.parseUnderline : true,
            parseStrikethrough: options.parseStrikethrough !== undefined ? options.parseStrikethrough : true,
            parseLink: options.parseLink !== undefined ? options.parseLink : true,
            parseImage: options.parseImage !== undefined ? options.parseImage : true,
            formatHTML: options.formatHTML !== undefined ? options.formatHTML : true
        };
    }

    public parse(markdown: string): string {
        const lines: string[] = markdown.trim().split('\n');
        let html: string = '';
        let isInList: boolean = false;
        let isInCodeBlock: boolean = false;
        let isInBlockQuote: boolean = false;
        let listIndentLevel: number = 0;

        for (let i = 0; i < lines.length; i++) {
            const line: string = lines[i];

            if (this.options.parseHeading && line.match(/^#{1,6}\s.+/)) {
                const level = line.indexOf(' ');

                if (level > 0) {
                    const headingText = line.slice(level + 1);
                    const headingLevel = Math.min(level, 6);
                    html += `<h${headingLevel}>${this.formatInlineElements(headingText)}</h${headingLevel}>`;
                    continue;
                }
            }

            if (this.options.parseList && line.match(/^(\s*)([-*]+|\d+\.)\s(.+)/)) {
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

                    html += '<ul><li>' + this.formatInlineElements(listItemText) + '</li>';
                    listIndentLevel++;
                } else if (indentLevel < listIndentLevel) {
                    html += '</li></ul>'.repeat(listIndentLevel - indentLevel) + `<li>${this.formatInlineElements(listItemText)}`;
                    listIndentLevel = indentLevel;
                }
            } else if (this.options.parseCodeBlock && line.startsWith('```')) {
                if (isInCodeBlock) {
                    html += '</code></pre>';
                    isInCodeBlock = false;
                } else {
                    html += '<pre><code>';
                    isInCodeBlock = true;
                }
            } else if (this.options.parseInlineCode && line.startsWith('`')) {
                html += '<code>' + this.escapeHtml(line.slice(1));
            } else if (this.options.parseHorizontalRule && (line.startsWith('---') || line.startsWith('***') || line.startsWith('___'))) {
                html += '<hr>';
            } else if (this.options.parseBlockQuote && line.startsWith('>')) {
                if (!isInBlockQuote) {
                    html += '<blockquote>';
                    isInBlockQuote = true;
                }

                html += this.formatInlineElements(line.slice(1).trim()) + ' ';
            } else if (this.options.parseImage && line.match(/^!\[.*?\]\(.*?\)/)) {
                const [, altText, imageUrl] = line.match(/^!\[(.*?)\]\((.*?)\)/) ?? [];
                html += `<img src="${imageUrl}" alt="${altText}">`;
            } else {
                if (isInList) {
                    html += '</ul>'.repeat(listIndentLevel + 1);
                    isInList = false;
                    listIndentLevel = 0;
                }

                if (isInCodeBlock) {
                    html += this.escapeHtml(line) + '\n';
                } else if (isInBlockQuote) {
                    html += this.formatInlineElements(line) + ' ';
                } else if (line.trim().length > 0) {
                    html += this.formatInlineElements(line) + ' ';
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
        if (this.options.formatHTML) html = prettier.format(html, { parser: 'html' });
        return html;
    }

    private formatInlineElements(text: string): string {
        let formattedText = text;

        if (this.options.parseBold) {
            formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        }
        if (this.options.parseItalic) {
            formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
        }
        if (this.options.parseUnderline) {
            formattedText = formattedText.replace(/__(.*?)__/g, '<u>$1</u>');
        }
        if (this.options.parseStrikethrough) {
            formattedText = formattedText.replace(/~~(.*?)~~/g, '<s>$1</s>');
        }
        if (this.options.parseLink) {
            formattedText = formattedText.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
        }

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