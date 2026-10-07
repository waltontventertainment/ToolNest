import React, { useState, useEffect, useRef } from 'react';
import { ToolPanel } from '../lib/toolkit';

export const Stopwatch: React.FC = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<{lapTime: number, totalTime: number}[]>([]);
  
  const timerRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      lastUpdateRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        const now = Date.now();
        const delta = now - lastUpdateRef.current;
        setTime(prev => prev + delta);
        lastUpdateRef.current = now;
      }, 10);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  const recordLap = () => {
    const lastTotalTime = laps.length > 0 ? laps[0].totalTime : 0;
    const lapTime = time - lastTotalTime;
    setLaps([{ lapTime, totalTime: time }, ...laps]);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <ToolPanel className="text-center py-10 space-y-8">
        <div className="text-6xl sm:text-8xl font-display font-bold tabular-nums text-foreground tracking-tight">
          {formatTime(time)}
        </div>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={toggleTimer}
            className={`px-8 py-3 rounded-full font-bold text-lg transition-brand ${isRunning ? 'bg-warning text-warning-foreground hover:bg-warning/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
          >
            {isRunning ? 'Pause' : (time === 0 ? 'Start' : 'Resume')}
          </button>
          
          <button
            onClick={isRunning ? recordLap : resetTimer}
            className="px-8 py-3 rounded-full font-bold text-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-brand"
          >
            {isRunning ? 'Lap' : 'Reset'}
          </button>
        </div>
      </ToolPanel>

      {laps.length > 0 && (
        <ToolPanel className="p-0 overflow-hidden">
          <div className="max-h-[300px] overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b">
                <tr>
                  <th className="px-6 py-3 font-medium">Lap</th>
                  <th className="px-6 py-3 font-medium">Lap Times</th>
                  <th className="px-6 py-3 font-medium">Overall Time</th>
                </tr>
              </thead>
              <tbody>
                {laps.map((lap, idx) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-secondary/20">
                    <td className="px-6 py-3 font-medium text-muted-foreground">
                      {laps.length - idx}
                    </td>
                    <td className="px-6 py-3 font-mono tabular-nums">
                      {formatTime(lap.lapTime)}
                    </td>
                    <td className="px-6 py-3 font-mono tabular-nums text-foreground">
                      {formatTime(lap.totalTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ToolPanel>
      )}
    </div>
  );
};
