import videoSrc from "../../../assets/ARCTIC15.mp4";

function HeroCanvas() {
    return (
        <video
            className="hero-canvas"
            autoPlay
            loop
            muted
            playsInline
            src={videoSrc}
        />
    );
}

export default HeroCanvas;
