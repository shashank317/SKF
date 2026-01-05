import { useTheme } from "../../context/ThemeContext";
import logo from "../../assets/CLOGO.png";

function Layout({ children }) {
  const { toggleTheme, theme } = useTheme();

  return (
    <>
      <header className="navbar">
        <div className="nav-left">
          <div className="logo">
            <img src={logo} alt="CADMAXX Logo" className="logo-img" />
          </div>
        </div>

        <div className="nav-right">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? "LIGHT MODE" : "DARK MODE"}
          </button>
        </div>
      </header>

      <main>{children}</main>
    </>
  );
}

export default Layout;
