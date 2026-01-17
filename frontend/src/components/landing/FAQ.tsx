import React from 'react';
import { Accordion } from '../ui/Accordion';

export const FAQ: React.FC = () => {
    const faqItems = [
        {
            id: '1',
            title: 'Do I need to pay for the training?',
            content: 'The basic version of the simulator is completely free. We believe that financial literacy should be accessible to everyone. Premium features for advanced learning may appear in the future.'
        },
        {
            id: '2',
            title: 'What level can I start from?',
            content: 'From absolutely zero! The first "Novice" level is designed for those who have never kept a budget and do not understand finance. We explain complex things in simple language.'
        },
        {
            id: '3',
            title: 'How long do lessons take?',
            content: 'One lesson takes 5-10 minutes. You can learn at your own pace — one lesson a day or whole modules on weekends.'
        },
        {
            id: '4',
            title: 'Who creates the curriculum?',
            content: 'The program is compiled based on classic principles of financial literacy and adapted with the help of artificial intelligence for maximum clarity and relevance.'
        },
        {
            id: '5',
            title: 'Can I get a certificate?',
            content: 'After completing all 5 levels and receiving the "Master" title, you will receive a digital certificate confirming your knowledge.'
        }
    ];

    return (
        <section id="faq" className="py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/20"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100/20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-3xl mx-auto px-4 relative z-10">
                <div className="text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12">
                        Everything you wanted to know before starting.
                    </p>
                </div>

                {/* FAQ Card Container */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
                    <Accordion items={faqItems} defaultOpenId="1" />
                </div>
            </div>
        </section>
    );
};
