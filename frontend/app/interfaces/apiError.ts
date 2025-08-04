export interface ApiError {
  response?: {
    data?: {
      error?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  message?: string;
  [key: string]: any;
}