'use client';

import { useResume } from '@/store/resume';
import { useState } from 'react';

export default function ResumeForm() {
  const { name, email, phone, role, sections, set } = useResume();
  const [loading, setLoading] = useState(false);

  async function handleAI(kind: 'summary'|'rewrite'|'tailor') {
    setLoading(true);
    try {
      // TODO: call your server route later, for now just stub:
      if (kind === 'summary') {
        set({ sections: { ...sections, summary: `Results-driven ${role || 'developer'} with experience in full-stack apps and AI-assisted tooling.` }});
      }
      // Add rewrite/tailor later
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-5">
      <div>
        <label className="label">Full name</label>
        <input className="input" value={name} onChange={e=>set({name:e.target.value})}/>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={e=>set({email:e.target.value})}/>
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={phone} onChange={e=>set({phone:e.target.value})}/>
        </div>
      </div>
      <div>
        <label className="label">Target role</label>
        <input className="input" placeholder="e.g., Frontend Engineer" value={role} onChange={e=>set({role:e.target.value})}/>
      </div>

      <div>
        <label className="label">Summary</label>
        <textarea className="input h-28" value={sections.summary}
          onChange={e=>set({ sections: { ...sections, summary: e.target.value }})}/>
        <div className="mt-2 flex gap-2">
          <button type="button" className="btn" disabled={loading} onClick={()=>handleAI('summary')}>AI: Generate summary</button>
        </div>
      </div>

      <div>
        <label className="label">Skills (comma separated)</label>
        <input className="input" value={sections.skills}
          onChange={e=>set({ sections: { ...sections, skills: e.target.value }})}/>
      </div>

      <div>
        <label className="label">Experience</label>
        <textarea className="input h-40" value={sections.experience}
          onChange={e=>set({ sections: { ...sections, experience: e.target.value }})}/>
      </div>

      <div>
        <label className="label">Education</label>
        <textarea className="input h-24" value={sections.education}
          onChange={e=>set({ sections: { ...sections, education: e.target.value }})}/>
      </div>

      <div>
        <label className="label">Projects</label>
        <textarea className="input h-24" value={sections.projects}
          onChange={e=>set({ sections: { ...sections, projects: e.target.value }})}/>
      </div>
    </form>
  );
}
