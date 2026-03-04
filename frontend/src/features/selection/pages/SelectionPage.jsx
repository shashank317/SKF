import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// -----------------------------------------------------------------------------
// MOCKED DEPENDENCIES (Consolidated to fix compilation errors)
// -----------------------------------------------------------------------------

const SCHEMAS = {
    LINEAR_GUIDE: { id: 'LINEAR_GUIDE', name: 'Linear Guide' },
    HEX_BOLT: { id: 'HEX_BOLT', name: 'Hex Bolt' },
    ALLEN_BOLT: { id: 'ALLEN_BOLT', name: 'Allen Bolt' },
    HYDRAULIC: { id: 'HYDRAULIC', name: 'Hydraulic Cylinder' },
    LUBRICATION_SYSTEM: { id: 'LUBRICATION_SYSTEM', name: 'Lubrication System' },
    T_BOLT: { id: 'T_BOLT', name: 'T-Bolt' },
    RS: { id: 'RS', name: 'Roller Support' }
};

const Layout = ({ children }) => (
    <div style={{ minHeight: '100vh', width: '100%', backgroundColor: 'transparent' }}>
        {children}
    </div>
);

const AnimatedContent = ({ children, delay = 0, duration = 0.6, distance = 30 }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay * 1000);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : `translateY(${distance}px)`,
            transition: `opacity ${duration}s ease-out, transform ${duration}s ease-out`,
            willChange: 'opacity, transform'
        }}>
            {children}
        </div>
    );
};

// -----------------------------------------------------------------------------
// INJECTED CSS (Replacing the external SelectionPage.css import)
// -----------------------------------------------------------------------------
const PAGE_STYLES = `
:root {
    --surface-1: #ffffff;
    --surface-2: #f3f4f6;
    --text-primary: #111827;
    --text-secondary: #6b7280;
    --accent-1: #3b82f6;
    --font-primary: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

[data-theme='dark'] {
    --surface-1: #111111;
    --surface-2: #222222;
    --text-primary: #ffffff;
    --text-secondary: #a1a1aa;
}

.selection-page {
    padding: 6rem 2rem 4rem;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
    min-height: calc(100vh - 160px);
    font-family: var(--font-primary, inherit);
    box-sizing: border-box;
}

.selection-header {
    text-align: center;
    margin-bottom: 5rem;
}

.selection-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 800;
    margin-bottom: 1rem;
    color: var(--text-primary);
    letter-spacing: -0.03em;
    line-height: 1.1;
}

.selection-subtitle {
    font-size: 1.125rem;
    color: var(--text-secondary);
    max-width: 500px;
    margin: 0 auto;
    line-height: 1.6;
}

.selection-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 1.5rem;
}

/* Card Base Styling */
.product-card {
    position: relative;
    background: var(--surface-1);
    border: 1px solid var(--surface-2);
    border-radius: 12px;
    padding: 2.5rem 2rem;
    cursor: pointer;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    height: 100%;
    box-sizing: border-box;
}

[data-theme='dark'] .product-card {
    box-shadow: none;
}

/* Card Hover Mechanics */
.product-card:hover {
    transform: translateY(-4px);
    border-color: var(--text-primary);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Slick Header inside Card */
.product-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
}

.product-card-visual {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-primary);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.product-card-visual svg {
    width: 100%;
    height: 100%;
    stroke-width: 1.5px;
}

.product-card:hover .product-card-visual {
    transform: scale(1.1);
    color: var(--accent-1);
}

/* Techy Monospace Badge */
.product-badge {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    padding: 0.25rem 0.6rem;
    background: var(--surface-2);
    color: var(--text-secondary);
    border-radius: 4px;
    text-transform: uppercase;
}

/* Typography */
.product-card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.product-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 0.5rem 0;
    letter-spacing: -0.01em;
}

.product-description {
    font-size: 0.95rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0 0 2.5rem 0;
    flex: 1;
}

/* Brutalist Button */
.configure-btn {
    align-self: flex-start;
    padding: 0;
    background: transparent;
    color: var(--text-primary);
    border: none;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    position: relative;
    margin-top: auto;
}

.configure-btn::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background-color: var(--text-primary);
    transition: width 0.3s ease;
}

.product-card:hover .configure-btn::after {
    width: 100%;
}

.configure-btn .arrow-icon {
    width: 16px;
    height: 16px;
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.product-card:hover .configure-btn .arrow-icon {
    transform: translateX(6px);
}

/* Subtle background accent line */
.card-accent-line {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: var(--accent-1);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.product-card:hover .card-accent-line {
    transform: scaleX(1);
}

@media (max-width: 768px) {
    .selection-grid {
        grid-template-columns: 1fr;
    }
    .selection-header {
        margin-bottom: 3rem;
    }
}
`;

