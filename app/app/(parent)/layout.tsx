'use client';

import { TopBar } from '@/components/navigation/TopBar';
import { ParentTopBarLinks } from '@/components/navigation/ParentTopBarLinks';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen">
      <TopBar navigationLinks={<ParentTopBarLinks />} />
      {children}
    </section>
  );
}