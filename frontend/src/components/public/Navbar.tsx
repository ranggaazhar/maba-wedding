import { Link, useLocation } from 'react-router-dom';
import LogoMaba from '../../assets/logomaba.svg';

export function Navbar() {
  const location = useLocation();
  
  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Our Projects', path: '/projects' },
    { name: 'Properties', path: '/properties' },
  ];
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-[#A8DADC] to-[#457B9D] rounded-full group-hover:scale-110 transition-transform">
              <img
                src={LogoMaba}
                alt="Logo Maba"
                className="h-12 w-12 object-contain brightness-0 invert"
              />
            </div>
            <span className="font-['Playfair_Display'] text-[#1D3557]" style={{ fontSize: '1.3rem', fontWeight: 600 }}>
              Maba Dekorasi
            </span>
          </Link>
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative transition-colors ${
                  isActive(link.path) 
                    ? 'text-[#1D3557]' 
                    : 'text-[#6B7280] hover:text-[#457B9D]'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#A8DADC] to-[#457B9D] rounded-full" />
                )}
              </Link>
            ))}
            <Link
              to="/projects"
              className="px-6 py-2.5 bg-gradient-to-r from-[#457B9D] to-[#1D3557] !text-white rounded-full hover:shadow-lg transition-all hover:scale-105"
            >
              Konsultasi
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
