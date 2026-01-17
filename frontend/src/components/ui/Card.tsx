import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    gridHeader?: boolean;
    padding?: boolean;
    style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    gridHeader = false,
    padding = true,
    style
}) => {
    return (
        <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 overflow-hidden ${className}`} style={style}>
            {gridHeader && (
                <div className="h-6 w-full bg-gray-50 border-b border-gray-100 relative opacity-60">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'linear-gradient(90deg, #e5e7eb 1px, transparent 1px), linear-gradient(#e5e7eb 1px, transparent 1px)',
                        backgroundSize: '16px 16px'
                    }}></div>
                </div>
            )}
            <div className={padding ? 'p-6' : ''}>
                {children}
            </div>
        </div>
    );
};
