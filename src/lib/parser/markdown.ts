/**
 * Markdown Card File Parser
 *
 * Supports multiple formats:
 *
 * Format 1 - Cloze (Simple):
 * # Deck Title
 * tags: tag1, tag2
 * ---
 * Sentence with {{c1::answer::hint}} cloze.
 * |trap: option1, option2
 *
 * Format 2 - Q&A:
 * # Deck Title
 * tags: tag1, tag2
 * ---
 * Q: Question
 * A: Answer
 *
 * Format 3 - Structured (Original):
 * ---
 * deck: Deck Name
 * tags: [tag1, tag2]
 * ---
 * # Card Title
 * ## front
 * Question
 * ## back
 * Answer
 */

import type { ParsedCard, ParsedDeck, ParseResult, ParseError } from './types';
import { extractClozes } from './cloze';

interface DeckMeta {
  name?: string;
  tags: string[];
  description?: string;
}

/**
 * Parse deck metadata from the beginning of the file
 * Supports both "# Title\ntags: ..." and YAML front matter
 */
function parseDeckMeta(content: string): { meta: DeckMeta; body: string } {
  const lines = content.split('\n');
  const meta: DeckMeta = { tags: [] };
  let bodyStartIndex = 0;

  // Check for YAML front matter (---\n...\n---)
  if (lines[0]?.trim() === '---') {
    const endIndex = lines.findIndex((line, i) => i > 0 && line.trim() === '---');
    if (endIndex > 0) {
      // Parse YAML front matter
      for (let i = 1; i < endIndex; i++) {
        const line = lines[i];
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) continue;

        const key = line.slice(0, colonIndex).trim().toLowerCase();
        const value = line.slice(colonIndex + 1).trim();

        if (key === 'deck' || key === 'name' || key === 'title') {
          meta.name = value;
        } else if (key === 'description') {
          meta.description = value;
        } else if (key === 'tags') {
          const tagsMatch = value.match(/\[(.*)\]/);
          if (tagsMatch) {
            meta.tags = tagsMatch[1].split(',').map(t => t.trim()).filter(Boolean);
          } else {
            meta.tags = value.split(',').map(t => t.trim()).filter(Boolean);
          }
        }
      }
      bodyStartIndex = endIndex + 1;
    }
  }

  // Check for "# Title" format (non-YAML)
  const remainingLines = lines.slice(bodyStartIndex);
  for (let i = 0; i < remainingLines.length; i++) {
    const line = remainingLines[i].trim();

    // Stop at separator
    if (line === '---') {
      bodyStartIndex += i + 1;
      break;
    }

    // Parse title (# Deck Title)
    if (line.startsWith('# ') && !meta.name) {
      meta.name = line.slice(2).trim();
      continue;
    }

    // Parse tags line
    if (line.toLowerCase().startsWith('tags:')) {
      const tagsValue = line.slice(5).trim();
      meta.tags = tagsValue.split(',').map(t => t.trim()).filter(Boolean);
      continue;
    }

    // Parse description
    if (line.toLowerCase().startsWith('description:')) {
      meta.description = line.slice(12).trim();
      continue;
    }

    // Skip empty lines in header
    if (line === '') continue;

    // If we hit content that's not metadata, treat as body
    if (!line.startsWith('#') && !line.toLowerCase().startsWith('tags:') &&
        !line.toLowerCase().startsWith('description:') && line !== '') {
      bodyStartIndex += i;
      break;
    }
  }

  const body = lines.slice(bodyStartIndex).join('\n').trim();
  return { meta, body };
}

/**
 * Parse cards from body content
 * Supports cloze format, Q&A format, line-based pipe format, and structured format
 */
