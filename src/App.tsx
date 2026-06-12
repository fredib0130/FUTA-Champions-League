import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
  Appearances
} from './pages';

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
            <Route path="appearances" element={<Appearances />} />
            <Route path="media" element={<Media />} />
            <Route path="news" element={<News />} />
            <Route path="sponsorship" element={<Sponsorship />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="live" element={<PublicLiveScores />} />
            <Route path="matches/:matchId" element={<PublicMatchCenter />} />
            {/* Fail-safe wildcard handling: 404/redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MatchStateProvider>
  );
}
