import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddCustomer from './pages/AddCustomer';
import UpdatesPage from './pages/UpdatesPage';
import WebsitesPage from './pages/WebsitesPage';
function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/add" element={<AddCustomer />} />
      <Route path="/updates" element={<UpdatesPage />} />
      <Route path="/websites" element={<WebsitesPage />} />
    </Routes>
  );
}

export default App;