function parseCards(body: string, errors: ParseError[]): ParsedCard[] {
  const cards: ParsedCard[] = [];

  // First, check if the body is line-based pipe format (most lines contain |)
  const allLines = body.split('\n').filter(line => line.trim() && line.trim() !== '---');
  const pipeLineCount = allLines.filter(line => line.includes('|') && !line.startsWith('|')).length;

  // If more than half of non-empty lines have pipes, treat as line-based format
  if (pipeLineCount > allLines.length * 0.5) {
    for (const line of allLines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine === '---') continue;

      // Simple pipe format: front | back
      if (trimmedLine.includes('|') && !trimmedLine.startsWith('|')) {
        const pipeIndex = trimmedLine.indexOf('|');
        const front = trimmedLine.slice(0, pipeIndex).trim();
        const back = trimmedLine.slice(pipeIndex + 1).trim();
        if (front && back) {
          cards.push({
            front,
            back,
            clozes: [],
            trapOptions: [],
            tags: [],
          });
        }
      }
    }
    return cards;
  }

  // Split by --- separators for card boundaries
  // Each section between --- is treated as one card block
  const sections = body.split(/\n---\n|\n---$|^---\n/).filter(s => s.trim() && s.trim() !== '---');

  for (const section of sections) {
    const trimmedBlock = section.trim();

    // Skip separators
    if (trimmedBlock === '---') continue;

    // Check for structured format first (## front / ## back / ## choices / ## steps)
    // These need to be kept as a single block even with empty lines
    if (trimmedBlock.includes('## front') || trimmedBlock.includes('## Front')) {
      const card = parseStructuredCard(trimmedBlock, errors);
      if (card) {
        cards.push(card);
      }
      continue;
    }

    // For non-structured cards, split by empty lines
    const subBlocks = trimmedBlock.split(/\n\s*\n/).filter(b => b.trim());

    for (const block of subBlocks) {
      const trimmedSubBlock = block.trim();
      if (!trimmedSubBlock || trimmedSubBlock === '---') continue;

      // Check for Q&A format
      if (trimmedSubBlock.startsWith('Q:') || trimmedSubBlock.startsWith('q:')) {
        const lines = trimmedSubBlock.split('\n');
        let question = '';
        let answer = '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.toLowerCase().startsWith('q:')) {
            question = trimmedLine.slice(2).trim();
          } else if (trimmedLine.toLowerCase().startsWith('a:')) {
            answer = trimmedLine.slice(2).trim();
          }
        }

        if (question && answer) {
          cards.push({
            front: question,
            back: answer,
            clozes: [],
            trapOptions: [],
            tags: [],
          });
        }
        continue;
      }

      // Cloze format: sentence with {{c1::answer::hint}} and optional |trap:
      if (trimmedSubBlock.includes('{{c') || trimmedSubBlock.includes('{{')) {
        const lines = trimmedSubBlock.split('\n');
        let front = '';
        let trapOptions: string[] = [];

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('|trap:') || trimmedLine.startsWith('| trap:')) {
            const trapValue = trimmedLine.replace(/^\|?\s*trap:\s*/i, '');
            trapOptions = trapValue.split(',').map(t => t.trim()).filter(Boolean);
          } else if (trimmedLine && !trimmedLine.startsWith('#')) {
            front = trimmedLine;
          }
        }

        if (front) {
          const clozes = extractClozes(front);
          cards.push({
            front,
            back: clozes.map(c => c.answer).join(', '),
            clozes,
            trapOptions,
            tags: [],
          });
        }
        continue;
      }

      // Simple pipe format: front | back
      if (trimmedSubBlock.includes('|') && !trimmedSubBlock.startsWith('|')) {
        const pipeIndex = trimmedSubBlock.indexOf('|');
        const front = trimmedSubBlock.slice(0, pipeIndex).trim();
        const back = trimmedSubBlock.slice(pipeIndex + 1).trim();
        if (front && back) {
          cards.push({
            front,
            back,
            clozes: [],
            trapOptions: [],
            tags: [],
          });
        }
        continue;
      }
    }
  }

  return cards;
}

/**
 * Parse a structured card block with ## front / ## back sections
 * Extended to support MCQ (## choices), numeric (## answer), and procedure (## steps)
 */
