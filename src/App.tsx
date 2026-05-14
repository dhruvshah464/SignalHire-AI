import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import NewOutreach from '@/pages/NewOutreach';
import OutreachDetail from '@/pages/OutreachDetail';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<NewOutreach />} />
          <Route path="/outreach/:id" element={<OutreachDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppLayout>
      <Toaster position="top-right" closeButton richColors />
    </BrowserRouter>
  );
}
