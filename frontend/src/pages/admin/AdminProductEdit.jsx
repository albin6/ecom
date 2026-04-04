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

  if (productLoading) return <Loader />;

  const isBusy = isCreating || isUpdating || isSubmitting;

  return (
    <div className="py-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
        {isEditMode ? 'Edit Product' : 'Create Product'}
      </h1>

      <form onSubmit={submitHandler} className="space-y-8">
        {/* Core Detail Pane */}
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">Core Identity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Name</label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
            <div><label className="text-sm font-medium">Slug (URL Mapping)</label><Input value={slug} onChange={e => setSlug(e.target.value)} required /></div>
            <div><label className="text-sm font-medium">Price ($)</label><Input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required /></div>
            <div className="relative">
              <label className="text-sm font-medium block mb-1">Category</label>
              <div className="relative">
                <input
                  type="text"
                  value={categorySearchTerm}
                  placeholder="Search and attach a Category..."
                  onChange={(e) => {
                    setCategorySearchTerm(e.target.value);
                    setCategory('');
                    setShowCategoryDropdown(true);
                  }}
                  onFocus={() => setShowCategoryDropdown(true)}
                  className="w-full flex h-10 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                {showCategoryDropdown && (
                  <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-2 space-y-1">
                      {categoriesLoading ? (
                        <div className="text-sm p-2 text-gray-500 text-center">Loading...</div>
                      ) : categories?.filter(c => c.name.toLowerCase().includes(categorySearchTerm.toLowerCase())).length === 0 ? (
                        <div className="text-sm p-2 text-gray-500 text-center">No categories found</div>
                      ) : (
                        categories?.filter(c => c.name.toLowerCase().includes(categorySearchTerm.toLowerCase())).map((c) => (
                          <div
                            key={c._id}
                            onClick={() => {
                              setCategory(c._id);
                              setCategorySearchTerm(c.name);
                              setShowCategoryDropdown(false);
                            }}
                            className={`p-2 cursor-pointer rounded-md text-sm transition-colors ${category === c._id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-50 text-gray-800'}`}
                          >
                            {c.name} {c.isBlocked ? <span className="text-red-500 text-xs ml-2">(Blocked)</span> : ''}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                className="w-full flex min-h-[80px] rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 my-1"
                rows="4"
              />
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Variants</h2>
            <Button type="button" variant="outline" onClick={handleAddVariant} className="flex gap-2 items-center">
              <Plus size={16}/> Add Color Variant
            </Button>
          </div>

          {variants.map((variant, vIndex) => {
            const totalImages = (variant.images?.length || 0) + (variant.pendingBlobs?.length || 0);
            return (
              <div key={vIndex} className="bg-white p-6 rounded-xl border-2 border-indigo-50 shadow-sm relative space-y-6">
                <button type="button" onClick={() => handleDeleteVariant(vIndex)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                  <Trash2 size={20} />
                </button>

                <div>
                  <label className="text-sm font-bold text-gray-800">Color / Style Name</label>
                  <Input value={variant.color} onChange={(e) => handleVariantColorChange(vIndex, e.target.value)} className="max-w-xs mt-1" required placeholder="e.g. Midnight Blue" />
                </div>

                {/* Image Manager */}
                <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700">
                      Images <span className="font-normal text-xs text-red-500 ml-2">(Min 3 required — {totalImages}/3)</span>
                    </h3>
                    <label className="cursor-pointer bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-gray-100 flex items-center gap-2 transition-colors">
                      <ImageIcon size={16} /> Select Image
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        ref={el => fileInputRefs.current[vIndex] = el}
                        onChange={(e) => onFileSelectToCrop(e, vIndex)}
                      />
                    </label>
                  </div>

                  <div className="flex gap-4 flex-wrap">
                    {/* Already uploaded to Cloudinary */}
                    {variant.images.map((url, imgIndex) => (
                      <div key={`confirmed-${imgIndex}`} className="relative shrink-0 group rounded-md overflow-hidden border">
                        <img src={url} alt="Variant" className="w-24 h-24 object-cover" />
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(vIndex, imgIndex)}
                          className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}

                    {/* Cropped locally — pending upload on submit */}
                    {(variant.pendingBlobs || []).map((pending, blobIndex) => (
                      <div key={`pending-${blobIndex}`} className="relative shrink-0 group rounded-md overflow-hidden border-2 border-amber-300">
                        <img src={pending.previewUrl} alt="Pending upload" className="w-24 h-24 object-cover" />
                        {/* Pending badge */}
                        <div className="absolute bottom-0 left-0 right-0 bg-amber-400/90 flex items-center justify-center gap-0.5 py-0.5">
                          <Clock size={9} className="text-white" />
                          <span className="text-white text-[9px] font-bold">Pending</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeletePending(vIndex, blobIndex)}
                          className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}

                    {totalImages === 0 && (
                      <p className="text-sm text-gray-400 py-4 italic">No images added yet.</p>
                    )}
                  </div>
                </div>

                {/* Sizes */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700">Sizes & Stock</h3>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddSizeClick(vIndex)} className="text-xs py-1 h-8">
                      <Plus size={14} className="mr-1"/> Add Size
                    </Button>
                  </div>
                  {variant.sizes.map((sizeObj, sIndex) => (
                    <div key={sIndex} className="flex gap-4 items-end bg-gray-50 p-3 rounded border border-gray-100">
                      <div className="w-1/3">
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Size (e.g. M, L, XL)</label>
                        <Input value={sizeObj.size} onChange={(e) => handleSizeChange(vIndex, sIndex, 'size', e.target.value)} required />
                      </div>
                      <div className="w-1/3">
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Stock Count</label>
                        <Input type="number" min="0" value={sizeObj.stock} onChange={(e) => handleSizeChange(vIndex, sIndex, 'stock', e.target.value)} required />
                      </div>
                      <button type="button" onClick={() => handleDeleteSize(vIndex, sIndex)} className="w-[40px] h-[40px] flex justify-center items-center text-gray-400 hover:text-red-500 bg-white border rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {variant.sizes.length === 0 && <p className="text-sm text-gray-400 italic">No sizes added yet.</p>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-6 border-t flex items-center justify-between gap-4">
          {/* Upload notice */}
          {variants.some(v => v.pendingBlobs?.length > 0) && (
            <p className="text-sm text-amber-600 font-medium flex items-center gap-1.5">
              <Upload size={14} />
              {variants.reduce((acc, v) => acc + (v.pendingBlobs?.length || 0), 0)} image(s) will be uploaded on save.
            </p>
          )}
          <div className="flex gap-4 ml-auto">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>Cancel</Button>
            <Button type="submit" isLoading={isBusy} className="w-48 bg-secondary text-white hover:bg-secondary/90">
              {isEditMode ? 'Save Changes' : 'Publish Product'}
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
