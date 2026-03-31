// src/pages/Home.tsx
import { useState } from 'react';
import { ImageWithFallback } from '@/components/fallbackimage/ImageWithFallback';
import { Link } from 'react-router-dom';
import { Sparkles, Users, Award, DollarSign, Heart, CheckCircle, ChevronLeft, ChevronRight, Quote, ArrowRight, Star } from 'lucide-react';
import { useHome } from '@/hooks/Customer/useHome';

// ── Skeleton helpers ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="w-1/3 flex-shrink-0 px-4">
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
        <div className="aspect-[4/5] bg-gray-200" />
        <div className="p-6 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

const whyChooseUs = [
  { icon: Sparkles, title: 'Desain Premium dan Elegan', description: 'Setiap detail dirancang dengan keahlian tinggi untuk menciptakan suasana mewah dan romantis yang tak terlupakan.' },
  { icon: Users, title: 'Tim Profesional', description: 'Tim berpengalaman yang berdedikasi untuk mewujudkan visi pernikahan impian Anda dengan sempurna.' },
  { icon: Award, title: 'Material Berkualitas', description: 'Kami hanya menggunakan bunga segar pilihan dan properti premium untuk memastikan kualitas terbaik.' },
  { icon: DollarSign, title: 'Harga Transparan', description: 'Tidak ada biaya tersembunyi. Dapatkan estimasi harga yang jelas dan sesuai dengan budget Anda.' },
];

const orderSteps = [
  { number: '01', title: 'Konsultasi', description: 'Diskusi awal untuk memahami visi dan kebutuhan Anda' },
  { number: '02', title: 'Pemilihan Konsep', description: 'Pilih tema dan gaya dekorasi yang sesuai' },
  { number: '03', title: 'Desain', description: 'Tim kami merancang layout detail untuk approval' },
  { number: '04', title: 'Eksekusi', description: 'Instalasi dan setup di hari H dengan sempurna' },
  { number: '05', title: 'Evaluasi', description: 'Kami memastikan semuanya berjalan lancar' },
];

