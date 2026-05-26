import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Generator from './pages/Generator.jsx';
import Matcher from './pages/Matcher.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CareerDNA from './pages/CareerDNA.jsx';
import JobAnalyzer from './pages/JobAnalyzer.jsx';
import InterviewRoom from './pages/InterviewRoom.jsx';
import Roadmap from './pages/Roadmap.jsx';
import Applications from './pages/Applications.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Profile from './pages/Profile.jsx';
import InterviewHistory from './pages/InterviewHistory.jsx';
import VoiceInterview from './pages/VoiceInterview.jsx';
import VoiceInterviewHistory from './pages/VoiceInterviewHistory.jsx';
import VoiceInterviewDetail from './pages/VoiceInterviewDetail.jsx';
import ContentLibrary from './pages/ContentLibrary.jsx';
import CareerIntelligence from './pages/CareerIntelligence.jsx';
import About from './pages/About.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

const privatePage = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={privatePage(<Dashboard />)} />
        <Route path="/career-intelligence" element={privatePage(<CareerIntelligence />)} />
        <Route path="/career-dna" element={privatePage(<CareerDNA />)} />
        <Route path="/job-analyzer" element={privatePage(<JobAnalyzer />)} />
        <Route path="/generator" element={privatePage(<Generator />)} />
        <Route path="/content-library" element={privatePage(<ContentLibrary />)} />
        <Route path="/matcher" element={<Matcher />} />
        <Route path="/interview-room" element={privatePage(<InterviewRoom />)} />
        <Route path="/interview-history" element={privatePage(<InterviewHistory />)} />
        <Route path="/voice-interview" element={privatePage(<VoiceInterview />)} />
        <Route path="/voice-interview-history" element={privatePage(<VoiceInterviewHistory />)} />
        <Route path="/voice-interview/:id" element={privatePage(<VoiceInterviewDetail />)} />
        <Route path="/roadmap" element={privatePage(<Roadmap />)} />
        <Route path="/applications" element={privatePage(<Applications />)} />
        <Route path="/profile" element={privatePage(<Profile />)} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
