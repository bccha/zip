import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testDir = path.join(__dirname, 'test_data');
const zipPath = path.join(__dirname, 'test_archive.zip');
const extractDir = path.join(__dirname, 'test_extracted');

// cleanup
if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

// 1. Create dummy data
console.log('Creating dummy files...');
fs.mkdirSync(testDir);
fs.writeFileSync(path.join(testDir, 'file1.txt'), 'Hello World');
fs.writeFileSync(path.join(testDir, 'file2.txt'), 'Zip Test');

// 2. Compress
console.log('Compressing...');
try {
    const zip = new AdmZip();
    zip.addLocalFolder(testDir);
    zip.writeZip(zipPath);
    console.log(`Compressed to ${zipPath}`);
} catch (e) {
    console.error('Compression failed:', e);
    process.exit(1);
}

// 3. List
console.log('Listing files...');
try {
    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();
    entries.forEach(e => console.log(' - ' + e.entryName));
    if (entries.length !== 2) {
        console.error('Entry count mismatch!');
        process.exit(1);
    }
} catch (e) {
    console.error('Listing failed:', e);
    process.exit(1);
}

// 4. Extract
console.log('Extracting...');
try {
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractDir, true);
    console.log(`Extracted to ${extractDir}`);

    if (!fs.existsSync(path.join(extractDir, 'file1.txt'))) {
        console.error('Extraction failed: file1.txt missing');
        process.exit(1);
    }
} catch (e) {
    console.error('Extraction failed:', e);
    process.exit(1);
}

console.log('VERIFICATION SUCCESSFUL: Zip logic works.');
