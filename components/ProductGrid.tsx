'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, Package, Tag } from 'lucide-react';
import { getImageUrl } from '@/lib/getImageUrl';
import { useCart } from '@/context/CartContext';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  inStock: boolean;
}

interface ProductGridProps {
  searchQuery: string;
  onAskAi?: (text: string) => void;
}

export function ProductGrid({ 
  searchQuery, 
  onAskAi 
}: ProductGridProps) {
  const { cart, addToCart } = useCart();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Debounce search from prop
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [page, debouncedSearch]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?page=${page}&limit=24&search=${encodeURIComponent(debouncedSearch)}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="h-64 relative bg-white">
              <img 
                src={selectedProduct.imageUrl || getImageUrl(selectedProduct.name, 800, 600)} 
                alt={selectedProduct.name} 
                className="w-full h-full object-contain p-2"
              />
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-900 rounded-full w-8 h-8 flex items-center justify-center font-bold shadow transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">{selectedProduct.name}</h2>
                <p className="text-2xl font-extrabold text-[#B12704] mt-2">₹{selectedProduct.price.toFixed(2)}</p>
              </div>
              <div className="prose prose-sm text-gray-600 max-h-40 overflow-y-auto pr-2">
                <p>{selectedProduct.description !== 'No description available' ? selectedProduct.description : 'Detailed description not available for this item.'}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap justify-between items-center gap-3">
                <button 
                  onClick={() => {
                    if (onAskAi) {
                      onAskAi(`I want to buy the ${selectedProduct.name} priced at ₹${selectedProduct.price.toFixed(2)}`);
                    }
                    setSelectedProduct(null);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full font-medium shadow-md transition-colors flex items-center gap-2 text-sm"
                >
                  ✨ Ask AI to Buy
                </button>
                
                <div className="flex flex-wrap items-center gap-3">
                  {cart.some(item => item.id === selectedProduct.id) ? (
                    <button 
                      onClick={() => {
                        setSelectedProduct(null);
                        router.push('/cart');
                      }}
                      className="px-4 py-2 bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 rounded-full font-medium shadow-sm transition-colors border border-[#FCD200] text-sm"
                    >
                      Go to Cart
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        addToCart(selectedProduct);
                      }}
                      className="px-4 py-2 bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 rounded-full font-medium shadow-sm transition-colors border border-[#FCD200] text-sm"
                    >
                      Add to Cart
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                      router.push('/checkout');
                    }}
                    className="px-4 py-2 bg-[#ffa41c] hover:bg-[#fa8900] text-gray-900 rounded-full font-medium shadow-sm transition-colors border border-[#FF8F00] text-sm"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Package className="h-12 w-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col cursor-pointer" onClick={() => setSelectedProduct(product)}>
                <div className="h-48 bg-white flex items-center justify-center border-b border-gray-100 overflow-hidden relative">
                   <img 
                      src={product.imageUrl || getImageUrl(product.name, 400, 300)} 
                      alt={product.name} 
                      className="w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-300" 
                      loading="lazy"
                   />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                    {product.description !== 'No description available' ? product.description : ''}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-lg font-bold text-gray-900">₹{product.price.toFixed(2)}</span>
                    <button 
                       className="px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                       onClick={(e) => {
                         e.stopPropagation();
                         setSelectedProduct(product);
                       }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Page <span className="font-medium text-gray-900">{page}</span> of <span className="font-medium text-gray-900">{totalPages}</span>
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
