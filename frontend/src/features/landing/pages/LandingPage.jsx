import Layout from "../components/Layout";
import Hero from "../components/Hero";
import Capabilities from "../components/Capabilities";
import Workflow from "../components/Workflow";
import Footer from "../components/Footer";

function LandingPage() {
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

export default LandingPage;
