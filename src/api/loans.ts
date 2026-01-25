import { api } from './client';
import { CreateLoanRequestDto, LoanDetailsDto, LoanListItemDto, UpdateLoanRequestDto } from './types';

export const listLoans = () => api.get<LoanListItemDto[]>('/api/loans');

export const getLoan = (id: string) => api.get<LoanDetailsDto>(`/api/loans/${id}`);

export const createLoan = (payload: CreateLoanRequestDto) => api.post<LoanDetailsDto>('/api/loans', payload);

export const updateLoan = (id: string, payload: UpdateLoanRequestDto) =>
  api.put<LoanDetailsDto>(`/api/loans/${id}`, payload);

export const deleteLoan = (id: string) => api.del<void>(`/api/loans/${id}`);

export const startLoan = (id: string) => api.post<LoanDetailsDto>(`/api/loans/${id}/start`);

export const returnLoan = (id: string) => api.post<LoanDetailsDto>(`/api/loans/${id}/return`);
