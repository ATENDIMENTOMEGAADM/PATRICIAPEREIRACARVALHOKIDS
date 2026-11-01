import {StrictMode, lazy, Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// A área restrita só é carregada em /admin, sem pesar no site público.
const AdminApp = lazy(() => import('./admin/AdminApp.tsx'));
const isAdmin = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdmin ? <Suspense fallback={null}><AdminApp /></Suspense> : <App />}
  </StrictMode>,
);
