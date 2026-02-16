import { useState, useRef, useCallback, useEffect } from "react";
import styled from "styled-components";

/* 360° 회전 뷰어 — 스프라이트 이미지를 캔버스에 그려 모델을 회전시키는 컴포넌트 */

// 총 프레임 수 (select1.png를 30등분한 이미지)
const TOTAL_FRAMES = 30;

// 프레임 파일 번호 시작값 (frame-01.png부터 시작)
const FRAME_START = 1;

// 프레임 번호(0~29)를 실제 이미지 경로로 변환하는 함수
const getFramePath = (index: number) =>
  `${import.meta.env.BASE_URL}images/model-360-1/frame-${String(index + FRAME_START).padStart(2, "0")}.png`;

// 하단 스크러버에 표시할 전체 프레임 경로 배열
const SCRUBBER_PATHS = Array.from({ length: TOTAL_FRAMES }, (_, i) =>
  getFramePath(i),
);

/* ── 스타일 컴포넌트 ── */

// 뷰어 전체를 감싸는 컨테이너 (드래그 커서 포함)
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

// 프레임을 그리는 캔버스 요소
const StyledCanvas = styled.canvas`
  max-height: 80vh;
  max-width: 80%;
  object-fit: contain;
  pointer-events: none;
`;

// 우측 하단에 현재 각도를 표시하는 인디케이터
const DegreeIndicator = styled.div`
  position: absolute;
  bottom: 70px;
  right: 20px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.05em;
  opacity: 0.4;
`;

// 하단 중앙의 가로 스크러버 바 (프레임 썸네일 목록)
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

