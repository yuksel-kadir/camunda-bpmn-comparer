
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DiffResult, ModificationDetail } from '../types';
import {
    IconPlus, IconMinus, IconUpdate, IconArrowRight, IconSearch, IconFilter, IconPlusCircle,
    IconUserTask, IconServiceTask, IconStartEvent, IconEndEvent, IconExclusiveGateway,
    IconParallelGateway, IconSequenceFlow, IconSubProcessCollapsed, IconManualTask,
    IconBusinessRuleTask, IconScriptTask, IconSendTask, IconReceiveTask, IconInclusiveGateway,
    IconCallActivity, IconIntermediateEvent, IconMessageEvent, IconTimerEvent,
    IconSignalEvent, IconErrorEvent, IconEscalationEvent, IconAssociation,
    IconTextAnnotation, IconDataObject, IconDataStore
} from './Icons';

interface DiffSummaryProps {
    diffResult: DiffResult;
    onElementHover: (id: string | null) => void;
    onElementClick: (id: string) => void;
    selectedId: string | null;
}

const getElementIcon = (type: string) => {
    const t = type.toLowerCase();
    // Tasks
    if (t.includes('usertask')) return <IconUserTask className="icon-dropdown" />;
    if (t.includes('servicetask')) return <IconServiceTask className="icon-dropdown" />;
    if (t.includes('manualtask')) return <IconManualTask className="icon-dropdown" />;
    if (t.includes('businessruletask')) return <IconBusinessRuleTask className="icon-dropdown" />;
    if (t.includes('scripttask')) return <IconScriptTask className="icon-dropdown" />;
    if (t.includes('sendtask')) return <IconSendTask className="icon-dropdown" />;
    if (t.includes('receivetask')) return <IconReceiveTask className="icon-dropdown" />;
    if (t.includes('task')) return <IconUserTask className="icon-dropdown" />;

    // Events
    if (t.includes('startevent')) return <IconStartEvent className="icon-dropdown" />;
    if (t.includes('endevent')) return <IconEndEvent className="icon-dropdown" />;
    if (t.includes('message')) return <IconMessageEvent className="icon-dropdown" />;
    if (t.includes('timer')) return <IconTimerEvent className="icon-dropdown" />;
    if (t.includes('signal')) return <IconSignalEvent className="icon-dropdown" />;
    if (t.includes('error')) return <IconErrorEvent className="icon-dropdown" />;
    if (t.includes('escalation')) return <IconEscalationEvent className="icon-dropdown" />;
    if (t.includes('intermediate') || t.includes('boundary')) return <IconIntermediateEvent className="icon-dropdown" />;

    // Gateways
    if (t.includes('exclusivegateway')) return <IconExclusiveGateway className="icon-dropdown" />;
    if (t.includes('parallelgateway')) return <IconParallelGateway className="icon-dropdown" />;
    if (t.includes('inclusivegateway')) return <IconInclusiveGateway className="icon-dropdown" />;
    if (t.includes('gateway')) return <IconExclusiveGateway className="icon-dropdown" />;

    // Flows & Artifacts
    if (t.includes('sequenceflow')) return <IconSequenceFlow className="icon-dropdown" />;
    if (t.includes('association')) return <IconAssociation className="icon-dropdown" />;
    if (t.includes('textannotation') || t.includes('annotation')) return <IconTextAnnotation className="icon-dropdown" />;
    if (t.includes('dataobject')) return <IconDataObject className="icon-dropdown" />;
    if (t.includes('datastore')) return <IconDataStore className="icon-dropdown" />;

    // Grouping
    if (t.includes('callactivity')) return <IconCallActivity className="icon-dropdown" />;
    if (t.includes('subprocess')) return <IconSubProcessCollapsed className="icon-dropdown" />;

    return <IconPlusCircle className="icon-dropdown" />; // Fallback
};

