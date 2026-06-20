'use client';

import { useState } from 'react';

interface ImagePreviewGalleryProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onDeleteImage?: (index: number) => void;
  onReorder?: (images: string[]) => void;
  maxImages?: number;
}

export function ImagePreviewGallery({
  images,
  onImagesChange,
  maxImages = 6,
}: ImagePreviewGalleryProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDelete = (index: number) => {
    if (confirm('Delete this image?')) {
      const updated = images.filter((_, i) => i !== index);
      onImagesChange(updated);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }

    const updated = [...images];
    const [removed] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, removed);
    
    onImagesChange(updated);
    setDraggedIndex(null);
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-6 text-clay">
        <p className="text-sm">No images uploaded yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-neutral-300 bg-neutral-50 p-4">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-semibold text-forest">
            Uploaded Images ({images.length}/{maxImages})
          </p>
          {images.length > 1 && (
            <p className="text-xs text-clay">First image is primary</p>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((url, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(idx)}
              className={`relative group cursor-move transition-opacity ${
                draggedIndex === idx ? 'opacity-50' : ''
              }`}
            >
              {/* Primary badge for first image */}
              {idx === 0 && (
                <div className="absolute top-1 left-1 bg-gold text-forest text-xs font-bold px-2 py-1 rounded z-10">
                  Primary
                </div>
              )}

              {/* Image */}
              <img
                src={url}
                alt={`Product ${idx + 1}`}
                className="w-full h-20 object-cover rounded-lg border border-neutral-300 cursor-pointer hover:opacity-90"
                onClick={() => setLightboxImage(url)}
              />

              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleDelete(idx)}
                className="absolute inset-0 bg-red-600/80 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <span className="text-white font-bold text-sm">Delete</span>
              </button>

              {/* Reorder hint */}
              {draggedIndex === null && (
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-10 bg-blue-500 flex items-center justify-center transition-opacity">
                  <span className="text-blue-600 font-semibold text-xs">Drag to reorder</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white text-3xl hover:text-gold"
          >
            ×
          </button>
          <img
            src={lightboxImage}
            alt="Full view"
            className="max-w-2xl max-h-screen object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
