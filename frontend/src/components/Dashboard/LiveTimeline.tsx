import React from 'react';
import { Activity, AlertTriangle, CheckCircle, Info, Flame } from 'lucide-react';
import type { LiveEvent } from '../../types';

interface LiveTimelineProps {
  events: LiveEvent[];
}

export const LiveTimeline: React.FC<LiveTimelineProps> = ({ events }) => {
  const getEventIcon = (severity: string) => {
    switch (severity) {
      case 'DANGER':
        return <Flame className="w-3.5 h-3.5 text-rose-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'SUCCESS':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Info className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  const getEventBorder = (severity: string) => {
    switch (severity) {
      case 'DANGER':
        return 'border-rose-800/80 bg-rose-950/20';
      case 'WARNING':
        return 'border-amber-800/80 bg-amber-950/20';
      case 'SUCCESS':
        return 'border-emerald-800/80 bg-emerald-950/20';
      default:
        return 'border-slate-800 bg-slate-950/40';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Live Incident & Corridor Timeline
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          {events.length} Events Logged
        </span>
      </div>

      <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1 scrollbar-thin scrollbar-thumb-slate-700">
        {events.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            Awaiting corridor events. Start simulation or trigger scenario.
          </div>
        ) : (
          events.map((ev) => (
            <div
              key={ev.id}
              className={`p-2 rounded-lg border ${getEventBorder(
                ev.severity
              )} text-xs transition-all`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center space-x-1.5 font-semibold text-slate-200">
                  {getEventIcon(ev.severity)}
                  <span>{ev.title}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {ev.formatted_time || 'Just now'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 ml-5 leading-tight">{ev.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
