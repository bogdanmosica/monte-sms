'use client';

import { AdminTopBarLinks } from '@/components/navigation/AdminTopBarLinks';
import { TopBar } from '@/components/navigation/TopBar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col min-h-screen">
      <TopBar navigationLinks={<AdminTopBarLinks />} />
      {children}
    </section>
  );
}
