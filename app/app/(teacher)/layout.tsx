'use client';

import { TopBar } from '@/components/navigation/TopBar';
import { TeacherTopBarLinks } from '@/components/navigation/TeacherTopBarLinks';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen">
      <TopBar navigationLinks={<TeacherTopBarLinks />} />
      {children}
    </section>
  );
}