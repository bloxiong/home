import { createBrowserRouter, Navigate, Outlet, RouterProvider, useLocation } from 'react-router-dom'
import { AuthProvider, CountsProvider, ThemeProvider, ToastProvider } from './components/Providers'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import { useAuth } from './lib/contexts'
import Login from './pages/Login'
import Forgot from './pages/Forgot'
import Reset from './pages/Reset'
import Dashboard from './pages/Dashboard'
import Traffic from './pages/Traffic'
import Surveys from './pages/Surveys'
import SurveyDetail from './pages/SurveyDetail'
import Enquiries from './pages/Enquiries'
import EnquiryDetail from './pages/EnquiryDetail'
import Email from './pages/Email'
import Content from './pages/Content'
import ContentEditor from './pages/ContentEditor'
import Admins from './pages/Admins'
import ActivityPage from './pages/Activity'
import Account from './pages/Account'
import NotFound from './pages/NotFound'

function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center" aria-busy="true">
      <img src="/brand/star.png" alt="" className="h-10 w-10 animate-pulse" />
    </div>
  )
}

/** Signed-in area: anything else bounces to /login and comes back after. */
function RequireAuth() {
  const { admin, ready } = useAuth()
  const loc = useLocation()
  if (!ready) return <Splash />
  if (!admin) return <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />
  return <Layout />
}

/** Signed-out pages: skip them if already signed in (except reset links). */
function PublicOnly() {
  const { admin, ready } = useAuth()
  if (!ready) return <Splash />
  if (admin) return <Navigate to="/" replace />
  return <Outlet />
}

function Root() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <CountsProvider>
              <Outlet />
            </CountsProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        element: <PublicOnly />,
        children: [
          { path: '/login', element: <Login /> },
          { path: '/forgot', element: <Forgot /> },
        ],
      },
      { path: '/reset', element: <Reset /> },
      {
        element: <RequireAuth />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'traffic', element: <Traffic /> },
          { path: 'surveys', element: <Surveys /> },
          { path: 'surveys/:id', element: <SurveyDetail /> },
          { path: 'enquiries', element: <Enquiries /> },
          { path: 'enquiries/:id', element: <EnquiryDetail /> },
          { path: 'email', element: <Email /> },
          { path: 'content', element: <Content /> },
          { path: 'content/:key', element: <ContentEditor /> },
          { path: 'admins', element: <Admins /> },
          { path: 'activity', element: <ActivityPage /> },
          { path: 'account', element: <Account /> },
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
