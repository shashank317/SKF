import { motion } from 'motion/react';

const ShinyButton = ({ text = "Open Configurator", onClick, className = "" }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={className}
            onClick={onClick}
            style={{
                position: 'relative',
                padding: '16px 32px',
                borderRadius: '12px',
                background: 'var(--accent-color)',
                color: 'white',
                border: 'none',
                overflow: 'hidden',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                boxShadow: '0 0 20px rgba(0,0,0,0.3)',
                textTransform: 'uppercase',
                marginTop: '30px'
            }}
        >
            <motion.div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '50%',
                    height: '100%',
                    background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.4), transparent)',
                    transform: 'skewX(-20deg)',
                }}
                initial={{ left: '-100%' }}
                animate={{ left: '200%' }}
                transition={{
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 2,
                    repeatDelay: 1,
                    ease: "easeInOut",
                }}
            />
            <span style={{ position: 'relative', zIndex: 10 }}>{text}</span>
        </motion.button>
    );
};

export default ShinyButton;
