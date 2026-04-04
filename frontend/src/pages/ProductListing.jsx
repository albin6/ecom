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
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price',      label: 'Price: Low → High' },
  { value: '-price',     label: 'Price: High → Low' },
  { value: 'name',       label: 'Name: A → Z' },
  { value: '-name',      label: 'Name: Z → A' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } }
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
    <div className="py-8">
      {/* ─── Page Header ─── */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">All Products</h1>
        {data && <p className="text-gray-500 text-sm mt-1">{data.total} products found</p>}
      </div>

      <div className="flex gap-8 items-start">
        {/* ─── Desktop Sidebar ─── */}
        <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24">
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

        {/* ─── Mobile Sidebar Drawer ─── */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-2xl p-6 overflow-y-auto lg:hidden"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-lg">Filters</h3>
                  <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
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

        {/* ─── Main Content ─── */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="Search products..."
                className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary shadow-sm transition-all"
              />
              {keyword && (
                <button onClick={() => { setKeyword(''); setDebouncedKeyword(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={e => applySort(e.target.value)}
              className="h-10 px-3 pr-8 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary shadow-sm transition-all appearance-none cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden h-10 px-4 rounded-lg border border-gray-200 bg-white flex items-center gap-2 text-sm font-semibold text-gray-600 hover:border-gray-300 shadow-sm"
            >
              <SlidersHorizontal size={15} /> Filters
            </button>

            {/* Clear Filters badge */}
            {hasFilters && (
              <motion.button
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                onClick={clearFilters}
                className="h-10 px-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold flex items-center gap-1.5 hover:bg-red-100"
              >
                <X size={14} /> Clear Filters
              </motion.button>
            )}
          </div>

          {/* Active filter chips */}
          {(category || minPrice || maxPrice) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {category && (
                <span className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-semibold">
                  {categories.find(c => c._id === category)?.name || 'Category'}
                  <button onClick={() => applyCategory('')} className="ml-1 hover:text-indigo-900"><X size={11} /></button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-semibold">
                  ${minPrice || 0} – ${maxPrice || '∞'}
                  <button onClick={() => { setMinPrice(''); setMaxPrice(''); setPage(1); }} className="ml-1 hover:text-purple-900"><X size={11} /></button>
                </span>
              )}
            </div>
          )}

          {/* ─── Product Grid ─── */}
          {isLoading ? (
            <div className="py-24 flex justify-center"><Loader /></div>
          ) : error ? (
            <Message variant="danger">{error?.data?.message || 'Failed to load products'}</Message>
          ) : data?.products?.length === 0 ? (
            <div className="py-24 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filters.</p>
              <Button variant="outline" onClick={clearFilters}>Clear All Filters</Button>
            </div>
          ) : (
            <motion.div
              key={`${debouncedKeyword}-${sort}-${category}-${minPrice}-${maxPrice}-${page}`}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 transition-opacity ${isFetching ? 'opacity-60 pointer-events-none' : ''}`}
            >
              {data.products.map(product => (
                <ProductListCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  justAdded={addedId === product._id}
                  userInfo={userInfo}
                />
              ))}
            </motion.div>
          )}

          {/* ─── Pagination ─── */}
          {data && data.pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-9 w-9 rounded-lg text-sm font-bold transition-all ${
                    p === page
                      ? 'bg-secondary text-white shadow-md'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={page >= data.pages}
                onClick={() => setPage(p => p + 1)}
                className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>

              <span className="ml-3 text-xs text-gray-400 font-medium">
                Page {page} of {data.pages}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────── Sub-components ─────────────── */

const FilterPanel = ({ categories, category, minPrice, maxPrice, hasFilters, onCategoryChange, onPriceApply, onClearFilters }) => {
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  // Sync local price inputs when parent resets
  useEffect(() => { setLocalMin(minPrice); }, [minPrice]);
  useEffect(() => { setLocalMax(maxPrice); }, [maxPrice]);

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Category</h4>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange('')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${!category ? 'bg-secondary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            All Categories
          </button>
          {Array.isArray(categories) && categories.map(c => (
            <button
              key={c._id}
              onClick={() => onCategoryChange(c._id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${category === c._id ? 'bg-secondary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Price Range</h4>
        <div className="flex gap-2 items-center">
          <input
            type="number" min="0" placeholder="Min" value={localMin}
            onChange={e => setLocalMin(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
          />
          <span className="text-gray-400 text-sm font-bold flex-shrink-0">–</span>
          <input
            type="number" min="0" placeholder="Max" value={localMax}
            onChange={e => setLocalMax(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
          />
        </div>
        <button
          onClick={() => onPriceApply(localMin, localMax)}
          className="mt-2 w-full h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-700 transition-colors"
        >
          Apply
        </button>
      </div>

      {hasFilters && (
        <button onClick={onClearFilters} className="w-full text-xs text-red-500 hover:text-red-700 font-semibold pt-2 border-t border-gray-100">
          ✕ Clear All Filters
        </button>
      )}
    </div>
  );
};

const ProductListCard = ({ product, onAddToCart, justAdded, userInfo }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [activeVariant, setActiveVariant] = useState(0);
  const [activeSize, setActiveSize] = useState('');

  const currentVariant = product.variants?.[activeVariant];
  const isOutOfStock = !product.variants?.some(v => v.sizes?.some(s => s.stock > 0));
  const FALLBACK = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect fill="%23f1f5f9" width="400" height="500"/><text fill="%2394a3b8" font-family="sans-serif" font-size="24" text-anchor="middle" x="200" y="260">No Image</text></svg>';
  const image = currentVariant?.images?.[0] || product.variants?.[0]?.images?.[0] || FALLBACK;

  // Reset size when variant (color) changes
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
      className="group bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.09)] transition-all duration-300 overflow-hidden flex flex-col"
    >
      <Link to={`/product/${product._id}`} className="relative block aspect-[4/5] overflow-hidden bg-gray-50">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="px-3 py-1 bg-gray-800 text-white text-xs font-bold rounded-full">Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/product/${product._id}`}>
          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-secondary transition-colors mb-2">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto relative min-h-[40px]">
          <AnimatePresence mode="wait">
            {!showOptions ? (
              <motion.div
                key="price-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between gap-3"
              >
                <span className="text-lg font-black text-gray-900">${product.price.toFixed(2)}</span>

                {userInfo && userInfo.role !== 'admin' && !isOutOfStock && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowOptions(true)}
                    disabled={justAdded}
                    className={`h-9 px-3 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all ${
                      justAdded
                        ? 'bg-emerald-500 text-white'
                        : 'bg-secondary text-white hover:bg-indigo-700 shadow-sm'
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {justAdded ? (
                        <motion.span key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                          <Check size={13} /> Added
                        </motion.span>
                      ) : (
                        <motion.span key="add" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                          <ShoppingCart size={13} /> Add
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="options-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-gray-50 rounded-xl p-2 border border-gray-100"
              >
                <div className="flex flex-col gap-2">
                  {/* Colors */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-1.5">
                      {product.variants.map((v, i) => (
                        <button
                          key={v.color}
                          onClick={() => setActiveVariant(i)}
                          className={`w-5 h-5 rounded-full border-2 transition-all ${
                            activeVariant === i ? 'border-secondary scale-110 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: v.color.toLowerCase() }}
                          title={v.color}
                        />
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setShowOptions(false)} className="h-7 w-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 transition-all">
                        <X size={14} />
                      </button>
                      <button 
                        onClick={handleConfirm}
                        disabled={!activeSize}
                        className="h-7 px-2 rounded-lg bg-secondary text-white flex items-center gap-1 text-[10px] font-black shadow-sm disabled:opacity-50"
                      >
                        <Check size={12} /> CONFIRM
                      </button>
                    </div>
                  </div>

                  {/* Sizes */}
                  <div className="flex flex-wrap gap-1">
                    {currentVariant.sizes.map(s => (
                      <button
                        key={s.size}
                        disabled={s.stock === 0}
                        onClick={() => setActiveSize(s.size)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
                          s.stock === 0
                            ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed'
                            : activeSize === s.size
                            ? 'bg-white border-secondary text-secondary shadow-sm'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {s.size}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
