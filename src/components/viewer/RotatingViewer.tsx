import { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';

/*
 * Canvas-based 360° viewer with inertia physics.
 *
 * Technique inspired by becaneparis.com:
 * 1. All frame images pre-loaded into memory as Image objects.
 * 2. A single <canvas> element renders the current frame — zero DOM changes.
 * 3. Continuous requestAnimationFrame loop with LERP (linear interpolation)
 *    for buttery-smooth easing between frames.
 * 4. Momentum/inertia on drag release for natural physics feel.
 *
 * Frame 0 in the sprite sheet is a seam frame — we skip it.
 * Uses frames 1–29 = 29 usable frames.
 */

const TOTAL_FRAMES = 29;
const FRAME_START = 1; // skip frame 0 (seam)

const getFramePath = (index: number) =>
  `/images/model-360-1/frame-${String(index + FRAME_START).padStart(2, '0')}.png`;

const SCRUBBER_PATHS = Array.from({ length: TOTAL_FRAMES }, (_, i) => getFramePath(i));

/* ── Styled Components ── */
const ViewerWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
  overflow: hidden;

  &:active {
    cursor: grabbing;
  }
`;

const StyledCanvas = styled.canvas`
  max-height: 80vh;
  max-width: 80%;
  object-fit: contain;
  pointer-events: none;
`;

const DegreeIndicator = styled.div`
  position: absolute;
  bottom: 70px;
  right: 20px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.05em;
  opacity: 0.4;
`;

/* ── Horizontal scrubber at bottom ── */
const ScrubberBar = styled.div`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: row;
  gap: 0px;
  z-index: 10;
  height: 32px;
  overflow: hidden;
  border-radius: 2px;
`;

const ScrubberThumb = styled.div<{ $active: boolean }>`
  width: 18px;
  height: 32px;
  overflow: hidden;
  opacity: ${({ $active }) => ($active ? 1 : 0.35)};
  transition: opacity 0.15s ease;
  cursor: pointer;
  flex-shrink: 0;
  border-bottom: ${({ $active }) =>
    $active ? '2px solid #000' : '2px solid transparent'};

  &:hover {
    opacity: 0.8;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

interface RotatingViewerProps {
  autoRotate?: boolean;
  autoRotateSpeed?: number; // degrees per second
}

const RotatingViewer: React.FC<RotatingViewerProps> = ({
  autoRotate = true,
  autoRotateSpeed = 220, // degrees per second (12 = ~30s per revolution)
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const loadedCountRef = useRef(0);

  // Continuous angle (0–360) — using floating-point for smooth interpolation
  const angleRef = useRef(0);
  const targetAngleRef = useRef(0);

  // Drag state
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const angleAtDragStartRef = useRef(0);

  // Momentum / inertia
  const velocityRef = useRef(0);
  const lastDragXRef = useRef(0);
  const lastDragTimeRef = useRef(0);

  // Auto-rotate
  const isAutoRotatingRef = useRef(autoRotate);
  const autoRotateSpeedRef = useRef(autoRotateSpeed);
  const autoResumeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Display frame for scrubber UI
  const [displayFrame, setDisplayFrame] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Preload all images
  useEffect(() => {
    const images: HTMLImageElement[] = [];
    let loaded = 0;

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loaded++;
        loadedCountRef.current = loaded;
        if (loaded === TOTAL_FRAMES) {
          setIsLoaded(true);
          // Set canvas size based on first image
          const canvas = canvasRef.current;
          if (canvas && images[0]) {
            canvas.width = images[0].naturalWidth;
            canvas.height = images[0].naturalHeight;
          }
        }
      };
      images.push(img);
    }

    imagesRef.current = images;
  }, []);

  // Keep speed ref in sync with prop
  useEffect(() => {
    autoRotateSpeedRef.current = autoRotateSpeed;
  }, [autoRotateSpeed]);

  // Helper: angle → frame index
  const angleToFrame = useCallback((angle: number) => {
    const normalized = ((angle % 360) + 360) % 360;
    return Math.floor((normalized / 360) * TOTAL_FRAMES) % TOTAL_FRAMES;
  }, []);

  // Draw a specific frame to canvas
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imagesRef.current[frameIndex];
    if (!canvas || !ctx || !img) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, []);

  // Main animation loop — runs continuously
  useEffect(() => {
    let animFrameId: number;
    let lastTimestamp = 0;
    let lastDrawnFrame = -1;

    const loop = (timestamp: number) => {
      if (lastTimestamp === 0) lastTimestamp = timestamp;
      const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1); // cap dt
      lastTimestamp = timestamp;

      if (!isDraggingRef.current) {
        // Apply inertia / momentum
        if (Math.abs(velocityRef.current) > 0.5) {
          angleRef.current += velocityRef.current * dt;
          targetAngleRef.current = angleRef.current;
          // Friction: decay velocity
          velocityRef.current *= 0.92;
        } else {
          velocityRef.current = 0;

          // Auto-rotate when no momentum
          if (isAutoRotatingRef.current) {
            angleRef.current += autoRotateSpeedRef.current * dt;
            targetAngleRef.current = angleRef.current;
          }
        }
      }

      // Smooth lerp towards target
      const diff = targetAngleRef.current - angleRef.current;
      if (Math.abs(diff) > 0.01) {
        angleRef.current += diff * 0.15; // lerp factor
      } else {
        angleRef.current = targetAngleRef.current;
      }

      // Normalize angle
      angleRef.current = ((angleRef.current % 360) + 360) % 360;
      targetAngleRef.current = ((targetAngleRef.current % 360) + 360) % 360;

      // Determine frame and draw only if frame changed
      const frame = angleToFrame(angleRef.current);
      if (frame !== lastDrawnFrame && loadedCountRef.current > frame) {
        drawFrame(frame);
        lastDrawnFrame = frame;
        setDisplayFrame(frame);
      }

      animFrameId = requestAnimationFrame(loop);
    };

    animFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameId);
  }, [angleToFrame, drawFrame]);

  // ── Mouse drag handlers ──
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    isAutoRotatingRef.current = false;
    velocityRef.current = 0;
    dragStartXRef.current = e.clientX;
    angleAtDragStartRef.current = angleRef.current;
    lastDragXRef.current = e.clientX;
    lastDragTimeRef.current = performance.now();

    if (autoResumeTimerRef.current) {
      clearTimeout(autoResumeTimerRef.current);
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;

    const now = performance.now();
    const dtMs = now - lastDragTimeRef.current;

    // Calculate velocity for momentum
    if (dtMs > 0) {
      const dx = e.clientX - lastDragXRef.current;
      velocityRef.current = (dx / dtMs) * 1000 * -0.3; // degrees/sec
    }

    lastDragXRef.current = e.clientX;
    lastDragTimeRef.current = now;

    const totalDeltaX = e.clientX - dragStartXRef.current;
    // Sensitivity: px to degrees
    const degreesPerPx = 0.4;
    const newAngle = angleAtDragStartRef.current - totalDeltaX * degreesPerPx;
    targetAngleRef.current = newAngle;
    angleRef.current = newAngle; // immediate during drag
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    // Resume auto-rotate after 3 seconds of inactivity
    autoResumeTimerRef.current = setTimeout(() => {
      velocityRef.current = 0;
      isAutoRotatingRef.current = true;
    }, 3000);
  }, []);

  // ── Touch drag handlers ──
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isDraggingRef.current = true;
    isAutoRotatingRef.current = false;
    velocityRef.current = 0;
    dragStartXRef.current = e.touches[0].clientX;
    angleAtDragStartRef.current = angleRef.current;
    lastDragXRef.current = e.touches[0].clientX;
    lastDragTimeRef.current = performance.now();

    if (autoResumeTimerRef.current) {
      clearTimeout(autoResumeTimerRef.current);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;

    const now = performance.now();
    const dtMs = now - lastDragTimeRef.current;

    if (dtMs > 0) {
      const dx = e.touches[0].clientX - lastDragXRef.current;
      velocityRef.current = (dx / dtMs) * 1000 * -0.3;
    }

    lastDragXRef.current = e.touches[0].clientX;
    lastDragTimeRef.current = now;

    const totalDeltaX = e.touches[0].clientX - dragStartXRef.current;
    const degreesPerPx = 0.4;
    const newAngle = angleAtDragStartRef.current - totalDeltaX * degreesPerPx;
    targetAngleRef.current = newAngle;
    angleRef.current = newAngle;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    autoResumeTimerRef.current = setTimeout(() => {
      velocityRef.current = 0;
      isAutoRotatingRef.current = true;
    }, 3000);
  }, []);

  // Scrubber click
  const handleScrubberClick = useCallback((frameIndex: number) => {
    isAutoRotatingRef.current = false;
    velocityRef.current = 0;
    const newAngle = (frameIndex / TOTAL_FRAMES) * 360;
    targetAngleRef.current = newAngle;
    // Don't set angleRef directly — let lerp ease into it

    if (autoResumeTimerRef.current) {
      clearTimeout(autoResumeTimerRef.current);
    }
    autoResumeTimerRef.current = setTimeout(() => {
      isAutoRotatingRef.current = true;
    }, 3000);
  }, []);

  const degree = Math.round((displayFrame / TOTAL_FRAMES) * 360);

  return (
    <ViewerWrapper
      ref={wrapperRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Single canvas — frames painted directly, zero DOM updates */}
      <StyledCanvas
        ref={canvasRef}
        style={{ opacity: isLoaded ? 1 : 0 }}
      />

      {/* Horizontal scrubber bar at bottom */}
      <ScrubberBar>
        {SCRUBBER_PATHS.map((src, i) => (
          <ScrubberThumb
            key={i}
            $active={i === displayFrame}
            onClick={(e) => {
              e.stopPropagation();
              handleScrubberClick(i);
            }}
          >
            <img src={src} alt={`Angle ${i}`} loading="lazy" />
          </ScrubberThumb>
        ))}
      </ScrubberBar>

      {/* Degree indicator */}
      <DegreeIndicator>
        {degree}° / 360°
      </DegreeIndicator>
    </ViewerWrapper>
  );
};

export default RotatingViewer;
