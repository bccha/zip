import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { zipHandler, type ZipFileEntry } from './utils/zipHandler';
import { FileList } from './components/FileList/FileList';
import './App.css';

function App() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'compress' | 'extract'>('compress');
  const [status, setStatus] = useState('Idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentEntries, setCurrentEntries] = useState<ZipFileEntry[] | null>(null);
  const [currentZipPath, setCurrentZipPath] = useState<string | null>(null);

  // New state for accumulation
  const [filesToCompress, setFilesToCompress] = useState<string[]>([]);

  // Helper to get webUtils safely and require electron
  const getElectronParams = () => {
    try {
      const electron = (window as any).require('electron');
      return {
        webUtils: electron.webUtils,
        ipcRenderer: electron.ipcRenderer
      };
    } catch (e) {
      console.error('Could not require electron', e);
      return { webUtils: null, ipcRenderer: null };
    }
  };

  const getFilePath = (file: File): string => {
    let filePath = '';
    const { webUtils } = getElectronParams();
    if (webUtils) {
      try {
        filePath = webUtils.getPathForFile(file);
      } catch (e) {
        console.warn('webUtils.getPathForFile failed', e);
      }
    }

    if (!filePath) {
      filePath = (file as any).path;
    }
    return filePath;
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    if (activeTab === 'compress') {
      const newPaths: string[] = [];
      droppedFiles.forEach(file => {
        const path = getFilePath(file);
        if (path) newPaths.push(path);
      });

      // Filter duplicates
      setFilesToCompress(prev => {
        const current = new Set(prev);
        newPaths.forEach(p => current.add(p));
        return Array.from(current);
      });
      setStatus(`Added ${newPaths.length} files to list.`); // simple dynamic msg

    } else {
      // Extract Tab - only handle first zip
      const file = droppedFiles[0];
      const filePath = getFilePath(file);
      if (filePath && filePath.toLowerCase().endsWith('.zip')) {
        openZip(filePath);
      } else {
        alert('Please drop a .zip file in Extraction mode.');
        setStatus(`${t('error')}: Not a zip file.`);
      }
    }
  };

  const openZip = async (filePath: string) => {
    try {
      setIsProcessing(true);
      setStatus(`Opening: ${filePath}...`);
      setActiveTab('extract');

      const entries = zipHandler.listFiles(filePath);
      setCurrentEntries(entries);
      setCurrentZipPath(filePath);
      setStatus(`Opened: ${filePath}`);
    } catch (err: any) {
      setStatus(`${t('error')}: ${err.message}`);
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompress = async () => {
    if (filesToCompress.length === 0) {
      alert(t('emptyList'));
      return;
    }

    const { ipcRenderer } = getElectronParams();
    if (!ipcRenderer) {
      alert("Electron IPC not available.");
      return;
    }

    try {
      // Open Save Dialog
      const result = await ipcRenderer.invoke('show-save-dialog');
      if (result.canceled || !result.filePath) return;

      const targetPath = result.filePath;

      setIsProcessing(true);
      setStatus(`Compressing to: ${targetPath}...`);

      zipHandler.compressFiles(filesToCompress, targetPath);

      const successMsg = `${t('successCompressed')}: ${targetPath}`;
      setStatus(successMsg);
      // Alert translated
      alert(successMsg);
      setFilesToCompress([]); // Clear list after success
    } catch (err: any) {
      setStatus(`${t('error')}: ${err.message}`);
      alert(`${t('error')}: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFileFromList = (pathToRemove: string) => {
    setFilesToCompress(prev => prev.filter(p => p !== pathToRemove));
  };

  const handleExtractAll = () => {
    if (!currentZipPath) return;
    try {
      setIsProcessing(true);
      const target = currentZipPath.replace(/\.[^/.]+$/, "") + "_extracted";
      zipHandler.extractFile(currentZipPath, target);

      const successMsg = `${t('successExtracted')}: ${target}`;
      setStatus(successMsg);
      alert(successMsg);
    } catch (err: any) {
      setStatus(`${t('error')}: ${err.message}`);
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
          alert(`${t('error')}: file.path is missing.`);
        }
      }
    };
    input.click();
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="container" onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
      <header className="app-header">
        <div className="title-bar">
          <div className="title-group">
            <h1 className="title">{t('title')}</h1>
          </div>

          <div className="header-controls">
            <div className="lang-control">
              <span className="lang-icon" title="Select Language">🌐</span>
              <select
                className="lang-select"
                onChange={(e) => changeLanguage(e.target.value)}
                defaultValue={i18n.language}
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="zh">中文</option>
                <option value="es">Español</option>
              </select>
            </div>

            {activeTab === 'extract' && currentEntries && (
              <div className="toolbar">
                <button onClick={handleExtractAll} disabled={isProcessing}>{t('extractAll')}</button>
                <button onClick={() => { setCurrentEntries(null); setCurrentZipPath(null); setStatus('Idle'); }}>{t('close')}</button>
              </div>
            )}
          </div>
        </div>
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'compress' ? 'active' : ''}`}
            onClick={() => setActiveTab('compress')}
          >
            {t('compress')}
          </button>
          <button
            className={`tab-button ${activeTab === 'extract' ? 'active' : ''}`}
            onClick={() => setActiveTab('extract')}
          >
            {t('extract')}
          </button>
        </div>
      </header>

      <div className={`status-bar ${status.startsWith(t('error')) ? 'error' : ''} ${status.startsWith('Success') || status.startsWith('성공') || status.startsWith('成功') || status.startsWith('¡Éxito') ? 'success' : ''}`}>
        {status}
      </div>

      <div className="content-area">
        {activeTab === 'compress' && (
          <div className="mode-view">
            <div className={`drop-zone ${filesToCompress.length > 0 ? 'compact' : ''}`}>
              <div className="icon">🗜️</div>
              <p>{t('dragDrop')}</p>
            </div>

            <div className="file-queue">
              <div className="queue-header">
                <h3>{t('filesToCompress')} ({filesToCompress.length})</h3>
                <button
                  className="primary-btn"
                  disabled={filesToCompress.length === 0 || isProcessing}
                  onClick={handleCompress}
                >
                  {t('makeZip')}
                </button>
              </div>
              {filesToCompress.length > 0 ? (
                <div className="queue-list-container">
                  <ul className="queue-list">
                    {filesToCompress.map((path, idx) => (
                      <li key={idx}>
                        <span className="path">{path}</span>
                        <button className="remove-btn" onClick={() => removeFileFromList(path)}>X</button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="empty-msg">{t('emptyList')}</div>
              )}
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
                <div className="icon">📂</div>
                <p>{t('dragDropZip')}</p>
                <p>{t('orClick')}</p>
                <button style={{ marginTop: '20px' }} onClick={handleOpenFile}>{t('openZip')}</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
