import {useEffect} from 'react'
import {BrowserRouter, Navigate, Route, Routes, useLocation} from 'react-router-dom'
import {ThemeProvider} from 'styled-components'
import {GlobalStyle} from './styles/GlobalStyle'
import {theme} from './theme'
import HomePage from './pages/Home'
import RecipePage from './pages/RecipePage'

const ScrollToTop = () => {
  const {pathname} = useLocation()

  useEffect(() => {
    window.scrollTo({top: 0, left: 0, behavior: 'auto'})
  }, [pathname])

  return null
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recipes/:slug" element={<RecipePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