const getFriendlyInfo = (type: string) => {
    const t = type.toLowerCase();
    switch (true) {
        case t.includes('exclusivegateway'):
            return { title: 'Decision Point', desc: 'Directs the flow based on specific logic.' };
        case t.includes('parallelgateway'):
            return { title: 'Parallel Split/Join', desc: 'Concurrent process paths.' };
        case t.includes('inclusivegateway'):
            return { title: 'Inclusive Decision', desc: 'One or more conditional paths.' };
        case t.includes('sequenceflow'):
            return { title: 'Sequence Flow', desc: 'Primary direction of the process.' };
        case t.includes('association'):
            return { title: 'Association', desc: 'Linked information or artifacts.' };
        case t.includes('textannotation') || t.includes('annotation'):
            return { title: 'Text Annotation', desc: 'Documentation or comments.' };
        case t.includes('dataobject'):
            return { title: 'Data Object', desc: 'Information used or produced.' };
        case t.includes('datastore'):
            return { title: 'Data Store', desc: 'Persistent storage location.' };
        case t.includes('message'):
            return { title: 'Message Event', desc: 'External communication.' };
        case t.includes('timer'):
            return { title: 'Timer Event', desc: 'Time-based delay or trigger.' };
        case t.includes('signal'):
            return { title: 'Signal Event', desc: 'Braodcast communication.' };
        case t.includes('error'):
            return { title: 'Error Event', desc: 'Exception handling.' };
        case t.includes('escalation'):
            return { title: 'Escalation Event', desc: 'Status change notice.' };
        case t.includes('startevent'):
            return { title: 'Start Event', desc: 'Process entry point.' };
        case t.includes('endevent'):
            return { title: 'End Event', desc: 'Process completion point.' };
        case t.includes('usertask'):
            return { title: 'User Task', desc: 'Human worker activity.' };
        case t.includes('servicetask'):
            return { title: 'Service Task', desc: 'Automated system activity.' };
        case t.includes('manualtask'):
            return { title: 'Manual Task', desc: 'Offline physical activity.' };
        case t.includes('callactivity'):
            return { title: 'Call Activity', desc: 'Invokes a separate process.' };
        case t.includes('subprocess'):
            return { title: 'Sub-Process', desc: 'Grouped internal flow.' };
        default:
            return { title: type.replace(/([A-Z])/g, ' $1').trim(), desc: 'BPMN process element.' };
    }
};

