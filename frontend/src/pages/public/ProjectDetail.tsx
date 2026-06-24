// src/pages/public/ProjectDetail.tsx
import { useParams, Link } from 'react-router-dom';
import { ImageWithFallback } from '@/components/fallbackimage/ImageWithFallback';
import { ArrowLeft, Palette, Sparkles, DollarSign } from 'lucide-react';
import { useProjectDetail } from '@/hooks/Customer/useProjectDetail';

function Skeleton() {
  return (
    <div className="min-h-screen pt-20 animate-pulse">
      <div className="h-[60vh] bg-gray-200" />
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-6xl">🌸</p>
        <h2 className="text-[#1D3557]">Proyek tidak ditemukan</h2>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-[#457B9D] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Projects
        </Link>
      </div>
    </div>
  );
}

export function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const {
    project,
    isLoading,
    notFound,
    heroPhoto,
    otherPhotos,
    formatPrice,
  } = useProjectDetail(slug);

  if (isLoading) return <Skeleton />;
  if (notFound || !project) return <NotFound />;

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Image */}
      <section className="relative h-[60vh] overflow-hidden">
        <ImageWithFallback
          src={heroPhoto?.url ?? '/placeholder.png'}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1D3557]/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            {project.category ? (
              <span className="inline-block px-4 py-2 bg-[#A8DADC] text-[#1D3557] rounded-full text-sm mb-4">
                {project.category.name}
              </span>
            ) : null}
            <h1 className="!text-white mb-4">{project.title}</h1>
            <div className="flex flex-wrap gap-6 text-[#A8DADC]">
              {project.theme ? (
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  <span>{project.theme}</span>
                </div>
              ) : null}
              {project.price ? (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-white">{formatPrice(project.price)}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Tentang Proyek — hanya description saja, tanpa atmosphere */}
      {project.description ? (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl space-y-6">
              <h2 className="mb-4">Tentang Proyek</h2>
              <p className="text-[#6B7280] text-lg leading-relaxed">
                {project.description}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* Photos — alternating layout */}
      {otherPhotos.length > 0 ? (
        <>
          {otherPhotos[0] ? (
            <section className="py-16 bg-[#F8F9FA]">
              <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="order-2 md:order-1 rounded-2xl overflow-hidden shadow-2xl">
                    <ImageWithFallback
                      src={otherPhotos[0].url}
                      alt={otherPhotos[0].caption ?? project.title}
                      className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="order-1 md:order-2 space-y-6">
                    <div className="inline-block p-3 bg-gradient-to-br from-[#A8DADC] to-[#457B9D] rounded-2xl shadow-lg">
                      <Palette className="w-8 h-8 text-white" />
                    </div>
                    <h3>Detail Image 1</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {otherPhotos[0].caption}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {/* Photo 2 — right image, left text */}
          {otherPhotos[1] ? (
            <section className="py-16 bg-white">
              <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <div className="inline-block p-3 bg-gradient-to-br from-[#457B9D] to-[#1D3557] rounded-2xl shadow-lg">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h3>Detail Image 2</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {otherPhotos[1].caption}
                    </p>
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-2xl">
                    <ImageWithFallback
                      src={otherPhotos[1].url}
                      alt={otherPhotos[1].caption ?? project.title}
                      className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {otherPhotos.length > 3 ? (
            <section className="py-16 bg-white">
              <div className="max-w-7xl mx-auto px-6">
                <h3 className="mb-8 text-center">Galeri Foto</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {otherPhotos.slice(3).map((photo, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden shadow-lg group">
                      <ImageWithFallback
                        src={photo.url}
                        alt={photo.caption ?? project.title}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}
        </>
      ) : null}

      {/* Photo 3 — full width pakai heroPhoto + atmosphere card, di luar block otherPhotos */}
      {heroPhoto ? (
        <section className="py-16 bg-[#F8F9FA]">
          <div className="max-w-7xl mx-auto px-6 space-y-12">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src={heroPhoto.url}
                alt={project.title}
                className="w-full h-[350px] sm:h-[450px] md:h-[600px] object-cover hover:scale-105 transition-transform duration-1000"
              />
            </div>
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h3>Sentuhan Akhir yang Sempurna</h3>
              {project.atmosphere_description ? (
                <div className="bg-white rounded-3xl p-10 shadow-xl space-y-6">
                  <h4 className="text-[#1D3557]">Suasana &amp; Kesan</h4>
                  <p className="text-[#6B7280] leading-relaxed">
                    {project.atmosphere_description}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* Package Includes */}
      {project.includes && project.includes.length > 0 ? (
        <section className="py-16 bg-[#F8F9FA]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12 space-y-4">
                <h2>Yang Termasuk dalam Konsep Ini</h2>
                <p className="text-[#6B7280]">
                  Paket lengkap untuk mewujudkan dekorasi impian Anda
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {project.includes.map((inc, idx) => (
                  <div
                    key={inc.id ?? idx}
                    className="flex items-start gap-4 p-6 bg-gradient-to-br from-[#F8F9FA] to-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-[#A8DADC]/20"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-[#A8DADC] to-[#457B9D] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">{idx + 1}</span>
                    </div>
                    <p className="text-[#2B2B2B]">{inc.item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#1D3557] to-[#0F1F35] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="!text-white">Tertarik dengan Konsep Ini?</h2>
          <p className="!text-[#A8DADC] text-lg max-w-2xl mx-auto">
            Konsultasikan kebutuhan Anda dengan tim kami. Kami siap menyesuaikan desain sesuai budget dan preferensi Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/projects"
              className="px-10 py-4 bg-gradient-to-r from-[#A8DADC] to-[#457B9D] text-[#1D3557] rounded-full hover:shadow-2xl transition-all hover:scale-105"
            >
              Lihat Proyek Lainnya
            </Link>
            <a
              href="#contact"
              className="px-10 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-full hover:bg-white/20 transition-all"
            >
              Hubungi Kami
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}