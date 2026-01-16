
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconHand, IconMouse } from './Icons';

interface NavigationHelpProps {
    className?: string;
}

export const NavigationHelp: React.FC<NavigationHelpProps> = ({ className }) => {
    const { t } = useTranslation();
    return (
        <div className={`nav-help ${className || ''}`}>
            <div className="nav-help-title">{t('help.title')}</div>
            <div className="nav-help-items">
                <div className="nav-help-item">
                    <IconHand className="nav-help-icon" />
                    <div className="nav-help-text">
                        <span className="nav-help-action">{t('help.drag')}</span>
                        <span className="nav-help-desc">{t('help.dragDesc')}</span>
                    </div>
                </div>
                <div className="nav-help-item">
                    <IconMouse className="nav-help-icon" />
                    <div className="nav-help-text">
                        <span className="nav-help-action">{t('help.zoom')}</span>
                        <span className="nav-help-desc">{t('help.zoomDesc')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
