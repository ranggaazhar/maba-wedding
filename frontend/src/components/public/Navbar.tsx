import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import LogoMaba from '../../assets/logomaba.svg';

export function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Our Projects', path: '/projects' },
    { name: 'Properties', path: '/properties' },
  ];
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-[#A8DADC] to-[#457B9D] rounded-full group-hover:scale-110 transition-transform">
              <img
                src={LogoMaba}
                alt="Logo Maba"
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain brightness-0 invert"
              />
            </div>
            <span className="font-['Playfair_Display'] text-[#1D3557]" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              Maba Dekorasi
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
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
            <a
              href="https://wa.me/6281215061622?text=Halo%20Maba%20Dekorasi%2C%20saya%20ingin%20berkonsultasi%20mengenai%20dekorasi%20pernikahan."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-gradient-to-r from-[#457B9D] to-[#1D3557] !text-white rounded-full hover:shadow-lg transition-all hover:scale-105"
            >
              Konsultasi
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-[#1D3557] hover:bg-[#A8DADC]/10 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-white shadow-lg py-4 px-6 space-y-4 animate-fade-in">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`text-base font-medium py-1 transition-colors ${
                  isActive(link.path)
                    ? 'text-[#1D3557]'
                    : 'text-[#6B7280] hover:text-[#457B9D]'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <a
              href="https://wa.me/6281215061622?text=Halo%20Maba%20Dekorasi%2C%20saya%20ingin%20berkonsultasi%20mengenai%20dekorasi%20pernikahan."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="w-full text-center px-6 py-2.5 bg-gradient-to-r from-[#457B9D] to-[#1D3557] !text-white rounded-full hover:shadow-lg transition-all"
            >
              Konsultasi
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
