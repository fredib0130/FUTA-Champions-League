import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
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
  Rankings
} from './pages';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="fixtures" element={<Fixtures />} />
          <Route path="table" element={<Table />} />
          <Route path="rankings" element={<Rankings />} />
          <Route path="playoffs" element={<Playoffs />} />
          <Route path="teams" element={<Teams />} />
          <Route path="teams/:id" element={<TeamProfile />} />
          <Route path="stats" element={<Stats />} />
          <Route path="media" element={<Media />} />
          <Route path="news" element={<News />} />
          <Route path="sponsorship" element={<Sponsorship />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
