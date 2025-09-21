import { useState } from 'react';
import useSWR from 'swr';

// Types from our API
export interface ChildData {
  id: number;
  firstName: string;
  lastName: string;
  nickname?: string;
  birthdate: string;
  gender?: string;
  montessoriLevel: string;
  currentClassroom?: string;
  startDate: string;
  isActive: boolean;
  school: {
    id: number;
    name: string;
  };
  parent: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateChildData {
  firstName: string;
  lastName: string;
  nickname?: string;
  birthdate: string;
  gender?: string;
  allergies?: string;
  medicalNotes?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    canPickup: boolean;
    notes?: string;
  };
  schoolId: number;
  parentId: number;
  montessoriLevel?: string;
  currentClassroom?: string;
  startDate: string;
  canReceivePhotos?: boolean;
  canParticipateInActivities?: boolean;
  notes?: string;
}

// SWR fetcher function
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

// Hook for fetching children
export function useChildren(schoolId?: number, parentId?: number) {
  const params = new URLSearchParams();

  if (schoolId) {
    params.append('schoolId', schoolId.toString());
  }
  if (parentId) {
    params.append('parentId', parentId.toString());
  }

  const { data, error, mutate } = useSWR(
    `/api/children${params.toString() ? `?${params.toString()}` : ''}`,
    fetcher
  );

  return {
    children: data?.children || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

// Hook for fetching a single child
export function useChild(id: number) {
  const { data, error, mutate } = useSWR(
    id ? `/api/children/${id}` : null,
    fetcher
  );

  return {
    child: data?.child,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

// Hook for creating children
export function useCreateChild() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createChild = async (childData: CreateChildData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(childData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create child');
      }

      const data = await response.json();
      return data.child;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createChild,
    isLoading,
    error,
  };
}

// Hook for updating children
export function useUpdateChild(id: number) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateChild = async (childData: Partial<CreateChildData>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/children/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(childData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update child');
      }

      const data = await response.json();
      return data.child;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateChild,
    isLoading,
    error,
  };
}

// Hook for deleting children
export function useDeleteChild() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteChild = async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/children/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete child');
      }

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteChild,
    isLoading,
    error,
  };
}

// Utility function to get child's age from birthdate
export function getChildAge(birthdate: string): number {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

// Utility function to format child's full name
export function getChildDisplayName(child: ChildData): string {
  return child.nickname || `${child.firstName} ${child.lastName}`;
}
