import { toast } from 'sonner';

export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, { description });
  },
  error: (message: string, description?: string) => {
    toast.error(message, { description });
  },
  info: (message: string, description?: string) => {
    toast.info(message, { description });
  },
  warning: (message: string, description?: string) => {
    toast.warning(message, { description });
  },
  loading: (message: string) => {
    return toast.loading(message);
  },
  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },
};

// Helper for URL-related operations that was causing issues
export const urlToast = {
  added: (url: string) => {
    toast.success('URL Added', {
      description: `Successfully added: ${url}`,
    });
  },
  error: (message: string) => {
    toast.error('URL Error', {
      description: message,
    });
  },
  copied: () => {
    toast.success('URL Copied', {
      description: 'URL copied to clipboard',
    });
  },
};
