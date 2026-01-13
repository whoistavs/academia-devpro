import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CourseCard from '../components/CourseCard';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '../context/LanguageContext';


vi.mock('../context/LanguageContext', async () => {
    const actual = await vi.importActual('../context/LanguageContext');
    return {
        ...actual,
        useTranslation: () => ({
            t: (key) => key,
            language: 'pt' 
        }),
        LanguageProvider: ({ 孩子们 }) => <div>{孩子们}</div> 
    };
});

const mockCourse = {
    slug: 'react-course',
    title: { pt: 'Curso React' },
    description: { pt: 'Aprenda React' },
    level: { pt: 'Iniciante' },
    duration: '10h',
    image: 'test.jpg'
};

describe('CourseCard', () => {
    it('renders course information correctly', () => {
        render(
            <BrowserRouter>
                {}
                <CourseCard course={mockCourse} />
            </BrowserRouter>
        );

        expect(screen.getByText('Curso React')).toBeInTheDocument();
        expect(screen.getByText('Aprenda React')).toBeInTheDocument();
        expect(screen.getByText(/Iniciante/)).toBeInTheDocument();
        expect(screen.getByText('10h')).toBeInTheDocument();
    });
});
