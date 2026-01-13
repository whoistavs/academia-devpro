
import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useTheme } from '../context/ThemeContext';

const SecurityCaptcha = ({ onValidate }) => {
    const { theme } = useTheme();

    /**
     * TEST SITE KEY - This works on localhost safely.
     * For production domains (e.g. devpro.com), you MUST register a new v2 Checkbox key at:
     * https://www.google.com/recaptcha/admin
     * and replace this value.
     */
    const SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

    const handleChange = (value) => {
        // If value is truthy, the user solved the captcha
        if (value) {
            onValidate(true);
        } else {
            onValidate(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center justify-center mb-6">
            <ReCAPTCHA
                sitekey={SITE_KEY}
                onChange={handleChange}
                theme={theme === 'dark' ? 'dark' : 'light'}
            />
            <p className="text-[10px] text-gray-400 mt-2 text-center">
                Protegido por reCAPTCHA Enterprise
            </p>
        </div>
    );
};

export default SecurityCaptcha;
