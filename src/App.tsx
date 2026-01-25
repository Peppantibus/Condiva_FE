import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './state/auth';
import { SessionProvider } from './state/session';

const App: React.FC = () => (
  <AuthProvider>
    <SessionProvider>
      <AppRoutes />
    </SessionProvider>
  </AuthProvider>
);

export default App;