export function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentPortfolio, setCurrentPortfolio] = useState(0);

  const { featuredProjects, testimonials, isLoadingProjects, isLoadingTestimonials, getHeroImage, formatPrice } = useHome();

  const visibleCount = 3;
  const maxPortfolio = Math.max(0, featuredProjects.length - visibleCount);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-white overflow-hidden pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute top-20 left-0 w-96 h-96 opacity-[0.07]" viewBox="0 0 400 400">
            <path d="M50,200 Q150,100 250,150 T450,200" fill="none" stroke="#A8DADC" strokeWidth="60" strokeLinecap="round" />
          </svg>
          <svg className="absolute top-40 left-20 w-80 h-80 opacity-[0.05]" viewBox="0 0 400 400">
            <path d="M0,250 Q100,200 200,220 T400,250" fill="none" stroke="#457B9D" strokeWidth="50" strokeLinecap="round" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="leading-tight">Crafting Moments Into Timeless Elegance</h1>
                <p className="text-[#6B7280] text-xl leading-relaxed max-w-xl">
                  Setiap detail menceritakan kisah cinta Anda. Kami hadirkan keindahan yang abadi untuk momen paling berharga dalam hidup Anda.
                </p>
              </div>
              <Link to="/projects" className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white rounded-full hover:shadow-2xl transition-all duration-500 hover:scale-105 group">
                <span className="text-lg">Book Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center gap-12 pt-8">
                <div><p className="text-4xl text-[#1D3557] mb-1">200+</p><p className="text-[#6B7280]">Projects Done</p></div>
                <div className="w-px h-16 bg-[#A8DADC]" />
                <div><p className="text-4xl text-[#1D3557] mb-1">100+</p><p className="text-[#6B7280]">Happy Clients</p></div>
                <div className="w-px h-16 bg-[#A8DADC]" />
                <div><p className="text-4xl text-[#1D3557] mb-1">5★</p><p className="text-[#6B7280]">Rating</p></div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl hover:-translate-y-2 transition-transform duration-500">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1658243862459-145b453dd74e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="Romantic Wedding Decoration"
                  className="w-full h-[600px] object-cover"
                />
                <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-[#A8DADC] rounded-tl-3xl" />
                <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-[#457B9D] rounded-br-3xl" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-2xl border border-[#A8DADC]/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#A8DADC] to-[#457B9D] rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white fill-white" />
                  </div>
                  <div>
                    <p className="text-[#1D3557]">Premium Quality</p>
                    <p className="text-[#6B7280] text-sm">Guaranteed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-gradient-to-br from-[#F8F9FA] to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <span className="text-[#457B9D] tracking-widest text-sm uppercase">Keunggulan Kami</span>
            <h2>Kenapa Memilih Kami</h2>
            <p className="text-[#6B7280] max-w-2xl mx-auto">Kepercayaan Anda adalah prioritas kami.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="group p-8 bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-[#A8DADC]/20 hover:border-[#457B9D]">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#A8DADC] to-[#457B9D] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="mb-3">{item.title}</h4>
                  <p className="text-[#6B7280] text-sm leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Projects Carousel */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <span className="text-[#457B9D] tracking-widest text-sm uppercase">Portfolio Terpilih</span>
            <h2>Portofolio Terpilih Kami</h2>
            <p className="text-[#6B7280] max-w-2xl mx-auto">Koleksi karya terbaik yang telah kami ciptakan</p>
          </div>

          <div className="relative">
            <button onClick={() => setCurrentPortfolio(p => Math.max(0, p - 1))} disabled={currentPortfolio === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-14 h-14 bg-white shadow-2xl rounded-full flex items-center justify-center hover:bg-[#A8DADC] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed group">
              <ChevronLeft className="w-6 h-6 text-[#1D3557] group-hover:text-white" />
            </button>
            <button onClick={() => setCurrentPortfolio(p => Math.min(maxPortfolio, p + 1))} disabled={currentPortfolio >= maxPortfolio}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-14 h-14 bg-white shadow-2xl rounded-full flex items-center justify-center hover:bg-[#A8DADC] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed group">
              <ChevronRight className="w-6 h-6 text-[#1D3557] group-hover:text-white" />
            </button>

            <div className="overflow-hidden">
              {isLoadingProjects ? (
                <div className="flex">
                  {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : featuredProjects.length === 0 ? (
                <p className="text-center text-[#6B7280] py-20">Belum ada project unggulan</p>
              ) : (
                <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${currentPortfolio * (100 / visibleCount)}%)` }}>
                  {featuredProjects.map(project => (
                    <div key={project.id} className="w-1/3 flex-shrink-0 px-4">
                      <Link to={`/projects/${project.id}`}
                        className="group block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-[#A8DADC]">
                        <div className="aspect-[4/5] overflow-hidden relative">
                          <ImageWithFallback src={getHeroImage(project)} alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          {project.category && (
                            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-[#1D3557]">
                              {project.category.name}
                            </div>
                          )}
                        </div>
                        <div className="p-6 space-y-3">
                          <h4 className="group-hover:text-[#457B9D] transition-colors" style={{ fontSize: '1.25rem' }}>{project.title}</h4>
                          {project.theme && <p className="text-[#6B7280] text-sm">{project.theme}</p>}
                          <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
                            <p className="text-[#457B9D]">{formatPrice(project.price)}</p>
                            <ArrowRight className="w-5 h-5 text-[#457B9D] group-hover:translate-x-2 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {featuredProjects.length > visibleCount && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: maxPortfolio + 1 }).map((_, i) => (
                  <button key={i} onClick={() => setCurrentPortfolio(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${i === currentPortfolio ? 'w-12 bg-gradient-to-r from-[#A8DADC] to-[#457B9D]' : 'w-2 bg-[#A8DADC]/30 hover:bg-[#A8DADC]/60'}`} />
                ))}
              </div>
            )}
          </div>

          <div className="text-center mt-10">
            <Link to="/projects" className="inline-flex items-center gap-2 text-[#457B9D] hover:text-[#1D3557] transition-colors group text-lg">
              Lihat Semua Karya <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-br from-[#1D3557] to-[#0F1F35] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#A8DADC] rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#457B9D] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <span className="text-[#A8DADC] tracking-widest text-sm uppercase">Testimoni</span>
            <h2 className="text-white">Apa Kata Mereka</h2>
          </div>

          {isLoadingTestimonials ? (
            <div className="bg-white/10 rounded-3xl p-12 animate-pulse">
              <div className="h-6 bg-white/20 rounded w-3/4 mb-4" />
              <div className="h-4 bg-white/20 rounded w-full mb-2" />
              <div className="h-4 bg-white/20 rounded w-5/6" />
            </div>
          ) : testimonials.length === 0 ? (
            <p className="text-center text-[#A8DADC]">Belum ada testimoni</p>
          ) : (
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/10 hover:border-white/30 transition-colors duration-500">
                <Quote className="w-12 h-12 text-[#A8DADC] mb-6 animate-pulse" />
                <p className="text-white text-xl mb-8 leading-relaxed italic">
                  "{testimonials[currentTestimonial]?.review_text}"
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white" style={{ fontSize: '1.25rem' }}>
                      {testimonials[currentTestimonial]?.customer_name}
                    </h4>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: testimonials[currentTestimonial]?.rating ?? 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setCurrentTestimonial(p => Math.max(0, p - 1))}
                      className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => setCurrentTestimonial(p => Math.min(testimonials.length - 1, p + 1))}
                      className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-center gap-2 mt-8">
                  {testimonials.map((_, i) => (
                    <button key={i} onClick={() => setCurrentTestimonial(i)}
                      className={`h-2 rounded-full transition-all ${i === currentTestimonial ? 'w-8 bg-[#A8DADC]' : 'w-2 bg-white/30'}`} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Order Steps */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <span className="text-[#457B9D] tracking-widest text-sm uppercase">Proses Kerja</span>
            <h2>Langkah Pemesanan</h2>
            <p className="text-[#6B7280] max-w-2xl mx-auto">Proses yang mudah dan transparan</p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#A8DADC] via-[#457B9D] to-[#1D3557] -translate-y-1/2 rounded-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {orderSteps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 border-[#A8DADC]/20 relative z-10 group hover:border-[#457B9D]">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#A8DADC] to-[#457B9D] rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                      <span className="text-white font-bold text-xl">{step.number}</span>
                    </div>
                    <h4 className="text-center mb-2" style={{ fontSize: '1.125rem' }}>{step.title}</h4>
                    <p className="text-[#6B7280] text-sm text-center leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-[#F8F9FA] to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-flex flex-col items-center gap-6 bg-white rounded-3xl p-10 shadow-2xl border border-[#A8DADC]/30">
              <CheckCircle className="w-12 h-12 text-[#457B9D] animate-pulse" />
              <div>
                <h3 className="mb-2">Siap Mewujudkan Dekorasi Impian?</h3>
                <p className="text-[#6B7280]">Hubungi kami hari ini untuk konsultasi gratis</p>
              </div>
              <Link to="/projects" className="px-10 py-4 bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white rounded-full hover:shadow-2xl transition-all hover:scale-105 group inline-flex items-center gap-2">
                Mulai Konsultasi <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}