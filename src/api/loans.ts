import { apiClient } from './client';
import { CreateLoanRequestDto, UpdateLoanRequestDto } from './types';

export const listLoans = () => apiClient.loansAll();

export const getLoan = (id: string) => apiClient.loansGET(id);

export const createLoan = (payload: CreateLoanRequestDto) => apiClient.loansPOST(payload as any);

export const updateLoan = (id: string, payload: UpdateLoanRequestDto) =>
  apiClient.loansPUT(id, payload as any);

export const deleteLoan = (id: string) => apiClient.loansDELETE(id);

export const startLoan = (id: string) => apiClient.start(id);

export const returnLoan = (id: string) => apiClient['return'](id);
