import React, { useState } from 'react';

interface AccordionItem {
    id: string;
    title: string;
    content: React.ReactNode;
}

interface AccordionProps {
    items: AccordionItem[];
    defaultOpenId?: string;
    className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
    items,
    defaultOpenId,
    className = ''
}) => {
    const [openId, setOpenId] = useState<string | undefined>(defaultOpenId);

    const toggle = (id: string) => {
        setOpenId(openId === id ? undefined : id);
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {items.map((item) => (
                <div
                    key={item.id}
                    className="border border-gray-200 rounded-2xl bg-white overflow-hidden transition-all duration-200"
                >
                    <button
                        onClick={() => toggle(item.id)}
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                        <span className="text-lg font-medium text-gray-900">{item.title}</span>
                        <span className={`transform transition-transform duration-200 ${openId === item.id ? 'rotate-180' : ''}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9L12 15L18 9" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                    </button>

                    <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${openId === item.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                            }`}
                    >
                        <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-100 mt-2">
                            {item.content}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
