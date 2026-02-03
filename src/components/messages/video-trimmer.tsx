'use client';

import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Scissors, Play, Pause, RotateCcw, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/utils/media-compression';

interface VideoTrimmerProps {
  file: File;
  maxDuration: number; // in seconds
  onComplete: (trimmedFile: File) => void;
  onCancel: () => void;
}

export function VideoTrimmer({ file, maxDuration, onComplete, onCancel }: VideoTrimmerProps) {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Initialize video
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Load FFmpeg
  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const ffmpeg = new FFmpeg();
        ffmpegRef.current = ffmpeg;

        ffmpeg.on('log', ({ message }) => {
          console.log('FFmpeg log:', message);
        });

        ffmpeg.on('progress', ({ progress: prog }) => {
          setProgress(Math.round(prog * 100));
        });

        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        setFfmpegLoaded(true);
      } catch (err) {
        console.error('Failed to load FFmpeg:', err);
        setError('Failed to load video editor. Please try again.');
      }
    };

    loadFFmpeg();
  }, []);

  // Set video metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      setVideoDuration(duration);
      setEndTime(Math.min(duration, maxDuration));
    }
  };

  // Update current time
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

      // Stop at end time
      if (time >= endTime) {
        videoRef.current.pause();
        setIsPlaying(false);
        videoRef.current.currentTime = startTime;
      }
    }
  };

  // Play/Pause toggle
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Reset to start
  const resetVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
      setCurrentTime(startTime);
    }
  };

  // Handle timeline click
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !videoRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * videoDuration;

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Trim video
  const handleTrim = async () => {
    if (!ffmpegRef.current || !ffmpegLoaded) {
      setError('Video editor not ready. Please wait.');
      return;
    }

    const trimDuration = endTime - startTime;
    if (trimDuration > maxDuration) {
      setError(`Selected duration is too long. Maximum is ${maxDuration} seconds.`);
      return;
    }

    if (trimDuration < 1) {
      setError('Selected duration is too short. Minimum is 1 second.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const ffmpeg = ffmpegRef.current;

      // Write input file
      await ffmpeg.writeFile('input.mp4', await fetchFile(file));

      // Trim video with FFmpeg
      await ffmpeg.exec([
        '-i',
        'input.mp4',
        '-ss',
        startTime.toString(),
        '-t',
        trimDuration.toString(),
        '-c:v',
        'libx264',
        '-c:a',
        'aac',
        '-preset',
        'ultrafast',
        '-crf',
        '28',
        'output.mp4',
      ]);

      // Read output file
      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data as BlobPart], { type: 'video/mp4' });
      const trimmedFile = new File([blob], file.name, { type: 'video/mp4' });

      // Clean up
      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('output.mp4');

      onComplete(trimmedFile);
    } catch (err) {
      console.error('Failed to trim video:', err);
      setError('Failed to trim video. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const selectedDuration = endTime - startTime;
  const isValidDuration = selectedDuration > 0 && selectedDuration <= maxDuration;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-2xl border border-[#333333] bg-[#0f0f0f] p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
              <Scissors className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Trim Video</h2>
              <p className="text-sm text-gray-400">Select up to {maxDuration} seconds to share</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isProcessing}
            className="text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Video Preview */}
        <div className="mb-6">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
            <video
              ref={videoRef}
              src={videoUrl}
              className="h-full w-full object-contain"
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
            />

            {/* Overlay controls */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100">
              <button
                onClick={togglePlayPause}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition-transform hover:scale-110"
              >
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="ml-1 h-8 w-8" />}
              </button>
            </div>

            {/* Duration badge */}
            <div className="absolute bottom-4 right-4 rounded-lg bg-black/70 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              {formatDuration(currentTime)} / {formatDuration(videoDuration)}
            </div>
          </div>
        </div>

        {/* Timeline & Controls */}
        <div className="mb-6 space-y-4">
          {/* Timeline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Timeline</span>
              <span
                className={cn('font-medium', isValidDuration ? 'text-green-400' : 'text-red-400')}
              >
                {formatDuration(selectedDuration)} selected
                {selectedDuration > maxDuration && ` (max ${maxDuration}s)`}
              </span>
            </div>

            <div
              ref={timelineRef}
              onClick={handleTimelineClick}
              className="relative h-20 cursor-pointer rounded-lg border border-[#333333] bg-[#1a1a1a]"
            >
              {/* Selected range */}
              <div
                className="absolute top-0 h-full border-l-2 border-r-2 border-blue-500 bg-blue-500/30"
                style={{
                  left: `${(startTime / videoDuration) * 100}%`,
                  width: `${((endTime - startTime) / videoDuration) * 100}%`,
                }}
              />

              {/* Current time indicator */}
              <div
                className="absolute top-0 h-full w-0.5 bg-white shadow-lg shadow-white/50"
                style={{ left: `${(currentTime / videoDuration) * 100}%` }}
              />

              {/* Start handle */}
              <div
                className="absolute top-0 h-full w-1 cursor-ew-resize bg-blue-500 hover:w-2"
                style={{ left: `${(startTime / videoDuration) * 100}%` }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const handleMove = (moveEvent: MouseEvent) => {
                    if (!timelineRef.current) return;
                    const rect = timelineRef.current.getBoundingClientRect();
                    const x = moveEvent.clientX - rect.left;
                    const percentage = Math.max(0, Math.min(1, x / rect.width));
                    const newStartTime = percentage * videoDuration;
                    if (newStartTime < endTime - 1) {
                      setStartTime(newStartTime);
                      if (videoRef.current) {
                        videoRef.current.currentTime = newStartTime;
                      }
                    }
                  };
                  const handleUp = () => {
                    document.removeEventListener('mousemove', handleMove);
                    document.removeEventListener('mouseup', handleUp);
                  };
                  document.addEventListener('mousemove', handleMove);
                  document.addEventListener('mouseup', handleUp);
                }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-blue-500 px-2 py-1 text-xs text-white">
                  {formatDuration(startTime)}
                </div>
              </div>

              {/* End handle */}
              <div
                className="absolute top-0 h-full w-1 cursor-ew-resize bg-blue-500 hover:w-2"
                style={{ left: `${(endTime / videoDuration) * 100}%` }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const handleMove = (moveEvent: MouseEvent) => {
                    if (!timelineRef.current) return;
                    const rect = timelineRef.current.getBoundingClientRect();
                    const x = moveEvent.clientX - rect.left;
                    const percentage = Math.max(0, Math.min(1, x / rect.width));
                    const newEndTime = percentage * videoDuration;
                    if (newEndTime > startTime + 1 && newEndTime <= videoDuration) {
                      setEndTime(newEndTime);
                    }
                  };
                  const handleUp = () => {
                    document.removeEventListener('mousemove', handleMove);
                    document.removeEventListener('mouseup', handleUp);
                  };
                  document.addEventListener('mousemove', handleMove);
                  document.addEventListener('mouseup', handleUp);
                }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-blue-500 px-2 py-1 text-xs text-white">
                  {formatDuration(endTime)}
                </div>
              </div>
            </div>
          </div>

          {/* Playback controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetVideo}
              disabled={isProcessing}
              className="text-gray-400 hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={togglePlayPause}
              disabled={isProcessing}
              className="text-white hover:bg-white/10"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Processing video...</span>
              <span className="text-blue-400">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#1a1a1a]">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isProcessing}
            className="text-gray-400 hover:bg-white/10 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleTrim}
            disabled={!ffmpegLoaded || !isValidDuration || isProcessing}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Trim & Continue
              </>
            )}
          </Button>
        </div>

        {/* Loading state */}
        {!ffmpegLoaded && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading video editor...
          </div>
        )}
      </div>
    </div>
  );
}
