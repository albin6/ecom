import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useGetAdminProductsQuery, useDeleteProductMutation, useToggleBlockProductMutation } from '../../features/products/productApiSlice.js';
import { Button } from '../../components/ui/Button.jsx';
import { Message } from '../../components/ui/Message.jsx';
import { Loader } from '../../components/ui/Loader.jsx';
import { Edit, Trash2, ShieldBan, ShieldCheck, Plus } from 'lucide-react';
import { Pagination } from '../../components/ui/Pagination.jsx';

export const AdminProductList = () => {
  const { searchQuery } = useOutletContext();
  const [pageNumber, setPageNumber] = useState(1);

  const { data, isLoading, error, refetch } = useGetAdminProductsQuery({ keyword: searchQuery, pageNumber });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [toggleBlock, { isLoading: isToggling }] = useToggleBlockProductMutation();

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to completely delete this product?')) {
      try {
        await deleteProduct(id).unwrap();
        refetch();
      } catch (err) {
        alert(err?.data?.message || 'Delete failed');
      }
    }
  };

  const handleToggleBlock = async (id) => {
    if (window.confirm('Toggle block status for this product?')) {
      try {
        await toggleBlock(id).unwrap();
        refetch();
      } catch (err) {
        alert(err?.data?.message || 'Toggle failed');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div></div>
        <Link to="/admin/products/new">
          <Button className="flex items-center gap-2">
            <Plus size={18} /> Create Product
          </Button>
        </Link>
      </div>

      {isLoading ? <Loader /> : error ? (
        <Message variant="danger">{error?.data?.message || 'Something went wrong'}</Message>
      ) : (
        <>
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">ID</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Product</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Category</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Price</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.products?.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6 whitespace-nowrap">
                         <span className="font-mono text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">
                            {product._id.substring(18, 24).toUpperCase()}
                         </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {product.variants?.[0]?.images?.[0] && (
                            <img src={product.variants[0].images[0]} alt="" className="w-10 h-10 rounded-xl object-cover bg-gray-100 shadow-sm" />
                          )}
                          <div>
                            <p className="text-sm font-bold text-gray-900">{product.name}</p>
                            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">/{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-black text-gray-900">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        {product.isBlocked ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-wide border border-red-100">
                            Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wide border border-emerald-100">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/products/${product._id}/edit`}>
                             <Button variant="ghost" size="sm" className="w-8 h-8 p-0 hover:bg-indigo-50 hover:text-indigo-600">
                               <Edit size={16} />
                             </Button>
                          </Link>
                          <Button 
                            onClick={() => handleToggleBlock(product._id)}
                            disabled={isToggling}
                            variant="ghost"
                            size="sm"
                            className={`w-8 h-8 p-0 ${product.isBlocked ? 'hover:bg-emerald-50 hover:text-emerald-600' : 'hover:bg-orange-50 hover:text-orange-600'}`}
                          >
                            {product.isBlocked ? <ShieldCheck size={16} /> : <ShieldBan size={16} />}
                          </Button>
                          <Button 
                            onClick={() => handleDelete(product._id)}
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
                  {data.products?.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-8 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                           <p className="text-gray-400 font-medium">
                              {searchQuery ? `No products matching "${searchQuery}"` : 'No inventory records found.'}
                           </p>
                        </div>
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
