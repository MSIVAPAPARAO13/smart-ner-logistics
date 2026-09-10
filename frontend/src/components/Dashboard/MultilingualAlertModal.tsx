import React, { useState, useEffect } from 'react';
import type { LanguageOption, MultilingualAlertResponse } from '../../types';
import { fetchSupportedLanguages, fetchTranslatedAlert, broadcastMultilingualAlert } from '../../api/client';
import { 
  Globe, 
  Send, 
  Check, 
  X, 
  AlertCircle,
  Radio
} from 'lucide-react';

interface MultilingualAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAlertId?: string;
}

export const MultilingualAlertModal: React.FC<MultilingualAlertModalProps> = ({
  isOpen,
  onClose,
  initialAlertId,
}) => {
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [selectedLang, setSelectedLang] = useState<string>('as'); // default Assamese for demonstration
  const [alertData, setAlertData] = useState<MultilingualAlertResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<boolean>(false);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadLanguages();
      loadTranslation('as');
    }
  }, [isOpen]);

  const loadLanguages = async () => {
    try {
      const res = await fetchSupportedLanguages();
      setLanguages(res.languages || []);
    } catch (err) {
      console.error('Failed to load languages', err);
    }
  };

  const loadTranslation = async (langCode: string) => {
    setLoading(true);
    setBroadcastSuccess(false);
    try {
      const res = await fetchTranslatedAlert(initialAlertId, langCode);
      setAlertData(res);
      setSelectedLang(langCode);
    } catch (err) {
      console.error('Failed to translate alert', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async () => {
    setIsBroadcasting(true);
    try {
      await broadcastMultilingualAlert({
        alert_id: initialAlertId,
        target_languages: ['en', 'hi', 'as', 'bn', 'kha', 'brx'],
        channels: ['SMS_GATEWAY', 'VHF_RADIO', 'FIELD_APP_PUSH'],
      });
      setBroadcastSuccess(true);
      setTimeout(() => setBroadcastSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to broadcast', err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Multilingual Emergency Dispatcher
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                  6 NER Languages
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Disaster & supply alerts localized for state emergency teams & local drivers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4">
          {/* Language Selector Tabs */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Select Regional Language (ভাষা / भाषा / Khasi / Bodo)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {languages.map((lang) => {
                const isSelected = selectedLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => loadTranslation(lang.code)}
                    className={`p-2.5 rounded-xl border text-center transition-all duration-150 flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? 'bg-purple-600/30 border-purple-500 text-white shadow-lg ring-1 ring-purple-500'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold">{lang.native_name}</span>
                    <span className="text-[10px] text-slate-400">{lang.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Translation Box */}
          <div className="rounded-xl bg-slate-800/40 border border-slate-800 p-4 flex flex-col gap-3 min-h-[180px] justify-center">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-slate-400">Translating alert content...</span>
              </div>
            ) : alertData ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-700/50 pb-2.5">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-amber-300">{alertData.title}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                    {alertData.native_name} ({alertData.language_name})
                  </span>
                </div>

                <div className="text-sm font-medium text-slate-100 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  {alertData.message}
                </div>

                <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg flex items-start gap-2">
                  <Radio className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold block text-[11px] uppercase tracking-wider text-emerald-300">
                      Standard Field Officer Action:
                    </span>
                    <span>{alertData.translated_action_guidance}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400 text-center">No alert selected</p>
            )}
          </div>

          {/* Broadcast Status */}
          {broadcastSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                Broadcast sent to all 6 NER language channels via SMS Gateway, VHF Radio network, and Field App Push!
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Target channels: <span className="text-slate-200 font-medium">SMS, Field App, VHF Voice Alert</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleBroadcast}
              disabled={isBroadcasting}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${isBroadcasting ? 'animate-ping' : ''}`} />
              {isBroadcasting ? 'Broadcasting to 6 NER Channels...' : 'Broadcast Multi-Lang Alert'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
