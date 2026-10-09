import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { Icon } from '../components/Reveal.jsx';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 grid place-items-center px-4 py-16">
        <section className="card p-8 sm:p-10 max-w-xl text-center">
          <span className="w-14 h-14 rounded-2xl bg-forest-50 border border-forest-100 grid place-items-center mx-auto mb-5">
            <Icon name="route" className="w-7 h-7 text-forest-700" />
          </span>
          <span className="eyebrow-pill mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-500" />
            404
          </span>
          <h1 className="font-display text-3xl font-extrabold text-ink">Page not found</h1>
          <p className="text-sm text-sage-600 mt-3 max-w-md mx-auto leading-relaxed">
            This route is not available. Head back to your dashboard to keep working, or return to the homepage.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-7">
            <Link to="/dashboard" className="btn-primary justify-center">Go to Dashboard</Link>
            <Link to="/" className="btn-secondary justify-center">Back to Home</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
