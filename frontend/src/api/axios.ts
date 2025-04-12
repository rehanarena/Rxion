// api.ts
import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';

const backendUrl =
    import.meta.env.VITE_NODE_ENV === "PRODUCTION"
      ? import.meta.env.VITE_PRODUCTION_URL_BACKEND
      : import.meta.env.VITE_BACKEND_URL;

      
interface ErrorResponse {
    success: boolean;
    message: string;
  }

const api = axios.create({
  baseURL: backendUrl, 
});

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError): Promise<AxiosError> => {
    let errorMessage = 'An error occurred';

    if (error.response && error.response.data) {
      const data = error.response.data as ErrorResponse;
      if (data.message) {
        errorMessage = data.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    toast.error(errorMessage);

    return Promise.reject(error);
  }
);

export default api;
