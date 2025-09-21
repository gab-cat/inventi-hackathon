'use client';
import { AppProgressProvider as ProgressProvider } from '@bprogress/next';
import React from 'react';

export const LoadingProgressProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProgressProvider height='4px' color='#2b7fff' options={{ showSpinner: true }}>
      {children}
    </ProgressProvider>
  );
};
