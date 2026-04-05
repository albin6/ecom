import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetProductsQuery } from '../features/products/productApiSlice.js';
import { useGetCategoriesQuery } from '../features/categories/categoryApiSlice.js';
import { addToCart } from '../features/cart/cartSlice.js';
import { Loader } from '../components/ui/Loader.jsx';
import { Message } from '../components/ui/Message.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Search, SlidersHorizontal, ShoppingCart, X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'LATEST ARRIVALS' },
  { value: 'price',      label: 'PRICE: LOW → HIGH' },
  { value: '-price',     label: 'PRICE: HIGH → LOW' },
  { value: 'name',       label: 'NAME: A → Z' },
  { value: '-name',      label: 'NAME: Z → A' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.1,
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1]
    } 
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1]
    } 
  }
};

export const ProductListing = () => {
  const dispatch   = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  // ── All filter/sort/pagination state is local — no URL params ──
  const [keyword,  setKeyword]  = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [sort,     setSort]     = useState('-createdAt');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page,     setPage]     = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addedId,  setAddedId]  = useState(null);

  // Debounce keyword → backend query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
      setPage(1); // reset pagination on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Reset to page 1 when sort/category/price changes
  const applySort = (value) => { setSort(value); setPage(1); };
  const applyCategory = (value) => { setCategory(value); setPage(1); };

  const { data, isLoading, error, isFetching } = useGetProductsQuery({
    keyword: debouncedKeyword,
    sort,
    category,
    minPrice,
    maxPrice,
    pageNumber: page,
    limit: 12
  });

  const { data: categories = [] } = useGetCategoriesQuery();

  const clearFilters = useCallback(() => {
    setKeyword('');
    setDebouncedKeyword('');
    setSort('-createdAt');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
  }, []);

  const hasFilters = debouncedKeyword || category || minPrice || maxPrice || sort !== '-createdAt';

  const handleAddToCart = (product, selectedVariant, selectedSize) => {
    // Fallback logic if for some reason we don't have them
    const variant = selectedVariant || product.variants?.[0];
    const size = selectedSize || variant?.sizes?.[0];

    dispatch(addToCart({
      product: product._id,
      name: product.name,
      image: variant?.images?.[0] || '',
      price: product.price,
      qty: 1,
      stock: size?.stock || 0,
      color: variant?.color,
      size: size?.size
    }));
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="py-12 bg-base-black min-h-screen">
      {/* Editorial Header */}
      <div className="mb-16 border-b border-white/5 pb-12 flex flex-col items-center text-center">
        <h1 className="text-5xl lg:text-7xl font-serif mb-4 tracking-tight italic">The Collection</h1>
        {data && (
          <p className="text-text-muted text-[10px] uppercase tracking-[0.4em] font-bold">
            Curating {data.total} exceptional pieces
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-16 items-start">
        {/* Editorial Sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-32">
          <FilterPanel
            categories={categories}
            category={category}
            minPrice={minPrice}
            maxPrice={maxPrice}
            hasFilters={hasFilters}
            onCategoryChange={applyCategory}
            onPriceApply={(min, max) => { setMinPrice(min); setMaxPrice(max); setPage(1); }}
            onClearFilters={clearFilters}
          />
        </aside>

        {/* Mobile Filter Drawer (Logic Preserved, Styled Luxury) */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-base-black/80 backdrop-blur-sm z-[110] lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                className="fixed left-0 top-0 bottom-0 w-80 bg-surface z-[120] p-8 lg:hidden flex flex-col"
              >
                <div className="flex justify-between items-center mb-12">
                  <h3 className="font-serif text-2xl">Collection Filters</h3>
                  <button onClick={() => setSidebarOpen(false)} className="text-text-primary hover:text-accent transition-colors">
                    <X size={20} strokeWidth={1} />
                  </button>
                </div>
                <FilterPanel
                  categories={categories}
                  category={category}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  hasFilters={hasFilters}
                  onCategoryChange={(cat) => { applyCategory(cat); setSidebarOpen(false); }}
                  onPriceApply={(min, max) => { setMinPrice(min); setMaxPrice(max); setPage(1); setSidebarOpen(false); }}
                  onClearFilters={() => { clearFilters(); setSidebarOpen(false); }}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 w-full">
          {/* Editorial Toolbar */}
          <div className="flex flex-col sm:flex-row items-end gap-8 mb-12 border-b border-white/5 pb-8">
            <div className="relative flex-1 group w-full">
              <input
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="SEARCH THE COLLECTION..."
                className="input-editorial text-[10px] tracking-widest placeholder:text-text-muted/30 pb-4 h-auto"
              />
              <Search className="absolute right-0 top-0 text-text-muted/40 group-focus-within:text-accent transition-colors" size={12} />
            </div>

            <div className="flex items-center gap-6 w-full sm:w-auto">
              {/* Luxury Sort */}
              <div className="relative group">
                <select
                  value={sort}
                  onChange={e => applySort(e.target.value)}
                  className="bg-transparent text-[10px] tracking-[0.2em] font-bold uppercase text-text-muted focus:text-accent focus:outline-none appearance-none pr-8 cursor-pointer border-none"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-surface">{o.label}</option>)}
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted/40 group-hover:text-accent transition-colors">
                  <SlidersHorizontal size={12} />
                </div>
              </div>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden h-10 flex items-center gap-2 text-[10px] tracking-widest font-bold uppercase text-accent"
              >
                Refine
              </button>

              {/* Clear Filters (Editorial style) */}
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-error/60 hover:text-error text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                  <X size={10} /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Active Chips (Minimalist) */}
          {(category || minPrice || maxPrice) && (
            <div className="flex flex-wrap gap-4 mb-8">
              {category && (
                <span className="flex items-center gap-2 text-[10px] tracking-widest text-accent font-bold uppercase border border-accent/20 px-3 py-1 rounded-sm">
                  {categories.find(c => c._id === category)?.name || 'Category'}
                  <button onClick={() => applyCategory('')} className="hover:text-text-primary transition-colors"><X size={10} /></button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="flex items-center gap-2 text-[10px] tracking-widest text-accent font-bold uppercase border border-accent/20 px-3 py-1 rounded-sm">
                  ${minPrice || 0} – ${maxPrice || '∞'}
                  <button onClick={() => { setMinPrice(''); setMaxPrice(''); setPage(1); }} className="hover:text-text-primary transition-colors"><X size={10} /></button>
                </span>
              )}
            </div>
          )}

          {/* ─── Product Grid ─── */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-6">
                  <div className="aspect-[4/5] skeleton-luxury" />
                  <div className="space-y-3">
                    <div className="h-4 w-3/4 skeleton-luxury" />
                    <div className="h-4 w-1/4 skeleton-luxury" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-12 border border-error/20 bg-error/5 text-error font-serif text-center italic">
              The collection could not be accessed at this time.
            </div>
          ) : data?.products?.length === 0 ? (
            <div className="py-32 text-center">
              <h3 className="font-serif text-3xl mb-4 italic">No remains found</h3>
              <p className="text-text-muted text-[10px] uppercase tracking-[0.4em] mb-12">Try different search terms or collection filters</p>
              <button 
                onClick={clearFilters}
                className="btn btn-secondary px-12 h-12"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <motion.div
                key={`${debouncedKeyword}-${sort}-${category}-${minPrice}-${maxPrice}-${page}`}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-20 transition-all duration-700 ${isFetching ? 'opacity-40 grayscale' : ''}`}
              >
                {data.products.map((product, idx) => (
                  <ProductListCard
                    key={product._id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    justAdded={addedId === product._id}
                    userInfo={userInfo}
                    // Purely decorative index for layout variety
                    isLarge={idx === 0 && page === 1 && !debouncedKeyword} 
                  />
                ))}
              </motion.div>

              {/* Luxury Pagination */}
              {data.pages > 1 && (
                <div className="mt-32 flex items-center justify-center gap-12 border-t border-white/5 pt-12">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    className="group flex items-center gap-4 text-[10px] tracking-[0.3em] font-bold uppercase text-text-muted disabled:opacity-20 transition-all hover:text-accent"
                  >
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Prev
                  </button>

                  <div className="flex gap-8">
                    {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`text-sm font-serif transition-all ${
                          p === page ? 'text-accent scale-150 italic' : 'text-text-muted hover:text-text-primary'
                        }`}
                      >
                        {String(p).padStart(2, '0')}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={page >= data.pages}
                    onClick={() => setPage(p => p + 1)}
                    className="group flex items-center gap-4 text-[10px] tracking-[0.3em] font-bold uppercase text-text-muted disabled:opacity-20 transition-all hover:text-accent"
                  >
                    Next <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const FilterPanel = ({ categories, category, minPrice, maxPrice, hasFilters, onCategoryChange, onPriceApply, onClearFilters }) => {
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  useEffect(() => { setLocalMin(minPrice); }, [minPrice]);
  useEffect(() => { setLocalMax(maxPrice); }, [maxPrice]);

  return (
    <div className="space-y-16">
      {/* Editorial Category List */}
      <div>
        <h4 className="text-[10px] font-bold text-accent uppercase tracking-[0.3em] mb-8">Navigation</h4>
        <div className="grid grid-cols-1 gap-4 font-serif text-xl italic">
          <button
            onClick={() => onCategoryChange('')}
            className={`text-left transition-all duration-300 hover:pl-4 hover:text-accent ${!category ? 'text-accent pl-4 underline' : 'text-text-muted'}`}
          >
            All Pieces
          </button>
          {Array.isArray(categories) && categories.map(c => (
            <button
              key={c._id}
              onClick={() => onCategoryChange(c._id)}
              className={`text-left transition-all duration-300 hover:pl-4 hover:text-accent ${category === c._id ? 'text-accent pl-4 underline' : 'text-text-muted'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Curator */}
      <div>
        <h4 className="text-[10px] font-bold text-accent uppercase tracking-[0.3em] mb-8">Value Range</h4>
        <div className="space-y-6">
          <div className="flex gap-12 items-center">
            <div className="flex-1">
              <label className="block text-[9px] uppercase tracking-widest text-text-muted mb-2">FROM</label>
              <input
                type="number" min="0" placeholder="0" value={localMin}
                onChange={e => setLocalMin(e.target.value)}
                className="input-editorial py-1 text-xs"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[9px] uppercase tracking-widest text-text-muted mb-2">TO</label>
              <input
                type="number" min="0" placeholder="∞" value={localMax}
                onChange={e => setLocalMax(e.target.value)}
                className="input-editorial py-1 text-xs"
              />
            </div>
          </div>
          <button
            onClick={() => onPriceApply(localMin, localMax)}
            className="w-full btn btn-secondary h-10 text-[10px]"
          >
            Apply Filter
          </button>
          {hasFilters && (
            <button onClick={onClearFilters} className="w-full text-[9px] uppercase tracking-widest text-error/60 hover:text-error transition-colors pt-4 border-t border-white/5 font-bold">
              ✕ Reset All Selections
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductListCard = ({ product, onAddToCart, justAdded, userInfo, isLarge }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [activeVariant, setActiveVariant] = useState(0);
  const [activeSize, setActiveSize] = useState('');

  const currentVariant = product.variants?.[activeVariant];
  const isOutOfStock = !product.variants?.some(v => v.sizes?.some(s => s.stock > 0));
  const FALLBACK = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect fill="%231a1a1a" width="400" height="500"/><text fill="%232a2a2a" font-family="serif" font-style="italic" font-size="24" text-anchor="middle" x="200" y="260">Hannvis</text></svg>';
  const image = currentVariant?.images?.[0] || product.variants?.[0]?.images?.[0] || FALLBACK;

  useEffect(() => {
    if (currentVariant) {
      const firstAvailable = currentVariant.sizes.find(s => s.stock > 0);
      setActiveSize(firstAvailable ? firstAvailable.size : '');
    }
  }, [activeVariant, currentVariant]);

  const handleConfirm = (e) => {
    e.stopPropagation();
    const sizeObj = currentVariant.sizes.find(s => s.size === activeSize);
    onAddToCart(product, currentVariant, sizeObj);
    setShowOptions(false);
  };

  return (
    <motion.div
      variants={cardVariants}
      className={`group flex flex-col ${isLarge ? 'lg:col-span-2 lg:flex-row gap-12' : ''}`}
    >
      <Link 
        to={`/product/${product._id}`} 
        className={`relative block overflow-hidden bg-surface group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-700 ease-boutique ${isLarge ? 'flex-1 aspect-[16/9]' : 'aspect-[4/5]'}`}
      >
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1200ms] ease-boutique grayscale-[0.2] group-hover:grayscale-0"
          loading="lazy"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-base-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-[10px] tracking-[0.3em] font-bold text-base-black bg-accent px-6 py-2 uppercase italic font-serif">Reserved / Out</span>
          </div>
        )}

        {/* Floating Add Trigger (Visual Only) */}
        {!isOutOfStock && !showOptions && userInfo && userInfo.role !== 'admin' && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-boutique pointer-events-none lg:pointer-events-auto">
            <button
              onClick={(e) => { e.preventDefault(); setShowOptions(true); }}
              className="bg-accent text-base-black text-[10px] tracking-widest font-bold px-8 py-3 uppercase hover:bg-white transition-colors"
            >
              Add to Selection
            </button>
          </div>
        )}
      </Link>

      <div className={`pt-6 flex flex-col flex-grow ${isLarge ? 'lg:max-w-xs' : ''}`}>
        <div className="flex justify-between items-start mb-2">
          <Link to={`/product/${product._id}`} className="flex-1">
            <h3 className="font-serif text-2xl group-hover:text-accent transition-colors leading-tight italic">
              {product.name}
            </h3>
          </Link>
          <span className="font-mono text-accent text-sm pl-4 leading-none">${product.price.toFixed(2)}</span>
        </div>

        <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-bold mb-6">
          {product.category?.name || 'Hannvis Selection'}
        </p>

        {/* Options Panel (Logic Preserved, Styled Luxury) */}
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-2 p-6 bg-surface border border-white/5 space-y-6"
          >
            <div>
              <label className="text-[9px] uppercase tracking-widest text-text-muted mb-4 block">SELECT PALETTE</label>
              <div className="flex gap-3">
                {product.variants.map((v, i) => (
                  <button
                    key={v.color}
                    onClick={() => setActiveVariant(i)}
                    className={`w-6 h-6 rounded-full border border-white/10 p-0.5 transition-all ${activeVariant === i ? 'border-accent scale-110' : 'opacity-40 hover:opacity-100'}`}
                  >
                    <div className="w-full h-full rounded-full" style={{ backgroundColor: v.color.toLowerCase() }} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[9px] uppercase tracking-widest text-text-muted mb-4 block">SELECT SIZE</label>
              <div className="flex flex-wrap gap-2">
                {currentVariant.sizes.map(s => (
                  <button
                    key={s.size}
                    disabled={s.stock === 0}
                    onClick={() => setActiveSize(s.size)}
                    className={`px-3 py-1.5 text-[10px] font-bold border transition-all ${
                      s.stock === 0 ? 'border-white/5 text-text-muted/20 cursor-not-allowed line-through' :
                      activeSize === s.size ? 'border-accent text-accent' : 'border-white/5 text-text-muted hover:border-white/20'
                    }`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/5">
              <button 
                onClick={handleConfirm}
                disabled={!activeSize}
                className="flex-1 bg-accent text-base-black text-[10px] font-bold py-3 uppercase hover:bg-white transition-all disabled:opacity-30"
              >
                Add to Selection
              </button>
              <button onClick={() => setShowOptions(false)} className="px-4 text-text-muted hover:text-text-primary transition-colors">
                <X size={16} strokeWidth={1} />
              </button>
            </div>
          </motion.div>
        )}

        {justAdded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-success/10 border border-success/20 text-success text-[10px] tracking-widest font-bold uppercase text-center italic">
            Added to Selection
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

