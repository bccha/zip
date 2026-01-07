import { useState } from 'react';

import { zipHandler, type ZipFileEntry } from './utils/zipHandler';
import { FileList } from './components/FileList/FileList';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'compress' | 'extract'>('compress');
  const [status, setStatus] = useState('Idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentEntries, setCurrentEntries] = useState<ZipFileEntry[] | null>(null);
  const [currentZipPath, setCurrentZipPath] = useState<string | null>(null);

  // Helper to get webUtils safely
  const getWebUtils = () => {
    try {
      return (window as any).require('electron').webUtils;
    } catch (e) {
      console.error('Could not require electron', e);
      return null;
    }
  };

  const getFilePath = (file: File): string => {
    let filePath = '';
    const webUtils = getWebUtils();
    if (webUtils) {
      try {
        filePath = webUtils.getPathForFile(file);
      } catch (e) {
        console.warn('webUtils.getPathForFile failed', e);
      }
    }

    if (!filePath) {
      // Fallback to file.path if webUtils failed or returned empty
      filePath = (file as any).path;
    }
    return filePath;
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    const files = Array.from(e.dataTransfer.files);
    console.log('Dropped files:', files);
    if (files.length === 0) return;

    const file = files[0];
    const filePath = getFilePath(file);

    if (!filePath) {
      console.error('Missing file.path on dropped file');
      alert('Error: Could not get file path.');
      setStatus('Error: Could not get file path.');
      return;
    }

    if (activeTab === 'compress') {
      setStatus(`Ready to compress: ${filePath}`);
      compressFile(filePath);
    } else {
      // Extract Tab
      if (filePath.toLowerCase().endsWith('.zip')) {
        openZip(filePath);
      } else {
        alert('Please drop a .zip file in Extraction mode.');
        setStatus('Error: Not a zip file.');
      }
    }
  };

  const openZip = async (filePath: string) => {
    try {
      setIsProcessing(true);
      setStatus(`Opening: ${filePath}...`);
      setActiveTab('extract'); // Switch to extract tab if not already

      // Use zipHandler utility
      const entries = zipHandler.listFiles(filePath);
      setCurrentEntries(entries);
      setCurrentZipPath(filePath);
      setStatus(`Opened: ${filePath}`);
    } catch (err: any) {
      setStatus(`Error opening zip: ${err.message}`);
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const compressFile = async (filePath: string) => {
    try {
      setIsProcessing(true);
      setStatus(`Compressing: ${filePath}...`);
      const target = filePath + '.zip';

      zipHandler.compressFiles([filePath], target);

      setStatus(`Compressed to: ${target}`);
      // Don't auto-switch, stay in compress mode to show success
      alert(`Success! compressed to: \n${target}`);
    } catch (err: any) {
      setStatus(`Error compressing: ${err.message}`);
      alert(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtractAll = () => {
    if (!currentZipPath) return;
    try {
      setIsProcessing(true);
      const target = currentZipPath.replace(/\.[^/.]+$/, "") + "_extracted";
      zipHandler.extractFile(currentZipPath, target);
      setStatus(`Extracted to: ${target}`);
      alert(`Success! Extracted to: \n${target}`);
    } catch (err: any) {
      setStatus(`Error extracting: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const filePath = getFilePath(file);
        if (filePath) {
          openZip(filePath);
        } else {
          alert('Error: file.path is missing.');
        }
      }
    };
    input.click();
  };

  return (
    <div className="container" onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
      <header className="app-header">
        <div className="title-bar">
          <h1 className="title">Zip Manager</h1>
          {activeTab === 'extract' && currentEntries && (
            <div className="toolbar">
              <button onClick={handleExtractAll} disabled={isProcessing}>Extract All</button>
              <button onClick={() => { setCurrentEntries(null); setCurrentZipPath(null); setStatus('Idle'); }}>Close</button>
            </div>
          )}
        </div>
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'compress' ? 'active' : ''}`}
            onClick={() => setActiveTab('compress')}
          >
            Compression
          </button>
          <button
            className={`tab-button ${activeTab === 'extract' ? 'active' : ''}`}
            onClick={() => setActiveTab('extract')}
          >
            Extraction
          </button>
        </div>
      </header>

      <div className={`status-bar ${status.startsWith('Error') ? 'error' : ''} ${status.startsWith('Success') ? 'success' : ''}`}>
        {status}
      </div>

      <div className="content-area">
        {activeTab === 'compress' && (
          <div className="mode-view">
            <div className="drop-zone">
              <div className="icon">🗜️</div>
              <p>Drag & Drop a <strong>File</strong> or <strong>Folder</strong> here</p>
              <p>to Compress into a .zip</p>
            </div>
          </div>
        )}

        {activeTab === 'extract' && (
          <div className="mode-view">
            {currentEntries ? (
              <div className="explorer-view">
                <div className="path-bar">{currentZipPath}</div>
                <FileList entries={currentEntries} />
              </div>
            ) : (
              <div className="drop-zone">
                <div className="icon">�</div>
                <p>Drag & Drop a <strong>.zip file</strong> here</p>
                <p>or click below to browse</p>
                <button style={{ marginTop: '20px' }} onClick={handleOpenFile}>Open Zip File</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
