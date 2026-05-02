import { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setDashboardLoading(true);
    try {
      const { data } = await api.get('/user/dashboard');
      setDashboard(data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  return (
    <AppContext.Provider value={{ dashboard, dashboardLoading, fetchDashboard }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
