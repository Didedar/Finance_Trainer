import React from 'react';
import { Hero } from '../components/landing/Hero';
import { AboutUs } from '../components/landing/AboutUs';
import { Functions } from '../components/landing/Functions';
import { WhyUs } from '../components/landing/WhyUs';
import { FAQ } from '../components/landing/FAQ';

export const LandingPage: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Hero />
            <Functions />
            <WhyUs />
            <AboutUs />
            <FAQ />
        </div>
    );
};
