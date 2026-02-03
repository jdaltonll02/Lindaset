import { useQuery, useMutation, useQueryClient } from 'react-query'
import { adminApi } from '../services/api'

export function useAdminUsers() {
  return useQuery('admin-users', adminApi.getUsers, {
    retry: false,
    onError: (error) => {
      console.log('Backend not available, using fallback data')
    }
  })
}

export function useAdminLanguages() {
  return useQuery('admin-languages', adminApi.getLanguages, {
    retry: false,
    onError: (error) => {
      console.log('Backend not available for languages')
    }
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation(adminApi.createUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-users')
    }
  })
}

export function useCreateLanguage() {
  const queryClient = useQueryClient()
  
  return useMutation(adminApi.createLanguage, {
    onSuccess: () => {
      queryClient.invalidateQueries('languages')
      queryClient.invalidateQueries('admin-languages')
    }
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  
  return useMutation(adminApi.deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-users')
    }
  })
}

export function useDeleteLanguage() {
  const queryClient = useQueryClient()
  
  return useMutation(adminApi.deleteLanguage, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-languages')
    }
  })
}