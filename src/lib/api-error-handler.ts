import { supabase } from '@/integrations/supabase/client';

interface ApiErrorDetails {
  userFullName: string;
  apiKeyName: string;
  errorMessage: string;
  errorResponse: any;
}

export const handleApiError = async (errorDetails: ApiErrorDetails) => {
  try {
    console.log('Sending API error email:', errorDetails);
    
    await supabase.functions.invoke('send-api-error-email', {
      body: errorDetails
    });
    
    console.log('API error email sent successfully');
  } catch (error) {
    console.error('Failed to send API error email:', error);
  }
};

export const createApiErrorHandler = (apiKeyName: string) => {
  return async (errorMessage: string, errorResponse: any, userFullName?: string) => {
    await handleApiError({
      userFullName: userFullName || 'Unknown User',
      apiKeyName,
      errorMessage,
      errorResponse
    });
  };
};