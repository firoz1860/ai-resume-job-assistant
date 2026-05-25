import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Generator from './pages/Generator.jsx';
import Matcher from './pages/Matcher.jsx';
import About from './pages/About.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generator" element={<Generator />} />
        <Route path="/matcher" element={<Matcher />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
