'use client';

import { useResume } from '@/store/resume';

export default function ResumePreview() {
  const { name, email, phone, role, location, sections } = useResume();

  return (
    <div className="preview">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold">{name || 'Your Name'}</h1>
        <p className="text-slate-600">{role || 'Title'}</p>
        <p className="text-sm muted">
          {(email || 'email@example.com')} · {(phone || '(000) 000-0000')} · {(location || 'City, Country')}
        </p>
      </header>

      <section className="mt-4">
        <h3 className="text-lg font-semibold">Summary</h3>
        <p className="text-slate-700">
          {sections.summary || 'Brief professional summary will appear here.'}
        </p>
      </section>

      <section className="mt-4">
        <h3 className="text-lg font-semibold">Skills</h3>
        <p className="text-slate-700">
          {sections.skills || 'React, Tailwind, TypeScript'}
        </p>
      </section>

      <section className="mt-4">
        <h3 className="text-lg font-semibold">Experience</h3>
        <div className="space-y-2 text-slate-700 whitespace-pre-wrap">
          {sections.experience || 'Company — Role (YYYY–YYYY)\n• Bullet with metric\n• Bullet with tech'}
        </div>
      </section>

      <section className="mt-4">
        <h3 className="text-lg font-semibold">Education</h3>
        <div className="space-y-1 text-slate-700 whitespace-pre-wrap">
          {sections.education || 'School — Program (YYYY–YYYY)'}
        </div>
      </section>
    </div>
  );
}
