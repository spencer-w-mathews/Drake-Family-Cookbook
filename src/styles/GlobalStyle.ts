import {createGlobalStyle} from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Work+Sans:wght@400;500;600&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
  }

  :root {
    font-family: ${({theme}) => theme.fonts.body};
    line-height: 1.6;
    font-weight: 400;
    color: ${({theme}) => theme.colors.ink};
    background-color: ${({theme}) => theme.colors.cream};
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    margin: 0;
    min-height: 100vh;
    background: radial-gradient(circle at 10% 20%, rgba(166, 61, 64, 0.08), transparent 40%),
      radial-gradient(circle at 90% 10%, rgba(108, 143, 115, 0.14), transparent 40%),
      ${({theme}) => theme.colors.cream};
    color: ${({theme}) => theme.colors.ink};
  }

  h1, h2, h3, h4 {
    font-family: ${({theme}) => theme.fonts.heading};
    margin: 0 0 0.4em;
    letter-spacing: -0.02em;
  }

  p {
    margin: 0 0 1em;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button, input {
    font-family: inherit;
  }

  #root {
    width: 100%;
  }
`
