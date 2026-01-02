import { useTheme } from "../context/ThemeContext";

function Layout({ children }) {
  const { toggleTheme, theme } = useTheme();

  return (
    <>
      <header className="navbar">
        <div className="nav-left">
          <div className="logo">
            CADMAXX<span className="logo-accent">_ENG</span>
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
