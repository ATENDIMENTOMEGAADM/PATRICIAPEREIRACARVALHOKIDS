import {StrictMode, lazy, Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// A área restrita só é carregada em /admin, sem pesar no site público.
const AdminApp = lazy(() => import('./admin/AdminApp.tsx'));
const PatientApp = lazy(() => import('./patient/PatientApp.tsx'));
const path = window.location.pathname;
const isAdmin = path === '/admin' || path.startsWith('/admin/');
const isConta = path === '/conta' || path.startsWith('/conta/');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdmin ? <Suspense fallback={null}><AdminApp /></Suspense>
      : isConta ? <Suspense fallback={null}><PatientApp /></Suspense>
      : <App />}
  </StrictMode>,
);
