import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  useGetProductDetailsQuery, 
  useCreateProductMutation, 
  useUpdateProductMutation,
  useUploadProductImageMutation
} from '../../features/products/productApiSlice.js';
import { useGetAdminCategoriesQuery } from '../../features/categories/categoryApiSlice.js';
import { ImageCropperModal } from '../../components/admin/ImageCropperModal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Loader } from '../../components/ui/Loader.jsx';
import { Trash2, Plus, Image as ImageIcon, X, Upload, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  // Each variant: { color, images: [cloudinaryUrl|...], pendingBlobs: [{ previewUrl, blob }] sizes: [...] }
  const [variants, setVariants] = useState([]);

  // Cropper State
  const [cropperModalSrc, setCropperModalSrc] = useState(null);
  const [activeVariantIndex, setActiveVariantIndex] = useState(null);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref map so we can reset each file input independently
  const fileInputRefs = useRef({});

  const { data: product, isLoading: productLoading } = useGetProductDetailsQuery(id, { skip: !isEditMode });
  const { data: categoriesData, isLoading: categoriesLoading } = useGetAdminCategoriesQuery();
  const categories = categoriesData?.categories ?? [];
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [uploadImage] = useUploadProductImageMutation();

  useEffect(() => {
    if (isEditMode && product) {
      setName(product.name);
      setSlug(product.slug);
      setPrice(product.price);
      setDescription(product.description);
      if (product.category) {
        const catId = product.category?._id || product.category;
        setCategory(catId);
        
        // Find category name for search term
        const found = categories?.find(c => c._id === catId);
        if (found) setCategorySearchTerm(found.name);
        else if (product.category?.name) setCategorySearchTerm(product.category.name);
      }
      // Existing variants have no pendingBlobs
      setVariants((product.variants || []).map(v => ({ 
        ...v, 
        pendingBlobs: [],
        sizes: (v.sizes || []).map(s => ({ ...s })) // Deep copy sizes
      })));
    }
  }, [product, isEditMode, categories]);

  // Cleanup object URLs when component unmounts to avoid memory leaks
  useEffect(() => {
    return () => {
      variants.forEach(v => (v.pendingBlobs || []).forEach(p => URL.revokeObjectURL(p.previewUrl)));
    };
  }, []);

  const handleAddVariant = () => {
    setVariants([...variants, { color: '', images: [], pendingBlobs: [], sizes: [] }]);
  };

  const handleVariantColorChange = (index, value) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, color: value } : v));
  };

  const handleDeleteVariant = (index) => {
    // Revoke pending blob URLs before removing
    (variants[index].pendingBlobs || []).forEach(p => URL.revokeObjectURL(p.previewUrl));
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleAddSizeClick = (variantIndex) => {
    const updated = [...variants];
    updated[variantIndex].sizes.push({ size: '', stock: 0 });
    setVariants(updated);
  };

  const handleSizeChange = (vIndex, sIndex, field, value) => {
    setVariants(prev => prev.map((v, vi) => vi === vIndex ? {
      ...v,
      sizes: v.sizes.map((s, si) => si === sIndex ? { 
        ...s, 
        [field]: field === 'stock' ? Number(value) : value 
      } : s)
    } : v));
  };

  const handleDeleteSize = (vIndex, sIndex) => {
    const updated = [...variants];
    updated[vIndex].sizes = updated[vIndex].sizes.filter((_, i) => i !== sIndex);
    setVariants(updated);
  };

  // ── FILE SELECT → open crop modal ──────────────────────────────
  const onFileSelectToCrop = (e, variantIndex) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setActiveVariantIndex(variantIndex);
        setCropperModalSrc(reader.result?.toString() || '');
      });
      reader.readAsDataURL(file);

      // ── BUG FIX #2: Reset the input value so the same file can be
      //    re-selected. The browser only fires onChange when the value
      //    changes; clearing it after reading makes every pick fresh.
      e.target.value = '';
    }
  };

  // ── CROP COMPLETE → store blob locally, NO Cloudinary upload yet ──
  const onCropComplete = (croppedBlob) => {
    setCropperModalSrc(null);

    // Create a local preview URL from the blob (no network request)
    const previewUrl = URL.createObjectURL(croppedBlob);

    const updated = [...variants];
    updated[activeVariantIndex].pendingBlobs = [
      ...(updated[activeVariantIndex].pendingBlobs || []),
      { previewUrl, blob: croppedBlob },
    ];
    setVariants(updated);
  };

  // Delete a confirmed (Cloudinary) image
  const handleDeleteImage = (vIndex, imgIndex) => {
    const updated = [...variants];
    updated[vIndex].images = updated[vIndex].images.filter((_, i) => i !== imgIndex);
    setVariants(updated);
  };

  // Delete a pending (not yet uploaded) image
  const handleDeletePending = (vIndex, blobIndex) => {
    const updated = [...variants];
    const removed = updated[vIndex].pendingBlobs[blobIndex];
    URL.revokeObjectURL(removed.previewUrl);
    updated[vIndex].pendingBlobs = updated[vIndex].pendingBlobs.filter((_, i) => i !== blobIndex);
    setVariants(updated);
  };

  // ── SUBMIT: upload pending blobs first, then save product ─────
  const submitHandler = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Validation
      for (const v of variants) {
        const totalImages = (v.images?.length || 0) + (v.pendingBlobs?.length || 0);
        if (totalImages < 3) {
          alert(`Color variant "${v.color || 'Unknown'}" requires at least 3 images.`);
          return;
        }
        if (v.sizes.length === 0) {
          alert(`Color variant "${v.color || 'Unknown'}" requires at least 1 size.`);
          return;
        }
      }

      // 2. Upload all pending blobs to Cloudinary, variant by variant
      const resolvedVariants = await Promise.all(
        variants.map(async (v) => {
          if (!v.pendingBlobs || v.pendingBlobs.length === 0) {
            const { pendingBlobs, ...rest } = v;
            return rest;
          }

          // Batch upload all pending blobs for this variant in one request
          const formData = new FormData();
          v.pendingBlobs.forEach((p, i) => {
            formData.append('images', p.blob, `variant-image-${i}.webp`);
          });

          const res = await uploadImage(formData).unwrap();
          const newUrls = res.urls;

          // Revoke object URLs now that they're uploaded
          v.pendingBlobs.forEach(p => URL.revokeObjectURL(p.previewUrl));

          const { pendingBlobs, ...rest } = v;
          return { ...rest, images: [...(v.images || []), ...newUrls] };
        })
      );

      // 3. Save product
      const catId = typeof category === 'object' ? category?._id : category;
      const payload = {
        name, slug, description, 
        category: catId,
        price: Number(price),
        variants: resolvedVariants,
      };

      if (isEditMode) {
        await updateProduct({ id, data: payload }).unwrap();
      } else {
        await createProduct(payload).unwrap();
      }

      navigate('/admin/products');
    } catch (err) {
      alert(err?.data?.message || err?.data?.[0]?.message || 'Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (productLoading) return <div className="h-[60vh] flex items-center justify-center"><Loader /></div>;

  const isBusy = isCreating || isUpdating || isSubmitting;

  return (
    <div className="py-12 max-w-5xl mx-auto space-y-12">
      <div className="border-b border-white/5 pb-8">
        <p className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-2 italic opacity-80">Creation Suite</p>
        <h1 className="text-4xl font-display text-text-primary tracking-tight">
          {isEditMode ? 'Modify Selection' : 'Define New Creation'}
        </h1>
      </div>

      <form onSubmit={submitHandler} className="space-y-16">
        {/* Core Detail Pane */}
        <div className="glass-panel p-10 border border-white/10 shadow-2xl space-y-10 group">
          <div className="flex items-center gap-4">
               <div className="w-1.5 h-6 bg-accent" />
               <h2 className="text-sm font-black text-text-primary uppercase tracking-[0.2em]">Creation Identity</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] ml-1">Piece Nomenclature</label>
                <Input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Atelier Wool Coat" />
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] ml-1">Collection SLUG</label>
                <Input value={slug} onChange={e => setSlug(e.target.value)} required placeholder="atelier-wool-coat" />
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] ml-1">Retail Valuation ($)</label>
                <Input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required placeholder="0.00" />
            </div>
            <div className="relative space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] ml-1">Collection Segment</label>
              <div className="relative">
                <input
                  type="text"
                  value={categorySearchTerm}
                  placeholder="Identify collection..."
                  onChange={(e) => {
                    setCategorySearchTerm(e.target.value);
                    setCategory('');
                    setShowCategoryDropdown(true);
                  }}
                  onFocus={() => setShowCategoryDropdown(true)}
                  className="w-full h-11 bg-transparent border-b-2 border-white/10 text-sm tracking-wider text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent transition-all duration-500"
                />
                <AnimatePresence>
                  {showCategoryDropdown && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute z-50 w-full mt-2 max-h-64 overflow-y-auto bg-surface/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-sm custom-scrollbar"
                    >
                      <div className="p-2 space-y-1">
                        {categoriesLoading ? (
                          <div className="text-[10px] font-bold p-4 text-text-muted text-center uppercase tracking-widest">Accessing Archives...</div>
                        ) : categories?.filter(c => c.name.toLowerCase().includes(categorySearchTerm.toLowerCase())).length === 0 ? (
                          <div className="text-[10px] font-bold p-4 text-text-muted text-center uppercase tracking-widest">No segments found</div>
                        ) : (
                          categories?.filter(c => c.name.toLowerCase().includes(categorySearchTerm.toLowerCase())).map((c) => (
                            <div
                              key={c._id}
                              onClick={() => {
                                setCategory(c._id);
                                setCategorySearchTerm(c.name);
                                setShowCategoryDropdown(false);
                              }}
                              className={`p-4 cursor-pointer text-[10px] uppercase tracking-widest transition-all ${category === c._id ? 'bg-accent text-base-black font-black' : 'hover:bg-white/5 text-text-muted hover:text-text-primary'}`}
                            >
                              {c.name} {c.isBlocked ? <span className="opacity-50 ml-2">(Restricted)</span> : ''}
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="col-span-1 md:col-span-2 space-y-1.5 pt-4">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] ml-1">Piece Narrative</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                placeholder="Describe the essence of this piece..."
                className="w-full min-h-[140px] bg-white/[0.03] border border-white/5 p-6 text-sm tracking-wider leading-relaxed text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent/40 transition-all duration-500 rounded-sm"
                rows="4"
              />
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="space-y-10">
          <div className="flex justify-between items-end border-b border-white/5 pb-6">
            <div>
                 <h2 className="text-sm font-black text-text-primary uppercase tracking-[0.2em] mb-1">Style Variants</h2>
                 <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Chromatic and Dimensional Multiplicity</p>
            </div>
            <Button type="button" variant="ghost" onClick={handleAddVariant} className="h-10 px-6 text-[9px] tracking-[0.2em] border border-white/5 hover:border-accent hover:text-accent font-bold">
              <Plus size={14} className="mr-2"/> Append Variant
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-12">
            {variants.map((variant, vIndex) => {
                const totalImages = (variant.images?.length || 0) + (variant.pendingBlobs?.length || 0);
                return (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={vIndex} 
                    className="glass-panel p-8 border border-white/5 shadow-xl relative group/variant"
                >
                    <button 
                        type="button" 
                        onClick={() => handleDeleteVariant(vIndex)} 
                        className="absolute top-6 right-6 text-text-muted hover:text-red-400 transition-colors opacity-0 group-hover/variant:opacity-100"
                    >
                    <Trash2 size={18} />
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-4 space-y-8">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">Palette Selection</label>
                                <Input value={variant.color} onChange={(e) => handleVariantColorChange(vIndex, e.target.value)} required placeholder="e.g. Noir Abyss" />
                            </div>

                            {/* Sizes */}
                            <div className="space-y-4 pt-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-[9px] font-black text-text-primary uppercase tracking-[0.2em]">Sizing & Stock</h3>
                                    <button 
                                        type="button" 
                                        onClick={() => handleAddSizeClick(vIndex)} 
                                        className="text-[9px] font-black text-accent uppercase tracking-widest hover:underline transition-all"
                                    >
                                        + Add Measurement
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {variant.sizes.map((sizeObj, sIndex) => (
                                        <div key={sIndex} className="flex gap-4 items-end bg-white/[0.02] p-4 border border-white/5 group/size">
                                            <div className="flex-grow space-y-1">
                                                <Input value={sizeObj.size} onChange={(e) => handleSizeChange(vIndex, sIndex, 'size', e.target.value)} required placeholder="Size" className="h-9" />
                                            </div>
                                            <div className="w-24 space-y-1">
                                                <Input type="number" min="0" value={sizeObj.stock} onChange={(e) => handleSizeChange(vIndex, sIndex, 'stock', e.target.value)} required placeholder="Qty" className="h-9" />
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => handleDeleteSize(vIndex, sIndex)} 
                                                className="h-9 w-9 flex items-center justify-center text-text-muted hover:text-red-400 border border-white/5 hover:border-red-900/30 transition-all opacity-0 group-size:opacity-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {variant.sizes.length === 0 && <p className="text-[9px] text-text-muted italic uppercase tracking-widest py-4">No size vectors defined.</p>}
                                </div>
                            </div>
                        </div>

                        {/* Image Manager */}
                        <div className="lg:col-span-8 bg-black/20 p-8 border border-white/5 rounded-sm space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-[9px] font-black text-text-primary uppercase tracking-[0.2em]">Visual Assets</h3>
                                    <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest mt-1">
                                        Collective required: <span className={totalImages < 3 ? 'text-red-400' : 'text-accent'}>{totalImages}/3</span>
                                    </p>
                                </div>
                                <label className="cursor-pointer bg-white text-base-black px-6 py-2 text-[9px] font-black uppercase tracking-widest hover:bg-accent transition-all flex items-center shadow-gold-glow">
                                    <ImageIcon size={14} className="mr-2" /> Select Ledger Asset
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        ref={el => fileInputRefs.current[vIndex] = el}
                                        onChange={(e) => onFileSelectToCrop(e, vIndex)}
                                    />
                                </label>
                            </div>

                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {/* Already uploaded to Cloudinary */}
                                {variant.images.map((url, imgIndex) => (
                                <div key={`confirmed-${imgIndex}`} className="relative group/img aspect-square bg-surface/40 border border-white/10 overflow-hidden shadow-lg">
                                    <img src={url} alt="Variant" className="w-full h-full object-cover grayscale-[0.3] group-hover/img:grayscale-0 transition-all duration-500" />
                                    <div className="absolute inset-0 bg-base-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteImage(vIndex, imgIndex)}
                                            className="text-red-400 p-2 hover:scale-110 transition-transform"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                ))}

                                {/* Cropped locally — pending upload on submit */}
                                {(variant.pendingBlobs || []).map((pending, blobIndex) => (
                                <div key={`pending-${blobIndex}`} className="relative group/img aspect-square bg-surface/40 border-2 border-accent/20 overflow-hidden shadow-gold-glow/10">
                                    <img src={pending.previewUrl} alt="Pending" className="w-full h-full object-cover" />
                                    <div className="absolute inset-x-0 bottom-0 bg-accent py-1 flex items-center justify-center gap-1.5">
                                        <Clock size={10} className="text-base-black" />
                                        <span className="text-base-black text-[8px] font-black uppercase tracking-widest">PENDING</span>
                                    </div>
                                    <div className="absolute inset-0 bg-base-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => handleDeletePending(vIndex, blobIndex)}
                                            className="text-red-400 p-2 hover:scale-110 transition-transform"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                ))}

                                {totalImages === 0 && (
                                <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed border-white/5 opacity-30">
                                     <ImageIcon size={32} className="text-text-muted mb-4" />
                                     <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">No visual records attached</p>
                                </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
                );
            })}
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 pb-20">
          <div className="flex flex-col gap-2">
            {variants.some(v => v.pendingBlobs?.length > 0) && (
                <div className="flex items-center gap-3 text-accent transition-all animate-pulse">
                <Upload size={14} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Syncing {variants.reduce((acc, v) => acc + (v.pendingBlobs?.length || 0), 0)} New Pieces on Publish</span>
                </div>
            )}
            <p className="text-[9px] text-text-muted uppercase tracking-[0.1em] opacity-40 italic">Integrity Check: ALL DIMENSIONS MUST BE DEFINED BEFORE ARCHIVING</p>
          </div>
          
          <div className="flex gap-6 w-full md:w-auto">
            <Button type="button" variant="ghost" onClick={() => navigate('/admin/products')} className="px-10 h-12 text-[10px] tracking-[0.2em] border border-white/5">
                Revoke Changes
            </Button>
            <Button type="submit" isLoading={isBusy} variant="primary" className="px-12 h-12 text-[10px] tracking-[0.2em] font-black shadow-gold-glow min-w-[220px]">
              {isEditMode ? 'Authorize Modifications' : 'Commit to Collection'}
            </Button>
          </div>
        </div>
      </form>

      {cropperModalSrc && (
        <ImageCropperModal
          imageSrc={cropperModalSrc}
          onCropCompleteCallback={onCropComplete}
          onClose={() => setCropperModalSrc(null)}
        />
      )}
    </div>
  );
};
