import HeroCanvas from "./HeroCanvas";
import BlurText from "./BlurText";
import ShinyButton from "./ShinyButton";

function Hero() {
  const handleAnimationComplete = () => {
    console.log('Animation completed!');
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

        <ShinyButton text="Open Configurator" />
      </div>

      <HeroCanvas />
    </section>
  );
}

export default Hero;
