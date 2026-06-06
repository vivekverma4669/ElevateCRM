'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsApi, companiesApi } from '@/lib/api';
import { Contact, Company } from '@/types';
import { toast } from '@/hooks/useToast';

export function useContacts(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: () => contactsApi.getAll(params),
    select: (r) => r.data,
    staleTime: 30 * 1000,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Contact>) => contactsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({ title: 'Contact created', description: 'New contact added successfully.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create contact.', variant: 'destructive' });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Contact> }) => contactsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({ title: 'Contact updated', description: 'Changes saved.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update contact.', variant: 'destructive' });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contactsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({ title: 'Contact deleted' });
    },
  });
}

export function useCompanies(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['companies', params],
    queryFn: () => companiesApi.getAll(params),
    select: (r) => r.data,
    staleTime: 30 * 1000,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Company>) => companiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({ title: 'Company created' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create company.', variant: 'destructive' });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Company> }) => companiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({ title: 'Company updated' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update company.', variant: 'destructive' });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => companiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({ title: 'Company deleted' });
    },
  });
}