export const DiffSummary: React.FC<DiffSummaryProps> = ({ diffResult, onElementHover, onElementClick, selectedId }) => {
    const { t } = useTranslation();
    const { addedDetails, removedDetails, modified } = diffResult;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Extract unique element types for filtering
    const allUniqueTypes = useMemo(() => {
        const types = new Set<string>();
        addedDetails.forEach(el => types.add(el.type));
        removedDetails.forEach(el => types.add(el.type));
        modified.forEach(el => types.add(el.type));
        return Array.from(types).sort();
    }, [addedDetails, removedDetails, modified]);

    // Filtering logic
    const filterList = <T extends { id: string; name?: string; type: string }>(list: T[]) => {
        return list.filter(el => {
            const matchesSearch = searchTerm === '' ||
                el.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                el.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                el.type.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesType = selectedType === 'all' || el.type === selectedType;

            return matchesSearch && matchesType;
        });
    };

    const filteredAdded = useMemo(() => filterList(addedDetails), [addedDetails, searchTerm, selectedType]);
    const filteredRemoved = useMemo(() => filterList(removedDetails), [removedDetails, searchTerm, selectedType]);
    const filteredModified = useMemo(() => filterList(modified), [modified, searchTerm, selectedType]);

    const hasNoChanges = addedDetails.length === 0 && removedDetails.length === 0 && modified.length === 0;

    if (hasNoChanges) {
        return (
            <div className="h-full flex-center flex-col text-center">
                <h2 className="text-header-lg mb-xs">{t('diff.noChanges')}</h2>
                <p className="text-body text-secondary">{t('diff.noChangesDesc')}</p>
            </div>
        );
    }

    return (
        <div className="diff-summary-container">
            <div className="diff-summary-header">
                <h2 className="text-header-lg">{t('diff.title')}</h2>

                <div className="diff-controls">
                    <div className="search-wrapper">
                        <IconSearch className="icon-sm search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder={t('diff.search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-wrapper" ref={dropdownRef}>
                        <div
                            className={`custom-dropdown ${isDropdownOpen ? 'open' : ''}`}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <div className="dropdown-trigger">
                                <IconFilter className="icon-sm filter-icon-static" />
                                <span className="dropdown-label">
                                    {selectedType === 'all' ? t('diff.allTypes') : `${getFriendlyInfo(selectedType).title} (${selectedType})`}
                                </span>
                                <div className="dropdown-arrow" />
                            </div>

                            {isDropdownOpen && (
                                <div className="dropdown-menu">
                                    <div
                                        className={`dropdown-item ${selectedType === 'all' ? 'active' : ''}`}
                                        onClick={(e) => { e.stopPropagation(); setSelectedType('all'); setIsDropdownOpen(false); }}
                                    >
                                        <IconFilter className="icon-dropdown filter-icon-all" />
                                        <div className="item-text-wrapper">
                                            <span className="item-title">{t('diff.allTypes')}</span>
                                            <span className="item-subtitle">{t('diff.allTypesDesc')}</span>
                                        </div>
                                    </div>
                                    {allUniqueTypes.map(type => (
                                        <div
                                            key={type}
                                            className={`dropdown-item ${selectedType === type ? 'active' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); setSelectedType(type); setIsDropdownOpen(false); }}
                                        >
                                            {getElementIcon(type)}
                                            <div className="item-text-wrapper">
                                                <span className="item-title">{getFriendlyInfo(type).title}</span>
                                                <span className="item-subtitle">({type})</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <p className="text-body text-secondary text-xs mb-lg">{t('diff.subtitle')}</p>

            <div className="diff-summary-grid">
                {/* Added */}
                <div className="diff-summary-column">
                    <div className="diff-summary-column-header" title={t('diff.addedTitle')}>
                        <IconPlus className="icon-lg text-added mr-xs" />
                        <h3 className="text-header text-added">{t('diff.added')} [{filteredAdded.length}]</h3>
                    </div>
                    <div className="diff-summary-list">
                        {filteredAdded.length > 0 ? (
                            filteredAdded.map(el => (
                                <div
                                    key={el.id}
                                    id={`diff-item-${el.id}`}
                                    className={`list-item-diff added ${selectedId === el.id ? 'selected' : ''}`}
                                    onMouseEnter={() => onElementHover(el.id)}
                                    onMouseLeave={() => onElementHover(null)}
                                    onClick={() => onElementClick(el.id)}
                                    title={t('diff.clickToZoom', { action: t('diff.added').toLowerCase(), name: el.name || el.id })}
                                >
                                    <div className="item-header">
                                        <div className="flex-col">
                                            <div className="source-label modified">{t('common.modified')}</div>
                                            <p className="item-name" title={el.name || el.id}>{el.name || getFriendlyInfo(el.type).title}</p>
                                        </div>
                                        <IconPlus className="icon-sm text-added" />
                                    </div>
                                    <p className="item-type">{getFriendlyInfo(el.type).title} • {el.type} • ID: {el.id}</p>
                                    <p className="item-description">{getFriendlyInfo(el.type).desc}</p>
                                </div>
                            ))
                        ) : (
                            <div className="diff-list-empty">
                                <IconPlus className="diff-list-empty-icon text-added" />
                                <span className="diff-list-empty-text">{t('diff.addedEmpty')}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Removed */}
                <div className="diff-summary-column">
                    <div className="diff-summary-column-header" title={t('diff.removedTitle')}>
                        <IconMinus className="icon-lg text-removed mr-xs" />
                        <h3 className="text-header text-removed">{t('diff.removed')} [{filteredRemoved.length}]</h3>
                    </div>
                    <div className="diff-summary-list">
                        {filteredRemoved.length > 0 ? (
                            filteredRemoved.map(el => (
                                <div
                                    key={el.id}
                                    id={`diff-item-${el.id}`}
                                    className={`list-item-diff removed ${selectedId === el.id ? 'selected' : ''}`}
                                    onMouseEnter={() => onElementHover(el.id)}
                                    onMouseLeave={() => onElementHover(null)}
                                    onClick={() => onElementClick(el.id)}
                                    title={t('diff.clickToZoom', { action: t('diff.removed').toLowerCase(), name: el.name || el.id })}
                                >
                                    <div className="item-header">
                                        <div className="flex-col">
                                            <div className="source-label original">{t('common.original')}</div>
                                            <p className="item-name" title={el.name || el.id}>{el.name || getFriendlyInfo(el.type).title}</p>
                                        </div>
                                        <IconMinus className="icon-sm text-removed" />
                                    </div>
                                    <p className="item-type">{getFriendlyInfo(el.type).title} • {el.type} • ID: {el.id}</p>
                                    <p className="item-description">{getFriendlyInfo(el.type).desc}</p>
                                </div>
                            ))
                        ) : (
                            <div className="diff-list-empty">
                                <IconMinus className="diff-list-empty-icon text-removed" />
                                <span className="diff-list-empty-text">{t('diff.removedEmpty')}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modified */}
                <div className="diff-summary-column">
                    <div className="diff-summary-column-header" title={t('diff.modifiedTitle')}>
                        <IconUpdate className="icon-lg text-modified mr-xs" />
                        <h3 className="text-header text-modified">{t('diff.modified')} [{filteredModified.length}]</h3>
                    </div>
                    <div className="diff-summary-list">
                        {filteredModified.length > 0 ? (
                            filteredModified.map(mod => (
                                <div
                                    key={mod.id}
                                    id={`diff-item-${mod.id}`}
                                    className={`list-item-diff modified ${selectedId === mod.id ? 'selected' : ''}`}
                                    onMouseEnter={() => onElementHover(mod.id)}
                                    onMouseLeave={() => onElementHover(null)}
                                    onClick={() => onElementClick(mod.id)}
                                    title={t('diff.clickToZoom', { action: t('diff.modified').toLowerCase(), name: mod.name || mod.id })}
                                >
                                    <div className="item-header">
                                        <div className="flex-col">
                                            <div className="flex-row gap-xs mb-xs">
                                                <div className="source-label original">{t('common.original')}</div>
                                                <span className="text-secondary text-xs">→</span>
                                                <div className="source-label modified">{t('common.modified')}</div>
                                            </div>
                                            <p className="item-name" title={mod.name || mod.id}>{mod.name || getFriendlyInfo(mod.type).title}</p>
                                        </div>
                                        <IconUpdate className="icon-sm text-modified" />
                                    </div>
                                    <p className="item-type">{getFriendlyInfo(mod.type).title} • {mod.type} • ID: {mod.id}</p>
                                    <p className="item-description">{getFriendlyInfo(mod.type).desc}</p>
                                    <div className="mod-list">
                                        {mod.changes.map((change, index) => (
                                            <div key={index} className="mod-item">
                                                <span className="mod-property">{change.property}</span>
                                                <div className="mod-diff">
                                                    <span className="mod-old-value">{change.oldValue || '""'}</span>
                                                    <IconArrowRight className="icon-sm mod-arrow" />
                                                    <span className="mod-new-value">{change.newValue || '""'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="diff-list-empty">
                                <IconUpdate className="diff-list-empty-icon text-modified" />
                                <span className="diff-list-empty-text">{t('diff.modifiedEmpty')}</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
