import { useState, useEffect } from 'react';
import { getHealth } from '../services/api';

const ConnectionTest = () => {
    const [status, setStatus] = useState('checking');
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const data = await getHealth();
                if (data.status === 'healthy') {
                    setStatus('connected');
                } else {
                    setStatus('error');
                    setError('Invalid response');
                }
            } catch (err) {
                setStatus('error');
                setError(err.message);
            }
        };

        checkConnection();
        const interval = setInterval(checkConnection, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    if (status === 'connected') {
        return (
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                padding: '10px 15px',
                background: '#dcfce7',
                color: '#166534',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500'
            }}>
                <span style={{ fontSize: '18px' }}>✅</span>
                Backend Connected
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                padding: '10px 15px',
                background: '#fee2e2',
                color: '#991b1b',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500'
            }}>
                <span style={{ fontSize: '18px' }}>❌</span>
                <span>Backend Disconnected</span>
                <span style={{ fontSize: '10px', opacity: 0.8 }}>({error})</span>
            </div>
        );
    }

    return null;
};

export default ConnectionTest;
