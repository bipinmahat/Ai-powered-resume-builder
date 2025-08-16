'use client';

import { useEffect, useRef, useState } from 'react';
import ResumePreview from '@/components/ResumePreview';
import { useResume } from '@/store/resume';

function toHtml(md: string) {
  const lines = md.split("\n");
  let html = "";
  let inList = false;

  for (const line of lines) {
    if (/^\s*[-*+]\s+/.test(line)) {
      if (!inList) {
        html += `<ul class="list-disc pl-5 space-y-1">`;
        inList = true;
      }
      html += `<li>${line.replace(/^\s*[-*+]\s+/, "")}</li>`;
    } else {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<p>${line}</p>`;
    }
  }

  if (inList) html += "</ul>";
  return html;
}

export default function Page() {
  const { name, email, phone, role, location, sections, set } = useResume();

  // ===== Theme (dark / light) =====
  const themeKey = 'resume_theme_v1';
  useEffect(() => {
    const saved = localStorage.getItem(themeKey);
    const initial =
      saved ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem(themeKey, isDark ? 'dark' : 'light');
  };

  // ===== Font sizing =====
  const baseFontKey = 'resume_font_size';
  useEffect(() => {
    const saved = parseInt(localStorage.getItem(baseFontKey) || '16', 10);
    document.documentElement.style.fontSize = `${saved}px`;
  }, []);
  const changeFont = (delta: number) => {
    const cur = parseInt(getComputedStyle(document.documentElement).fontSize, 10);
    const next = Math.min(20, Math.max(12, cur + delta));
    document.documentElement.style.fontSize = `${next}px`;
    localStorage.setItem(baseFontKey, String(next));
  };

  // ===== Dialog (Job Description) =====
  const jdRef = useRef<HTMLDialogElement>(null);

  // ===== Helpers =====
  const collectData = () => ({
    name,
    title: role,
    email,
    phone,
    location,
    summary: sections.summary,
    skills: sections.skills,
    experience: sections.experience,
    education: sections.education,
  });

  const buildPlainText = () => {
    const d = collectData();
    return `${d.name}\n${d.title}\n${d.email} · ${d.phone} · ${d.location}\n
SUMMARY:\n${d.summary}\n
SKILLS:\n${d.skills}\n
EXPERIENCE:\n${d.experience}\n
EDUCATION:\n${d.education}`;
  };

  const download = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // ===== Render preview skills as chips (simple) =====
  const skillChips = (sections.skills || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // ===== Experience / Education HTML (markdown-lite) =====
  const expHTML = toHtml(sections.experience || '');
  const eduHTML = toHtml(sections.education || '');

  return (
    <div className="antialiased bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen">
      {/* Theme toggle */}
      <button
        aria-label="Toggle theme"
        onClick={toggleTheme}
        className="theme-toggle fixed top-4 right-4 z-50 p-2 rounded-md bg-white/60 dark:bg-slate-800/60 backdrop-blur border border-white/10 shadow-sm"
      >
        <span>🌓</span>
      </button>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/60 dark:bg-slate-800/60 border-b border-slate-200/20 dark:border-slate-700/30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold tracking-tight">AI Resume Builder</h1>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Frontend — interactive controls included.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(buildPlainText());
                  alert('Copied to clipboard');
                } catch {
                  download('resume.txt', buildPlainText());
                }
              }}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10"
            >
              📋 <span className="hidden sm:inline">Copy</span>
            </button>

            <button
              onClick={() =>
                download(
                  `resume-${(name || 'resume').replace(/\s+/g, '_')}.json`,
                  JSON.stringify(collectData(), null, 2)
                )
              }
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10"
            >
              ⬇️ <span className="hidden sm:inline">Export</span>
            </button>

            <label className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 cursor-pointer">
              ⬆️ <span className="hidden sm:inline">Import</span>
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    const txt = await f.text();
                    const obj = JSON.parse(txt);
                    set({
                      name: obj.name ?? '',
                      email: obj.email ?? '',
                      phone: obj.phone ?? '',
                      role: obj.title ?? obj.role ?? '',
                      location: obj.location ?? '',
                      sections: {
                        summary: obj.summary ?? '',
                        skills: obj.skills ?? '',
                        experience: obj.experience ?? '',
                        education: obj.education ?? '',
                        projects: obj.projects ?? '',
                      },
                    });
                  } catch {
                    alert('Import failed');
                  } finally {
                    e.currentTarget.value = '';
                  }
                }}
              />
            </label>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Form */}
        <section className="card bg-white/90 dark:bg-slate-800/60 border border-slate-200/30 dark:border-slate-700/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Details</h2>
            <button
              onClick={() => {
                if (!confirm('Clear all fields?')) return;
                set({
                  name: '',
                  email: '',
                  phone: '',
                  role: '',
                  location: '',
                  sections: { summary: '', skills: '', experience: '', education: '', projects: '' },
                });
              }}
              className="px-3 py-2 rounded-lg bg-red-600 text-white"
            >
              Clear
            </button>
          </div>

          <form
            className="grid grid-cols-1 gap-4"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm">Full Name</span>
                <input
                  className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/30 p-2.5 text-gray-800"
                  placeholder="Alex Johnson"
                  value={name}
                  onChange={(e) => set({ name: e.target.value })}
                />
              </label>

              <label className="block">
                <span className="text-sm">Title</span>
                <input
                  className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/30 p-2.5 text-gray-800"
                  placeholder="Frontend Developer"
                  value={role}
                  onChange={(e) => set({ role: e.target.value })}
                />
              </label>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <label className="block">
                <span className="text-sm">Email</span>
                <input
                  type="email"
                  className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/30 p-2.5 text-gray-800"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => set({ email: e.target.value })}
                />
              </label>

              <label className="block">
                <span className="text-sm">Phone</span>
                <input
                  className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/30 p-2.5 text-gray-800"
                  placeholder="(+1) 555-123-4567"
                  value={phone}
                  onChange={(e) => set({ phone: e.target.value })}
                />
              </label>

              <label className="block">
                <span className="text-sm">Location</span>
                <input
                  className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/30 p-2.5 text-gray-800"
                  placeholder="Toronto, ON"
                  value={location}
                  onChange={(e) => set({ location: e.target.value })}
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm">Summary</span>
              <textarea
                rows={4}
                className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/30 p-2.5 text-gray-800"
                placeholder="2–3 lines highlighting impact, stack, and achievements."
                value={sections.summary}
                onChange={(e) => set({ sections: { ...sections, summary: e.target.value } })}
              />
            </label>

            <label className="block">
              <span className="text-sm">Skills (comma separated)</span>
              <input
                className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/30 p-2.5 text-gray-800"
                placeholder="React, Tailwind, TypeScript, Node.js"
                value={sections.skills}
                onChange={(e) => set({ sections: { ...sections, skills: e.target.value } })}
              />
            </label>

            <label className="block">
              <span className="text-sm">Experience (markdown bullets supported)</span>
              <textarea
                rows={6}
                className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/30 p-2.5 text-gray-800"
                placeholder={'Company — Role (YYYY–YYYY)\n• Bullet with metric\n• Bullet with tech'}
                value={sections.experience}
                onChange={(e) => set({ sections: { ...sections, experience: e.target.value } })}
              />
            </label>

            <label className="block">
              <span className="text-sm">Education</span>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/30 p-2.5 text-gray-800"
                placeholder="School — Program (YYYY–YYYY)"
                value={sections.education}
                onChange={(e) => set({ sections: { ...sections, education: e.target.value } })}
              />
            </label>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
              {/* AI buttons stubbed (hook up to your API later) */}
              <button
                type="button"
                onClick={() => alert('Hook this to your AI summary endpoint')}
                className="px-3 py-2 rounded-lg bg-emerald-500 text-white"
              >
                AI: Improve Summary
              </button>
              <button
                type="button"
                onClick={() => alert('Hook this to your AI bullets endpoint')}
                className="px-3 py-2 rounded-lg bg-indigo-600 text-white"
              >
                AI: Generate Bullets
              </button>
              <button
                type="button"
                onClick={() => jdRef.current?.showModal()}
                className="px-3 py-2 rounded-lg bg-fuchsia-600 text-white"
              >
                AI: From Job Description
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                onClick={() => document.getElementById('previewCard')?.classList.toggle('compact')}
                className="px-3 py-2 rounded-lg bg-white/10"
              >
                Toggle Compact
              </button>
              <button
                type="button"
                onClick={() => changeFont(+1)}
                className="px-3 py-2 rounded-lg bg-white/10"
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => changeFont(-1)}
                className="px-3 py-2 rounded-lg bg-white/10"
              >
                A-
              </button>
              <button type="button" onClick={() => window.print()} className="px-3 py-2 rounded-lg bg-indigo-500 text-white">
                Print / Download
              </button>
            </div>
          </form>

          {/* Job description dialog */}
          <dialog
            ref={jdRef}
            className="rounded-2xl p-0 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-[min(760px,96vw)]"
          >
            <div className="p-4 border-b border-slate-200/8 dark:border-slate-700/20 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Paste Job Description</h3>
              <button className="px-3 py-2 rounded-lg bg-white/10" onClick={() => jdRef.current?.close()}>
                Close
              </button>
            </div>
            <div className="p-4">
              <textarea
                id="jobDescription"
                className="w-full h-48 rounded-lg bg-slate-50 dark:bg-slate-900/40 p-3 border text-gray-800"
                placeholder="Paste the JD here…"
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  className="px-4 py-2 rounded-lg bg-fuchsia-600 text-white"
                  onClick={() => {
                    alert('Hook this to your AI “tailor to JD” endpoint');
                    jdRef.current?.close();
                  }}
                >
                  Generate Tailored Resume
                </button>
              </div>
            </div>
          </dialog>
        </section>

        {/* RIGHT: Preview */}
        <section
          id="previewCard"
          className="bg-white dark:bg-slate-800/60 border border-slate-200/30 dark:border-slate-700/20 rounded-2xl shadow p-6"
        >
          {/* Top area mirrors your white-card design */}
          <div className="space-y-4">
            <header>
              <h1 className="text-2xl font-bold">{name || 'Your Name'}</h1>
              <p className="text-slate-500 dark:text-slate-300">{role || 'Title'}</p>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                {(email || 'email@example.com')} · {(phone || '(000) 000-0000')} ·{' '}
                {(location || 'City, Country')}
              </p>
            </header>

            <section>
              <h3 className="text-lg font-semibold">Summary</h3>
              <p className="text-slate-700 dark:text-slate-200">{sections.summary || 'Brief professional summary will appear here.'}</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Skills</h3>
              {skillChips.length ? (
                <ul className="flex flex-wrap gap-2">
                  {skillChips.map((s) => (
                    <li
                      key={s}
                      className="rounded-full px-3 py-1 text-sm bg-slate-100/60 dark:bg-slate-700/40 border border-slate-200/30"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-700 dark:text-slate-200">React, Tailwind, TypeScript</p>
              )}
            </section>

            <section>
              <h3 className="text-lg font-semibold">Experience</h3>
              <div
                className="space-y-2 text-slate-700 dark:text-slate-200"
                dangerouslySetInnerHTML={{ __html: expHTML }}
              />
            </section>

            <section>
              <h3 className="text-lg font-semibold">Education</h3>
              <div
                className="space-y-1 text-slate-700 dark:text-slate-200"
                dangerouslySetInnerHTML={{ __html: eduHTML }}
              />
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
