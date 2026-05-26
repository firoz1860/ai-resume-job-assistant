import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { applicationsApi } from '../services/api.js';

const empty = { companyName: '', role: '', jobLink: '', status: 'Saved', appliedDate: '', followUpDate: '', notes: '', generatedContent: '' };
const statuses = ['Saved', 'Applied', 'Interview', 'Rejected', 'Offer'];

export default function Applications() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [followUp, setFollowUp] = useState('');
  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const load = async () => setItems(await applicationsApi.list());
  useEffect(() => { load(); }, []);
  const create = async (e) => { e.preventDefault(); await applicationsApi.create(form); setForm(empty); load(); };
  const remove = async (id) => { await applicationsApi.remove(id); load(); };
  const generateFollowUp = async (id) => { const data = await applicationsApi.followUp(id); setFollowUp(data.message); };
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-1.5">Application Tracker</h1>
          <p className="text-sm text-muted mb-8">Track applications, statuses, notes, and follow-up messages.</p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {['Total', 'Applied', 'Interview', 'Offer'].map((label) => (
              <div key={label} className="card p-4">
                <p className="text-xs text-muted uppercase font-semibold">{label}</p>
                <p className="text-2xl font-bold text-ink">{label === 'Total' ? items.length : items.filter((i) => i.status === label).length}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6 items-start">
            <form onSubmit={create} className="card p-5 sm:p-6 space-y-3">
              {['companyName', 'role', 'jobLink', 'appliedDate', 'followUpDate'].map((name) => (
                <input key={name} name={name} value={form[name]} onChange={set} placeholder={name.replace(/([A-Z])/g, ' $1')} className="form-input" />
              ))}
              <select name="status" value={form.status} onChange={set} className="form-select">
                {statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
              <textarea name="notes" value={form.notes} onChange={set} placeholder="Notes" className="form-textarea" />
              <button className="btn-primary w-full justify-center">Add Application</button>
            </form>

            <div className="space-y-4">
              {statuses.map((status) => (
                <div key={status} className="card p-4">
                  <h2 className="font-bold text-ink mb-3">{status}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.filter((item) => item.status === status).map((item) => (
                      <div key={item.id} className="bg-surface border border-border rounded-lg p-3">
                        <p className="font-semibold text-ink">{item.companyName}</p>
                        <p className="text-sm text-muted">{item.role}</p>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => generateFollowUp(item.id)} className="text-xs text-accent font-semibold">Follow-up</button>
                          <button onClick={() => remove(item.id)} className="text-xs text-red-600 font-semibold">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {followUp && <div className="card p-4 whitespace-pre-wrap text-sm">{followUp}</div>}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
