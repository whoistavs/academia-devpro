
import React, { useEffect } from 'react';

/**
 * reCAPTCHA v3 Implementation
 * This component is "invisible". It handles token generation via the global grecaptcha object.
 */
const SecurityCaptcha = ({ onValidate }) => {
    
    // In v3, we usually generate a token on-demand (e.g. on form submission)
    // However, to maintain compatibility with the parent components that expect 
    // a token in state, we can generate an initial one or provide a function.
    
    useEffect(() => {
        const generateToken = () => {
            if (window.grecaptcha) {
                window.grecaptcha.ready(() => {
                    window.grecaptcha.execute('6Ld9gI0sAAAAAHnF3WR4wfN_ExOkehjbsQwkZDCT', { action: 'homepage' })
                        .then((token) => {
                            onValidate(token);
                        });
                });
            }
        };

        // Generate an initial token
        generateToken();
        
        // Refresh token every 2 minutes (reCAPTCHA tokens expire)
        const interval = setInterval(generateToken, 1000 * 120);
        return () => clearInterval(interval);
    }, [onValidate]);

    return (
        <div className="text-[10px] text-gray-400 mt-2 text-center mb-4">
            Este site é protegido pelo reCAPTCHA e a 
            <a href="https://policies.google.com/privacy" className="underline ml-1">Privacidade</a> e
            <a href="https://policies.google.com/terms" className="underline ml-1">Termos de Serviço</a> do Google se aplicam.
        </div>
    );
};

export default SecurityCaptcha;
