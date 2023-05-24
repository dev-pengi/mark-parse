
# Mark parse

Mark parse is a JavaScript module that allows you to parse Markdown text and convert it into HTML.

## Installation

You can install the Make parse module using npm:

```bash
npm install mark-parse
```

## Usage

Import the `Make parse` class into your JavaScript file:

```javascript
import { MarkdownParser } from 'mark-parse';
```

Create an instance of the `MarkdownParser` class:

```javascript
const parser = new MarkdownParser();
```

Parse Markdown text:

```javascript
const markdown = '# Hello, World!';
const html = parser.parse(markdown);
console.log(html);
```

### Options

The `MarkdownParser` constructor accepts an optional `options` parameter that allows you to customize the parsing behavior. The available options are:

- `parseList` (default: `true`): Set to `false` to disable parsing of lists.
- `parseCodeBlock` (default: `true`): Set to `false` to disable parsing of code blocks.
- `parseBlockQuote` (default: `true`): Set to `false` to disable parsing of block quotes.
- `parseHeading` (default: `true`): Set to `false` to disable parsing of headings.
- `parseInlineCode` (default: `true`): Set to `false` to disable parsing of inline code.
- `parseHorizontalRule` (default: `true`): Set to `false` to disable parsing of horizontal rules.
- `parseBold` (default: `true`): Set to `false` to disable parsing of bold text.
- `parseItalic` (default: `true`): Set to `false` to disable parsing of italic text.
- `parseUnderline` (default: `true`): Set to `false` to disable parsing of underline text.
- `parseStrikethrough` (default: `true`): Set to `false` to disable parsing of strikethrough text.
- `parseLink` (default: `true`): Set to `false` to disable parsing of links.
- `parseImage` (default: `true`): Set to `false` to disable parsing of images.

You can customize the parsing behavior by providing an options object when creating the `MarkdownParser` instance:

```javascript
const options = {
  parseList: true,
  parseCodeBlock: true,
  parseBlockQuote: true,
  parseHeading: true,
  parseInlineCode: true,
  parseHorizontalRule: true,
  parseBold: true,
  parseItalic: true,
  parseUnderline: true,
  parseStrikethrough: true,
  parseLink: true,
  parseImage: true,
};

const parser = new MarkdownParser(options);
```

### Example

Here's an example of parsing Markdown text and rendering the HTML output:

```javascript
import { MarkdownParser } from 'markdown-parser';

const options = {
  parseHeading: false,
};

const parser = new MarkdownParser(options);

const markdown = '# Hello, World!';

const html = parser.parse(markdown);

console.log(html);
```

This output:

```
<p>Hello, World!</p>
```