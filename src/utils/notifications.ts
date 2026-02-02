import type { LoanDetailsDto, OfferDetailsDto } from '../api/types';

/**
 * Notification entity type, used for enriching notification messages
 * with entity-specific details (offer message or item name).
 */
export type NotificationEntity =
    | { entityType: 'Offer'; data: OfferDetailsDto }
    | { entityType: 'Loan'; data: LoanDetailsDto };

/**
 * Mapping of notification types to their Italian base messages.
 */
export const notificationTypeMessages: Record<string, string> = {
    OfferReceivedToRequester: "Hai ricevuto un'offerta",
    OfferAcceptedToLender: 'La tua offerta è stata accettata',
    OfferRejectedToLender: 'La tua offerta è stata rifiutata',
    OfferWithdrawnToRequester: "Un'offerta è stata ritirata",
    LoanReservedToBorrower: 'Prestito riservato',
    LoanReservedToLender: 'Prestito riservato',
    LoanStartedToBorrower: 'Il prestito è iniziato',
    LoanReturnRequestedToLender: 'È stato richiesto il rientro',
    LoanReturnConfirmedToBorrower: 'Il rientro è stato confermato',
    LoanReturnConfirmedToLender: 'Il rientro è stato confermato',
    LoanReturnCanceledToLender: 'La richiesta di rientro è stata annullata',
};

/**
 * Mapping from numeric notification type values to their string names.
 * Backend sends numbers, but we need strings to look up messages.
 */
const numericTypeToName: Record<number, string> = {
    0: 'OfferReceivedToRequester',
    1: 'OfferAcceptedToLender',
    2: 'OfferRejectedToLender',
    3: 'OfferWithdrawnToRequester',
    4: 'LoanReservedToBorrower',
    5: 'LoanReservedToLender',
    6: 'LoanStartedToBorrower',
    7: 'LoanReturnRequestedToLender',
    8: 'LoanReturnConfirmedToBorrower',
    9: 'LoanReturnConfirmedToLender',
    10: 'LoanReturnCanceledToLender',
};

/**
 * Normalizes a notification type value to a string or null.
 * Handles both string and numeric values from backend.
 */
export const normalizeNotificationType = (value: unknown): string | null => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return numericTypeToName[value] ?? null;
    return null;
};

/**
 * Builds a user-facing notification message based on the notification type
 * and optional entity data.
 *
 * @param type - The notification type string (e.g., 'OfferReceivedToRequester')
 * @param entity - Optional entity data to enrich the message
 * @returns The constructed notification message in Italian
 */
export const buildNotificationMessage = (
    type: string | null,
    entity?: NotificationEntity
): string => {
    const base = type ? notificationTypeMessages[type] : undefined;
    const message = base ?? 'Hai una nuova notifica';

    return message;
};
