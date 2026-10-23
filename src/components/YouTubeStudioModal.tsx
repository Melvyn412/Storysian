import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Video,
  Download,
  Play,
  Square,
  Sparkles,
  Copy,
  Check,
  Film,
  Image as ImageIcon,
  ExternalLink,
  Flame,
} from 'lucide-react';
import * as THREE from 'three';
import { VikingWorld } from '../game/VikingWorld';
import { CharacterController } from '../game/CharacterController';

interface YouTubeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  world: VikingWorld | null;
  player: CharacterController | null;
  canvasElement: HTMLCanvasElement | null;
}

interface TrailerScene {
  title: string;
  duration: number; // in seconds
  camPos: THREE.Vector3;
  targetPos: THREE.Vector3;
}

const TRAILER_SCENES: TrailerScene[] = [
  {
    title: '1. Fjord Longship Voyage (Drakkar High Seas)',
    duration: 8,
    camPos: new THREE.Vector3(38, 14, 115),
    targetPos: new THREE.Vector3(10, 3, 75),
  },
  {
    title: '2. Katfjord Village & Base Tycoon (Nordic Settlement)',
    duration: 8,
    camPos: new THREE.Vector3(12, 22, 42),
    targetPos: new THREE.Vector3(0, 3.5, 0),
  },
  {
    title: '3. Katfjord Pet Trading Post (Mythic Companions)',
    duration: 8,
    camPos: new THREE.Vector3(-6, 5.5, 30),
    targetPos: new THREE.Vector3(-12, 3.2, 22),
  },
  {
    title: '4. Naval Siege & Frost Ballista Assault (Saxon Fortress)',
    duration: 8,
    camPos: new THREE.Vector3(26, 12, 185),
    targetPos: new THREE.Vector3(38, 5, 204),
  },
  {
    title: '5. Underworld Níðhöggr Dragon Boss Lair (Niflheim Caverns)',
    duration: 8,
    camPos: new THREE.Vector3(-42, 11, -118),
    targetPos: new THREE.Vector3(-50, 4, -135),
  },
];

