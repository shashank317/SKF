import logo from "../../../assets/CLOGO.png";

function Layout({ children }) {
    return (
        <>
            <header className="navbar">
                <div className="nav-left">
                    <div className="logo">
                        <img src={logo} alt="CADMAXX Logo" className="logo-img" />
                    </div>
                </div>

                <nav className="nav-center">
                    <a href="#capabilities" className="nav-link">Capabilities</a>
                    <a href="#workflow" className="nav-link">Workflow</a>
                </nav>

                <div className="nav-right">
                    <a href="/select" className="nav-cta-btn">Get Started</a>
                </div>
            </header>

            <main>{children}</main>
        </>
    );
}

export default Layout;
