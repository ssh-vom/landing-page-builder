import { Routes, Route } from 'react-router-dom';
import MarketingPage from './pages/MarketingPage';
import NewPage from './pages/NewPage';
import GenerationPage from './pages/GenerationPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MarketingPage />} />
      <Route path="/new" element={<NewPage />} />
      <Route path="/g/:id" element={<GenerationPage />} />
      <Route path="/history" element={<HistoryPage />} />
    </Routes>
  );
}
