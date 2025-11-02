import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// User roles enum
export enum UserRole {
  SuperAdmin = 0,
  TenantAdmin = 1,
  CompanyAdmin = 2,
  Agent = 3,
  EndUser = 4,
}

// Users interface
export interface User {
  id: string
  name: string;
  email: string;
  role: UserRole;
  department: string;
}

// Pagination params
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// Status params
export interface StatusParams {
  isActive: boolean;
  isDeleted: boolean;
}

// Helper function to handle API errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Fetch users
export const fetchUsers = async (page: number, pageSize: number): Promise<User[]> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Auth/Users`, {
    credentials: 'include',
  });
  return handleResponse(response);
};

// Fetch single user by id
export const fetchUserById = async (id: number): Promise<User> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Auth/Users/${id}`, {
    credentials: 'include',
  });
  return handleResponse(response);
};

// Create user
export const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Auth/Users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(user),
  });
  return handleResponse(response);
};

// Update user
export const updateUser = async (id: number, user: Partial<User>): Promise<User> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Auth/Users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(user),
  });
  return handleResponse(response);
};

// Delete user
export const deleteUser = async (id: number): Promise<void> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Auth/Users/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

// Activate user
export const activateUser = async (id: number): Promise<User> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Auth/Users/${id}/activate`, {
    method: 'POST',
    credentials: 'include',
  });
  return handleResponse(response);
};

// Deactivate user
export const deactivateUser = async (id: number): Promise<User> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Auth/Users/${id}/deactivate`, {
    method: 'POST',
    credentials: 'include',
  });
  return handleResponse(response);
};

// Reset user password
export const resetUserPassword = async (id: number): Promise<void> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Auth/Users/${id}/reset-password`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

// Assign role to user
export const assignUserRole = async (id: number, role: number): Promise<User> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Auth/Users/${id}/role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ role }),
  });
  return handleResponse(response);
};

// Unassign role from user
export const unassignUserRole = async (id: number): Promise<User> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Auth/Users/${id}/role`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};
// Fetch users hook
export const useUsers = (page: number, pageSize: number) => {
  return useQuery<User[], Error>({
    queryKey: ['users', page, pageSize],
    queryFn: () => fetchUsers(page, pageSize),
  });
};

// Fetch single user
export const useUser = (id: number) => {
  return useQuery<User, Error>({
    queryKey: ['user', id],
    queryFn: () => fetchUserById(id),
    placeholderData: (previousData) => previousData,
  });
};

// Create user mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, Omit<User, 'id'>>({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { id: number; user: Partial<User> }>({
    mutationFn: ({ id, user }) => updateUser(id, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Delete user mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Activate user mutation
export const useActivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, number>({
    mutationFn: activateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Deactivate user mutation
export const useDeactivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, number>({
    mutationFn: deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Reset user password mutation
export const useResetUserPassword = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: resetUserPassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Assign user role mutation
export const useAssignUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { id: number; role: number }>({
    mutationFn: ({ id, role }) => assignUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Unassign user role mutation
export const useUnassignUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, number>({
    mutationFn: unassignUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

