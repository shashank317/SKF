const steps = [
  {
    id: "01",
    title: "Input",
    description:
      "Enter required dimensions and operational constraints.",
  },
  {
    id: "02",
    title: "Validate",
    description:
      "System checks feasibility, tolerance, and availability.",
  },
  {
    id: "03",
    title: "Match",
    description:
      "Exact and nearest components are identified.",
  },
  {
    id: "04",
    title: "Deploy",
    description:
      "View 3D model, download CAD, and export datasheet.",
  },
];

function Workflow() {
  return (
    <section className="workflow">
      <div className="workflow-header">
        <h1>Workflow</h1>
        <h3>From parameters to part number.</h3>
      </div>

      <div className="workflow-steps">
        {steps.map((step) => (
          <div className="step" key={step.id}>
            <span className="step-number">{step.id}</span>
            <h4>{step.title}</h4>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Workflow;
