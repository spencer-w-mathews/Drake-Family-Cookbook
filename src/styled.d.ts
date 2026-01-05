import 'styled-components'

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      berry: string
      berryStrong: string
      sage: string
      sageStrong: string
      cream: string
      sand: string
      ink: string
      muted: string
      surface: string
      surfaceSoft: string
      error: string
    }
    fonts: {
      heading: string
      body: string
    }
    shadows: {
      card: string
      cardHover: string
      hero: string
    }
    radii: {
      lg: string
      md: string
      sm: string
      pill: string
    }
  }
}
