import ScrollFloat from './ScrollFloat';
import AnimatedContent from './AnimatedContent';

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
                <ScrollFloat
                    animationDuration={1}
                    ease='back.inOut(2)'
                    scrollStart='center bottom+=50%'
                    scrollEnd='bottom bottom-=40%'
                    stagger={0.03}
                    containerClassName="workflow-title"
                >
                    Workflow
                </ScrollFloat>
                <h3>From parameters to part number.</h3>
            </div>

            <div className="workflow-steps">
                {steps.map((step, index) => (
                    <div className="step" key={step.id}>
                        <AnimatedContent
                            distance={150}
                            direction="horizontal"
                            reverse={false}
                            duration={1.2}
                            ease="bounce.out"
                            initialOpacity={0.2}
                            animateOpacity
                            scale={1.1}
                            threshold={0.1}
                            delay={index * 0.2}
                        >
                            <span className="step-number">{step.id}</span>
                        </AnimatedContent>
                        <h4>{step.title}</h4>
                        <p>{step.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Workflow;