// 스크러버 안의 개별 썸네일 아이템
const ScrubberThumb = styled.div<{ $active: boolean }>`
  width: 18px;
  height: 32px;
  overflow: hidden;
  opacity: ${({ $active }) => ($active ? 1 : 0.35)};
  transition: opacity 0.15s ease;
  cursor: pointer;
  flex-shrink: 0;
  border-bottom: ${({ $active }) =>
    $active ? "2px solid #000" : "2px solid transparent"};

  &:hover {
    opacity: 0.8;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// 컴포넌트에 전달할 수 있는 속성 정의
interface RotatingViewerProps {
  autoRotate: boolean;
  autoRotateSpeed: number;
}

const RotatingViewer: React.FC<RotatingViewerProps> = ({
  autoRotate = true,
  autoRotateSpeed = 220,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 프레임 이미지 객체 배열 (메모리에 미리 로드)
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const loadedCountRef = useRef(0);

  // 현재 회전 각도 (0~360, 부드러운 보간을 위해 소수점 허용)
  const angleRef = useRef(0);
  // 목표 각도 (드래그 시 이 값을 먼저 변경, 실제 각도가 서서히 따라감)
  const targetAngleRef = useRef(0);

  // 드래그 상태 관리
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const angleAtDragStartRef = useRef(0);

  // 관성(모멘텀) 효과를 위한 속도 값
  const velocityRef = useRef(0);
  const lastDragXRef = useRef(0);
  const lastDragTimeRef = useRef(0);

  // 자동 회전 상태 관리
  const isAutoRotatingRef = useRef(autoRotate);
  const autoRotateSpeedRef = useRef(autoRotateSpeed);
  // 드래그 종료 후 자동 회전 재개를 위한 타이머
  const autoResumeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // 화면에 표시 중인 프레임 번호 (스크러버 UI 동기화용)
  const [displayFrame, setDisplayFrame] = useState(0);
  // 모든 이미지가 로드 완료되었는지 여부
  const [isLoaded, setIsLoaded] = useState(false);

  // 모든 프레임 이미지를 메모리에 미리 로드하는 효과
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
          // 첫 번째 이미지 크기에 맞춰 캔버스 해상도 설정
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

  // 자동 회전 속도가 변경되면 ref에 동기화
  useEffect(() => {
    autoRotateSpeedRef.current = autoRotateSpeed;
  }, [autoRotateSpeed]);

  // 현재 각도(0~360)를 프레임 인덱스(0~29)로 변환하는 함수
  const angleToFrame = useCallback((angle: number) => {
    const normalized = ((angle % 360) + 360) % 360;
    return Math.floor((normalized / 360) * TOTAL_FRAMES) % TOTAL_FRAMES;
  }, []);

  // 지정된 프레임 이미지를 캔버스에 그리는 함수
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imagesRef.current[frameIndex];
    if (!canvas || !ctx || !img) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, []);

  // 매 프레임마다 실행되는 메인 애니메이션 루프
  useEffect(() => {
    let animFrameId: number;
    let lastTimestamp = 0;
    let lastDrawnFrame = -1;

    const loop = (timestamp: number) => {
      if (lastTimestamp === 0) lastTimestamp = timestamp;
      // 프레임 간 시간 차이 계산 (최대 0.1초로 제한하여 탭 전환 시 점프 방지)
      const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
      lastTimestamp = timestamp;

      if (!isDraggingRef.current) {
        // 관성 효과: 드래그 후 남은 속도로 계속 회전
        if (Math.abs(velocityRef.current) > 0.5) {
          angleRef.current += velocityRef.current * dt;
          targetAngleRef.current = angleRef.current;
          // 마찰 적용: 속도를 서서히 감소
          velocityRef.current *= 0.92;
        } else {
          velocityRef.current = 0;

          // 관성이 없을 때 자동 회전 실행
          if (isAutoRotatingRef.current) {
            angleRef.current += autoRotateSpeedRef.current * dt;
            targetAngleRef.current = angleRef.current;
          }
        }
      }

      // LERP(선형 보간)로 현재 각도를 목표 각도에 부드럽게 근접
      const diff = targetAngleRef.current - angleRef.current;
      if (Math.abs(diff) > 0.01) {
        angleRef.current += diff * 0.15;
      } else {
        angleRef.current = targetAngleRef.current;
      }

      // 각도를 0~360 범위로 정규화
      angleRef.current = ((angleRef.current % 360) + 360) % 360;
      targetAngleRef.current = ((targetAngleRef.current % 360) + 360) % 360;

      // 프레임이 변경된 경우에만 캔버스를 다시 그림 (성능 최적화)
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

  // 마우스 드래그 시작 처리
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

  // 마우스 드래그 중 회전 각도 계산
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;

    const now = performance.now();
    const dtMs = now - lastDragTimeRef.current;

    // 드래그 속도 계산 (드래그 종료 후 관성 효과에 사용)
    if (dtMs > 0) {
      const dx = e.clientX - lastDragXRef.current;
      velocityRef.current = (dx / dtMs) * 1000 * -0.3;
    }

    lastDragXRef.current = e.clientX;
    lastDragTimeRef.current = now;

    const totalDeltaX = e.clientX - dragStartXRef.current;
    // 마우스 이동 거리(px)를 회전 각도(degree)로 변환
    const degreesPerPx = 0.4;
    const newAngle = angleAtDragStartRef.current - totalDeltaX * degreesPerPx;
    targetAngleRef.current = newAngle;
    angleRef.current = newAngle;
  }, []);

  // 마우스 드래그 종료 — 3초 후 자동 회전 재개
  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    autoResumeTimerRef.current = setTimeout(() => {
      velocityRef.current = 0;
      isAutoRotatingRef.current = true;
    }, 3000);
  }, []);

  // 터치 드래그 시작 처리 (모바일)
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

  // 터치 드래그 중 회전 각도 계산 (모바일)
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

  // 터치 드래그 종료 — 3초 후 자동 회전 재개 (모바일)
  const handleTouchEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    autoResumeTimerRef.current = setTimeout(() => {
      velocityRef.current = 0;
      isAutoRotatingRef.current = true;
    }, 3000);
  }, []);

  // 스크러버 썸네일 클릭 시 해당 각도로 부드럽게 이동
  const handleScrubberClick = useCallback((frameIndex: number) => {
    isAutoRotatingRef.current = false;
    velocityRef.current = 0;
    const newAngle = (frameIndex / TOTAL_FRAMES) * 360;
    targetAngleRef.current = newAngle;

    if (autoResumeTimerRef.current) {
      clearTimeout(autoResumeTimerRef.current);
    }
    autoResumeTimerRef.current = setTimeout(() => {
      isAutoRotatingRef.current = true;
    }, 3000);
  }, []);

  // 현재 프레임을 각도(degree)로 변환하여 표시
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
      {/* 프레임 이미지를 렌더링하는 캔버스 */}
      <StyledCanvas ref={canvasRef} style={{ opacity: isLoaded ? 1 : 0 }} />

      {/* 하단 프레임 썸네일 스크러버 */}
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

      {/* 현재 회전 각도 표시 */}
      <DegreeIndicator>{degree}° / 360°</DegreeIndicator>
    </ViewerWrapper>
  );
};

export default RotatingViewer;
