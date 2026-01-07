import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';

export interface ZipFileEntry {
    name: string;
    isDirectory: boolean;
    entryName: string; // Full path inside zip
    size: number;
    compressedSize: number;
    date: Date;
}

export const zipHandler = {
    /**
     * List all files in a zip archive.
     */
    listFiles: (filePath: string): ZipFileEntry[] => {
        try {
            const zip = new AdmZip(filePath);
            const entries = zip.getEntries();
            return entries.map((entry) => ({
                name: entry.name,
                isDirectory: entry.isDirectory,
                entryName: entry.entryName,
                size: entry.header.size,
                compressedSize: entry.header.compressedSize,
                date: entry.header.time,
            }));
        } catch (error) {
            console.error('Error reading zip file:', error);
            throw error;
        }
    },

    /**
     * Extract all files or a specific file from the archive.
     */
    extractFile: (zipPath: string, targetPath: string, entryName?: string): void => {
        try {
            const zip = new AdmZip(zipPath);
            if (entryName) {
                // Extract specific file
                // extractEntryTo(entryName, targetPath, maintainEntryPath, overwrite)
                zip.extractEntryTo(entryName, targetPath, true, true);
            } else {
                // Extract all
                zip.extractAllTo(targetPath, true);
            }
        } catch (error) {
            console.error('Error extracting zip file:', error);
            throw error;
        }
    },

    /**
     * Compress a list of files or directories into a new zip archive.
     */
    compressFiles: (filePaths: string[], targetZipPath: string): void => {
        try {
            const zip = new AdmZip();
            filePaths.forEach((filePath) => {
                const stats = fs.statSync(filePath);
                if (stats.isDirectory()) {
                    zip.addLocalFolder(filePath, path.basename(filePath));
                } else {
                    zip.addLocalFile(filePath);
                }
            });
            zip.writeZip(targetZipPath);
        } catch (error) {
            console.error('Error compressing files:', error);
            throw error;
        }
    },
};
