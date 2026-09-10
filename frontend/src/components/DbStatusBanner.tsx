'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function useDbStatus() {
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const queryClient = useQueryClient();

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const res = await fetch(`${API_URL}/health`);
      if (res.ok) {
        const data = await res.json();
        const connected = Boolean(data.dbConnected);

        if (dbConnected === false && connected) {
          window.dispatchEvent(new Event('mongodb_reconnected'));
          queryClient.invalidateQueries();
        }

        setDbConnected(connected);
      } else {
        setDbConnected(false);
      }
    } catch {
      setDbConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(
      () => { checkStatus(); },
      dbConnected === true ? 10000 : 3000
    );
    return () => clearInterval(interval);
  }, [dbConnected]);

  return { dbConnected, isChecking, checkStatus };
}

export function DbStatusBanner() {
  const { dbConnected, isChecking } = useDbStatus();

  if (dbConnected !== false) return null;

  return (
    <div className="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-7 py-2.5 text-xs text-amber-900 shadow-xs">
      <div className="flex items-center gap-2 font-medium">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 animate-pulse" />
        <span>
          <strong>MongoDB Disconnected:</strong> Waiting for local MongoDB service to start...
        </span>
      </div>
      <div className="flex items-center gap-2 text-amber-700">
        <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline text-[11px]">Auto-retrying connection...</span>
      </div>
    </div>
  );
}
