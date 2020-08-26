import Link from 'next/link'

const Layout = props => (
  <div>
    <nav className="navbar navbar-dark bg-primary">
      <a className="navbar-brand" href="#">Tally Hub</a>
        <ul className="navbar-nav mr-auto">
          <li className="nav-item">
            <Link href="/">
              <a className="nav-link">Tallies</a>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/config">
              <a className="nav-link">Configuration</a>
            </Link>
          </li>
        </ul>
    </nav>
    <div id="content">
      {props.children}
    </div>
  </div>
);

export default Layout;