import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroCanvas from "./HeroCanvas";
import BlurText from "../ui/BlurText";
import ShinyButton from "../ui/ShinyButton";

function Hero() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleAnimationComplete = () => {
    console.log('Animation completed!');
  };

  const handleOpenConfigurator = () => {
    setIsLoading(true);
    // Small delay to show the animation before navigation
    setTimeout(() => {
      navigate('/configurator');
    }, 1500);
  };

  return (
    <section className="hero">
      <div className="hero-content fade-in">
        <BlurText
          text="SYSTEM ONLINE"
          as="span"
          delay={150}
          animateBy="words"
          direction="top"
          className="badge"
        />

        <h1>
          <BlurText
            text="Engineering components,"
            as="span"
            delay={150}
            animateBy="words"
            direction="top"
            style={{ display: 'inline-flex' }}
          />
          <br />
          <BlurText
            text="selected by"
            as="span"
            delay={150}
            animateBy="words"
            direction="top"
            style={{ display: 'inline-flex' }}
          />
          &nbsp;
          <BlurText
            text="dimensions"
            as="span"
            delay={150}
            animateBy="words"
            direction="top"
            className="accent"
            style={{ display: 'inline-flex' }}
          />
        </h1>

        <BlurText
          text="Dimension-driven component selection with instant 3D preview and datasheet access."
          as="p"
          delay={150}
          animateBy="words"
          direction="top"
        />

        <ShinyButton text="Open Configurator" onClick={handleOpenConfigurator} />
      </div>

      <HeroCanvas />

      {/* Loading Animation Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="spinner-container">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-core"></div>
            </div>
            <div className="loading-text">
              <div className="loading-title">Initializing Configurator</div>
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Hero;
