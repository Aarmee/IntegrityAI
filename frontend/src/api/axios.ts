import axios from 'axios';

let rawBase = (import.meta.env.VITE_API_GATEWAY_URL || '').trim();

if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
  rawBase = 'https://integrityai-gateway.onrender.com';
} else if (!rawBase || rawBase === 'integrityai-gateway') {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    rawBase = 'https://integrityai-gateway.onrender.com';
  } else {
    rawBase = 'http://localhost:8080';
  }
} else if (!rawBase.startsWith('http://') && !rawBase.startsWith('https://')) {
  rawBase = `https://${rawBase}`;
}

export const API_BASE_URL = rawBase;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('integrityai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('integrityai_token');
        localStorage.removeItem('integrityai_user');
        window.location.href = '/login?session_expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  let rawMsg = '';
  if (axios.isAxiosError(error)) {
    // If validation details map is returned, pick the first readable field error
    if (error.response?.data?.details && typeof error.response.data.details === 'object') {
      const details = error.response.data.details;
      const firstKey = Object.keys(details)[0];
      if (firstKey && details[firstKey]) {
        return String(details[firstKey]);
      }
    }

    if (error.response?.data?.message) {
      rawMsg = error.response.data.message;
    } else if (error.response?.data?.error) {
      rawMsg = error.response.data.error;
    } else if (typeof error.response?.data === 'string') {
      rawMsg = error.response.data;
    } else if (error.message) {
      rawMsg = error.message;
    }
  } else if (error instanceof Error) {
    rawMsg = error.message;
  }

  if (!rawMsg) {
    return 'An unexpected issue occurred. Please check your information and try again.';
  }

  // Transform technical, SQL, or database error messages into human-friendly sentences:
  const lower = rawMsg.toLowerCase();

  // Feign / Microservice connection errors (e.g. "Connection refused executing GET http://...")
  if (
    lower.includes('connection refused') ||
    lower.includes('connectexception') ||
    lower.includes('feign') ||
    lower.includes('executing get') ||
    lower.includes('executing post') ||
    lower.includes('bad gateway') ||
    lower.includes('service unavailable') ||
    lower.includes('502') ||
    lower.includes('503')
  ) {
    if (lower.includes('faculty') || lower.includes('assignments') || lower.includes('8082')) {
      return 'The Academic Faculty Service is currently synchronizing coursework. Please refresh or try again in a few moments.';
    }
    if (lower.includes('analysis') || lower.includes('8090')) {
      return 'The AI Analysis Engine is processing queued scans. Your report will be ready shortly.';
    }
    if (lower.includes('submission') || lower.includes('8083')) {
      return 'The Submission Storage Service is temporarily busy. Please re-try submitting in a moment.';
    }
    if (lower.includes('notification') || lower.includes('8084')) {
      return 'Notification delivery is queued and will update shortly.';
    }
    return 'The requested university microservice is temporarily synchronizing. Please try again in a moment.';
  }

  // Resource Not Found
  if (lower.includes('not found') || lower.includes('404')) {
    if (lower.includes('assignment')) {
      return 'The selected assignment could not be found or has been archived by faculty.';
    }
    if (lower.includes('submission')) {
      return 'The requested submission record could not be found.';
    }
    return 'The requested academic record was not found.';
  }

  // Enum or internal parsing exceptions
  if (
    lower.includes('no enum constant') ||
    lower.includes('illegalargumentexception') ||
    lower.includes('json parse error') ||
    lower.includes('httpmessagenotreadableexception')
  ) {
    return 'Unable to process action due to an unexpected format. Please refresh the page.';
  }

  // S3 or AWS storage errors
  if (lower.includes('s3') || lower.includes('amazons3') || lower.includes('bucket')) {
    return 'Cloud document storage is temporarily busy. Please retry your file upload in a moment.';
  }

  if (lower.includes('value too long') || lower.includes('character varying')) {
    return 'One of the selected options or input values exceeds the allowed length. Please shorten your selection.';
  }

  if (
    lower.includes('duplicate key') ||
    lower.includes('users_email_key') ||
    lower.includes('already registered') ||
    lower.includes('already exists')
  ) {
    return 'An account with this email address already exists. Please log in or use a different email.';
  }

  if (
    lower.includes('bad credentials') ||
    lower.includes('invalid credentials') ||
    lower.includes('invalid email or password')
  ) {
    return 'Invalid email or password. Please verify your credentials and try again.';
  }

  if (
    lower.includes('could not execute statement') ||
    lower.includes('sql') ||
    lower.includes('constraint')
  ) {
    return 'Unable to save data due to an invalid format. Please check your details and try again.';
  }

  if (lower.includes('network error') || lower.includes('err_connection_refused')) {
    return 'Unable to connect to the server. Please verify your connection or try again shortly.';
  }

  return rawMsg;
}

export default apiClient;
