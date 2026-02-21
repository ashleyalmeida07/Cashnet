'use client';

import React, { useState, useEffect } from 'react';
import { useSimulationStore } from '@/store/simulationStore';

const CascadeBanner: React.FC = () => {
  const cascadeTriggered = useSimulationStore((state) => state.cascadeTriggered);
  const setCascadeTriggered = useSimulationStore((state) => state.setCascadeTriggered);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (cascadeTriggered) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setCascadeTriggered(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [cascadeTriggered, setCascadeTriggered]);

  if (!visible) return null;

  return (
    <div className="fixed top-16 md:top-16 left-0 right-0 z-20 md:left-60">
      <div className="animate-cascadeFlash border-b-2 border-[#ff3860] bg-[rgba(255,56,96,0.15)] backdrop-blur-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-blink">🚨</span>
            <div>
              <h2 className="font-mono font-bold text-danger text-lg">
                CASCADE EVENT DETECTED
              </h2>
              <p className="text-sm text-danger/80 font-mono mt-1">
                Critical system failure - liquidation cascade in progress
              </p>
            </div>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="px-3 py-1 text-danger hover:bg-[rgba(255,56,96,0.2)] rounded transition-colors text-sm font-mono"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};

export default CascadeBanner;
