import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
        >
            {children}
        </div>
    );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => (
    <div className={`px-5 py-4 border-b border-slate-50 ${className}`}>
        {children}
    </div>
);

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => (
    <div className={`p-5 ${className}`}>
        {children}
    </div>
);

export const CardFooter: React.FC<CardProps> = ({ children, className = '' }) => (
    <div className={`px-5 py-4 bg-slate-50 border-t border-slate-100 ${className}`}>
        {children}
    </div>
);
