// src/pages/OurProjects.tsx
import { ImageWithFallback } from '@/components/fallbackimage/ImageWithFallback';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRight } from 'lucide-react';
import { useOurProjects } from '@/hooks/Customer/useOurProjects';

function SkeletonProjectCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-6 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}

export function OurProjects() {
  const {
    projects,
    categories,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    getHeroImage,
    formatPrice,
  } = useOurProjects();

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#1D3557] to-[#0F1F35] text-white py-24">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <h1 className="text-white">Our Projects</h1>
          <p className="text-[#A8DADC] text-xl max-w-3xl mx-auto leading-relaxed">
            Every celebration is a story. Explore our crafted moments that turned dreams into unforgettable memories.
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="bg-white border-b border-[#E5E7EB] sticky top-20 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau tema..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-[#A8DADC]/30 rounded-full focus:outline-none focus:border-[#457B9D] transition-colors"
              />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Filter className="w-5 h-5 text-[#6B7280]" />
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-5 py-2 rounded-full transition-all ${selectedCategory === 'All' ? 'bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white shadow-lg' : 'bg-[#F8F9FA] text-[#6B7280] hover:bg-[#A8DADC]/20'}`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-5 py-2 rounded-full transition-all ${selectedCategory === cat.name ? 'bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white shadow-lg' : 'bg-[#F8F9FA] text-[#6B7280] hover:bg-[#A8DADC]/20'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonProjectCard key={i} />)}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#6B7280] text-xl">Tidak ada proyek yang ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map(project => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <ImageWithFallback
                      src={getHeroImage(project)}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {project.category && (
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                        <span className="text-[#1D3557] text-sm">{project.category.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-3">
                    <h3 className="group-hover:text-[#457B9D] transition-colors" style={{ fontSize: '1.375rem' }}>
                      {project.title}
                    </h3>
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-[#6B7280] text-sm">Tema</p>
                        <p className="text-[#1D3557]">{project.theme ?? '—'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#6B7280] text-sm">Estimasi</p>
                        <p className="text-[#457B9D]">{formatPrice(project.price)}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-[#E5E7EB] flex items-center gap-1 text-[#457B9D] group-hover:underline">
                      Lihat Detail <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}