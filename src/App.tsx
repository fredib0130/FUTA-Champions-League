import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { MatchStateProvider } from './context/MatchStateContext';
import { 
  Home, 
  Fixtures, 
  Teams, 
  Stats, 
  Media, 
  News, 
  Sponsorship, 
  About, 
  Contact,
  TeamProfile,
  Table,
  Playoffs,
  Rankings,
  Pots,
  Champions,
  RegistrationPortal
} from './pages';

import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminMatchController from './pages/AdminMatchController';
import AdminAccreditation from './pages/AdminAccreditation';
import AdminLogoControlPage from './pages/AdminLogoControlPage';
import PublicMatchCenter from './pages/PublicMatchCenter';
import PublicLiveScores from './pages/PublicLiveScores';
import TeamRegisterPage from './pages/TeamRegisterPage';
import TeamPortalPage from './pages/TeamPortalPage';

export default function App() {
  return (
    <MatchStateProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="registration" element={<RegistrationPortal />} />
            <Route path="register/:teamId" element={<TeamRegisterPage />} />
            <Route path="portal/team" element={<TeamPortalPage />} />
            <Route path="fixtures" element={<Fixtures />} />
            <Route path="table" element={<Table />} />
            <Route path="rankings" element={<Rankings />} />
            <Route path="pots" element={<Pots />} />
            <Route path="champions" element={<Champions />} />
            <Route path="playoffs" element={<Playoffs />} />
            <Route path="teams" element={<Teams />} />
            <Route path="teams/:id" element={<TeamProfile />} />
            <Route path="stats" element={<Stats />} />
            <Route path="media" element={<Media />} />
            <Route path="news" element={<News />} />
            <Route path="sponsorship" element={<Sponsorship />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="live" element={<PublicLiveScores />} />
            <Route path="matches/:matchId" element={<PublicMatchCenter />} />
          </Route>

          {/* Admin Panels standalone full screen */}
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/accreditation" element={<AdminAccreditation />} />
          <Route path="admin/team-logos" element={<AdminLogoControlPage />} />
          <Route path="admin/matches/:matchId" element={<AdminMatchController />} />
        </Routes>
      </BrowserRouter>
    </MatchStateProvider>
  );
}
