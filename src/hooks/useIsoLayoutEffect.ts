'use client';

import { useEffect, useLayoutEffect } from 'react';

// useLayoutEffect läuft vor dem ersten Bild nach der Hydrierung. Auf dem Server (Build)
// gibt es keinen Layout-Effekt, dort genügt useEffect, der nie ausgeführt wird.
export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
