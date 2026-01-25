import React from 'react';

interface AvatarProps {
    src?: string;
    alt?: string;
    fallback: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
    src,
    alt,
    fallback,
    size = 'md',
    className = '',
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-14 h-14 text-base',
        xl: 'w-20 h-20 text-xl',
    };

    return (
        <div className={`relative inline-block rounded-full overflow-hidden bg-primary-100 text-primary-700 font-bold flex items-center justify-center border-2 border-white shadow-sm ${sizeClasses[size]} ${className}`}>
            {src ? (
                <img
                    src={src}
                    alt={alt || fallback}
                    className="w-full h-full object-cover"
                />
            ) : (
                <span>{fallback.substring(0, 2).toUpperCase()}</span>
            )}
        </div>
    );
};
