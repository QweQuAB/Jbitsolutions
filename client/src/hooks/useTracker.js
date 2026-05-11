import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api';

const PAGE_LABELS = {
  '/': 'Services',
  '/guides': 'Guides',
  '/booking': 'Book a Service',
};

export function useTracker() {
  const location = useLocation();

  useEffect(() => {
    const label = PAGE_LABELS[location.pathname] || location.pathname;
    api.trackInteraction('pageview', label);
  }, [location.pathname]);
}

export function useTrackClick() {
  return (page, detail) => {
    api.trackInteraction('click', page, detail);
  };
}
