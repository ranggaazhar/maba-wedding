import { Heart, Instagram, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

function Tiktok(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#1D3557] to-[#0F1F35] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-[#A8DADC] to-[#457B9D] p-2 rounded-full">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="font-['Playfair_Display']" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                Maba Dekorasi
              </span>
            </div>
            <p className="text-[#A8DADC] text-sm leading-relaxed">
              Every love story deserves a beautiful wedding decoration
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-white/10 hover:bg-[#A8DADC] rounded-full flex items-center justify-center transition-all hover:scale-110">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-white/10 hover:bg-[#A8DADC] rounded-full flex items-center justify-center transition-all hover:scale-110">
                <Tiktok className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="!text-white mb-4" style={{ fontSize: '1.125rem' }}>Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="!text-[#A8DADC] hover:text-white transition-colors">Beranda</Link></li>
              <li><Link to="/projects" className="!text-[#A8DADC] hover:text-white transition-colors">Our Projects</Link></li>
              <li><Link to="/properties" className="!text-[#A8DADC] hover:text-white transition-colors">Properties</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="!text-white mb-4" style={{ fontSize: '1.125rem' }}>Layanan</h4>
            <ul className="space-y-2 !text-[#A8DADC] text-sm">
              <li>Dekorasi Lamaran</li>
              <li>Dekorasi Wedding</li>
              <li>Welcome Gate</li>
              <li>Set Akad</li>
              <li>Lorong Bunga</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="!text-white mb-4" style={{ fontSize: '1.125rem' }}>Hubungi Kami</h4>
            <ul className="space-y-3 !text-[#A8DADC] text-sm">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>081215061622</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Kulon Progo, Yogyakarta</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-[#A8DADC] text-sm">
          <p>&copy; 2025 Maba Dekorasi. Every love story deserves a beautiful wedding decoration.</p>
        </div>
      </div>
    </footer>
  );
}
