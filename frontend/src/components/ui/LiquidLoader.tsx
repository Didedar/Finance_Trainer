import React from 'react';

interface LiquidLoaderProps {
    /** Display message shown below the loader */
    message?: string;
    /** Subtitle/additional info shown below the main message */
    subtext?: string;
    /** Size variant: 'sm' (48px), 'md' (80px), or 'lg' (120px) */
    size?: 'sm' | 'md' | 'lg';
    /** Show orbiting particles around the blob */
    showOrbits?: boolean;
    /** Custom className for the container */
    className?: string;
}

/**
 * Premium liquid loading animation component.
 * Features a morphing blob with gradient effects, optional orbiting particles,
 * and animated text with shimmer effect.
 */
export const LiquidLoader: React.FC<LiquidLoaderProps> = ({
    message = 'Loading...',
    subtext,
    size = 'md',
    showOrbits = true,
    className = ''
}) => {
    const sizeClass = `liquid-blob--${size}`;

    return (
        <div className={`liquid-loader py-16 ${className}`}>
            {/* Blob container with optional orbits */}
            <div className="relative">
                {/* Main morphing blob */}
                <div className={`liquid-blob ${sizeClass}`} />

                {/* Orbiting particles */}
                {showOrbits && size !== 'sm' && (
                    <>
                        <div className="liquid-orbit" />
                        <div className="liquid-orbit liquid-orbit--2" />
                        <div className="liquid-orbit liquid-orbit--3" />
                    </>
                )}
            </div>

            {/* Loading text with shimmer effect */}
            {message && (
                <p className="liquid-text">{message}</p>
            )}

            {/* Subtext */}
            {subtext && (
                <p className="liquid-subtext">{subtext}</p>
            )}
        </div>
    );
};

export default LiquidLoader;
