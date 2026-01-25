import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    className = '',
    id,
    ...props
}) => {
    const inputId = id || props.name;

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        {icon}
                    </div>
                )}
                <input
                    id={inputId}
                    className={`
            block w-full rounded-xl border-slate-200 bg-white
            text-slate-900 placeholder-slate-400
            focus:border-primary-500 focus:ring-primary-500
            disabled:bg-slate-50 disabled:text-slate-500
            transition-colors duration-200
            ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border'}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-500 ml-1">{error}</p>
            )}
        </div>
    );
};
