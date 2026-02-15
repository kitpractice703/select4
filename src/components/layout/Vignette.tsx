import styled from 'styled-components';

export const VignetteOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: ${({ theme }) => theme.zIndex.vignette};
  box-shadow:
    inset 0 0 120px 60px rgba(70, 130, 255, 0.12),
    inset 0 0 250px 100px rgba(70, 130, 255, 0.06);
`;
