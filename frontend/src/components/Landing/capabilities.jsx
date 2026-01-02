import ScrollFloat from './ScrollFloat';

const cards = [
  {
    title: "Dimension Input",
    description:
      "Define shaft diameters, widths, and constraints directly.",
    className: "preview-card",
    children: (
      <div className="example-box">
        <p className="right-box-label">Example Preview</p>

        <div className="preview-item">
          <span>Diameter</span>
          <span className="preview-value">25</span>
        </div>

        <div className="preview-item">
          <span>Width</span>
          <span className="preview-value">12</span>
        </div>

        <div className="preview-item">
          <span>Material</span>
          <span className="preview-value">Steel</span>
        </div>

        <div className="example-result">
          Matched Part: <strong>ABC-123</strong>
        </div>
      </div>
    )
  },
  {
    title: "Auto Resolve",
    description:
      "System validates against thousands of SKUs instantly.",
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
          Eliminate catalog browsing.
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
