import { createMuiTheme, CssBaseline, fade, ThemeProvider } from '@material-ui/core'
import React from 'react';
// import App from 'next/app'

const colorGreen = "#00bc8c"
const myTheme = createMuiTheme({
  // copying the colors of https://bootswatch.com/4/darkly/_variables.scss
  
  palette: {
    type: "dark",
    background: {
      paper: "#303030",
      default: "#222",
    },
    primary: {
      main: "#375a7f",
    },
    secondary: {
      main: colorGreen,
    },
    error: {
      main: "#e74c3c",
    },
    warning: {
      main: "#f39c12",
    },
    info: {
      main: "#3498db",
    },
    success: {
      main: colorGreen,
    },
    grey: {
      100: "#f8f9fa",
      200: "#ebebeb",
      300: "#dee2e6",
      400: "#ced4da",
      500: "#adb5bd",
      600: "#888",
      700: "#444",
      800: "#303030",
      900: "#222",
    }
  },
  typography: {
    fontSize: 15,
    htmlFontSize: 15,
    h1: {
      fontSize: "3rem",
      letterSpacing: "0",
    },
    h2: {
      fontSize: "2.5rem",
      letterSpacing: "0",
    },
    h3: {
      fontSize: "2rem",
      letterSpacing: "0",
    },
    h4: {
      fontSize: "1.5rem",
      letterSpacing: "0",
    },
    h5: {
      fontSize: "1.25rem",
      letterSpacing: "0",
    },
    h6: {
      fontSize: "1rem",
      letterSpacing: "0",
    },
  },
  props: {
    // @ts-ignore MuiAlert is in Lab
    MuiAlert: {
      variant: "filled",
    },
    MuiInput: {
      color: "secondary",
    },
    MuiLink: {
      color: "secondary",
    },
    MuiNativeSelect: {
      color: "secondary",
      variant: "filled",
    },
    MuiSelect: {
      // native components have better support on mobile
      native: true,
      color: "secondary",
      variant: "filled",
    },
    MuiTextField: {
      color: "secondary",
      variant: "filled",
    }
  },

});

function MyApp({ Component, pageProps }) {
  return <ThemeProvider theme={myTheme}>
    <CssBaseline />
    <Component {...pageProps} />
  </ThemeProvider>
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

export default MyApp