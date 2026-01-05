import Layout from "../components/Landing/Layout";
import Hero from "../components/Landing/Hero";
import Capabilities from "../components/Landing/Capabilities";
import Workflow from "../components/Landing/Workflow";
import Footer from "../components/Landing/Footer";

function Home() {
  return (
    <Layout>
      <Hero />
      <div className="section-divider" />
      <Capabilities className="section-alt" />
      <div className="section-divider" />
      <Workflow />
      <Footer />
    </Layout>
  );
}

export default Home;
