import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { profileApi } from '../services/api.js';

export default function Profile() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState({ education: '', skills: '', projects: '', experience: '', targetRole: '', dreamCompany: '', resumeText: '' });
  const [saved, setSaved] = useState(false);
  useEffect(() => { profileApi.get().then((data) => setProfile((p) => ({ ...p, ...data }))).catch(() => {}); }, []);
  const set = (e) => setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));
  const save = async (e) => { e.preventDefault(); await profileApi.update(profile); setSaved(true); };
  return <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 py-8 md:py-12"><div className="max-w-3xl mx-auto px-4 sm:px-6">
    <div className="flex items-start justify-between gap-4 mb-8"><div><h1 className="text-2xl sm:text-3xl font-bold text-ink">Profile</h1><p className="text-sm text-muted">{user?.email}</p></div><button onClick={logout} className="btn-secondary">Logout</button></div>
    <form onSubmit={save} className="card p-5 sm:p-6 space-y-4">{['education', 'skills', 'projects', 'experience', 'targetRole', 'dreamCompany'].map((name) => <input key={name} name={name} value={profile[name] || ''} onChange={set} placeholder={name.replace(/([A-Z])/g, ' $1')} className="form-input" />)}<textarea name="resumeText" value={profile.resumeText || ''} onChange={set} rows={6} placeholder="Resume text" className="form-textarea" />{saved && <p className="text-sm text-emerald-600">Profile saved.</p>}<button className="btn-primary">Save Profile</button></form>
  </div></main><Footer /></div>;
}
