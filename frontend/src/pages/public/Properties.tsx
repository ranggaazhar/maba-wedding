// src/pages/Properties.tsx
import { ImageWithFallback } from '@/components/fallbackimage/ImageWithFallback';
import { Search } from 'lucide-react';
import { useProperties } from '@/hooks/Customer/useProperties';

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
  const { properties, isLoading, searchQuery, setSearchQuery, getPrimaryImage, formatPrice } = useProperties();

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

      {/* Search Section */}
      <section className="bg-white border-b border-[#E5E7EB] py-8 -mt-16 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Cari properti atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-[#A8DADC]/30 rounded-full focus:outline-none focus:border-[#457B9D] transition-colors"
            />
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
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-br from-[#F8F9FA] to-white rounded-3xl p-12 shadow-xl border-2 border-[#A8DADC]/20 text-center space-y-6">
            <h3>Butuh Paket Custom?</h3>
            <p className="text-[#6B7280] leading-relaxed max-w-2xl mx-auto">
              Semua properti dapat dikombinasikan sesuai kebutuhan Anda. Tim kami siap membantu merancang paket custom yang sesuai dengan tema dan budget pernikahan Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <a href="#contact" className="px-8 py-4 bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white rounded-full hover:shadow-2xl transition-all hover:scale-105">
                Konsultasi Sekarang
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Info */}
      <section className="py-16 bg-gradient-to-br from-[#1D3557] to-[#0F1F35] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { emoji: '📦', title: 'Harga Transparan', desc: 'Semua harga sudah termasuk instalasi dan transportasi area Jakarta' },
              { emoji: '✨', title: 'Kondisi Prima', desc: 'Semua properti terawat dengan baik dan selalu dalam kondisi terbaik' },
              { emoji: '🔄', title: 'Fleksibel', desc: 'Sewa per item atau dalam paket sesuai kebutuhan acara Anda' },
            ].map((item, i) => (
              <div key={i} className="space-y-3">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-3xl">{item.emoji}</span>
                </div>
                <h4 className="text-white">{item.title}</h4>
                <p className="text-[#A8DADC] text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}