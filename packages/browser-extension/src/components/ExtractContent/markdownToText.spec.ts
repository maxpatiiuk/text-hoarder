import { test } from 'vitest';
import assert from 'node:assert/strict';
import { markdownToText } from './markdownToText';

test('markdownToText', () => {
  assert.equal(
    markdownToText(
      `# Heading
# sub heading

> [!NOTE]
> [Test]() test@test.com '"<>& &lt;&gt; <sup>1</sup>
> ![Test]() 😆

1. **bold** __bold__
   - [x] *italic* _italic_
     * \`code\` ~~strike~~

<!-- comment -->

\`\`\`js
console.log('Hello, World!');
\`\`\`

| A | B |
| - | - |
| 1 | 2 |
`,
    ),
    `Heading
sub heading
[!NOTE]
Test test@test.com '"<>& <> 1
Test 😆

bold bold
(checked) italic italic
code strike

console.log('Hello, World!');
A B
1 2`,
  );
});
