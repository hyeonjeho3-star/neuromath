/**
 * IndexedDB Database using Dexie.js
 * Multi-user support with local authentication
 */

import Dexie, { type Table } from 'dexie';

// Types
export type CardType = 'basic' | 'cloze' | 'mcq' | 'numeric' | 'procedure';
export type AnswerType = 'text' | 'number' | 'choice' | 'ordered-steps';

// User Types
export interface User {
  id: string;
  username: string;
  displayName: string;
  passwordHash: string;  // SHA-256 hashed password
  createdAt: Date;
  lastLoginAt: Date;
  settings?: UserSettings;
}

export interface UserSettings {
  theme?: 'light' | 'dark' | 'system';
  defaultSessionMinutes?: number;
  maxNewCardsPerDay?: number;
  maxReviewsPerDay?: number;
}

export interface Deck {
  id: string;
  userId: string;  // Owner user ID
  name: string;
  description?: string;
  tags: string[];
  cardCount: number;
  newCount: number;
  learningCount: number;
  reviewCount: number;
  sourceFile?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Step {
  order: number;
  content: string;
  hint?: string;
}

export interface Card {
  id: string;
  userId: string;  // Owner user ID
  deckId: string;
  front: string;
  back: string;
  clozes: ClozeItem[];
  trapOptions: string[];
  tags: string[];
  // New fields for card types
  cardType: CardType;
  answerType: AnswerType;
  answerKey?: string;  // For numeric: exact answer, for text: expected answer
  choices?: Choice[];  // For MCQ cards
  steps?: Step[];      // For procedure cards
  // FSRS fields
  state: CardState;
  difficulty: number;
  stability: number;
  retrievability: number;
  dueDate: Date;
  lastReview: Date | null;
  reps: number;
  lapses: number;
  elapsedDays: number;
  scheduledDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClozeItem {
  index: number;
  answer: string;
  hint?: string;
  start: number;
  end: number;
}

export type CardState = 'new' | 'learning' | 'review' | 'relearning';

export type ErrorTag = 'careless' | 'concept' | 'calculation' | 'memory' | 'procedure' | 'other';

export interface ReviewLog {
  id: string;
  userId: string;  // Owner user ID
  cardId: string;
  deckId: string;
  rating: number;
  state: CardState;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  lastElapsedDays: number;
  scheduledDays: number;
  elapsedMs: number;
  reviewedAt: Date;
  // New fields for extended tracking
  isCorrect?: boolean;
  userAnswer?: string;
  selectedChoice?: string;  // Choice ID for MCQ
  errorTag?: ErrorTag;
}

export interface Settings {
  id: string;      // Primary key
  key: string;
  userId: string;  // Owner user ID
  value: string;
}

// Database class
class NeuroMathDatabase extends Dexie {
  users!: Table<User, string>;
  decks!: Table<Deck, string>;
  cards!: Table<Card, string>;
  reviewLogs!: Table<ReviewLog, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super('neuromath');

    // Version 1: Initial schema
    this.version(1).stores({
      decks: 'id, name, updatedAt',
      cards: 'id, deckId, state, dueDate, [deckId+state], [deckId+dueDate]',
      reviewLogs: 'id, cardId, deckId, reviewedAt, [deckId+reviewedAt]',
      settings: 'key',
    });

    // Version 2: Add cardType, answerType, choices, steps to cards
    //            Add isCorrect, userAnswer, selectedChoice, errorTag to reviewLogs
    this.version(2).stores({
      decks: 'id, name, updatedAt',
      cards: 'id, deckId, state, dueDate, cardType, [deckId+state], [deckId+dueDate], [deckId+cardType]',
      reviewLogs: 'id, cardId, deckId, reviewedAt, errorTag, [deckId+reviewedAt], [deckId+errorTag]',
      settings: 'key',
    }).upgrade(tx => {
      // Migrate existing cards to have default cardType and answerType
      return tx.table('cards').toCollection().modify(card => {
        if (!card.cardType) {
          // Determine card type based on existing data
          if (card.clozes && card.clozes.length > 0) {
            card.cardType = 'cloze';
            card.answerType = 'text';
          } else {
            card.cardType = 'basic';
            card.answerType = 'text';
          }
        }
        if (!card.answerType) {
          card.answerType = 'text';
        }
      });
    });

    // Version 3: Multi-user support (intermediate - may have issues with some DBs)
    // Kept for upgrade path compatibility
    this.version(3).stores({
      users: 'id, username',
      decks: 'id, userId, name, updatedAt, [userId+name], [userId+updatedAt]',
      cards: 'id, userId, deckId, state, dueDate, cardType, [userId+deckId], [userId+state], [deckId+state], [deckId+dueDate], [deckId+cardType]',
      reviewLogs: 'id, userId, cardId, deckId, reviewedAt, errorTag, [userId+deckId], [userId+reviewedAt], [deckId+reviewedAt], [deckId+errorTag]',
      settings: 'key, userId',
    });

    // Version 4: Fix settings table with proper id-based primary key
    // Note: settings table uses 'id' as primary key with [key+userId] as unique index
    this.version(4).stores({
      users: 'id, username',
      decks: 'id, userId, name, updatedAt, [userId+name], [userId+updatedAt]',
      cards: 'id, userId, deckId, state, dueDate, cardType, [userId+deckId], [userId+state], [deckId+state], [deckId+dueDate], [deckId+cardType]',
      reviewLogs: 'id, userId, cardId, deckId, reviewedAt, errorTag, [userId+deckId], [userId+reviewedAt], [deckId+reviewedAt], [deckId+errorTag]',
      settings: 'id, [key+userId], userId',
    }).upgrade(async tx => {
      const defaultUserId = 'default-user';
      const now = new Date();

      // Check if default user already exists (from v3)
      const existingUser = await tx.table('users').get(defaultUserId);
      if (!existingUser) {
        // Create default user for existing data migration
        await tx.table('users').add({
          id: defaultUserId,
          username: 'default',
          displayName: '기본 사용자',
          passwordHash: '',
          createdAt: now,
          lastLoginAt: now,
        });

        // Migrate existing decks to default user
        await tx.table('decks').toCollection().modify(deck => {
          if (!deck.userId) {
            deck.userId = defaultUserId;
          }
        });

        // Migrate existing cards to default user
        await tx.table('cards').toCollection().modify(card => {
          if (!card.userId) {
            card.userId = defaultUserId;
          }
        });

        // Migrate existing review logs to default user
        await tx.table('reviewLogs').toCollection().modify(log => {
          if (!log.userId) {
            log.userId = defaultUserId;
          }
        });
      }

      // Migrate settings - add id field if missing
      const oldSettings = await tx.table('settings').toArray();
      // Clear and re-add with new structure
      await tx.table('settings').clear();
      for (const setting of oldSettings) {
        await tx.table('settings').add({
          id: setting.id || crypto.randomUUID(),
          key: setting.key,
          userId: setting.userId || defaultUserId,
          value: setting.value,
        });
      }
    });
  }
}

// Singleton instance
export const db = new NeuroMathDatabase();

// Helper function to generate UUID
export function generateId(): string {
  return crypto.randomUUID();
}

// Helper function to hash password using SHA-256
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper function to verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}
