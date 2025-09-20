'use client';

import { TopBar } from '@/components/navigation/TopBar';
import { AdminTopBarLinks } from '@/components/navigation/AdminTopBarLinks';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen">
      <TopBar navigationLinks={<AdminTopBarLinks />} />
      {children}
    </section>
  );
}