'use client';

import { useState, useRef } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { db } from '@/lib/db';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const {
    requestRetention,
    maximumInterval,
    maxNewCardsPerDay,
    maxReviewsPerDay,
    defaultSessionMinutes,
    restReminderMinutes,
    updateSetting,
    resetSettings,
  } = useSettingsStore();

  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      setExportStatus('exporting');
      setStatusMessage('Exporting data...');

      // Get all data from IndexedDB
      const decks = await db.decks.toArray();
      const cards = await db.cards.toArray();
      const reviewLogs = await db.reviewLogs.toArray();
      const settings = await db.settings.toArray();

      const exportData = {
        version: 2,
        exportedAt: new Date().toISOString(),
        data: {
          decks,
          cards,
          reviewLogs,
          settings,
        },
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `neuromath-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus('success');
      setStatusMessage(`Exported ${decks.length} decks, ${cards.length} cards`);
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
      setStatusMessage('Export failed. Please try again.');
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus('importing');
      setStatusMessage('Importing data...');

      const text = await file.text();
      const importData = JSON.parse(text);

      // Validate import data structure
      if (!importData.data || !importData.data.decks || !importData.data.cards) {
        throw new Error('Invalid backup file format');
      }

      const { decks, cards, reviewLogs, settings } = importData.data;

      // Ask user about import strategy
      const strategy = confirm(
        'How would you like to import?\n\nOK = Merge with existing data (skip duplicates)\nCancel = Replace all data (delete existing)'
      )
        ? 'merge'
        : 'replace';

      if (strategy === 'replace') {
        // Clear existing data
        await db.transaction('rw', [db.decks, db.cards, db.reviewLogs, db.settings], async () => {
          await db.decks.clear();
          await db.cards.clear();
          await db.reviewLogs.clear();
          await db.settings.clear();
        });
      }

      // Import data
      await db.transaction('rw', [db.decks, db.cards, db.reviewLogs, db.settings], async () => {
        // Parse dates back to Date objects
        const parsedDecks = decks.map((d: any) => ({
          ...d,
          createdAt: new Date(d.createdAt),
          updatedAt: new Date(d.updatedAt),
        }));

        const parsedCards = cards.map((c: any) => ({
          ...c,
          dueDate: new Date(c.dueDate),
          lastReview: c.lastReview ? new Date(c.lastReview) : null,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
        }));

        const parsedLogs = reviewLogs.map((l: any) => ({
          ...l,
          reviewedAt: new Date(l.reviewedAt),
        }));

        if (strategy === 'merge') {
          // Skip existing entries
          for (const deck of parsedDecks) {
            const exists = await db.decks.get(deck.id);
            if (!exists) await db.decks.add(deck);
          }
          for (const card of parsedCards) {
            const exists = await db.cards.get(card.id);
            if (!exists) await db.cards.add(card);
          }
          for (const log of parsedLogs) {
            const exists = await db.reviewLogs.get(log.id);
            if (!exists) await db.reviewLogs.add(log);
          }
          for (const setting of settings) {
            await db.settings.put(setting);
          }
        } else {
          // Direct insert
          await db.decks.bulkAdd(parsedDecks);
          await db.cards.bulkAdd(parsedCards);
          await db.reviewLogs.bulkAdd(parsedLogs);
          await db.settings.bulkPut(settings);
        }
      });

      setImportStatus('success');
      setStatusMessage(`Imported ${decks.length} decks, ${cards.length} cards`);
      setTimeout(() => {
        setImportStatus('idle');
        // Reload page to reflect imported data
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Import failed:', error);
      setImportStatus('error');
      setStatusMessage('Import failed. Please check the file format.');
      setTimeout(() => setImportStatus('idle'), 3000);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

      {/* FSRS Parameters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          FSRS Algorithm
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Retention Rate
            </label>
            <input
              type="range"
              min="0.7"
              max="0.99"
              step="0.01"
              value={requestRetention}
              onChange={(e) => updateSetting('requestRetention', parseFloat(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>70%</span>
              <span className="font-medium text-orange-500">{Math.round(requestRetention * 100)}%</span>
              <span>99%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maximum Interval (days)
            </label>
            <input
              type="number"
              min="30"
              max="36500"
              value={maximumInterval}
              onChange={(e) => updateSetting('maximumInterval', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Daily Limits */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Daily Limits
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Cards Per Day
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={maxNewCardsPerDay}
              onChange={(e) => updateSetting('maxNewCardsPerDay', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maximum Reviews Per Day
            </label>
            <input
              type="number"
              min="10"
              max="500"
              value={maxReviewsPerDay}
              onChange={(e) => updateSetting('maxReviewsPerDay', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Session Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Session Settings
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Default Session Length (minutes)
            </label>
            <select
              value={defaultSessionMinutes}
              onChange={(e) => updateSetting('defaultSessionMinutes', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rest Reminder (minutes, 0 to disable)
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={restReminderMinutes}
              onChange={(e) => updateSetting('restReminderMinutes', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Data Management
        </h2>

        <div className="space-y-4">
          {/* Export */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Export all decks, cards, and review history to a backup file.
            </p>
            <button
              onClick={handleExport}
              disabled={exportStatus === 'exporting'}
              className="flex items-center justify-center gap-2 w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors"
            >
              <Download size={20} />
              {exportStatus === 'exporting' ? 'Exporting...' : 'Export All Data'}
            </button>
            {exportStatus === 'success' && (
              <div className="flex items-center gap-2 mt-2 text-green-600 dark:text-green-400 text-sm">
                <CheckCircle size={16} />
                {statusMessage}
              </div>
            )}
            {exportStatus === 'error' && (
              <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle size={16} />
                {statusMessage}
              </div>
            )}
          </div>

          {/* Import */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Import data from a backup file. You can merge with existing data or replace all.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Upload size={20} />
              {importStatus === 'importing' ? 'Importing...' : 'Import Data'}
            </label>
            {importStatus === 'success' && (
              <div className="flex items-center gap-2 mt-2 text-green-600 dark:text-green-400 text-sm">
                <CheckCircle size={16} />
                {statusMessage}
              </div>
            )}
            {importStatus === 'error' && (
              <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle size={16} />
                {statusMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          if (confirm('Reset all settings to defaults?')) {
            resetSettings();
          }
        }}
        className="w-full py-3 border-2 border-red-500 text-red-500 rounded-xl font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        Reset to Defaults
      </button>
    </div>
  );
}
