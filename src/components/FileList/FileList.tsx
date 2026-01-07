import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ZipFileEntry } from '../../utils/zipHandler';
import './FileList.css';

interface FileListProps {
    entries: ZipFileEntry[];
}

export const FileList: React.FC<FileListProps> = ({ entries }) => {
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
                    </tr>
                </thead>
                <tbody>
                    {entries.map((entry) => (
                        <tr key={entry.entryName}>
                            <td className="file-name">
                                <span className="icon">{entry.isDirectory ? '📁' : '📄'}</span>
                                {entry.name || entry.entryName}
                            </td>
                            <td>{entry.isDirectory ? 'Folder' : 'File'}</td>
                            <td>{entry.isDirectory ? '-' : formatBytes(entry.size)}</td>
                            <td>{entry.date ? new Date(entry.date).toLocaleDateString() : '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
