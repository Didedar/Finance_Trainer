import React, { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'info' | 'warning' | 'error';
    duration?: number;
    onClose: () => void;
    icon?: React.ReactNode;
}

export const Toast: React.FC<ToastProps> = ({
    message,
    type = 'success',
    duration = 3000,
    onClose,
    icon
}) => {
    const [isVisible] = useState(true);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLeaving(true);
            setTimeout(onClose, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const typeStyles = {
        success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30',
        info: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-500/30',
        warning: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-500/30',
        error: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/30'
    };

    const defaultIcons = {
        success: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
        info: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        warning: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        error: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        )
    };

    if (!isVisible) return null;

    return (
        <div
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl
                ${typeStyles[type]}
                ${isLeaving ? 'animate-slide-out-right' : 'animate-slide-in-right'}
            `}
        >
            <span className="flex-shrink-0">
                {icon || defaultIcons[type]}
            </span>
            <span className="font-semibold text-lg">{message}</span>
        </div>
    );
};

// XP Toast - specialized for XP notifications
interface XPToastProps {
    xp: number;
    onClose: () => void;
}

export const XPToast: React.FC<XPToastProps> = ({ xp, onClose }) => {
    return (
        <Toast
            message={`+${xp} XP earned!`}
            type="success"
            duration={4000}
            onClose={onClose}
            icon={
                <span className="text-2xl">⭐</span>
            }
        />
    );
};
