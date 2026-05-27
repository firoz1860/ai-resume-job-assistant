import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 grid place-items-center px-4 py-16">
        <section className="card p-8 sm:p-10 max-w-xl text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-accent mb-2">404</p>
          <h1 className="text-3xl font-extrabold text-ink">Page not found</h1>
          <p className="text-sm text-muted mt-3">
            This route is not available. Open the dashboard or search tools from the command palette.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-7">
            <Link to="/dashboard" className="btn-primary">Dashboard</Link>
            <Link to="/" className="btn-secondary">Home</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
