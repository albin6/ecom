import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  useGetCategoryDetailsQuery, 
  useCreateCategoryMutation, 
  useUpdateCategoryMutation 
} from '../../features/categories/categoryApiSlice.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Loader } from '../../components/ui/Loader.jsx';

export const AdminCategoryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  const { data: category, isLoading: isFetching } = useGetCategoryDetailsQuery(id, { skip: !isEditMode });
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

  useEffect(() => {
    if (isEditMode && category) {
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description);
    }
  }, [category, isEditMode]);

  const submitHandler = async (e) => {
    e.preventDefault();
    const payload = { name, slug, description };

    try {
      if (isEditMode) {
        await updateCategory({ id, data: payload }).unwrap();
      } else {
        await createCategory(payload).unwrap();
      }
      navigate('/admin/categories');
    } catch (err) {
      alert(err?.data?.message || err?.data?.[0]?.message || 'Sync disruption encountered.');
    }
  };

  if (isFetching) return <div className="h-[60vh] flex items-center justify-center"><Loader /></div>;

  return (
    <div className="py-12 max-w-3xl mx-auto space-y-12">
      <div className="border-b border-white/5 pb-8">
        <p className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-2 italic opacity-80">Architecture Suite</p>
        <h1 className="text-4xl font-display text-text-primary tracking-tight">
          {isEditMode ? 'Modify Segment' : 'Define New Segment'}
        </h1>
      </div>

      <form onSubmit={submitHandler} className="glass-panel p-10 border border-white/10 shadow-2xl space-y-10 group">
        <div className="flex items-center gap-4">
             <div className="w-1.5 h-6 bg-accent" />
             <h2 className="text-sm font-black text-text-primary uppercase tracking-[0.2em]">Segment Parameters</h2>
        </div>
        
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] ml-1">Segment Domain</label>
              <Input 
                value={name} 
                onChange={e => {
                  setName(e.target.value);
                  if (!isEditMode) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                }} 
                required 
                placeholder="e.g. Outerwear"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] ml-1">Archive SLUG</label>
              <Input value={slug} onChange={e => setSlug(e.target.value.toLowerCase())} required placeholder="outerwear" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] ml-1">Segment Narrative</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              required 
              rows="4"
              placeholder="Define the essence of this collection segment..."
              className="w-full min-h-[140px] bg-white/[0.03] border border-white/5 p-6 text-sm tracking-wider leading-relaxed text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent/40 transition-all duration-500 rounded-sm"
            />
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex justify-end gap-6">
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/categories')} className="px-10 h-12 text-[10px] tracking-[0.2em] border border-white/5">
              Revoke Changes
          </Button>
          <Button type="submit" isLoading={isCreating || isUpdating} variant="primary" className="px-12 h-12 text-[10px] tracking-[0.2em] font-black shadow-gold-glow min-w-[220px]">
             {isEditMode ? 'Authorize Overwrite' : 'Commit to Architecture'}
          </Button>
        </div>
      </form>
    </div>
  );
};
