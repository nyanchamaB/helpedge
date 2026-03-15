"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface NavigationContextType {
  activePage: string;
  pageParams: Record<string, string>;
  navigateTo: (page: string, params?: Record<string, string>) => void;
  pageTitle: string;
  pageDescription: string;
  setPageInfo: (title: string, description: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Helper function to extract params from dynamic routes
function extractParamsFromPath(path: string): Record<string, string> {
  const params: Record<string, string> = {};

  // Define known dynamic route patterns
  const patterns = [
    { pattern: /^\/tickets\/([^\/]+)$/, paramNames: ['id'] },
    { pattern: /^\/portal\/ticket\/([^\/]+)$/, paramNames: ['id'] },
    { pattern: /^\/service-categories\/([^\/]+)\/edit$/, paramNames: ['id'] },
    { pattern: /^\/service-categories\/([^\/]+)$/, paramNames: ['id'] },
  ];

  for (const { pattern, paramNames } of patterns) {
    const match = path.match(pattern);
    if (match) {
      // Extract matched groups and map to param names
      paramNames.forEach((name, index) => {
        params[name] = match[index + 1];
      });
      break;
    }
  }

  return params;
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [activePage, setActivePage] = useState('/dashboard');
  const [pageParams, setPageParams] = useState<Record<string, string>>({});
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [pageDescription, setPageDescription] = useState('Overview of your help desk metrics');

  // Initialize from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1); // Remove #
    if (hash) {
      // Parse route and params from hash (e.g., #/tickets/123?param=value)
      const [route, queryString] = hash.split('?');
      const params: Record<string, string> = {};

      // Extract params from query string
      if (queryString) {
        queryString.split('&').forEach(pair => {
          const [key, value] = pair.split('=');
          if (key && value) {
            params[key] = decodeURIComponent(value);
          }
        });
      }

      // Also extract params from dynamic route segments (e.g., /tickets/123 -> {id: '123'})
      const extractedParams = extractParamsFromPath(route);
      const mergedParams = { ...extractedParams, ...params }; // Query params override path params

      setActivePage(route || '/dashboard');
      setPageParams(mergedParams);
    }
  }, []);

  const navigateTo = useCallback((page: string, params?: Record<string, string>) => {
    setActivePage(page);

    // If params not provided, try to extract from path (for dynamic routes like /tickets/123)
    const extractedParams = params || extractParamsFromPath(page);
    setPageParams(extractedParams);

    // Update URL hash for bookmarking without page reload
    let hashUrl = `#${page}`;
    // Only add query string if params were explicitly provided (not auto-extracted)
    if (params && Object.keys(params).length > 0) {
      const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      hashUrl += `?${queryString}`;
    }
    window.history.pushState(null, '', hashUrl);
  }, []);

  const setPageInfo = useCallback((title: string, description: string) => {
    setPageTitle(title);
    setPageDescription(description);
  }, []);

  return (
    <NavigationContext.Provider value={{ activePage, pageParams, navigateTo, pageTitle, pageDescription, setPageInfo }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
