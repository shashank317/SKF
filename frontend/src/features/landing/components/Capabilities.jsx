import ScrollFloat from './ScrollFloat';
import configImg from '../../../assets/config.png';

const cards = [
    {
        title: "Dimension Input",
        description:
            "Define shaft diameters, widths, and constraints directly.",
        className: "preview-card",
        children: (
            <img
                src={configImg}
                alt="Configurator Preview"
                style={{ width: '200%', borderRadius: '20px', marginTop: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
        )
    },

];

function Capabilities({ className = "" }) {
    return (
        <section className={`capabilities ${className}`}>
            <div className="capabilities-text">
                <h1>Capabilities</h1>
                <ScrollFloat
                    animationDuration={1}
                    ease='back.inOut(2)'
                    scrollStart='center bottom+=50%'
                    scrollEnd='bottom bottom-=40%'
                    stagger={0.03}
                    containerClassName="mb-10"
                >
                    Eliminate catalog   browsing.
                </ScrollFloat>

                <p>
                    Traditional component selection requires searching through
                    hundreds of PDF pages. This system reverses the process:
                    you define the geometry, and the system resolves the part.
                </p>

                <ul>
                    <li>Tolerance-based filtering</li>
                    <li>Material & finish constraints</li>
                    <li>Legacy part cross-referencing</li>
                </ul>
            </div>

            <div className="capabilities-cards">
                {cards.map((card) => (
                    <div className={`card ${card.className || ''}`} key={card.title}>
                        <h4>{card.title}</h4>
                        <p>{card.description}</p>
                        {card.children}
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Capabilities;