function parseStructuredCard(block: string, errors: ParseError[]): ParsedCard | null {
  const card: Partial<ParsedCard> = {
    tags: [],
    trapOptions: [],
    clozes: [],
  };

  // Extract title (# heading)
  const titleMatch = block.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    card.title = titleMatch[1].trim();
  }

  // Check for card type directive
  const typeMatch = block.match(/type:\s*(basic|cloze|mcq|numeric|procedure)/i);
  if (typeMatch) {
    card.cardType = typeMatch[1].toLowerCase() as ParsedCard['cardType'];
  }

  // Extract front section
  const frontMatch = block.match(/##\s*front\s*\n([\s\S]*?)(?=##|$)/i);
  if (frontMatch) {
    card.front = frontMatch[1].trim();
    card.clozes = extractClozes(card.front);
  } else {
    errors.push({
      message: `Card missing "## front" section${card.title ? ` (${card.title})` : ''}`,
      severity: 'error',
    });
    return null;
  }

  // Extract back section
  const backMatch = block.match(/##\s*back\s*\n([\s\S]*?)(?=##|$)/i);
  if (backMatch) {
    card.back = backMatch[1].trim();
  } else {
    card.back = '';
  }

  // Extract trap options section (legacy support)
  const trapMatch = block.match(/##\s*trap_options?\s*\n([\s\S]*?)(?=##|$)/i);
  if (trapMatch) {
    const trapContent = trapMatch[1].trim();
    const items = trapContent.match(/^[-*]\s*(.+)$/gm);
    if (items) {
      card.trapOptions = items.map(item =>
        item.replace(/^[-*]\s*/, '').trim()
      );
    } else {
      card.trapOptions = trapContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    }
  }

  // Extract choices section for MCQ cards
  // Format: - [x] Correct answer OR - [ ] Wrong answer
  const choicesMatch = block.match(/##\s*choices?\s*\n([\s\S]*?)(?=##|$)/i);
  if (choicesMatch) {
    const choicesContent = choicesMatch[1].trim();
    const choiceLines = choicesContent.split('\n').filter(line => line.trim());
    const choices: ParsedCard['choices'] = [];

    for (const line of choiceLines) {
      const trimmedLine = line.trim();
      // Match - [x] text (correct) or - [ ] text (incorrect)
      const checkboxMatch = trimmedLine.match(/^[-*]\s*\[(x|X| )\]\s*(.+)$/);
      if (checkboxMatch) {
        const isCorrect = checkboxMatch[1].toLowerCase() === 'x';
        const text = checkboxMatch[2].trim();
        choices.push({ text, isCorrect });
      } else {
        // Simple format: - text (first one is correct) OR * text (correct if marked with *)
        const simpleMatch = trimmedLine.match(/^[-*]\s*(.+)$/);
        if (simpleMatch) {
          const isCorrect = trimmedLine.startsWith('*');
          const text = simpleMatch[1].trim();
          choices.push({ text, isCorrect });
        }
      }
    }

    if (choices.length > 0) {
      card.choices = choices;
      card.cardType = card.cardType || 'mcq';
      card.answerType = 'choice';
    }
  }

  // Extract answer section for numeric cards
  // Format: ## answer\n42 OR ## answer\n3.14
  const answerMatch = block.match(/##\s*answer\s*\n([\s\S]*?)(?=##|$)/i);
  if (answerMatch && !card.choices) {
    const answerContent = answerMatch[1].trim();
    // Check if it's a numeric answer
    const numericValue = answerContent.split('\n')[0].trim();
    if (numericValue && /^-?[\d.,/]+$/.test(numericValue.replace(/\s/g, ''))) {
      card.answerKey = numericValue;
      card.cardType = card.cardType || 'numeric';
      card.answerType = 'number';
      // If no back is set, use the answer as back
      if (!card.back) {
        card.back = numericValue;
      }
    }
  }

  // Extract steps section for procedure cards
  // Format: ## steps\n1. Step one\n2. Step two (hint: some hint)
  const stepsMatch = block.match(/##\s*steps?\s*\n([\s\S]*?)(?=##|$)/i);
  if (stepsMatch) {
    const stepsContent = stepsMatch[1].trim();
    const stepLines = stepsContent.split('\n').filter(line => line.trim());
    const steps: ParsedCard['steps'] = [];

    for (const line of stepLines) {
      const trimmedLine = line.trim();
      // Match numbered steps: 1. Content (hint: optional hint)
      const stepMatch = trimmedLine.match(/^(\d+)[.)]\s*(.+?)(?:\s*\(hint:\s*([^)]+)\))?$/i);
      if (stepMatch) {
        const order = parseInt(stepMatch[1], 10);
        const content = stepMatch[2].trim();
        const hint = stepMatch[3]?.trim();
        steps.push({ order, content, hint });
      } else {
        // Simple numbered format without hint
        const simpleMatch = trimmedLine.match(/^(\d+)[.)]\s*(.+)$/);
        if (simpleMatch) {
          const order = parseInt(simpleMatch[1], 10);
          const content = simpleMatch[2].trim();
          steps.push({ order, content });
        }
      }
    }

    if (steps.length > 0) {
      // Sort by order
      steps.sort((a, b) => a.order - b.order);
      card.steps = steps;
      card.cardType = card.cardType || 'procedure';
      card.answerType = 'ordered-steps';
      // Set back to steps summary if not set
      if (!card.back) {
        card.back = steps.map(s => `${s.order}. ${s.content}`).join('\n');
      }
    }
  }

  // Extract tags
  const tagsMatch = block.match(/tags:\s*\[(.*)\]/i);
  if (tagsMatch) {
    card.tags = tagsMatch[1]
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
  }

  // Auto-detect card type if not set
  if (!card.cardType) {
    if (card.clozes && card.clozes.length > 0) {
      card.cardType = 'cloze';
    } else {
      card.cardType = 'basic';
    }
  }

  return card as ParsedCard;
}

/**
 * Parse a complete markdown deck file
 */
export function parseMarkdown(content: string, sourceFile?: string): ParseResult {
  const errors: ParseError[] = [];

  // Parse metadata
  const { meta, body } = parseDeckMeta(content);

  // Validate deck name
  if (!meta.name) {
    // Use filename as fallback
    if (sourceFile) {
      meta.name = sourceFile.replace(/\.(md|markdown)$/i, '').split('/').pop() || 'Untitled Deck';
    } else {
      meta.name = 'Untitled Deck';
    }
    errors.push({
      message: 'No deck name found. Using filename or "Untitled Deck".',
      severity: 'warning',
    });
  }

  // Parse cards
  const cards = parseCards(body, errors);

  if (cards.length === 0) {
    errors.push({
      message: 'No cards found in file. Check the file format.',
      severity: 'error',
    });
    return { success: false, errors };
  }

  // Apply deck-level tags to cards without tags
  for (const card of cards) {
    if (card.tags.length === 0 && meta.tags.length > 0) {
      card.tags = [...meta.tags];
    }
  }

  const deck: ParsedDeck = {
    name: meta.name,
    description: meta.description,
    tags: meta.tags,
    cards,
    sourceFile,
  };

  return {
    success: true,
    deck,
    errors,
  };
}
