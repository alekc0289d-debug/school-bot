import { useState } from 'react';
import toast from 'react-hot-toast';

export function useAsync() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (asyncFn, options = {}) => {
    const {
      loadingMessage,
      successMessage,
      errorMessage = 'Xatolik yuz berdi',
    } = options;

    setLoading(true);
    setError(null);

    const toastId = loadingMessage ? toast.loading(loadingMessage) : null;

    try {
      const result = await asyncFn();

      if (successMessage) {
        toast.success(successMessage, { id: toastId });
      } else if (toastId) {
        toast.dismiss(toastId);
      }

      return { data: result, error: null };
    } catch (err) {
      setError(err);
      toast.error(`${errorMessage}`, { id: toastId });
      console.error('useAsync xatolik:', err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, execute };
}