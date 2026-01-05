import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom'
import {ThemeProvider} from 'styled-components'
import {GlobalStyle} from './styles/GlobalStyle'
import {theme} from './theme'
import HomePage from './pages/Home'
import RecipePage from './pages/RecipePage'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
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
