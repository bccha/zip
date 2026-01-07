import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ZipFileEntry } from '../../utils/zipHandler';
import './FileList.css';

interface FileListProps {
    entries: ZipFileEntry[];
    onExtract: (entry: ZipFileEntry) => void;
    onPreview: (entry: ZipFileEntry) => void;
}

export const FileList: React.FC<FileListProps> = ({ entries, onExtract, onPreview }) => {
    const { t } = useTranslation();

    if (entries.length === 0) {
        return <div className="file-list-empty">{t('emptyList')}</div>;
    }

    // Simple formatting for bytes
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="file-list-container">
            <table className="file-list-table">
                <thead>
                    <tr>
                        <th>{t('name')}</th>
                        <th>{t('type')}</th>
                        <th>{t('size')}</th>
                        <th>{t('date')}</th>
                        <th>{t('action') || 'Action'}</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.map((entry) => (
                        <tr
                            key={entry.entryName}
                            onDoubleClick={() => !entry.isDirectory && onPreview(entry)}
                            className={entry.isDirectory ? 'is-directory' : 'is-file'}
                        >
                            <td className="file-name">
                                <span className="icon">{entry.isDirectory ? '📁' : '📄'}</span>
                                {entry.name || entry.entryName}
                            </td>
                            <td>{entry.isDirectory ? 'Folder' : 'File'}</td>
                            <td>{entry.isDirectory ? '-' : formatBytes(entry.size)}</td>
                            <td>{entry.date ? new Date(entry.date).toLocaleDateString() : '-'}</td>
                            <td>
                                <button
                                    className="action-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onExtract(entry);
                                    }}
                                >
                                    ⬇️
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
