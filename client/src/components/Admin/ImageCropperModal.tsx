import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AvatarEditor from 'react-avatar-editor';

interface ImageCropperModalProps {
    isOpen: boolean;
    imageFile: File | null;
    onApply: (croppedFile: File) => void;
    onCancel: () => void;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ isOpen, imageFile, onApply, onCancel }) => {
    const editorRef = useRef<AvatarEditor>(null);
    const [zoom, setZoom] = useState(1);

    const handleApply = () => {
        if (editorRef.current && imageFile) {
            const canvas = editorRef.current.getImageScaledToCanvas();
            canvas.toBlob((blob) => {
                if (blob) {
                    // Create a File from the Blob keeping the original name and type roughly
                    const croppedFile = new File([blob], imageFile.name, { type: 'image/jpeg' });
                    onApply(croppedFile);
                }
            }, 'image/jpeg', 0.95);
        }
    };

    if (!isOpen || !imageFile) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="glass-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onCancel}
                style={{ zIndex: 2000 }} // Ensure it's above the Form modals
            >
                <motion.div
                    className="glass-modal"
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    onClick={e => e.stopPropagation()}
                    style={{ background: '#fff', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px', border: '1px solid #f0f0f2', textAlign: 'center' }}
                >
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1a1a1a', margin: '0 0 8px' }}>Adjust Profile Picture</h3>
                    <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '24px' }}>Drag to pan and use the slider to zoom.</p>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', background: '#fafafa', padding: '20px', borderRadius: '16px', border: '1px solid #f0f0f2' }}>
                        <AvatarEditor
                            ref={editorRef}
                            image={imageFile}
                            width={200}
                            height={200}
                            border={0}
                            borderRadius={100} // Circle mask
                            scale={zoom}
                            rotate={0}
                            style={{ borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                    </div>

                    <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                        <input 
                            type="range" 
                            min="1" 
                            max="3" 
                            step="0.05" 
                            value={zoom} 
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            style={{ flex: 1, accentColor: 'var(--prime-orange)' }}
                        />
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            type="button" 
                            onClick={onCancel} 
                            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid #e8e8e8', background: '#fff', fontWeight: 700, fontSize: '0.9rem', color: '#555', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            onClick={handleApply} 
                            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'var(--prime-orange)', color: '#fff', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(255, 140, 66, 0.3)' }}
                        >
                            Apply Crop
                        </button>
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ImageCropperModal;