export const YouTubeStudioModal: React.FC<YouTubeStudioModalProps> = ({
  isOpen,
  onClose,
  world,
  player,
  canvasElement,
}) => {
  const [activeTab, setActiveTab] = useState<'trailer' | 'gameplay' | 'thumbnails' | 'seo'>('trailer');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingMode, setRecordingMode] = useState<'trailer' | 'freeform'>('trailer');
  const [recordDuration, setRecordDuration] = useState(0);
  const [trailerSceneIndex, setTrailerSceneIndex] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedVideoSize, setRecordedVideoSize] = useState<number>(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const trailerTimeoutRef = useRef<number | null>(null);

  // Copy helper
  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Clean up timer
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (trailerTimeoutRef.current) clearTimeout(trailerTimeoutRef.current);
    };
  }, []);

  // Start recording from canvas
  const startCanvasRecording = (isAutoTrailer: boolean) => {
    if (!canvasElement) {
      alert('WebGL canvas not ready for recording.');
      return;
    }

    try {
      // 60fps canvas stream
      const stream = canvasElement.captureStream(60);

      // Select mime type
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
        ? 'video/webm;codecs=vp8'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 8000000, // 8 Mbps high bitrate 1080p
      });

      recordedChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setRecordedVideoSize(blob.size);
        setIsRecording(false);

        // Reset camera override
        if (player) player.isCinematicOverride = false;
        if (world) world.clearCinematicCamera();
      };

      recorder.start(500); // 500ms chunks
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingMode(isAutoTrailer ? 'trailer' : 'freeform');
      setRecordDuration(0);
      setRecordedVideoUrl(null);

      // Start duration counter
      const startTime = Date.now();
      timerIntervalRef.current = window.setInterval(() => {
        setRecordDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 500);

      // If Auto-Trailer, execute camera sequence
      if (isAutoTrailer) {
        runTrailerSequence(0);
      }
    } catch (err) {
      console.error('Failed to start MediaRecorder:', err);
      alert('Browser does not support canvas video capture.');
    }
  };

  const runTrailerSequence = (sceneIdx: number) => {
    if (sceneIdx >= TRAILER_SCENES.length) {
      // Finished all scenes, stop recording
      stopRecording();
      return;
    }

    setTrailerSceneIndex(sceneIdx);
    const scene = TRAILER_SCENES[sceneIdx];

    if (player) player.isCinematicOverride = true;
    if (world) {
      world.setCinematicCamera(scene.camPos, scene.targetPos, sceneIdx === 0);
    }

    trailerTimeoutRef.current = window.setTimeout(() => {
      runTrailerSequence(sceneIdx + 1);
    }, scene.duration * 1000);
  };

  const stopRecording = () => {
    if (trailerTimeoutRef.current) {
      clearTimeout(trailerTimeoutRef.current);
      trailerTimeoutRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none font-sans">
      <div className="w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-900/90 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-md">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Cinzel',serif] flex items-center gap-2">
                YouTube Creator Studio &amp; Video Suite
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
                  1080p 60fps Native Capture
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Record official trailers, gameplay clips, download high-CTR thumbnails, and copy SEO tags
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isRecording) stopRecording();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-neutral-900/60 border-b border-neutral-800 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('trailer')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'trailer'
                ? 'bg-red-600 text-white shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Auto-Trailer (40s)
          </button>
          <button
            onClick={() => setActiveTab('gameplay')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'gameplay'
                ? 'bg-red-600 text-white shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            Freeform Recorder
          </button>
          <button
            onClick={() => setActiveTab('thumbnails')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'thumbnails'
                ? 'bg-red-600 text-white shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            YouTube Thumbnails (2)
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'seo'
                ? 'bg-red-600 text-white shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            SEO Description &amp; Tags
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: AUTO TRAILER RECORDER */}
          {activeTab === 'trailer' && (
            <div className="space-y-4">
              <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-400" />
                      40-Second Official Cinematic YouTube Trailer
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                      Automates 5 sweeping cinematic camera angles: Fjord Drakkar Voyage, Katfjord Village Base,
                      Pet Trading Post, Saxon Naval Siege, and the Underworld Frost Dragon Lair.
                    </p>
                  </div>

                  <div className="shrink-0">
                    {!isRecording ? (
                      <button
                        onClick={() => startCanvasRecording(true)}
                        className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-lg shadow-red-600/30 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        Record 40s Trailer Now
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-red-400 border border-red-500/50 font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer animate-pulse"
                      >
                        <Square className="w-4 h-4 fill-red-500 text-red-500" />
                        Stop Recording ({recordDuration}s / 40s)
                      </button>
                    )}
                  </div>
                </div>

                {/* Recording Progress Indicator */}
                {isRecording && recordingMode === 'trailer' && (
                  <div className="mt-4 pt-4 border-t border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-300 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
                        Active Scene: {TRAILER_SCENES[trailerSceneIndex]?.title}
                      </span>
                      <span className="font-mono text-neutral-400">{recordDuration}s / 40s</span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-red-500 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${Math.min(100, (recordDuration / 40) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Ready Video Download Card */}
              {recordedVideoUrl && (
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Trailer Video Captured &amp; Ready!</h4>
                      <p className="text-xs text-neutral-400">
                        Resolution: 1080p 60fps WebM · Size: {(recordedVideoSize / (1024 * 1024)).toFixed(1)} MB ·
                        Ready for YouTube Upload
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={recordedVideoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Preview
                    </a>
                    <a
                      href={recordedVideoUrl}
                      download="viking_realm_official_trailer.webm"
                      className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Video File (.webm)
                    </a>
                  </div>
                </div>
              )}

              {/* Scene Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                {TRAILER_SCENES.map((sc, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border text-left text-xs ${
                      isRecording && trailerSceneIndex === i
                        ? 'border-red-500 bg-red-950/30 text-white'
                        : 'border-neutral-800 bg-neutral-900/50 text-neutral-400'
                    }`}
                  >
                    <div className="font-bold text-neutral-200 truncate">{sc.title.split(' ')[0]} {sc.title.split(' ')[1]}</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">{sc.duration} Seconds</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FREEFORM GAMEPLAY RECORDER */}
          {activeTab === 'gameplay' && (
            <div className="space-y-4">
              <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5">
                <h3 className="text-base font-bold text-white">Manual Gameplay Video Capture</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Start recording when you want to showcase your own Viking combat, pet bartering, Drakkar sailing,
                  or village construction, and click Stop whenever you are finished.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {!isRecording ? (
                    <button
                      onClick={() => {
                        startCanvasRecording(false);
                        onClose(); // minimize to play freely
                      }}
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      Start Freeform Recording &amp; Play
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-red-400 border border-red-500 font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer"
                    >
                      <Square className="w-4 h-4 fill-red-500 text-red-500" />
                      Stop Recording ({recordDuration}s)
                    </button>
                  )}

                  {recordedVideoUrl && (
                    <a
                      href={recordedVideoUrl}
                      download="viking_realm_gameplay_clip.webm"
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow"
                    >
                      <Download className="w-4 h-4" />
                      Download Gameplay Video ({(recordedVideoSize / (1024 * 1024)).toFixed(1)} MB)
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: YOUTUBE THUMBNAILS */}
          {activeTab === 'thumbnails' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white font-['Cinzel',serif]">High-Click-Through YouTube Thumbnails</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Designed specifically for YouTube 16:9 1920×1080 standards with bold titles, vibrant saturation, and high action contrast.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Thumbnail 1 */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
                  <div className="aspect-video w-full bg-black relative group">
                    <img
                      src="/youtube/thumbnail_gameplay_raiders.jpeg"
                      alt="Blocky Viking Raiders YouTube Thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-neutral-950/80 px-2.5 py-1 rounded-md text-[10px] font-mono text-amber-300 border border-amber-400/40">
                      Thumbnail #1: Gameplay &amp; Raids
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between gap-3 bg-neutral-900/90 border-t border-neutral-800 flex-1">
                    <div>
                      <h4 className="text-sm font-bold text-white">BLOCKY VIKING RAIDERS</h4>
                      <p className="text-[11px] text-neutral-400">1920 × 1080 JPEG · Epic Drakkar Longship &amp; Dragon Fortress Siege</p>
                    </div>
                    <a
                      href="/youtube/thumbnail_gameplay_raiders.jpeg"
                      download="thumbnail_blocky_viking_raiders.jpeg"
                      className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download JPEG
                    </a>
                  </div>
                </div>

                {/* Thumbnail 2 */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
                  <div className="aspect-video w-full bg-black relative group">
                    <img
                      src="/youtube/thumbnail_mythical_pets_trading.jpeg"
                      alt="Mythical Pets Unlocked YouTube Thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-neutral-950/80 px-2.5 py-1 rounded-md text-[10px] font-mono text-sky-300 border border-sky-400/40">
                      Thumbnail #2: Pet Trading &amp; Guides
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between gap-3 bg-neutral-900/90 border-t border-neutral-800 flex-1">
                    <div>
                      <h4 className="text-sm font-bold text-white">MYTHICAL PETS UNLOCKED!</h4>
                      <p className="text-[11px] text-neutral-400">1920 × 1080 JPEG · Runic Raven, Golden Boar, Frost Wyrm &amp; Wolf</p>
                    </div>
                    <a
                      href="/youtube/thumbnail_mythical_pets_trading.jpeg"
                      download="thumbnail_mythical_pets_trading.jpeg"
                      className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download JPEG
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SEO TITLES, DESCRIPTION & TAGS */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white font-['Cinzel',serif]">Copy-Paste YouTube Metadata</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Optimized for YouTube search algorithms, gaming recommendations, and high CTR.
                </p>
              </div>

              {/* Video Title Option */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Recommended Video Title</span>
                  <button
                    onClick={() =>
                      handleCopy(
                        'title',
                        'I Built a Viking Empire and Unlocked the RAREST Mythic Dragon! ⚔️ (Roblox / 3D Sandbox)'
                      )
                    }
                    className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                  >
                    {copiedKey === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'title' ? 'Copied!' : 'Copy Title'}
                  </button>
                </div>
                <div className="p-2.5 bg-neutral-950 rounded-lg text-xs font-mono text-neutral-200 border border-neutral-800">
                  I Built a Viking Empire and Unlocked the RAREST Mythic Dragon! ⚔️ (Roblox / 3D Sandbox)
                </div>
              </div>

              {/* Description */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Video Description with Timestamps</span>
                  <button
                    onClick={() =>
                      handleCopy(
                        'desc',
                        `Welcome to Viking Realm: Blocky World! Today we sail the high-seas on a custom Drakkar warship, hatch 12 mythical companion beasts, barter with players at Katfjord Pet Trading Post, and lay siege to the Saxon coastal fortress with Frost Ballistas!\n\nPLAY THE GAME HERE: https://storysian.com/\nDownload on Itch.io: https://itch.io/\n\nTIMESTAMPS:\n0:00 - Launching the Drakkar Longship into the Fjord\n3:15 - Katfjord Village Tycoon & Mead Hall Feast\n7:40 - Unlocking Rarest Mythic Dragon & Pet Barter Post\n12:20 - 6-Ship Armada Fleet Rally\n16:45 - Epic Saxon Fortress Siege & Frost Ballista Battle\n21:10 - Niflheim Underworld Frost Dragon Boss Raid!\n\n#VikingRealm #Roblox #PetSimulator #Gaming #IndieGame #MultiplayerSandbox`
                      )
                    }
                    className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                  >
                    {copiedKey === 'desc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'desc' ? 'Copied!' : 'Copy Description'}
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={6}
                  value={`Welcome to Viking Realm: Blocky World! Today we sail the high-seas on a custom Drakkar warship, hatch 12 mythical companion beasts, barter with players at Katfjord Pet Trading Post, and lay siege to the Saxon coastal fortress with Frost Ballistas!\n\nPLAY THE GAME HERE: https://storysian.com/\nDownload on Itch.io: https://itch.io/\n\nTIMESTAMPS:\n0:00 - Launching the Drakkar Longship into the Fjord\n3:15 - Katfjord Village Tycoon & Mead Hall Feast\n7:40 - Unlocking Rarest Mythic Dragon & Pet Barter Post\n12:20 - 6-Ship Armada Fleet Rally\n16:45 - Epic Saxon Fortress Siege & Frost Ballista Battle\n21:10 - Niflheim Underworld Frost Dragon Boss Raid!\n\n#VikingRealm #Roblox #PetSimulator #Gaming #IndieGame #MultiplayerSandbox`}
                  className="w-full p-2.5 bg-neutral-950 rounded-lg text-xs font-mono text-neutral-300 border border-neutral-800 resize-none focus:outline-none"
                />
              </div>

              {/* YouTube Tags */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">YouTube Search Tags (Comma Separated)</span>
                  <button
                    onClick={() =>
                      handleCopy(
                        'tags',
                        'viking realm, roblox viking, blocky world, pet simulator, drakkar sailing, pet trading, sea of thieves roblox, blox fruits, indie game 2026, webgl game, norse rpg, dragon boss raid, tycoon game'
                      )
                    }
                    className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                  >
                    {copiedKey === 'tags' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'tags' ? 'Copied!' : 'Copy Tags'}
                  </button>
                </div>
                <div className="p-2.5 bg-neutral-950 rounded-lg text-xs font-mono text-neutral-400 border border-neutral-800">
                  viking realm, roblox viking, blocky world, pet simulator, drakkar sailing, pet trading, sea of thieves roblox, blox fruits, indie game 2026, webgl game, norse rpg, dragon boss raid, tycoon game
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-900/60 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>
            {isRecording ? (
              <span className="text-red-400 font-bold flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                RECORDING IN PROGRESS ({recordDuration}s) — Captured at 1080p 60fps
              </span>
            ) : (
              'Native WebGL screen capture & MediaRecorder — Zero watermarks, 100% YouTube ready'
            )}
          </span>
          <button onClick={onClose} className="hover:text-white transition">
            Close [Esc]
          </button>
        </div>
      </div>
    </div>
  );
};
