// src/pages/Properties.tsx
import { ImageWithFallback } from '@/components/fallbackimage/ImageWithFallback';
import { Search, Filter } from 'lucide-react';
import { useProperties } from '@/hooks/Customer/useProperties';
import { Button } from '@/components/ui/button';

function getPaginationRange(current: number, total: number): (number | '...')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, '...', total];
  if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

function SkeletonPropertyCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}

export function Properties() {
  const {
    properties,
    totalProperties,
    categories,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    currentPage,
    setCurrentPage,
    totalPages,
    getPrimaryImage,
    formatPrice
  } = useProperties();

  const paginationRange = getPaginationRange(currentPage, totalPages);

  return (
    <div className="min-h-screen pt-20">
      <section className="relative bg-gradient-to-br from-[#1D3557] via-[#2A4A6C] to-[#457B9D] text-white pt-32 pb-40 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-20 left-10 w-80 h-80 bg-[#A8DADC]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#457B9D]/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-32 h-32 border-2 border-white/10 rounded-full"></div>
        <div className="absolute bottom-24 left-1/3 w-20 h-20 border-2 border-[#A8DADC]/20 rounded-full"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-1 bg-gradient-to-r from-[#A8DADC] to-transparent rounded-full"></div>
              <span className="text-[#A8DADC] text-sm tracking-[0.3em] uppercase">Catalog</span>
            </div>

            <h1 className="!text-white leading-tight">
              Properties Catalog
            </h1>

            <p className="!text-[#A8DADC]/90 text-xl leading-relaxed max-w-2xl">
              Koleksi lengkap properti dekorasi premium kami. Setiap item dipilih dengan cermat untuk menciptakan momen sempurna Anda.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          {/* Wave bottom */}
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 0C240 80 480 120 720 100C960 80 1200 40 1440 0V120H0V0Z" fill="#FFFFFF" />
          </svg>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="bg-white border-b border-[#E5E7EB] top-20 z-40 shadow-sm -mt-16 relative">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Cari properti..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-[#A8DADC]/30 rounded-full focus:outline-none focus:border-[#457B9D] transition-colors"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3 flex-wrap">
              <Filter className="w-5 h-5 text-[#6B7280] flex-shrink-0" />
              <Button
                variant="ghost"
                onClick={() => setSelectedCategory('All')}
                className={`px-5 py-2 h-auto rounded-full transition-all text-sm font-light ${selectedCategory === 'All'
                    ? 'bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white shadow-lg hover:text-white hover:opacity-90'
                    : 'bg-[#F8F9FA] text-[#6B7280] hover:bg-[#A8DADC]/20 hover:text-[#1D3557]'
                  }`}
              >
                All
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  variant="ghost"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-5 py-2 h-auto rounded-full transition-all text-sm font-sans font-light ${selectedCategory === cat.name
                      ? 'bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white shadow-lg hover:text-white hover:opacity-90'
                      : 'bg-[#F8F9FA] text-[#6B7280] hover:bg-[#A8DADC]/20 hover:text-[#1D3557]'
                    }`}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonPropertyCard key={i} />)}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#6B7280] text-xl">Tidak ada properti yang ditemukan</p>
            </div>
          ) : (
            <>
              {/* Result count */}
              <p className="text-[#6B7280] text-sm mb-6 font-sans">
                Menampilkan{' '}
                <span className="text-[#1D3557] font-medium">{properties.length}</span>
                {' '}dari{' '}
                <span className="text-[#1D3557] font-medium">{totalProperties}</span>
                {' '}properti
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {properties.map(property => (
                  <div key={property.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="aspect-square overflow-hidden relative">
                      <ImageWithFallback
                        src={getPrimaryImage(property)}
                        alt={property.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {property.category && (
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                          <span className="text-[#1D3557] text-xs">{property.category.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 space-y-3">
                      <h4 className="group-hover:text-[#457B9D] transition-colors" style={{ fontSize: '1.125rem' }}>
                        {property.name}
                      </h4>
                      {property.description && (
                        <p className="text-[#6B7280] text-sm leading-relaxed line-clamp-2">{property.description}</p>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
                        <div>
                          <p className="text-[#6B7280] text-xs">Harga Sewa</p>
                          <p className="text-[#457B9D]">{formatPrice(property.price)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Pagination ──────────────────────────────────────────── */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 h-auto border-2 border-[#A8DADC] text-[#457B9D] rounded-lg hover:bg-[#A8DADC] hover:text-white hover:border-[#A8DADC] transition-all disabled:opacity-40 font-sans"
                  >
                    Previous
                  </Button>

                  {paginationRange.map((item, i) =>
                    item === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-[#6B7280] select-none">…</span>
                    ) : (
                      <Button
                        key={item}
                        variant="ghost"
                        onClick={() => setCurrentPage(item as number)}
                        className={`px-4 py-2 h-auto rounded-lg transition-all font-sans ${currentPage === item
                          ? 'bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white hover:text-white hover:opacity-90 shadow-lg'
                          : 'border-2 border-[#A8DADC] text-[#457B9D] hover:bg-[#A8DADC] hover:text-white'
                          }`}
                      >
                        {item}
                      </Button>
                    )
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 h-auto border-2 border-[#A8DADC] text-[#457B9D] rounded-lg hover:bg-[#A8DADC] hover:text-white hover:border-[#A8DADC] transition-all disabled:opacity-40 font-sans"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}