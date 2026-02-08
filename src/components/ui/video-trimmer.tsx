'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, Pause, Scissors, Volume2, VolumeX } from 'lucide-react';

interface VideoTrimmerProps {
  videoFile: File;
  maxDuration: number;
  onTrim: (startTime: number, endTime: number, duration: number) => void;
  onCancel: () => void;
  open: boolean;
}

export function VideoTrimmer({
  videoFile,
  maxDuration,
  onTrim,
  onCancel,
  open,
}: VideoTrimmerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ type: 'start' | 'end' | null; startX: number; initialValue: number }>({
    type: null,
    startX: 0,
    initialValue: 0,
  });
  
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(maxDuration);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);

// eslint-disable-next-line react-hooks/set-state-in-effect
          setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [videoFile]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      const videoDuration = video.duration;
      setDuration(videoDuration);
      setEndTime(Math.min(maxDuration, videoDuration));
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.currentTime >= endTime) {
        video.pause();
        setIsPlaying(false);
        video.currentTime = startTime;
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [endTime, startTime, maxDuration]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      if (video.currentTime < startTime || video.currentTime >= endTime) {
        video.currentTime = startTime;
      }
      video.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const getTimeFromX = (clientX: number): number => {
    if (!timelineRef.current || duration === 0) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return percentage * duration;
  };

  // Pointer down on handle
  const handlePointerDown = (e: React.PointerEvent, type: 'start' | 'end') => {
    e.preventDefault();
    e.stopPropagation();
    
    // Capture the pointer to this element
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    
    dragRef.current = {
      type,
      startX: e.clientX,
      initialValue: type === 'start' ? startTime : endTime,
    };
    setIsDragging(true);
  };

  // Pointer move while dragging
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragRef.current.type) return;
    
    e.preventDefault();
    const time = getTimeFromX(e.clientX);
    
    if (dragRef.current.type === 'start') {
      let newStart = Math.max(0, Math.min(time, endTime - 0.5));
      // Enforce max duration
      if (endTime - newStart > maxDuration) {
        newStart = endTime - maxDuration;
      }
      setStartTime(newStart);
      
      // Update video position
      if (videoRef.current && currentTime < newStart) {
        videoRef.current.currentTime = newStart;
        setCurrentTime(newStart);
      }
    } else if (dragRef.current.type === 'end') {
      let newEnd = Math.max(startTime + 0.5, Math.min(time, duration));
      // Enforce max duration
      if (newEnd - startTime > maxDuration) {
        newEnd = startTime + maxDuration;
      }
      setEndTime(newEnd);
      
      // Update video position
      if (videoRef.current && currentTime > newEnd) {
        videoRef.current.currentTime = newEnd;
        setCurrentTime(newEnd);
      }
    }
  };

  // Pointer up - stop dragging
  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      dragRef.current.type = null;
      setIsDragging(false);
    }
  };

  // Click on timeline to seek
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    
    // Check if click is on a handle
    const target = e.target as HTMLElement;
    if (target.closest('[data-handle]')) return;
    
    const time = getTimeFromX(e.clientX);
    const clampedTime = Math.max(startTime, Math.min(endTime, time));
    
    if (videoRef.current) {
      videoRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms}`;
  };

  const handleTrim = () => {
    onTrim(startTime, endTime, endTime - startTime);
  };

  const selectedDuration = endTime - startTime;
  const isValidSelection = selectedDuration > 0 && selectedDuration <= maxDuration;

  const startPercent = duration > 0 ? (startTime / duration) * 100 : 0;
  const endPercent = duration > 0 ? (endTime / duration) * 100 : 100;
  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5" />
            Trim Video - Select up to {maxDuration} seconds
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video Player */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              playsInline
              muted={isMuted}
              onClick={togglePlayPause}
            />
            
            {/* Play/Pause Overlay */}
            <button
              onClick={togglePlayPause}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all"
            >
              {isPlaying ? (
                <Pause className="h-8 w-8 text-white" />
              ) : (
                <Play className="h-8 w-8 text-white ml-1" />
              )}
            </button>

            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className="absolute bottom-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-all"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-white" />
              ) : (
                <Volume2 className="h-5 w-5 text-white" />
              )}
            </button>

            {/* Current Time Display */}
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/70 rounded text-white text-sm font-mono">
              {formatTime(currentTime)}
            </div>
          </div>

          {/* Time Labels */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Start: <span className="font-mono font-semibold text-blue-600">{formatTime(startTime)}</span>
            </span>
            <span className={`font-semibold ${selectedDuration > maxDuration ? 'text-red-600' : 'text-green-600'}`}>
              Duration: {formatTime(selectedDuration)} / {maxDuration}s
            </span>
            <span className="text-gray-600">
              End: <span className="font-mono font-semibold text-blue-600">{formatTime(endTime)}</span>
            </span>
          </div>

          {/* Timeline with Draggable Handles */}
          <div
            ref={timelineRef}
            onClick={handleTimelineClick}
            className="relative h-24 bg-gray-300 rounded-lg cursor-pointer select-none touch-none"
          >
            {/* Timeline background gradient */}
            <div className="absolute inset-0 rounded-lg overflow-hidden bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400" />

            {/* Dimmed left area (before start) */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-black/60 rounded-l-lg"
              style={{ width: `${startPercent}%` }}
            />

            {/* Dimmed right area (after end) */}
            <div
              className="absolute top-0 bottom-0 right-0 bg-black/60 rounded-r-lg"
              style={{ width: `${100 - endPercent}%` }}
            />

            {/* Selected region highlight */}
            <div
              className="absolute top-0 bottom-0 bg-green-500/20 border-t-4 border-b-4 border-yellow-400"
              style={{
                left: `${startPercent}%`,
                width: `${endPercent - startPercent}%`,
              }}
            />

            {/* START HANDLE */}
            <div
              data-handle="start"
              onPointerDown={(e) => handlePointerDown(e, 'start')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="absolute top-0 bottom-0 cursor-ew-resize z-30 touch-none"
              style={{
                left: `calc(${startPercent}% - 14px)`,
                width: '28px',
              }}
            >
              {/* Handle visual */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-2 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-200 transition-colors shadow-lg">
                {/* Grip dots */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1">
                  <div className="w-1 h-1 rounded-full bg-yellow-700" />
                  <div className="w-1 h-1 rounded-full bg-yellow-700" />
                  <div className="w-1 h-1 rounded-full bg-yellow-700" />
                </div>
              </div>
              {/* Extended touch target visual */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-14 bg-yellow-400/30 rounded-lg border-2 border-yellow-400 hover:bg-yellow-400/50" />
            </div>

            {/* END HANDLE */}
            <div
              data-handle="end"
              onPointerDown={(e) => handlePointerDown(e, 'end')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="absolute top-0 bottom-0 cursor-ew-resize z-30 touch-none"
              style={{
                left: `calc(${endPercent}% - 14px)`,
                width: '28px',
              }}
            >
              {/* Handle visual */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-2 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-200 transition-colors shadow-lg">
                {/* Grip dots */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1">
                  <div className="w-1 h-1 rounded-full bg-yellow-700" />
                  <div className="w-1 h-1 rounded-full bg-yellow-700" />
                  <div className="w-1 h-1 rounded-full bg-yellow-700" />
                </div>
              </div>
              {/* Extended touch target visual */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-14 bg-yellow-400/30 rounded-lg border-2 border-yellow-400 hover:bg-yellow-400/50" />
            </div>

            {/* Playhead (current position) */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none z-20"
              style={{ left: `${currentPercent}%` }}
            >
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-white" />
            </div>
          </div>

          {/* Instructions */}
          <p className="text-sm text-gray-600 text-center">
            👆 <strong>Drag the yellow handles</strong> left or right to select your clip • Click on timeline to seek • Max {maxDuration} seconds
          </p>

          {/* Duration Warning */}
          {selectedDuration > maxDuration && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">
                ⚠️ Selection exceeds {maxDuration} seconds. Please shorten your selection.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-2">
            <div className="text-sm text-gray-500">
              Total video: {formatTime(duration)}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel} size="lg">
                Cancel
              </Button>
              <Button
                onClick={handleTrim}
                disabled={!isValidSelection}
                size="lg"
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <Scissors className="h-4 w-4" />
                Trim & Upload ({formatTime(selectedDuration)})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
