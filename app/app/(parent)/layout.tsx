'use client';

import { ParentTopBarLinks } from '@/components/navigation/ParentTopBarLinks';
import { TopBar } from '@/components/navigation/TopBar';

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col min-h-screen">
      <TopBar navigationLinks={<ParentTopBarLinks />} />
      {children}
    </section>
  );
}
