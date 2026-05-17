import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return <Loader2 className="w-5 h-5 animate-spin text-white inline-block" />;
};
