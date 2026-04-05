import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useGetAdminCategoriesQuery, useDeleteCategoryMutation, useToggleBlockCategoryMutation } from '../../features/categories/categoryApiSlice.js';
import { Button } from '../../components/ui/Button.jsx';
import { Message } from '../../components/ui/Message.jsx';
import { Loader } from '../../components/ui/Loader.jsx';
import { Edit, Trash2, ShieldBan, ShieldCheck, Plus } from 'lucide-react';
import { Pagination } from '../../components/ui/Pagination.jsx';

export const AdminCategoryList = () => {
  const { searchQuery } = useOutletContext();
  const [pageNumber, setPageNumber] = useState(1);

  const { data, isLoading, error, refetch } = useGetAdminCategoriesQuery({ keyword: searchQuery, pageNumber });
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const [toggleBlock, { isLoading: isToggling }] = useToggleBlockCategoryMutation();
  
  const handleDelete = async (id) => {
    if (window.confirm('WARNING: Deleting a category will orphan any products nested under it. This action is terminal.')) {
      try {
        await deleteCategory(id).unwrap();
        refetch();
      } catch (err) {
        alert(err?.data?.message || 'Delete operation failed');
      }
    }
  };

  const handleToggleBlock = async (id) => {
    if (window.confirm('Toggling this block status will cascade visibility across ALL nested products natively in real-time. Proceed?')) {
      try {
        await toggleBlock(id).unwrap();
        refetch();
      } catch (err) {
        alert(err?.data?.message || 'Toggle modification failed');
      }
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <h3 className="font-display text-2xl tracking-tight">Category Ledger</h3>
          <p className="text-[10px] font-bold text-accent uppercase tracking-widest mt-2">Classified Segments: {data?.categories?.length || 0}</p>
        </div>
        <Link to="/admin/categories/new">
          <Button className="h-12 px-8 text-[10px] tracking-[0.2em]" variant="primary">
            <Plus size={16} className="mr-2" /> Define New Segment
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center bg-surface/20 rounded-sm border border-white/5">
          <Loader />
        </div>
      ) : error ? (
        <Message variant="danger">{error?.data?.message || 'Data stream interrupted.'}</Message>
      ) : (
        <>
          <div className="glass-panel overflow-hidden border border-white/10 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-8 py-5 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Reference</th>
                    <th className="px-8 py-5 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Segment Name</th>
                    <th className="px-8 py-5 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Slug Path</th>
                    <th className="px-8 py-5 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-accent uppercase tracking-[0.2em]">Executive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.categories?.map((category) => (
                    <tr key={category._id} className="hover:bg-white/[0.01] transition-all group">
                      <td className="px-8 py-6">
                        <span className="font-mono text-[11px] text-text-muted bg-surface/40 px-2 py-1 border border-white/5 tracking-wider uppercase">
                          #{category._id.substring(18, 24).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-bold text-text-primary tracking-tight">{category.name}</td>
                      <td className="px-8 py-6 font-mono text-[9px] text-text-muted uppercase tracking-tighter opacity-60">/{category.slug}</td>
                      <td className="px-8 py-6">
                        {category.isBlocked ? (
                          <span className="text-[9px] font-black bg-red-900/10 text-red-400 px-2.5 py-1 rounded-sm border border-red-900/20 uppercase tracking-widest">Quarantined</span>
                        ) : (
                          <span className="text-[9px] font-black bg-emerald-900/10 text-emerald-400 px-2.5 py-1 rounded-sm border border-emerald-900/20 uppercase tracking-widest">Active Listing</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex items-center justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                           <Link to={`/admin/categories/${category._id}/edit`}>
                             <Button variant="ghost" size="sm" className="w-9 h-9 p-0 border border-white/5 hover:border-accent hover:text-accent">
                               <Edit size={14} />
                             </Button>
                           </Link>
                           <Button 
                             onClick={() => handleToggleBlock(category._id)}
                             disabled={isToggling}
                             variant="ghost"
                             size="sm"
                             className={`w-9 h-9 p-0 border border-white/5 ${category.isBlocked ? 'hover:border-emerald-50 hover:text-emerald-400' : 'hover:border-orange-900 hover:text-orange-400'}`}
                             title={category.isBlocked ? 'Reinstate Visibility' : 'Quarantine Entire Branch'}
                           >
                             {category.isBlocked ? <ShieldCheck size={14} /> : <ShieldBan size={14} />}
                           </Button>
                           <Button 
                             onClick={() => handleDelete(category._id)}
                             disabled={isDeleting}
                             variant="ghost"
                             size="sm"
                             className="w-9 h-9 p-0 border border-white/5 hover:border-red-900 hover:text-red-400"
                           >
                             <Trash2 size={14} />
                           </Button>
                         </div>
                      </td>
                    </tr>
                  ))}
                  {data.categories?.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-8 py-20 text-center">
                        <p className="text-text-muted text-xs italic italic-editorial uppercase tracking-widest">
                          {searchQuery ? `No matches found for "${searchQuery}" in archive.` : 'No categories allocated.'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="pt-8 flex justify-center">
            <Pagination 
              page={data.page} 
              pages={data.pages} 
              onPageChange={(page) => setPageNumber(page)} 
            />
          </div>
        </>
      )}
    </div>
  );
};
