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
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <h3 className="font-display text-2xl tracking-tight">Product Ledger</h3>
          <p className="text-[10px] font-bold text-accent uppercase tracking-widest mt-2">{data?.products?.length || 0} Assets in Inventory</p>
        </div>
        <Link to="/admin/products/new">
          <Button className="h-12 px-8 text-[10px] tracking-[0.2em]" variant="primary">
            <Plus size={16} className="mr-2" /> Create New Asset
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center bg-surface/20 rounded-sm border border-white/5">
          <Loader />
        </div>
      ) : error ? (
        <Message variant="danger">{error?.data?.message || 'Inventory Retrieval Failure'}</Message>
      ) : (
        <>
          <div className="glass-panel overflow-hidden border border-white/10 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-8 py-5 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Reference</th>
                    <th className="px-8 py-5 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Asset Identity</th>
                    <th className="px-8 py-5 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Class</th>
                    <th className="px-8 py-5 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Valuation</th>
                    <th className="px-8 py-5 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Availability</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-accent uppercase tracking-[0.2em]">Executive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.products?.map((product) => (
                    <tr key={product._id} className="hover:bg-white/[0.01] transition-all group">
                      <td className="px-8 py-6">
                        <span className="font-mono text-[11px] text-text-muted bg-surface/40 px-2 py-1 border border-white/5 tracking-wider uppercase">
                          #{product._id.substring(18, 24).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          {product.variants?.[0]?.images?.[0] ? (
                            <img src={product.variants[0].images[0]} alt="" className="w-12 h-12 rounded-sm object-cover border border-white/10 grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" />
                          ) : (
                            <div className="w-12 h-12 bg-surface/40 border border-white/10 flex items-center justify-center text-[10px] text-text-muted">N/A</div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-text-primary tracking-tight">{product.name}</p>
                            <p className="text-[9px] font-mono text-text-muted uppercase tracking-tighter mt-1 opacity-60 italic">/{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[9px] font-black text-text-muted border border-white/10 px-2 py-0.5 rounded-sm uppercase tracking-widest">
                          {product.category?.name || 'Unclassified'}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-bold text-text-primary">
                        ${product.price.toLocaleString()}
                      </td>
                      <td className="px-8 py-6">
                        {product.isBlocked ? (
                          <span className="text-[9px] font-black bg-red-900/10 text-red-400 px-2.5 py-1 rounded-sm border border-red-900/20 uppercase tracking-widest">Restricted</span>
                        ) : (
                          <span className="text-[9px] font-black bg-emerald-900/10 text-emerald-400 px-2.5 py-1 rounded-sm border border-emerald-900/20 uppercase tracking-widest">Authorized</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                          <Link to={`/admin/products/${product._id}/edit`}>
                             <Button variant="ghost" size="sm" className="w-9 h-9 p-0 border border-white/5 hover:border-accent hover:text-accent">
                               <Edit size={14} />
                             </Button>
                          </Link>
                          <Button 
                            onClick={() => handleToggleBlock(product._id)}
                            disabled={isToggling}
                            variant="ghost"
                            size="sm"
                            className={`w-9 h-9 p-0 border border-white/5 ${product.isBlocked ? 'hover:border-emerald-50 hover:text-emerald-400' : 'hover:border-orange-900 hover:text-orange-400'}`}
                          >
                            {product.isBlocked ? <ShieldCheck size={14} /> : <ShieldBan size={14} />}
                          </Button>
                          <Button 
                            onClick={() => handleDelete(product._id)}
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
                  {data.products?.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-8 py-20 text-center">
                        <p className="text-text-muted text-xs italic italic-editorial uppercase tracking-widest">
                          {searchQuery ? `No assets matching "${searchQuery}" in archive.` : 'No archival records found.'}
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
