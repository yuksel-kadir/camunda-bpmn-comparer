
import React from 'react';
import { useTranslation } from 'react-i18next';

interface LegendProps {
    className?: string;
}

export const Legend: React.FC<LegendProps> = ({ className }) => {
    const { t } = useTranslation();
    return (
        <div className={`nav-help legend-help ${className || ''}`}>
            <div className="nav-help-title">{t('legend.title')}</div>
            <div className="nav-help-items">
                <div className="nav-help-item">
                    <div className="legend-indicator indicator-added" />
                    <div className="nav-help-text">
                        <span className="nav-help-action">{t('legend.added')}</span>
                        <span className="nav-help-desc">{t('legend.addedDesc')}</span>
                    </div>
                </div>
                <div className="nav-help-item">
                    <div className="legend-indicator indicator-removed" />
                    <div className="nav-help-text">
                        <span className="nav-help-action">{t('legend.removed')}</span>
                        <span className="nav-help-desc">{t('legend.removedDesc')}</span>
                    </div>
                </div>
                <div className="nav-help-item">
                    <div className="legend-indicator indicator-modified" />
                    <div className="nav-help-text">
                        <span className="nav-help-action">{t('legend.modified')}</span>
                        <span className="nav-help-desc">{t('legend.modifiedDesc')}</span>
                    </div>
                </div>
                <div className="nav-help-item">
                    <div className="legend-indicator indicator-hover" />
                    <div className="nav-help-text">
                        <span className="nav-help-action">{t('legend.hover')}</span>
                        <span className="nav-help-desc">{t('legend.hoverDesc')}</span>
                    </div>
                </div>
                <div className="nav-help-item">
                    <div className="legend-indicator indicator-select" />
                    <div className="nav-help-text">
                        <span className="nav-help-action">{t('legend.selection')}</span>
                        <span className="nav-help-desc">{t('legend.selectionDesc')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
