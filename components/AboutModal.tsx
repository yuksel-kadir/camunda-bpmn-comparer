
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconInfo, IconRefresh } from './Icons';

interface AboutModalProps {
    onClose: () => void;
    version: string;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose, version }) => {
    const { t } = useTranslation();
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content about-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="flex-row gap-sm">
                        <IconInfo className="icon-md text-focus" />
                        <h3 className="text-header">{t('about.title')}</h3>
                    </div>
                    <button className="btn-icon-sm btn-secondary" onClick={onClose}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.5 3.5L3.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                <div className="modal-body">
                    <div className="about-section">
                        <div className="about-hero">
                            <h1 className="text-header-lg">{t('common.version', { version })}</h1>
                            <p className="text-body text-secondary mt-xs">{t('about.tagline')}</p>
                        </div>

                        <div className="about-divider"></div>

                        <div className="tech-stack">
                            <h4 className="text-label mb-sm">{t('about.builtWith')}</h4>
                            <div className="tech-grid">
                                <div className="tech-item">React</div>
                                <div className="tech-item">Tauri</div>
                                <div className="tech-item">BPMN.js</div>
                                <div className="tech-item">TypeScript</div>
                                <div className="tech-item">Vite</div>
                                <div className="tech-item">Rust</div>
                            </div>
                        </div>

                        <div className="about-footer mt-lg">
                            <p className="text-xs text-muted">
                                {t('about.footer')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
