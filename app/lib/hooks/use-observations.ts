import { useEffect, useState } from 'react';
import useSWR from 'swr';

// Types from our API
export interface ObservationData {
  id: number;
  title: string;
  description: string;
  montessoriArea: string;
  activityType?: string;
  workCycle?: string;
  skillsDemonstrated?: any[];
  socialInteraction?: string;
  childInterest?: string;
  concentrationLevel?: string;
  independenceLevel?: string;
  nextSteps?: string;
  hasPhoto: boolean;
  hasVideo: boolean;
  observationDate: string;
  tags?: string[];
  createdAt: string;
  child: {
    id: number;
    firstName: string;
    lastName: string;
  };
  teacher: {
    id: number;
    name: string;
  };
}

export interface CreateObservationData {
  childId: number;
  title: string;
  description: string;
  montessoriArea: string;
  activityType?: string;
  workCycle?: 'Morning' | 'Afternoon';
  skillsDemonstrated?: any[];
  socialInteraction?:
    | 'Individual'
    | 'Small Group'
    | 'Large Group'
    | 'Peer to Peer';
  childInterest?: 'High' | 'Medium' | 'Low';
  concentrationLevel?: 'Deep' | 'Moderate' | 'Brief';
  independenceLevel?: 'Independent' | 'Guided' | 'Assisted';
  nextSteps?: string;
  materialsUsed?: string[];
  hasPhoto?: boolean;
  hasVideo?: boolean;
  mediaUrls?: string[];
  isVisibleToParents?: boolean;
  isConfidential?: boolean;
  observationDate: string;
  tags?: string[];
}

// SWR fetcher function
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

// Hook for fetching observations
export function useObservations(childId?: number, limit = 20, offset = 0) {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (childId) {
    params.append('childId', childId.toString());
  }

  const { data, error, mutate } = useSWR(
    `/api/observations?${params.toString()}`,
    fetcher
  );

  return {
    observations: data?.observations || [],
    total: data?.total || 0,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

// Hook for fetching a single observation
export function useObservation(id: number) {
  const { data, error, mutate } = useSWR(
    id ? `/api/observations/${id}` : null,
    fetcher
  );

  return {
    observation: data?.observation,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

// Hook for creating observations
export function useCreateObservation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createObservation = async (observationData: CreateObservationData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/observations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(observationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create observation');
      }

      const data = await response.json();
      return data.observation;
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
    createObservation,
    isLoading,
    error,
  };
}

// Hook for updating observations
export function useUpdateObservation(id: number) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateObservation = async (
    observationData: Partial<CreateObservationData>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/observations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(observationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update observation');
      }

      const data = await response.json();
      return data.observation;
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
    updateObservation,
    isLoading,
    error,
  };
}

// Hook for deleting observations
export function useDeleteObservation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteObservation = async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/observations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete observation');
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
    deleteObservation,
    isLoading,
    error,
  };
}

// Hook for observation statistics
export function useObservationStats() {
  const { observations } = useObservations();

  const stats = {
    total: observations.length,
    byArea: {} as Record<string, number>,
    byInterest: {} as Record<string, number>,
    thisWeek: 0,
  };

  // Calculate statistics
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  observations.forEach((obs: ObservationData) => {
    // Count by Montessori area
    if (obs.montessoriArea) {
      stats.byArea[obs.montessoriArea] =
        (stats.byArea[obs.montessoriArea] || 0) + 1;
    }

    // Count by child interest
    if (obs.childInterest) {
      stats.byInterest[obs.childInterest] =
        (stats.byInterest[obs.childInterest] || 0) + 1;
    }

    // Count this week
    if (new Date(obs.observationDate) >= weekAgo) {
      stats.thisWeek++;
    }
  });

  return stats;
}
