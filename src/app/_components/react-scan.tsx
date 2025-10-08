'use client';

import { useEffect } from 'react';
import { scan } from 'react-scan';

export function ReactScan() {
  useEffect(() => {
    scan({
      enabled: true,
      log: true, // logs render info to console (default: false)
    });
  }, []);

  return null;
}
