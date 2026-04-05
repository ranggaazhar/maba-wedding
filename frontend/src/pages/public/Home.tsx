import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Users, Award, DollarSign, Heart, CheckCircle,
  ChevronLeft, ChevronRight, Quote, ArrowRight, Star
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useHome } from '@/hooks/Customer/useHome';
import { ImageWithFallback } from '@/components/fallbackimage/ImageWithFallback';
import Gedung from '../../assets/gedung.png';
import hero1 from '../../assets/hero3.png';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Testimonial {
  customer_name: string;
  review_text: string;
  rating: number;
}

// ── Skeleton helpers ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="w-1/3 flex-shrink-0 px-4">
      <Card className="overflow-hidden">
        <Skeleton className="aspect-[4/5] w-full" />
        <CardContent className="p-6 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </CardContent>
      </Card>
    </div>
  );
}

function SkeletonTestimonial() {
  return (
    <Card className="bg-white/10 border-white/10 rounded-3xl">
      <CardContent className="p-12 space-y-4">
        <Skeleton className="h-6 w-3/4 bg-white/20" />
        <Skeleton className="h-4 w-full bg-white/20" />
        <Skeleton className="h-4 w-5/6 bg-white/20" />
      </CardContent>
    </Card>
  );
}

// ── Static data ───────────────────────────────────────────────────────────────
const whyChooseUs = [
  {
    icon: Sparkles,
    title: 'Desain Premium dan Elegan',
    description: 'Setiap detail dirancang dengan keahlian tinggi untuk menciptakan suasana mewah dan romantis yang tak terlupakan.',
  },
  {
    icon: Users,
    title: 'Tim Profesional',
    description: 'Tim berpengalaman yang berdedikasi untuk mewujudkan visi pernikahan impian Anda dengan sempurna.',
  },
  {
    icon: Award,
    title: 'Material Berkualitas',
    description: 'Kami hanya menggunakan bunga segar pilihan dan properti premium untuk memastikan kualitas terbaik.',
  },
  {
    icon: DollarSign,
    title: 'Harga Transparan',
    description: 'Tidak ada biaya tersembunyi. Dapatkan estimasi harga yang jelas dan sesuai dengan budget Anda.',
  },
];

const orderSteps = [
  { number: '01', title: 'Konsultasi',       description: 'Diskusi awal untuk memahami visi dan kebutuhan Anda' },
  { number: '02', title: 'Pemilihan Konsep', description: 'Pilih tema dan gaya dekorasi yang sesuai' },
  { number: '03', title: 'Desain',           description: 'Tim kami merancang layout detail untuk approval' },
  { number: '04', title: 'Eksekusi',         description: 'Instalasi dan setup di hari H dengan sempurna' },
  { number: '05', title: 'Evaluasi',         description: 'Kami memastikan semuanya berjalan lancar' },
];

