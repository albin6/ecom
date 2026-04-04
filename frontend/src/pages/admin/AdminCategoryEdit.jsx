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

  if (isFetching) return <Loader />;

  return (
    <div className="py-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
        {isEditMode ? 'Edit Category' : 'Create Category'}
      </h1>

      <form onSubmit={submitHandler} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div>
          <label className="text-sm font-medium">Domain Name</label>
          <Input 
            value={name} 
            onChange={e => {
              setName(e.target.value);
              if (!isEditMode) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
            }} 
            required 
          />
        </div>
        <div>
          <label className="text-sm font-medium">URL Routing Slug</label>
          <Input value={slug} onChange={e => setSlug(e.target.value.toLowerCase())} required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Detailed Description</label>
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            required 
            rows="4"
            className="w-full flex min-h-[80px] rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 mt-1" 
          />
        </div>

        <div className="pt-4 border-t flex justify-end gap-4 mt-8">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/categories')}>Cancel Operation</Button>
          <Button type="submit" isLoading={isCreating || isUpdating} className="w-48 bg-secondary text-white hover:bg-secondary/90">
             {isEditMode ? 'Commit Overwrite' : 'Publish Allocation'}
          </Button>
        </div>
      </form>
    </div>
  );
};
