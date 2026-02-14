import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './state/auth';
import { SessionProvider } from './state/session';
import { SeoManager } from './seo/SeoManager';

const App: React.FC = () => (
  <AuthProvider>
    <SessionProvider>
      <SeoManager />
      <AppRoutes />
    </SessionProvider>
  </AuthProvider>
);

export default App;
