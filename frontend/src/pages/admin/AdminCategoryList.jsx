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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div></div>
        <Link to="/admin/categories/new">
          <Button className="flex items-center gap-2">
            <Plus size={18} /> Create Category
          </Button>
        </Link>
      </div>

      {isLoading ? <Loader /> : error ? (
        <Message variant="danger">{error?.data?.message || 'Data stream interrupted.'}</Message>
      ) : (
        <>
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">ID</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Name</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Slug Path</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.categories?.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">
                           {category._id.substring(18, 24).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap font-bold text-gray-900">{category.name}</td>
                      <td className="px-8 py-6 whitespace-nowrap font-mono text-xs text-gray-500 uppercase tracking-tighter">/{category.slug}</td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        {category.isBlocked ? (
                          <span className="inline-flex items-center px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-wide border border-red-100">
                             System Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wide border border-emerald-100">
                             Active Listing
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                         <div className="flex items-center justify-end gap-2">
                           <Link to={`/admin/categories/${category._id}/edit`}>
                             <Button variant="ghost" size="sm" className="w-8 h-8 p-0 hover:bg-indigo-50 hover:text-indigo-600">
                               <Edit size={16} />
                             </Button>
                           </Link>
                           <Button 
                             onClick={() => handleToggleBlock(category._id)}
                             disabled={isToggling}
                             variant="ghost"
                             size="sm"
                             className={`w-8 h-8 p-0 ${category.isBlocked ? 'hover:bg-emerald-50 hover:text-emerald-600' : 'hover:bg-orange-50 hover:text-orange-600'}`}
                             title={category.isBlocked ? 'Reinstate Visibility' : 'Quarantine Entire Branch'}
                           >
                             {category.isBlocked ? <ShieldCheck size={16} /> : <ShieldBan size={16} />}
                           </Button>
                           <Button 
                             onClick={() => handleDelete(category._id)}
                             disabled={isDeleting}
                             variant="ghost"
                             size="sm"
                             className="w-8 h-8 p-0 hover:bg-red-50 hover:text-red-600"
                           >
                             <Trash2 size={16} />
                           </Button>
                         </div>
                      </td>
                    </tr>
                  ))}
                  {data.categories?.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-8 py-12 text-center">
                        <p className="text-gray-400 font-medium">
                          {searchQuery ? `No matches found for "${searchQuery}"` : 'No categories allocated.'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination 
            page={data.page} 
            pages={data.pages} 
            onPageChange={(page) => setPageNumber(page)} 
          />
        </>
      )}
    </div>
  );
};
