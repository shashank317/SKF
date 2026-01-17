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

                <div className="nav-right">
                    {/* Theme toggle removed - using light mode only */}
                </div>
            </header>

            <main>{children}</main>
        </>
    );
}

export default Layout;
