import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { historyService } from '../services/historyService';
import { ComparisonHistoryItem } from '../types';
import { exists } from '@tauri-apps/plugin-fs';
import { IconHistory, IconFile, IconRotateCcw, IconAlert } from './Icons';

interface HistoryPanelProps {
    onSelect: (item: ComparisonHistoryItem) => void;
    refreshKey: number;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ onSelect, refreshKey }) => {
    const { t } = useTranslation();
    const [history, setHistory] = useState<ComparisonHistoryItem[]>([]);
    const [missingStatus, setMissingStatus] = useState<Record<string, { f1: boolean; f2: boolean }>>({});
    useEffect(() => {
        const items = historyService.getHistory();
        setHistory(items);
        checkFiles(items);
    }, [refreshKey]);

    const checkFiles = async (items: ComparisonHistoryItem[]) => {
        const status: Record<string, { f1: boolean; f2: boolean }> = {};

        await Promise.all(items.map(async (item) => {
            let f1Missing = false;
            let f2Missing = false;

            try {
                f1Missing = !(await exists(item.file1.path));
            } catch (e) {
                console.error(`Error checking file1: ${item.file1.path}`, e);
                f1Missing = true;
            }

            try {
                f2Missing = !(await exists(item.file2.path));
            } catch (e) {
                console.error(`Error checking file2: ${item.file2.path}`, e);
                f2Missing = true;
            }

            if (f1Missing || f2Missing) {
                status[item.id] = { f1: f1Missing, f2: f2Missing };
            }
        }));

        setMissingStatus(status);
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    if (history.length === 0) {
        return (
            <div className="history-empty">
                <IconHistory className="icon-decorative" />
                <p className="text-body">{t('history.empty')}</p>
            </div>
        );
    }

    return (
        <div className="history-panel">
            <div className="flex-between mb-sm">
                <h3 className="text-header">{t('history.title')}</h3>
                <button
                    onClick={() => { historyService.clearHistory(); setHistory([]); }}
                    className="btn-secondary btn-compact"
                    title={t('history.clearTitle')}
                >
                    {t('history.clear')}
                </button>
            </div>
            <div className="history-list">
                {history.map((item) => {
                    const status = missingStatus[item.id];
                    const hasMissing = status?.f1 || status?.f2;

                    return (
                        <div
                            key={item.id}
                            className={`history-item ${hasMissing ? 'history-item-warning' : ''}`}
                            onClick={() => onSelect(item)}
                            title={hasMissing ? t('history.missingFiles') : undefined}
                        >
                            <div className="history-item-header">
                                <span className="history-item-date">{formatDate(item.timestamp)}</span>
                                <IconRotateCcw className="icon-sm text-secondary" />
                            </div>
                            <div className="history-files">
                                <div className="history-file">
                                    <div className="flex-between">
                                        <span className="history-file-label text-added">{t('common.original')}</span>
                                        {status?.f1 && (
                                            <span title={t('history.fileNotFound')}>
                                                <IconAlert className="icon-sm text-error" />
                                            </span>
                                        )}
                                    </div>
                                    <div className="history-file-details">
                                        <span className={`history-file-name ${status?.f1 ? 'text-muted' : ''}`}>{item.file1.name}</span>
                                        <span className="history-file-path" title={item.file1.path}>{item.file1.path}</span>
                                    </div>
                                </div>
                                <div className="history-file">
                                    <div className="flex-between">
                                        <span className="history-file-label text-modified">{t('common.modified')}</span>
                                        {status?.f2 && (
                                            <span title={t('history.fileNotFound')}>
                                                <IconAlert className="icon-sm text-error" />
                                            </span>
                                        )}
                                    </div>
                                    <div className="history-file-details">
                                        <span className={`history-file-name ${status?.f2 ? 'text-muted' : ''}`}>{item.file2.name}</span>
                                        <span className="history-file-path" title={item.file2.path}>{item.file2.path}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
