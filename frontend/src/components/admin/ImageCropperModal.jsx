import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../utils/cropImage.js';
import { Button } from '../ui/Button.jsx';
import { motion } from 'framer-motion';

export const ImageCropperModal = ({ imageSrc, onCropCompleteCallback, onClose }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixelsOutput) => {
    setCroppedAreaPixels(croppedAreaPixelsOutput);
  }, []);

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropCompleteCallback(croppedBlob);
    } catch (e) {
      console.error(e);
      alert('Failed to crop image properly.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">Position and Crop Image</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 font-bold text-xl">&times;</button>
        </div>

        <div className="relative w-full h-[500px] bg-gray-900 bg-opacity-10">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} // Force 1:1 aspect ratio perfectly optimized for Clothing E-commerce Grids
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div className="p-4 bg-gray-50 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-1/2">
            <label className="text-sm font-semibold text-gray-600">Zoom</label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto text-gray-700">Cancel</Button>
            <Button onClick={handleSave} isLoading={isProcessing} className="w-full sm:w-auto shrink-0 bg-secondary text-white hover:bg-secondary/90">
              Apply Crop
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
