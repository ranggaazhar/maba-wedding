// src/pages/Index.tsx
import { AdminLayout } from '../components/admin/AdminLayout';
import Dashboard from './Dashboard';

const Index = () => {
  return (
    <AdminLayout>
      <Dashboard />
    </AdminLayout>
  );
};

export default Index;