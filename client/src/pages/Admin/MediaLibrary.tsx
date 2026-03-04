import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

// --- Types ---
interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: string;
  date: string;
  dimensions: string;
}

const MediaLibrary: React.FC = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // --- Mock Data ---
  const [mediaFiles] = useState<MediaFile[]>([
    { id: 'IMG-101', name: 'neural-headphones-hero.jpg', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', size: '1.2 MB', date: 'Oct 24, 2025', dimensions: '1200x800' },
    { id: 'IMG-102', name: 'keyboard-top-down.png', url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80', size: '850 KB', date: 'Oct 23, 2025', dimensions: '1080x1080' },
    { id: 'IMG-103', name: 'focus-timer-desk.jpg', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', size: '2.1 MB', date: 'Oct 20, 2025', dimensions: '1920x1080' },
    { id: 'IMG-104', name: 'ergo-mouse-side.webp', url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80', size: '420 KB', date: 'Oct 15, 2025', dimensions: '800x800' },
    { id: 'IMG-105', name: 'smart-watch-face.jpg', url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80', size: '1.5 MB', date: 'Oct 12, 2025', dimensions: '1200x1200' },
    { id: 'IMG-106', name: 'wireless-charger.png', url: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=800&q=80', size: '920 KB', date: 'Oct 10, 2025', dimensions: '1000x1000' },
  ]);

  // Framer Motion Variants
  const pageVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="mx-auto"
      style={{ maxWidth: '1400px' }}
    >
      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bolder mb-1 text-dark" style={{ letterSpacing: '-0.5px' }}>Media Library</h2>
          <p className="text-muted mb-0">Manage product images, banners, and digital assets.</p>
        </div>
        <div className="d-flex gap-3 w-100" style={{ maxWidth: '400px' }}>
          <div className="input-group shadow-sm flex-grow-1">
            <span className="input-group-text bg-white border-light border-end-0 text-muted">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <input type="text" className="form-control border-light border-start-0 shadow-none" placeholder="Search files..." />
          </div>
          <button 
            onClick={() => setShowUpload(!showUpload)}
            className="btn text-white fw-bold shadow-sm px-4 border-0 text-nowrap" 
            style={{ background: 'var(--prime-gradient, linear-gradient(135deg, #ff8c42 0%, #ff5722 100%))', borderRadius: '10px' }}
          >
            {showUpload ? 'Cancel' : 'Upload Files'}
          </button>
        </div>
      </div>

      {/* Conditionally Rendered Upload Zone */}
      <AnimatePresence>
        {showUpload && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
            animate={{ opacity: 1, height: 'auto', marginBottom: '24px' }} 
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div 
              className="card border-0 shadow-sm bg-white p-5 d-flex flex-column align-items-center justify-content-center text-center transition-all" 
              style={{ 
                borderRadius: '16px',
                borderStyle: 'dashed',
                borderWidth: '2px',
                borderColor: isDragging ? '#ff8c42' : '#cbd5e1', 
                backgroundColor: isDragging ? 'rgba(255, 140, 66, 0.05)' : '#f8fafc',
                cursor: 'pointer',
              }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); /* Handle drop */ }}
            >
              <div className="p-3 bg-white rounded-circle shadow-sm mb-3 text-primary">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <h5 className="fw-bolder text-dark mb-1">Drag & Drop Media Here</h5>
              <p className="text-muted mb-4">Supports JPG, PNG, WEBP, MP4 (Max 10MB)</p>
              <button className="btn btn-dark fw-bold px-4 py-2 rounded-pill shadow-sm" style={{ backgroundColor: '#0f172a' }}>
                Browse Computer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="row g-4 position-relative">
        
        {/* Gallery Grid */}
        <div className={`col-12 ${selectedFile ? 'col-xl-8' : 'col-xl-12'} transition-all duration-300`}>
          <div className="card border-0 shadow-sm bg-white p-4 h-100" style={{ borderRadius: '16px', minHeight: '600px' }}>
            <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3">
              {mediaFiles.map((file) => {
                const isSelected = selectedFile?.id === file.id;
                return (
                  <div className="col" key={file.id}>
                    <div 
                      onClick={() => setSelectedFile(isSelected ? null : file)}
                      className={`position-relative rounded-4 overflow-hidden transition-all ${isSelected ? 'shadow-lg' : 'shadow-sm'}`}
                      style={{ 
                        aspectRatio: '1/1', 
                        cursor: 'pointer',
                        border: isSelected ? '4px solid var(--prime-deep, #ff8c42)' : '1px solid #e2e8f0',
                        transform: isSelected ? 'scale(0.96)' : 'scale(1)'
                      }}
                    >
                      <img 
                        src={file.url} 
                        alt={file.name} 
                        className="w-100 h-100 object-fit-cover" 
                      />
                      {isSelected && (
                        <div className="position-absolute top-0 end-0 m-2 bg-white rounded-circle p-1 shadow-sm text-primary d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                      )}
                    </div>
                    <p className="text-truncate small text-muted mt-2 fw-medium px-1 text-center" title={file.name}>
                      {file.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected File Details Pane */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div 
              initial={{ opacity: 0, x: 50 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
              className="col-12 col-xl-4"
            >
              <div className="card border-0 shadow-sm bg-white p-4 sticky-top" style={{ borderRadius: '16px', top: '24px' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bolder mb-0 text-dark">File Details</h6>
                  <button onClick={() => setSelectedFile(null)} className="btn-close shadow-none"></button>
                </div>
                
                <div className="rounded-4 overflow-hidden mb-4 shadow-sm" style={{ border: '1px solid #e2e8f0' }}>
                  <img src={selectedFile.url} alt={selectedFile.name} className="w-100" style={{ maxHeight: '250px', objectFit: 'contain', backgroundColor: '#f8fafc' }} />
                </div>

                <div className="d-flex flex-column gap-3 mb-4">
                  <div>
                    <span className="text-muted small fw-bold text-uppercase d-block mb-1">File Name</span>
                    <span className="fw-bold text-dark text-break">{selectedFile.name}</span>
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <span className="text-muted small fw-bold text-uppercase d-block mb-1">Uploaded</span>
                      <span className="fw-medium text-dark">{selectedFile.date}</span>
                    </div>
                    <div className="col-6">
                      <span className="text-muted small fw-bold text-uppercase d-block mb-1">File Size</span>
                      <span className="fw-medium text-dark">{selectedFile.size}</span>
                    </div>
                    <div className="col-6 mt-2">
                      <span className="text-muted small fw-bold text-uppercase d-block mb-1">Dimensions</span>
                      <span className="fw-medium text-dark">{selectedFile.dimensions}</span>
                    </div>
                    <div className="col-6 mt-2">
                      <span className="text-muted small fw-bold text-uppercase d-block mb-1">Type</span>
                      <span className="fw-medium text-dark text-uppercase">{selectedFile.name.split('.').pop()}</span>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-column gap-2 border-top pt-4">
                  <div className="input-group mb-2">
                    <input type="text" readOnly className="form-control bg-light border-light shadow-none text-muted small" value={selectedFile.url} />
                    <button className="btn btn-outline-secondary fw-bold shadow-none" title="Copy URL">Copy</button>
                  </div>
                  
                  <button className="btn btn-outline-danger fw-bold w-100 d-flex align-items-center justify-content-center gap-2 py-2" style={{ borderRadius: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    Delete Permanently
                  </button>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MediaLibrary;