import React from 'react'
import Layout from '../components/layout/Layout'
import MiniPage from '../components/layout/MiniPage'

const PageNotFound = ({children}) => {
  return (
    <Layout testId="404">
      <MiniPage title="Page Not Found">{children}</MiniPage>
    </Layout>
  )
}
export default PageNotFound