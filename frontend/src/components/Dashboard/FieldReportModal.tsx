import React, { useState, useCallback } from 'react';
import { X, Send, AlertTriangle, MapPin, Camera, Upload, WifiOff, Navigation, CheckCircle2, Loader2 } from 'lucide-react';
import { submitFieldReport, uploadFieldPhoto } from '../../api/client';
import { offlineQueue } from '../../utils/offlineQueue';

interface FieldReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportSubmitted: () => void;
  isOnline: boolean;
}

/** Convert a File to a base64 data URL (persists across refresh for offline queue) */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export const FieldReportModal: React.FC<FieldReportModalProps> = ({
  isOpen,
  onClose,
  onReportSubmitted,
  isOnline,
}) => {
  const [officerName, setOfficerName] = useState('Officer P. Sharma');
  const [department, setDepartment] = useState('Assam State Disaster Management Authority');
  const [district, setDistrict] = useState('East Jaintia Hills');
  const [locationName, setLocationName] = useState('NH-6 Sonapur Tunnel Approach');
  const [incidentType, setIncidentType] = useState('LANDSLIDE');
  const [severity, setSeverity] = useState('HIGH');
  const [description, setDescription] = useState(
    'Rockfall and mud sliding across both lanes due to continuous torrential rain. Heavy machinery required for clearance.'
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'fetching' | 'acquired' | 'error'>('idle');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string>('');

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Generate local preview URL
      const objectUrl = URL.createObjectURL(file);
      setPhotoPreviewUrl(objectUrl);
      // Convert to base64 for persistent offline storage
      try {
        const b64 = await fileToBase64(file);
        setPhotoBase64(b64);
      } catch (err) {
        console.warn('Base64 conversion failed:', err);
      }
    }
  };

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation not supported by this browser.');
      setGpsStatus('error');
      return;
    }
    setGpsStatus('fetching');
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setGpsStatus('acquired');
      },
      (err) => {
        // On error or if location access denied, fall back to map-center coords for demo
        setLatitude(25.312);
        setLongitude(92.355);
        setGpsStatus('acquired');
        setGpsError(`GPS auto-location: NH-6 Sonapur zone (fallback — ${err.message})`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!latitude || !longitude) {
      alert('Please capture GPS location before submitting.');
      return;
    }
    setIsSubmitting(true);
    try {
      let photoUrl: string | undefined = undefined;
      let evidenceSource: 'FIELD_UPLOAD' | 'HISTORICAL_REFERENCE' | 'SIMULATION' | 'NO_EVIDENCE_IMAGE' = 'NO_EVIDENCE_IMAGE';
      const idempKey = `IDEMP-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      if (!isOnline) {
        // OFFLINE: Enqueue with base64 image (persists across refresh in localStorage)
        offlineQueue.enqueue({
          officer_name: officerName,
          department,
          district,
          location_name: locationName,
          latitude,
          longitude,
          incident_type: incidentType,
          severity,
          description,
          // Store base64 data URL so image survives page reload in offline queue
          photo_url: photoBase64 ?? undefined,
        });
      } else {
        // ONLINE: Upload photo first if provided, then submit
        if (selectedFile) {
          try {
            const uploadRes = await uploadFieldPhoto(selectedFile);
            photoUrl = uploadRes.photo_url;
            evidenceSource = 'FIELD_UPLOAD';
          } catch (uploadErr) {
            console.warn('Photo upload failed, submitting without photo:', uploadErr);
            evidenceSource = 'NO_EVIDENCE_IMAGE';
          }
        }
        await submitFieldReport({
          officer_name: officerName,
          department,
          district,
          location_name: locationName,
          latitude,
          longitude,
          incident_type: incidentType,
          severity,
          description,
          photo_url: photoUrl,
          evidence_source: evidenceSource,
          sync_state: 'SYNCED',
          idempotency_key: idempKey,
        });
      }

      onReportSubmitted();
      onClose();
    } catch (err) {
      console.error('Error submitting field report:', err);
      alert('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold">Submit Geo-Tagged Field Incident</h2>
              {!isOnline && (
                <div className="flex items-center space-x-1 text-[11px] text-amber-400">
                  <WifiOff className="w-3 h-3" />
                  <span>Offline Mode • Report + photo saved locally</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Reporting Official</label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Agency / Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">District</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                {['East Jaintia Hills', 'West Jaintia Hills', 'Cachar', 'Hailakandi', 'Kamrup', 'Silchar', 'Dibrugarh', 'Jorhat', 'Shillong', 'Aizawl', 'Imphal East', 'Kohima'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Location Name</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* GPS Capture — REAL navigator.geolocation */}
          <div>
            <label className="block text-slate-400 mb-1.5">GPS Coordinates</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCaptureGps}
                disabled={gpsStatus === 'fetching'}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  gpsStatus === 'acquired'
                    ? 'bg-emerald-900/50 border border-emerald-600 text-emerald-300'
                    : 'bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {gpsStatus === 'fetching' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : gpsStatus === 'acquired' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Navigation className="w-3.5 h-3.5" />
                )}
                {gpsStatus === 'fetching' ? 'Acquiring GPS…' : gpsStatus === 'acquired' ? 'GPS Acquired' : 'Capture GPS Location'}
              </button>
              {latitude && longitude && (
                <span className="font-mono text-[11px] text-emerald-400">
                  {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </span>
              )}
            </div>
            {gpsError && (
              <p className="text-amber-400 text-[10px] mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {gpsError}
              </p>
            )}
            {gpsStatus === 'idle' && (
              <p className="text-slate-500 text-[10px] mt-1">GPS required for geo-tagged report submission.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Incident Type</label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                {['LANDSLIDE', 'FLOOD', 'BRIDGE_DAMAGE', 'ROAD_BLOCKED', 'MEDICAL_EMERGENCY', 'SUPPLY_DISRUPTION', 'VEHICLE_BREAKDOWN', 'CRITICAL_INFRASTRUCTURE'].map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="CRITICAL">🔴 CRITICAL</option>
                <option value="HIGH">🟠 HIGH</option>
                <option value="MEDIUM">🟡 MEDIUM</option>
                <option value="LOW">🟢 LOW</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Photo Attachment — base64 for offline persistence */}
          <div>
            <label className="block text-slate-400 mb-1.5">
              Evidence Photo
              {!isOnline && <span className="ml-1 text-amber-400">(saved offline in base64)</span>}
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg cursor-pointer transition text-[11px] text-slate-300">
                <Camera className="w-3.5 h-3.5 text-sky-400" />
                <span>{selectedFile ? selectedFile.name : 'Attach Photo'}</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
              {photoPreviewUrl && (
                <img src={photoPreviewUrl} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-600" />
              )}
            </div>
            {photoBase64 && !isOnline && (
              <p className="text-emerald-400 text-[10px] mt-1">✓ Photo encoded for offline storage (will upload on sync)</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || gpsStatus === 'idle'}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                gpsStatus === 'idle'
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : isOnline
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isOnline ? <Send className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isSubmitting ? 'Submitting…' : isOnline ? 'Submit Report' : 'Queue Offline'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
