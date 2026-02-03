import React, { useEffect } from 'react';
import { Button } from './Button';
import { createPortal } from 'react-dom';

interface ConfirmationDialogProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'danger';
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    isOpen,
    title,
    description,
    confirmLabel = 'Conferma',
    cancelLabel = 'Annulla',
    variant = 'default',
    onConfirm,
    onCancel,
    isLoading = false,
}) => {
    // Prevent scrolling when dialog is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={!isLoading ? onCancel : undefined}
            />

            {/* Dialog Card */}
            <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 p-6 space-y-4">
                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">
                        {title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        {description}
                    </p>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'primary' : 'primary'} // Can add danger variant to Button later if needed, for now primary is purple
                        onClick={onConfirm}
                        isLoading={isLoading}
                        className={variant === 'danger' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : ''}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};
