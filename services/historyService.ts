import { ComparisonHistoryItem } from '../types';
import { exists, readTextFile } from '@tauri-apps/plugin-fs';

const HISTORY_KEY = 'bpmn-comparison-history';
const MAX_HISTORY = 20;

export const historyService = {
    getHistory(): ComparisonHistoryItem[] {
        const raw = localStorage.getItem(HISTORY_KEY);
        if (!raw) return [];
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error('Failed to parse history', e);
            return [];
        }
    },

    saveComparison(file1: { path: string; name: string }, file2: { path: string; name: string }) {
        const history = this.getHistory();

        // Check if this exact comparison already exists (same paths)
        const existingIndex = history.findIndex(item =>
            (item.file1.path === file1.path && item.file2.path === file2.path) ||
            (item.file1.path === file2.path && item.file2.path === file1.path)
        );

        if (existingIndex !== -1) {
            history.splice(existingIndex, 1);
        }

        const newItem: ComparisonHistoryItem = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            file1,
            file2
        };

        const newHistory = [newItem, ...history].slice(0, MAX_HISTORY);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    },

    async validateItem(item: ComparisonHistoryItem): Promise<{ valid: boolean; missingFiles: string[] }> {
        const missingFiles: string[] = [];

        const file1Exists = await exists(item.file1.path);
        if (!file1Exists) missingFiles.push(item.file1.name);

        const file2Exists = await exists(item.file2.path);
        if (!file2Exists) missingFiles.push(item.file2.name);

        return {
            valid: missingFiles.length === 0,
            missingFiles
        };
    },

    async loadFiles(item: ComparisonHistoryItem): Promise<{ file1: string; file2: string }> {
        const file1 = await readTextFile(item.file1.path);
        const file2 = await readTextFile(item.file2.path);
        return { file1, file2 };
    },

    clearHistory() {
        localStorage.removeItem(HISTORY_KEY);
    }
};
