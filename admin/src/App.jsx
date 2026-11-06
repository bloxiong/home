import { lazy } from 'react'
import { createBrowserRouter, Navigate, Outlet, RouterProvider, useLocation } from 'react-router-dom'
import { AuthProvider, CountsProvider, ThemeProvider, ToastProvider } from './components/Providers'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import { useAuth } from './lib/contexts'
import Login from './pages/Login'
import Forgot from './pages/Forgot'
import Reset from './pages/Reset'
import NotFound from './pages/NotFound'

/* Each page loads when it's opened. After a new deploy an old tab can ask for a
   file that has gone, so it reloads once to pick up the new ones. */
const page = (load) => lazy(() => load().then((m) => { try { sessionStorage.removeItem('bx-reloaded') } catch { /* blocked */ } return m }).catch((e) => {
  let again = true
  try { again = !sessionStorage.getItem('bx-reloaded'); sessionStorage.setItem('bx-reloaded', '1') } catch { again = false }
  if (again) window.location.reload()
  throw e
}))
const Dashboard = page(() => import('./pages/Dashboard'))
const Traffic = page(() => import('./pages/Traffic'))
const Surveys = page(() => import('./pages/Surveys'))
const SurveyDetail = page(() => import('./pages/SurveyDetail'))
const Enquiries = page(() => import('./pages/Enquiries'))
const EnquiryDetail = page(() => import('./pages/EnquiryDetail'))
const Inbox = page(() => import('./pages/Inbox'))
const Contacts = page(() => import('./pages/Contacts'))
const Contact = page(() => import('./pages/Contact'))
const InboxThread = page(() => import('./pages/InboxThread'))
const Email = page(() => import('./pages/Email'))
const Content = page(() => import('./pages/Content'))
const ContentEditor = page(() => import('./pages/ContentEditor'))
const Admins = page(() => import('./pages/Admins'))
const ActivityPage = page(() => import('./pages/Activity'))
const Account = page(() => import('./pages/Account'))

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
          { path: 'inbox', element: <Inbox /> },
          { path: 'contacts', element: <Contacts /> },
          { path: 'contacts/person', element: <Contact /> },
          { path: 'inbox/:id', element: <InboxThread /> },
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