// ── Main Component ────────────────────────────────────────────────────────────
export function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentPortfolio, setCurrentPortfolio] = useState(0);

  const {
    featuredProjects,
    testimonials,
    isLoadingProjects,
    isLoadingTestimonials,
    getHeroImage,
    formatPrice,
  } = useHome();

  const visibleCount = 3;
  const maxPortfolio = Math.max(0, featuredProjects.length - visibleCount);
  const activeTestimonial: Testimonial | undefined = testimonials[currentTestimonial];

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[75vh] flex items-center bg-white overflow-hidden pt-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute top-20 left-0 w-96 h-96 opacity-[0.07]" viewBox="0 0 400 400">
            <path d="M50,200 Q150,100 250,150 T450,200" fill="none" stroke="#A8DADC" strokeWidth="60" strokeLinecap="round" />
          </svg>
          <svg className="absolute top-40 left-20 w-80 h-80 opacity-[0.05]" viewBox="0 0 400 400">
            <path d="M0,250 Q100,200 200,220 T400,250" fill="none" stroke="#457B9D" strokeWidth="50" strokeLinecap="round" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge variant="outline" className="text-[#457B9D] border-[#A8DADC] px-4 py-1 rounded-full text-xs tracking-widest uppercase">
                  wedding decoration vendor
                </Badge>
                <h1 className="leading-tight !text-[#1D3557] !text-5xl !font-serif !font-semibold">
                  Every love story deserves a beautiful wedding decoration
                </h1>
                <p className="text-[#6B7280] text-xl leading-relaxed max-w-xl">
                  Kami percaya setiap kisah cinta layak dirayakan dengan keindahan yang berkelas. Melalui sentuhan desain yang elegan dan detail yang presisi, kami wujudkan momen yang abadi dalam setiap sudutnya.
                </p>
              </div>
              <Button
                asChild
                size="lg"
                className="rounded-full px-10 py-6 text-lg bg-gradient-to-r from-[#457B9D] to-[#1D3557] hover:shadow-2xl hover:scale-105 transition-all duration-500 group !text-white"
              >
                <Link to="/projects" className="inline-flex items-center gap-3">
                  Book Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <div className="flex items-center gap-12 pt-8">
                <div>
                  <p className="text-4xl text-[#1D3557] font-semibold mb-1">200+</p>
                  <p className="text-[#6B7280] text-sm">Projects Done</p>
                </div>
                <Separator orientation="vertical" className="h-16 bg-[#A8DADC]" />
                <div>
                  <p className="text-4xl text-[#1D3557] font-semibold mb-1">100+</p>
                  <p className="text-[#6B7280] text-sm">Happy Clients</p>
                </div>
                <Separator orientation="vertical" className="h-16 bg-[#A8DADC]" />
                <div>
                  <p className="text-4xl text-[#1D3557] font-semibold mb-1">5★</p>
                  <p className="text-[#6B7280] text-sm">Rating</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl hover:-translate-y-2 transition-transform duration-500">
                <img
                  src={hero1}
                  alt="Romantic Wedding Decoration"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-[#A8DADC] rounded-tl-3xl" />
                <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-[#457B9D] rounded-br-3xl" />
              </div>
              <Card className="absolute -bottom-6 -right-6 shadow-2xl border border-[#A8DADC]/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 bg-gradient-to-br from-[#A8DADC] to-[#457B9D]">
                      <AvatarFallback className="bg-gradient-to-br from-[#A8DADC] to-[#457B9D]">
                        <Heart className="w-6 h-6 text-white fill-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[#1D3557] font-medium text-sm">Make Your Love</p>
                      <p className="text-[#6B7280] text-xs">With Us</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative animate-[fadeInLeft_1s_ease-out]">
              <div className="relative border-2 border-[#A8DADC] rounded-3xl p-8 bg-gradient-to-br from-[#F8F9FA] to-white">
                <div className="relative w-full h-72 rounded-2xl overflow-hidden shadow-xl z-10 transform hover:scale-105 transition-transform duration-500">
                  <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-xl">
                    <ImageWithFallback
                      src= {Gedung}
                      alt="Wedding Decoration"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-[#A8DADC] to-[#457B9D] rounded-full opacity-20 animate-pulse" />
              </div>
            </div>

            {/* Right Side - Text Content */}
            <div className="space-y-6 animate-[fadeInRight_1s_ease-out]">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#A8DADC]/10 rounded-full border border-[#A8DADC]/30">
                <Sparkles className="w-4 h-4 text-[#457B9D]" />
                <span className="text-[#457B9D] text-sm tracking-wide">PREMIUM COLLECTION</span>
              </div>

              <h2 className="leading-tight">
                MABA DEKORASI
              </h2>

              <p className="text-[#6B7280] text-lg leading-relaxed">
                Koleksi karya terbaik kami yang telah dipercaya oleh ratusan pasangan untuk mewujudkan momen istimewa mereka. Setiap detail dikerjakan dengan presisi tinggi dan sentuhan artistik yang memukau.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#A8DADC] to-[#457B9D] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-[#1D3557] mb-1">Kualitas Premium</h4>
                    <p className="text-[#6B7280] text-sm">Material terbaik dan bunga pilihan untuk hasil yang sempurna</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#A8DADC] to-[#457B9D] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-[#1D3557] mb-1">Desain Unik</h4>
                    <p className="text-[#6B7280] text-sm">Setiap konsep dirancang khusus sesuai tema dan kepribadian Anda</p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 text-[#457B9D] hover:text-[#1D3557] transition-colors group"
                >
                  <span className="text-lg">Lihat Semua Karya</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-[#F8F9FA] to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="text-[#457B9D] border-[#A8DADC] px-4 py-1 rounded-full text-xs tracking-widest uppercase">
              Keunggulan Kami
            </Badge>
            <h2 className="text-3xl font-semibold text-[#1D3557]">Kenapa Memilih Kami</h2>
            <p className="text-[#6B7280] max-w-2xl mx-auto">Kepercayaan Anda adalah prioritas kami.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card
                  key={index}
                  className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-[#A8DADC]/20 hover:border-[#457B9D]"
                >
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#A8DADC] to-[#457B9D] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-[#1D3557] font-semibold mb-3">{item.title}</h4>
                    <p className="text-[#6B7280] text-sm leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="text-[#457B9D] border-[#A8DADC] px-4 py-1 rounded-full text-xs tracking-widest uppercase">
              Portfolio Terpilih
            </Badge>
            <h2 className="text-3xl font-semibold text-[#1D3557]">Portofolio Terpilih Kami</h2>
            <p className="text-[#6B7280] max-w-2xl mx-auto">Koleksi karya terbaik yang telah kami ciptakan</p>
          </div>

          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPortfolio(p => Math.max(0, p - 1))}
              disabled={currentPortfolio === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-14 h-14 rounded-full shadow-2xl hover:bg-[#A8DADC] hover:text-white transition-all duration-300 disabled:opacity-40 group"
            >
              <ChevronLeft className="w-6 h-6 text-[#1D3557] group-hover:text-white" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPortfolio(p => Math.min(maxPortfolio, p + 1))}
              disabled={currentPortfolio >= maxPortfolio}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-14 h-14 rounded-full shadow-2xl hover:bg-[#A8DADC] hover:text-white transition-all duration-300 disabled:opacity-40 group"
            >
              <ChevronRight className="w-6 h-6 text-[#1D3557] group-hover:text-white" />
            </Button>

            <div className="overflow-hidden">
              {isLoadingProjects ? (
                <div className="flex">
                  {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : featuredProjects.length === 0 ? (
                <p className="text-center text-[#6B7280] py-20">Belum ada project unggulan</p>
              ) : (
                <div
                  className="flex transition-transform duration-700 ease-out"
                  style={{ transform: `translateX(-${currentPortfolio * (100 / visibleCount)}%)` }}
                >
                  {featuredProjects.map((project) => (
                    <div key={project.id} className="w-1/3 flex-shrink-0 px-4">
                      <Link to={`/projects/${project.id}`}>
                        <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-[#A8DADC]">
                          <div className="aspect-[4/5] overflow-hidden relative">
                            <img
                              src={getHeroImage(project)}
                              alt={project.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            {project.category && (
                              <Badge className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-[#1D3557] text-xs border-none">
                                {project.category.name}
                              </Badge>
                            )}
                          </div>
                          <CardContent className="p-6 space-y-3">
                            <h4 className="text-xl font-semibold text-[#1D3557] group-hover:text-[#457B9D] transition-colors">
                              {project.title}
                            </h4>
                            {project.theme && (
                              <p className="text-[#6B7280] text-sm">{project.theme}</p>
                            )}
                            <Separator className="border-[#E5E7EB]" />
                            <div className="flex items-center justify-between pt-1">
                              <p className="text-[#457B9D] font-medium">{project.price != null ? formatPrice(project.price) : '-'}</p>
                              <ArrowRight className="w-5 h-5 text-[#457B9D] group-hover:translate-x-2 transition-transform" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {featuredProjects.length > visibleCount && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: maxPortfolio + 1 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPortfolio(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentPortfolio
                        ? 'w-12 bg-gradient-to-r from-[#A8DADC] to-[#457B9D]'
                        : 'w-2 bg-[#A8DADC]/30 hover:bg-[#A8DADC]/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="text-center mt-10">
            <Button variant="link" asChild className="text-[#457B9D] hover:text-[#1D3557] text-lg group p-0">
              <Link to="/projects" className="inline-flex items-center gap-2">
                Lihat Semua Karya
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-[#1D3557] to-[#0F1F35] text-white relative overflow-hidden">
        {/* ambient blobs */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#A8DADC] rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#457B9D] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 space-y-4 animate-[fadeInUp_1s_ease-out]">
            <span className="!text-[#A8DADC] tracking-widest text-sm uppercase">Testimoni</span>
            <h2 className="!text-white">Apa Kata Mereka</h2>
            <p className="!text-[#A8DADC]">
              Kepuasan klien adalah kebahagiaan kami
            </p>
          </div>

          {isLoadingTestimonials ? (
            <SkeletonTestimonial />
          ) : testimonials.length === 0 ? (
            <p className="text-center !text-[#A8DADC]">Belum ada testimoni</p>
          ) : (
            <div className="relative">
              <Card className="bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-colors duration-500 rounded-3xl">
                <CardContent className="p-12">
                  <Quote className="w-12 h-12 text-[#A8DADC] mb-6 animate-pulse" />
                  <p className="!text-white text-xl mb-8 leading-relaxed italic">
                    "{activeTestimonial?.review_text}"
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="!text-white font-semibold text-lg">
                        {activeTestimonial?.customer_name}
                      </h4>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: activeTestimonial?.rating ?? 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentTestimonial(p => Math.max(0, p - 1))}
                        className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full text-white hover:text-white hover:scale-110 transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentTestimonial(p => Math.min(testimonials.length - 1, p + 1))}
                        className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full text-white hover:text-white hover:scale-110 transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Dots */}
                  <div className="flex justify-center gap-2 mt-8">
                    {testimonials.map((_: unknown, i: number) => (
                      <button
                        key={i}
                        onClick={() => setCurrentTestimonial(i)}
                        className={`h-2 rounded-full transition-all ${
                          i === currentTestimonial ? 'w-8 bg-[#A8DADC]' : 'w-2 bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* ── Order Steps ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="text-[#457B9D] border-[#A8DADC] px-4 py-1 rounded-full text-xs tracking-widest uppercase">
              Proses Kerja
            </Badge>
            <h2 className="text-3xl font-semibold text-[#1D3557]">Langkah Pemesanan</h2>
            <p className="text-[#6B7280] max-w-2xl mx-auto">Proses yang mudah dan transparan</p>
          </div>

          <div className="relative">
            {/* Horizontal line (desktop only) */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#A8DADC] via-[#457B9D] to-[#1D3557] -translate-y-1/2 rounded-full" />

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {orderSteps.map((step, index) => (
                <Card
                  key={index}
                  className="group relative z-10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 border-[#A8DADC]/20 hover:border-[#457B9D]"
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#A8DADC] to-[#457B9D] rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                      <span className="text-white font-bold text-xl">{step.number}</span>
                    </div>
                    <h4 className="text-[#1D3557] font-semibold mb-2 text-lg">{step.title}</h4>
                    <p className="text-[#6B7280] text-sm leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-[#F8F9FA] to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="floral" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="2" fill="#1D3557" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#floral)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Poetic Section */}
          <div className="text-center mb-20 space-y-6 max-w-3xl mx-auto animate-[fadeInUp_1s_ease-out]">
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto animate-[shimmer_2s_ease-in-out_infinite]" />
            <h2 className="font-['Playfair_Display'] italic" style={{ fontSize: '2.5rem' }}>
              "Where Love Blooms, Memories Last Forever"
            </h2>
            <p className="text-[#6B7280] text-lg leading-relaxed">
              Setiap kelopak bunga, setiap lipatan kain, setiap cahaya yang kami pilih—semuanya adalah bagian dari cerita cinta yang akan Anda kenang selamanya. Biarkan kami mengubah ruang menjadi surga kecil untuk momen terindah Anda.
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto animate-[shimmer_2s_ease-in-out_infinite]" />
          </div>

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="col-span-2 row-span-2 animate-[fadeInUp_1s_ease-out]">
              <div className="relative h-full rounded-2xl overflow-hidden shadow-xl group">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1706741921974-967b3590743c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwYmFja2Ryb3AlMjBmbG93ZXJzfGVufDF8fHx8MTc2NDg0MTkwOHww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Wedding Backdrop"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1D3557]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
            
            <div className="aspect-square rounded-2xl overflow-hidden shadow-xl group animate-[fadeInUp_1s_ease-out_0.1s_both]">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1676853963956-0309922ebca1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwdGFibGUlMjBjZW50ZXJwaWVjZXxlbnwxfHx8fDE3NjQ4MTgxNDZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Table Centerpiece"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            
            <div className="aspect-square rounded-2xl overflow-hidden shadow-xl group animate-[fadeInUp_1s_ease-out_0.2s_both]">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1700061955118-4c321eec3773?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHJvc2VzJTIwd2VkZGluZ3xlbnwxfHx8fDE3NjQ4NDE5MDl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="White Roses"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            
            <div className="aspect-square rounded-2xl overflow-hidden shadow-xl group animate-[fadeInUp_1s_ease-out_0.3s_both]">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1762926627960-18e533c63134?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwd2VsY29tZSUyMGdhdGV8ZW58MXx8fHwxNzY0ODQwNjczfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Welcome Gate"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            
            <div className="aspect-square rounded-2xl overflow-hidden shadow-xl group animate-[fadeInUp_1s_ease-out_0.4s_both]">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1611550898818-87c908160447?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY2FycGV0JTIwYWlzbGV8ZW58MXx8fHwxNzY0ODQxOTA5fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Wedding Aisle"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
          </div>

          {/* CTA */}
          <div className="text-center animate-[fadeInUp_1s_ease-out_0.5s_both]">
            <div className="inline-flex flex-col items-center gap-6 bg-white rounded-3xl p-10 shadow-2xl border border-[#A8DADC]/30 hover:shadow-3xl transition-shadow duration-500">
              <CheckCircle className="w-12 h-12 text-[#457B9D] animate-pulse" />
              <div>
                <h3 className="mb-2">Siap Mewujudkan Dekorasi Impian?</h3>
                <p className="!text-[#6B7280]">
                  Hubungi kami hari ini untuk konsultasi gratis
                </p>
              </div>
              <Link
                to="/projects"
                className="px-10 py-4 bg-gradient-to-r from-[#457B9D] to-[#1D3557] !text-white rounded-full hover:shadow-2xl transition-all hover:scale-105 group"
              >
                <span className="inline-flex items-center gap-2">
                  Mulai Konsultasi
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}