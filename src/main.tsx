import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { StartupNotice } from './components/notice/StartupNotice'
import { AuthProvider } from './context/AuthContext'
import './index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element was not found')
}

function Root() {
  const [startupNoticeOpen, setStartupNoticeOpen] = useState(true)

  return (
    <>
      <App />
      {startupNoticeOpen ? (
        <StartupNotice onClose={() => setStartupNoticeOpen(false)} />
      ) : null}
    </>
  )
}

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </StrictMode>,
)
