import { CssBaseline } from '@material-ui/core'
import React from 'react'
import MyTheme from '../components/style/MyTheme'
// import App from 'next/app'


function MyApp({ Component, pageProps }) {
  return <MyTheme>
    <CssBaseline />
    <Component {...pageProps} />
  </MyTheme>
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