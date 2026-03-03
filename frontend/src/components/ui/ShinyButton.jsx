import { motion } from 'motion/react';

const ShinyButton = ({ text = "Open Configurator", onClick, className = "" }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className={className}
            onClick={onClick}
            style={{
                position: 'relative',
                padding: '16px 36px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                overflow: 'hidden',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '700',
                letterSpacing: '1.5px',
                boxShadow: '0 8px 30px rgba(30, 58, 138, 0.35), 0 2px 8px rgba(0,0,0,0.1)',
                textTransform: 'uppercase',
                marginTop: '32px',
                transition: 'box-shadow 0.3s ease',
            }}
        >
            <motion.div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '40%',
                    height: '100%',
                    background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.3), transparent)',
                    transform: 'skewX(-20deg)',
                }}
                initial={{ left: '-100%' }}
                animate={{ left: '250%' }}
                transition={{
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 2.5,
                    repeatDelay: 1.5,
                    ease: "easeInOut",
                }}
            />
            <span style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '10px' }}>
                {text}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transition: 'transform 0.2s' }}>
                    <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </span>
        </motion.button>
    );
};

export default ShinyButton;
