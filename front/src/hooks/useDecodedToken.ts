import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

export const useDecodedToken = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useDecodedToken must be used within an AuthProvider');
    }

    const getDecodedToken = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const payloadBase64 = token.split('.')[1];
            if (!payloadBase64) return null;

            return JSON.parse(atob(payloadBase64));
        } catch (error) {
            console.error('Erro ao decodificar token:', error);
            return null;
        }
    };

    return getDecodedToken();
};
