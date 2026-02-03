import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { UserFriendlyError, getUserFriendlyError } from '../../utils/errorMapper';
import { useNavigate } from 'react-router-dom';

interface ErrorDialogProps {
    error: unknown;
    onClear: () => void;
}

export const ErrorDialog: React.FC<ErrorDialogProps> = ({ error, onClear }) => {
    const [errorConfig, setErrorConfig] = useState<UserFriendlyError | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (error) {
            const config = getUserFriendlyError(error);
            setErrorConfig(config);
            // Disable body scroll
            document.body.style.overflow = 'hidden';
        } else {
            setErrorConfig(null);
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [error]);

    if (!errorConfig) return null;

    const handleAction = () => {
        if (errorConfig.actionType === 'login') {
            navigate('/login');
        } else if (errorConfig.actionType === 'retry') {
            window.location.reload();
        }
        // For 'dismiss' or after action, clear error
        onClear();
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[10px] animate-in fade-in duration-300"
                onClick={onClear}
            />

            {/* Dialog Card / Bottom Sheet */}
            <div className="relative bg-white w-full max-w-sm rounded-[32px] sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300 p-6 space-y-5 text-center">

                {/* Warning Icon */}
                <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-red-500 text-xl font-bold">!</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">
                        {errorConfig.title}
                    </h3>
                    <p className="text-slate-500 text-base leading-relaxed">
                        {errorConfig.message}
                    </p>
                </div>

                <div className="pt-2">
                    <Button
                        fullWidth
                        size="lg"
                        className="bg-[#7B39ED] hover:bg-[#6A32C9] text-white rounded-xl py-3 shadow-lg shadow-purple-500/20"
                        onClick={handleAction}
                    >
                        {errorConfig.actionLabel}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};
