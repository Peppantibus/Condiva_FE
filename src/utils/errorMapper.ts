export interface UserFriendlyError {
    title: string;
    message: string;
    actionLabel: string;
    actionType: 'retry' | 'login' | 'dismiss';
}

export const getUserFriendlyError = (error: any): UserFriendlyError => {
    let status = 0;

    // Try to extract status code
    if (error?.status) {
        status = error.status;
    } else if (error?.response?.status) {
        status = error.response.status;
    }

    // Network Error / No Connection
    if (error?.message === 'Network Error' || status === 0) {
        // Sometimes status 0 means network error in axios/fetch wrappers
        if (navigator.onLine === false) {
            return {
                title: 'Nessuna Connessione',
                message: 'Sembra che ci sia un problema di connessione. Controlla la tua rete e riprova.',
                actionLabel: 'Riprova',
                actionType: 'retry',
            };
        }
    }

    // Auth Errors
    if (status === 401 || status === 403) {
        return {
            title: 'Accesso Negato',
            message: 'Sessione scaduta o accesso non consentito. Per favore, effettua nuovamente il login.',
            actionLabel: 'Accedi',
            actionType: 'login',
        };
    }

    // Not Found
    if (status === 404) {
        return {
            title: 'Non Trovato',
            message: 'Ops! Non siamo riusciti a trovare l\'elemento richiesto.',
            actionLabel: 'Ho capito',
            actionType: 'dismiss',
        };
    }

    // Generic Server Errors (400, 500, etc.)
    return {
        title: 'Qualcosa non va',
        message: 'Qualcosa è andato storto nei nostri sistemi. Stiamo già lavorando per risolvere, riprova tra pochi minuti.',
        actionLabel: 'Riprova',
        actionType: 'retry',
    };
};
