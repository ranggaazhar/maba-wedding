// src/components/public/PublicLayout.tsx
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function PublicLayout() {
  return (
    <div className="customer-theme">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}