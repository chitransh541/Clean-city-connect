import React, { useState, useEffect, useRef } from 'react';
import { FiFileText, FiClock, FiCheckCircle, FiPlus, FiUpload, FiMapPin, FiX, FiImage, FiVideo, FiCamera, FiTag } from 'react-icons/fi';
import Card from '../ui/Card';
import WaveButton from '../ui/WaveButton';
import Modal from '../ui/Modal';
import MapPicker from '../ui/MapPicker';
import SuccessAnimation from '../animations/SuccessAnimation';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function DashboardHome({ onStatClick }) {
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Media state – separate photo and video
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  // Camera capture
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState('photo'); // 'photo' or 'video'
  const videoStreamRef = useRef(null);
  const cameraVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const recordIntervalRef = useRef(null);

  // Location state
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [location, setLocation] = useState({ lat: null, lng: null, address: '' });
  const [gettingLocation, setGettingLocation] = useState(false);

  // Form state
  const [form, setForm] = useState({
    description: '',
    comment: '',
    aiDescription: '',
    wasteType: 'mixed',
  });
  const [labels, setLabels] = useState([]);
  const [newLabel, setNewLabel] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  async function fetchComplaints() {
    if (!user || !token) return;
    try {
      const res = await fetch(`${API_BASE}/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const complaints = data.complaints || [];
        setStats({
          total: complaints.length,
          pending: complaints.filter(c => c.status === 'pending').length,
          resolved: complaints.filter(c => c.status === 'resolved').length,
        });
      }
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    }
  }

  // ─── PHOTO UPLOAD ───
  function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    toast.success('Photo added!');
    // Trigger AI analysis
    runAIAnalysis(file);
  }

  // ─── VIDEO UPLOAD ───
  function handleVideoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }
    // Validate duration
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      if (video.duration > 30) {
        toast.error('Video must be 30 seconds or less');
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      toast.success(`Video added (${Math.round(video.duration)}s)`);
    };
    video.src = URL.createObjectURL(file);
  }

  // ─── AI ANALYSIS ───
  async function runAIAnalysis(imageFile) {
    if (!imageFile) return;
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('photo', imageFile);

      const res = await fetch(`${API_BASE}/complaints/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setForm(prev => ({
          ...prev,
          aiDescription: data.description || '',
          wasteType: data.suggestedCategory || 'mixed',
        }));
        if (data.labels?.length > 0) {
          setLabels(prev => [...new Set([...prev, ...data.labels])]);
        }
        toast.success('AI analysis complete! 🤖');
      } else {
        setForm(prev => ({ ...prev, aiDescription: 'AI analysis unavailable' }));
      }
    } catch {
      setForm(prev => ({ ...prev, aiDescription: 'AI analysis failed – describe manually' }));
    } finally {
      setAnalyzing(false);
    }
  }

  // ─── CAMERA ───
  async function startCamera(mode) {
    setCameraMode(mode);
    setShowCamera(true);
    try {
      const constraints = {
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: mode === 'video',
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoStreamRef.current = stream;
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error('Camera access denied');
      setShowCamera(false);
    }
  }

  function capturePhoto() {
    const video = cameraVideoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      toast.success('Photo captured!');
      stopCamera();
      runAIAnalysis(file);
    }, 'image/jpeg', 0.9);
  }

  function startRecording() {
    const stream = videoStreamRef.current;
    if (!stream) return;
    const chunks = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'video/webm' });
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      toast.success('Video recorded!');
      stopCamera();
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setRecording(true);
    setRecordTimer(0);
    recordIntervalRef.current = setInterval(() => {
      setRecordTimer(prev => {
        if (prev >= 29) {
          stopRecording();
          return 30;
        }
        return prev + 1;
      });
    }, 1000);
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    clearInterval(recordIntervalRef.current);
  }

  function stopCamera() {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(t => t.stop());
      videoStreamRef.current = null;
    }
    setShowCamera(false);
    setRecording(false);
    clearInterval(recordIntervalRef.current);
  }

  // ─── LOCATION ───
  function handleCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          setLocation({ lat, lng, address: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
          toast.success('📍 Location detected!');
        } catch {
          setLocation({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
        }
        setGettingLocation(false);
      },
      () => { toast.error('Could not get location'); setGettingLocation(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleMapSelect({ lat, lng, address }) {
    setLocation({ lat, lng, address });
    toast.success('📍 Location selected!');
  }

  // ─── LABELS ───
  function addLabel() {
    const val = newLabel.trim().toLowerCase();
    if (val && !labels.includes(val)) {
      setLabels(prev => [...prev, val]);
      setNewLabel('');
    }
  }

  function removeLabel(label) {
    setLabels(prev => prev.filter(l => l !== label));
  }

  // ─── SUBMIT ───
  async function handleSubmit(e) {
    e.preventDefault();
    if (!photoFile && !videoFile) {
      toast.error('Please add at least a photo or video');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      if (photoFile) formData.append('photo', photoFile);
      if (videoFile) formData.append('video', videoFile);
      formData.append('aiDescription', form.aiDescription);
      formData.append('description', form.comment);
      formData.append('wasteType', form.wasteType);
      formData.append('labels', JSON.stringify(labels));
      if (location.lat != null) formData.append('lat', location.lat);
      if (location.lng != null) formData.append('lng', location.lng);
      if (location.address) formData.append('address', location.address);

      const res = await fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setShowForm(false);
        setShowSuccess(true);
        toast.success('Complaint submitted! 🎉');
        resetForm();
        fetchComplaints();
      } else {
        toast.error(data.message || 'Failed to submit');
      }
    } catch {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setPhotoFile(null); setPhotoPreview(null);
    setVideoFile(null); setVideoPreview(null);
    setLocation({ lat: null, lng: null, address: '' });
    setForm({ description: '', comment: '', aiDescription: '', wasteType: 'mixed' });
    setLabels([]); setNewLabel('');
  }

  return (
    <div className="dashboard-home">
      {/* Stats cards */}
      <div className="dashboard-stats-grid">
        {[
          { label: 'Total Requests', value: stats.total, icon: <FiFileText />, colorClass: 'dashboard-stat-icon-wrapper--blue', status: null },
          { label: 'Pending', value: stats.pending, icon: <FiClock />, colorClass: 'dashboard-stat-icon-wrapper--amber', status: 'pending' },
          { label: 'Resolved', value: stats.resolved, icon: <FiCheckCircle />, colorClass: 'dashboard-stat-icon-wrapper--leaf', status: 'resolved' },
        ].map((stat, i) => (
          <Card key={i} interactive onClick={() => onStatClick(stat.status)} className="dashboard-stat-card">
            <div className={`dashboard-stat-icon-wrapper ${stat.colorClass}`}>
              {stat.icon}
            </div>
            <div>
              <p className="dashboard-stat-value">{stat.value}</p>
              <p className="dashboard-stat-label">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Raise complaint */}
      <div className="card dashboard-complaint-panel">
        <button onClick={() => setShowForm(!showForm)} className="dashboard-complaint-btn">
          <div className="dashboard-complaint-btn-left">
            <div className="dashboard-complaint-btn-icon"><FiPlus /></div>
            <div>
              <p className="dashboard-complaint-btn-title">Raise a Complaint</p>
              <p className="dashboard-complaint-btn-subtitle">Report waste or cleanliness issues</p>
            </div>
          </div>
          <span className={`dashboard-complaint-btn-chevron ${showForm ? 'dashboard-complaint-btn-chevron--open' : ''}`}>
            <FiPlus />
          </span>
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="dashboard-complaint-form">
            {/* ── PHOTO SECTION ── */}
            <div>
              <label className="dashboard-form-label"><FiImage style={{ marginRight: 6, verticalAlign: 'middle' }} /> Photo</label>
              {!photoPreview ? (
                <div className="media-upload-row">
                  <label className="media-upload-btn">
                    <FiUpload /> Choose File
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="dashboard-upload-input" />
                  </label>
                  <button type="button" onClick={() => startCamera('photo')} className="media-upload-btn media-upload-btn--camera">
                    <FiCamera /> Take Photo
                  </button>
                </div>
              ) : (
                <div className="dashboard-media-preview">
                  <img src={photoPreview} alt="Preview" className="dashboard-media-img" />
                  <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }} className="dashboard-media-remove">
                    <FiX className="dashboard-media-remove-icon" />
                  </button>
                  <span className="dashboard-media-badge"><FiImage /> photo</span>
                </div>
              )}
            </div>

            {/* ── VIDEO SECTION ── */}
            <div>
              <label className="dashboard-form-label"><FiVideo style={{ marginRight: 6, verticalAlign: 'middle' }} /> Video (max 30s)</label>
              {!videoPreview ? (
                <div className="media-upload-row">
                  <label className="media-upload-btn">
                    <FiUpload /> Choose File
                    <input type="file" accept="video/*" onChange={handleVideoUpload} className="dashboard-upload-input" />
                  </label>
                  <button type="button" onClick={() => startCamera('video')} className="media-upload-btn media-upload-btn--camera">
                    <FiCamera /> Record Video
                  </button>
                </div>
              ) : (
                <div className="dashboard-media-preview">
                  <video src={videoPreview} controls className="dashboard-media-video" />
                  <button type="button" onClick={() => { setVideoFile(null); setVideoPreview(null); }} className="dashboard-media-remove">
                    <FiX className="dashboard-media-remove-icon" />
                  </button>
                  <span className="dashboard-media-badge"><FiVideo /> video</span>
                </div>
              )}
            </div>

            {/* ── LOCATION ── */}
            <div>
              <label className="dashboard-form-label"><FiMapPin style={{ marginRight: 6, verticalAlign: 'middle' }} /> Location</label>
              <div className="location-row">
                <button type="button" onClick={handleCurrentLocation} disabled={gettingLocation} className="dashboard-location-btn">
                  <FiMapPin /> {gettingLocation ? 'Getting...' : 'Current Location'}
                </button>
                <button type="button" onClick={() => setShowMapPicker(true)} className="dashboard-location-btn">
                  <FiMapPin /> Choose on Map
                </button>
              </div>
              {location.address && (
                <div className="location-display">
                  <FiMapPin className="location-display-icon" />
                  <span>{location.address}</span>
                </div>
              )}
            </div>

            {/* ── AI DESCRIPTION ── */}
            <div>
              <label className="dashboard-form-label">
                AI Description {analyzing && <span className="ai-analyzing-badge">🤖 Analyzing...</span>}
                <span className="dashboard-textarea-helper">(editable)</span>
              </label>
              <textarea rows={3} value={form.aiDescription}
                onChange={e => setForm(prev => ({ ...prev, aiDescription: e.target.value }))}
                placeholder={analyzing ? 'AI is analyzing your image...' : 'Upload an image to get AI description'}
                className="input-field dashboard-textarea" />
            </div>

            {/* ── WASTE TYPE ── */}
            <div>
              <label className="dashboard-form-label">Waste Type</label>
              <div className="waste-type-row">
                {['wet', 'dry', 'solid', 'mixed'].map(type => (
                  <button
                    key={type}
                    type="button"
                    className={`waste-type-btn ${form.wasteType === type ? 'waste-type-btn--active' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, wasteType: type }))}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* ── LABELS / CATEGORIES ── */}
            <div>
              <label className="dashboard-form-label"><FiTag style={{ marginRight: 6, verticalAlign: 'middle' }} /> Categories / Labels</label>
              <div className="labels-container">
                {labels.map((label, i) => (
                  <span key={i} className="label-pill label-pill--editable">
                    {label}
                    <button type="button" onClick={() => removeLabel(label)} className="label-pill-remove">×</button>
                  </span>
                ))}
                <div className="label-input-wrapper">
                  <input
                    type="text"
                    value={newLabel}
                    onChange={e => setNewLabel(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLabel(); } }}
                    placeholder="Add label..."
                    className="label-input"
                  />
                  <button type="button" onClick={addLabel} className="label-add-btn">+</button>
                </div>
              </div>
            </div>

            {/* ── USER COMMENT ── */}
            <div>
              <label className="dashboard-form-label">Your Comments</label>
              <textarea rows={2} placeholder="Add any additional details..."
                value={form.comment}
                onChange={e => setForm(prev => ({ ...prev, comment: e.target.value }))}
                className="input-field dashboard-textarea" />
            </div>

            <WaveButton type="submit" disabled={loading} className="dashboard-submit-btn">
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </WaveButton>
          </form>
        )}
      </div>

      {/* Camera Modal */}
      <Modal isOpen={showCamera} onClose={stopCamera} title={cameraMode === 'photo' ? 'Take Photo' : 'Record Video'}>
        <div className="camera-modal">
          <video ref={cameraVideoRef} autoPlay playsInline muted={cameraMode === 'photo'} className="camera-preview" />
          <div className="camera-controls">
            {cameraMode === 'photo' ? (
              <button type="button" onClick={capturePhoto} className="camera-capture-btn">
                <FiCamera /> Capture
              </button>
            ) : (
              <>
                {!recording ? (
                  <button type="button" onClick={startRecording} className="camera-capture-btn camera-capture-btn--record">
                    ● Start Recording
                  </button>
                ) : (
                  <button type="button" onClick={stopRecording} className="camera-capture-btn camera-capture-btn--stop">
                    ■ Stop ({30 - recordTimer}s)
                  </button>
                )}
              </>
            )}
            <button type="button" onClick={stopCamera} className="camera-cancel-btn">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Map Picker Modal */}
      <MapPicker
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onSelect={handleMapSelect}
        initialLat={location.lat}
        initialLng={location.lng}
      />

      {/* Success modal */}
      <Modal isOpen={showSuccess} onClose={() => setShowSuccess(false)} title="">
        <div className="dashboard-success-modal">
          <SuccessAnimation size={100} />
          <h3 className="dashboard-success-title">Complaint Submitted!</h3>
          <p className="dashboard-success-text">Our team will review it shortly. You'll earn 50 points when it's resolved!</p>
          <WaveButton onClick={() => setShowSuccess(false)}>Back to Dashboard</WaveButton>
        </div>
      </Modal>
    </div>
  );
}
