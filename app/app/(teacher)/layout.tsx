'use client';

import { TeacherTopBarLinks } from '@/components/navigation/TeacherTopBarLinks';
import { TopBar } from '@/components/navigation/TopBar';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col min-h-screen">
      <TopBar navigationLinks={<TeacherTopBarLinks />} />
      {children}
    </section>
  );
}
