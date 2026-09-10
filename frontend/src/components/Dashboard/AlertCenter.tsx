import React from 'react';
import { Bell, AlertTriangle, AlertOctagon, X, CheckCircle, ArrowRight } from 'lucide-react';
import type { Alert } from '../../types';

interface AlertCenterProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  onAcknowledge?: (alertId: string) => void;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({ isOpen, onClose, alerts, onAcknowledge }) => {
  if (!isOpen) return null;

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'DANGER':
        return <AlertOctagon className="w-5 h-5 text-rose-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      default:
        return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-950 text-rose-400 border-rose-800';
      case 'DANGER':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'WARNING':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      default:
        return 'bg-blue-950 text-blue-400 border-blue-800';
    }
  };

  return (
    <div className="fixed inset-0 z-[2500] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] p-6 shadow-2xl text-white flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
              <Bell className="w-4 h-4 text-rose-400 animate-bounce" />
            </div>
            <div>
              <h2 className="text-base font-bold">Centralized Emergency & Risk Alerts</h2>
              <p className="text-xs text-slate-400">Automated corridor & supply chain disruption intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
          {alerts.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
              <div>All Northeast strategic corridors are operating within safe baseline parameters.</div>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-sm space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    {getAlertIcon(alert.severity)}
                    <span className="font-bold text-slate-100 text-sm">{alert.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSeverityBadge(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    {onAcknowledge && (
                      <button
                        onClick={() => onAcknowledge(alert.id)}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-700 cursor-pointer"
                      >
                        Ack
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed">{alert.message}</p>

                {alert.recommended_action && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex items-start space-x-2 text-[11px] text-emerald-400">
                    <ArrowRight className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span><b>Action Protocol:</b> {alert.recommended_action}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                  <span>Type: <b className="text-slate-400 font-mono">{alert.alert_type}</b></span>
                  <span>{new Date(alert.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-4 mt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition cursor-pointer"
          >
            Dismiss Panel
          </button>
        </div>
      </div>
    </div>
  );
};
