'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Enhanced Markdown Renderer for flashcard content
 * Supports: tables, bold, italic, lists, code, headers, math (LaTeX)
 */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const renderedContent = useMemo(() => {
    return parseMarkdown(content);
  }, [content]);

  return (
    <div className={cn('markdown-content', className)}>
      {renderedContent}
    </div>
  );
}

function parseMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Check for table (starts with |)
    if (line.trim().startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      elements.push(<Table key={key++} lines={tableLines} />);
      continue;
    }

    // Check for unordered list
    if (line.trim().match(/^[-*]\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^[-*]\s/)) {
        listItems.push(lines[i].trim().replace(/^[-*]\s/, ''));
        i++;
      }
      elements.push(<UnorderedList key={key++} items={listItems} />);
      continue;
    }

    // Check for ordered list
    if (line.trim().match(/^\d+\.\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^\d+\.\s/)) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(<OrderedList key={key++} items={listItems} />);
      continue;
    }

    // Check for headers
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const text = headerMatch[2];
      elements.push(<Header key={key++} level={level} text={text} />);
      i++;
      continue;
    }

    // Check for code block
    if (line.trim().startsWith('```')) {
      const codeLines: string[] = [];
      i++; // Skip opening ```
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // Skip closing ```
      elements.push(<CodeBlock key={key++} code={codeLines.join('\n')} />);
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={key++} className="h-2" />);
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(<Paragraph key={key++} text={line} />);
    i++;
  }

  return elements;
}

// Table component
function Table({ lines }: { lines: string[] }) {
  if (lines.length < 2) return null;

  const parseRow = (line: string): string[] => {
    return line
      .split('|')
      .slice(1, -1) // Remove empty first and last from split
      .map(cell => cell.trim());
  };

  const headers = parseRow(lines[0]);

  // Check if second line is separator (contains ---)
  const hasSeparator = lines[1]?.includes('---');
  const dataStartIndex = hasSeparator ? 2 : 1;

  const rows = lines.slice(dataStartIndex).map(parseRow);

  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-blue-50 dark:bg-blue-900/30">
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-3 py-2 text-left font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              >
                <InlineMarkdown text={header} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                'transition-colors',
                rowIndex % 2 === 0
                  ? 'bg-white dark:bg-gray-800'
                  : 'bg-gray-50 dark:bg-gray-800/50'
              )}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <InlineMarkdown text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Unordered list component
function UnorderedList({ items }: { items: string[] }) {
  return (
    <ul className="my-3 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
          <span><InlineMarkdown text={item} /></span>
        </li>
      ))}
    </ul>
  );
}

// Ordered list component
function OrderedList({ items }: { items: string[] }) {
  return (
    <ol className="my-3 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-sm font-semibold">
            {i + 1}
          </span>
          <span className="flex-1 pt-0.5"><InlineMarkdown text={item} /></span>
        </li>
      ))}
    </ol>
  );
}

// Header component
function Header({ level, text }: { level: number; text: string }) {
  const className = cn(
    'font-bold text-gray-900 dark:text-white',
    level === 1 && 'text-xl mt-4 mb-2',
    level === 2 && 'text-lg mt-3 mb-2',
    level === 3 && 'text-base mt-2 mb-1',
    level >= 4 && 'text-sm mt-2 mb-1'
  );

  return (
    <div className={className}>
      <InlineMarkdown text={text} />
    </div>
  );
}

// Code block component
function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="my-3 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-x-auto text-sm font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
      {code}
    </pre>
  );
}

// Paragraph component
function Paragraph({ text }: { text: string }) {
  return (
    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
      <InlineMarkdown text={text} />
    </p>
  );
}

// Inline markdown (bold, italic, code, math)
function InlineMarkdown({ text }: { text: string }) {
  if (!text) return null;

  const elements: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Math (LaTeX): $...$
    const mathMatch = remaining.match(/^\$([^$]+)\$/);
    if (mathMatch) {
      elements.push(
        <span
          key={key++}
          className="inline-block px-1 py-0.5 mx-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-mono text-sm"
        >
          {mathMatch[1]}
        </span>
      );
      remaining = remaining.slice(mathMatch[0].length);
      continue;
    }

    // Bold: **text** or __text__
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/) || remaining.match(/^__([^_]+)__/);
    if (boldMatch) {
      elements.push(
        <strong key={key++} className="font-bold text-gray-900 dark:text-white">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic: *text* or _text_
    const italicMatch = remaining.match(/^\*([^*]+)\*/) || remaining.match(/^_([^_]+)_/);
    if (italicMatch) {
      elements.push(
        <em key={key++} className="italic">
          {italicMatch[1]}
        </em>
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Inline code: `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      elements.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-red-600 dark:text-red-400 rounded text-sm font-mono"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Highlight with colon pattern: **key**: value (common in flashcards)
    const keyValueMatch = remaining.match(/^([^:]+):\s*/);
    if (keyValueMatch && remaining.indexOf(':') < 20) {
      // Only treat as key-value if colon is near the start
      const keyPart = keyValueMatch[1];
      // Check if key part has bold markers
      if (keyPart.startsWith('**') && keyPart.endsWith('**')) {
        elements.push(
          <span key={key++} className="font-bold text-blue-600 dark:text-blue-400">
            {keyPart.slice(2, -2)}
          </span>
        );
        elements.push(<span key={key++}>: </span>);
        remaining = remaining.slice(keyValueMatch[0].length);
        continue;
      }
    }

    // Regular text (up to next special character)
    const nextSpecial = remaining.search(/[\*_`$]/);
    if (nextSpecial === -1) {
      elements.push(<span key={key++}>{remaining}</span>);
      break;
    } else if (nextSpecial === 0) {
      // Special char that wasn't matched - treat as regular text
      elements.push(<span key={key++}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    } else {
      elements.push(<span key={key++}>{remaining.slice(0, nextSpecial)}</span>);
      remaining = remaining.slice(nextSpecial);
    }
  }

  return <>{elements}</>;
}