// -----------------------------------------------------------------------------
// COMPONENT LOGIC
// -----------------------------------------------------------------------------

// Minimalist, tech-focused SVG icons
const SVGIcons = {
    LINEAR_GUIDE: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="4" rx="1" />
            <rect x="6" y="14" width="12" height="4" rx="1" />
            <path d="M8 10v4" />
            <path d="M16 10v4" />
        </svg>
    ),
    HEX_BOLT: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l4.5 2.5v5L12 12l-4.5-2.5v-5L12 2z" />
            <path d="M9 12v10" />
            <path d="M15 12v10" />
            <path d="M9 16h6" />
            <path d="M9 20h6" />
        </svg>
    ),
    ALLEN_BOLT: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="7" r="5" />
            <path d="M12 5L10 8h4l-2-3z" />
            <path d="M10 12v10" />
            <path d="M14 12v10" />
            <path d="M10 17h4" />
        </svg>
    ),
    HYDRAULIC: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="8" width="16" height="14" rx="2" />
            <path d="M8 8V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" />
            <path d="M12 12v6" />
            <path d="M9 15h6" />
        </svg>
    ),
    LUBRICATION_SYSTEM: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
            <path d="M12 18v.01" />
        </svg>
    ),
    T_BOLT: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="5" rx="1" />
            <rect x="9" y="7" width="6" height="15" rx="1" />
            <path d="M10 11h4" />
            <path d="M10 15h4" />
        </svg>
    ),
    RS: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="10" r="6" />
            <path d="M4 20h16" />
            <path d="M6 20l2-4" />
            <path d="M18 20l-2-4" />
            <path d="M12 16v4" />
        </svg>
    ),
    DEFAULT: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
    )
};

function SelectionPage() {
    const navigate = useNavigate();
    const [hoveredProduct, setHoveredProduct] = useState(null);

    const handleSelectComponent = (schemaId) => {
        // Fallback if navigate isn't fully operational in this preview env
        try {
            navigate(`/configurator?type=${schemaId}`);
        } catch (e) {
            console.log(`Navigating to /configurator?type=${schemaId}`);
        }
    };

    const getProductVisual = (id) => {
        return SVGIcons[id] || SVGIcons.DEFAULT;
    };

    return (
        <Layout>
            <style>{PAGE_STYLES}</style>
            <div className="selection-page">
                <AnimatedContent distance={30} duration={0.8} delay={0}>
                    <div className="selection-header">
                        <h1 className="selection-title">Component Family</h1>
                        <p className="selection-subtitle">
                            Select an industrial product schema to initialize the dimension-driven configurator.
                        </p>
                    </div>
                </AnimatedContent>

                <div className="selection-grid">
                    {Object.values(SCHEMAS).map((schema, index) => {
                        const icon = getProductVisual(schema.id.toUpperCase());

                        return (
                            <AnimatedContent
                                key={schema.id}
                                distance={40}
                                delay={0.1 + (index * 0.05)} // Staggered entry
                                duration={0.6}
                            >
                                <div
                                    className="product-card"
                                    onMouseEnter={() => setHoveredProduct(schema.id)}
                                    onMouseLeave={() => setHoveredProduct(null)}
                                    onClick={() => handleSelectComponent(schema.id.toUpperCase())}
                                >
                                    <div className="card-accent-line" />

                                    <div className="product-card-header">
                                        <div className="product-card-visual">
                                            {icon}
                                        </div>
                                        <span className="product-badge">
                                            {schema.id.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="product-card-content">
                                        <h3 className="product-name">{schema.name}</h3>
                                        <p className="product-description">
                                            Parametric configuration. Adjust dimensions, update materials, and export native 3D CAD data instantly.
                                        </p>
                                        <button className="configure-btn">
                                            Configure
                                            <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                                <polyline points="12 5 19 12 12 19"></polyline>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </AnimatedContent>
                        );
                    })}
                </div>
            </div>
        </Layout>
    );
}

export default SelectionPage;