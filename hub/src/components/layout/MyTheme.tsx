import { createMuiTheme, ThemeProvider } from '@material-ui/core'
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
    fontFamily: '"Lato", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: {
      fontSize: "3rem",
      letterSpacing: "0",
      fontWeight: 300,
    },
    h2: {
      fontSize: "2.5rem",
      letterSpacing: "0",
      fontWeight: 300,
    },
    h3: {
      fontSize: "2rem",
      letterSpacing: "0",
      fontWeight: 400,
    },
    h4: {
      fontSize: "1.5rem",
      letterSpacing: "0",
      fontWeight: 400,
    },
    h5: {
      fontSize: "1.25rem",
      letterSpacing: "0",
      fontWeight: 500,
    },
    h6: {
      fontSize: "1rem",
      letterSpacing: "0",
      fontWeight: 500,
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
    MuiInputLabel: {
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

})

type MyThemeProps = {
  children: React.ReactNode
}

function MyTheme({children}: MyThemeProps) {
  return <ThemeProvider theme={myTheme}>{children}</ThemeProvider>
}

export default MyTheme