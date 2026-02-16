import styled from 'styled-components';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import RotatingViewer from '../components/viewer/RotatingViewer';

// 페이지 전체를 감싸는 레이아웃 컨테이너
const HomeWrapper = styled.div`
  width: 100%;
`;

/* ── 히어로 섹션: 360° 뷰어가 표시되는 메인 영역 ── */
const HeroSection = styled.section`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
`;

// 360° 뷰어를 담는 컨테이너
const HeroViewerContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

// 히어로 우측에 떠 있는 시즌/룩 정보 오버레이
const HeroOverlayInfo = styled.div`
  position: absolute;
  top: 50%;
  right: ${({ theme }) => theme.spacing.xl};
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  z-index: 10;
`;

const LookLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.5;
`;

const LookTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.black};
  text-transform: uppercase;
  letter-spacing: -0.02em;
`;

/* ── 매니페스토 섹션: 스크롤 시 한 단어씩 나타나는 브랜드 문구 ── */
const ManifestoSection = styled.section`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing['4xl']} ${({ theme }) => theme.spacing.xl};
`;

const ManifestoText = styled(motion.p)`
  font-size: ${({ theme }) => theme.fontSizes.hero};
  font-weight: ${({ theme }) => theme.fontWeights.black};
  text-transform: uppercase;
  line-height: 1.05;
  letter-spacing: -0.02em;
  text-align: center;
  max-width: 1000px;
`;

/* ── 컬렉션 프리뷰 섹션: 상품 카드 목록 ── */
const CollectionSection = styled.section`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing['4xl']} ${({ theme }) => theme.spacing.xl};
  gap: ${({ theme }) => theme.spacing['2xl']};
`;

const CollectionLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.5;
`;

const CollectionTitle = styled(motion.h2)`
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  font-weight: ${({ theme }) => theme.fontWeights.black};
  text-transform: uppercase;
  letter-spacing: -0.02em;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes['2xl']};
  }
`;

const CollectionGrid = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xl};
  justify-content: center;
  flex-wrap: wrap;
  max-width: 1200px;
  width: 100%;
`;

const CollectionCard = styled(motion.div)`
  width: 180px;
  height: 280px;
  background: ${({ theme }) => theme.colors.gray[300]};
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.4;
  cursor: pointer;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      transparent 60%,
      rgba(0, 0, 0, 0.05) 100%
    );
  }
`;

// 컬렉션 하단의 "DISCOVER" 링크
const DiscoverLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: ${({ theme }) => theme.spacing.xl};
  opacity: 0.6;
  transition: opacity ${({ theme }) => theme.transitions.fast};

  &:hover {
    opacity: 1;
  }
`;

const ProductCount = styled.span`
  opacity: 0.5;
`;

/* ── 스크롤 진행도에 따라 단어별로 서서히 나타나는 텍스트 컴포넌트 ── */
const WordContainer = styled.span`
  display: inline;
`;

const AnimatedWord = styled(motion.span)`
  display: inline-block;
  margin-right: 0.3em;
`;

// 전체 문장을 단어 단위로 분리하여 스크롤 진행도에 따라 투명도를 변경
const ScrollRevealText: React.FC<{ text: string; progress: import('framer-motion').MotionValue<number> }> = ({
  text,
  progress,
}) => {
  const words = text.split(' ');

  return (
    <WordContainer>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <Word key={i} word={word} range={[start, end]} progress={progress} />
        );
      })}
    </WordContainer>
  );
};

// 개별 단어의 투명도를 스크롤 진행도 범위에 따라 제어
const Word: React.FC<{
  word: string;
  range: [number, number];
  progress: import('framer-motion').MotionValue<number>;
}> = ({ word, range, progress }) => {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return <AnimatedWord style={{ opacity }}>{word}</AnimatedWord>;
};

/* ── 홈페이지 컴포넌트 ── */
const HomePage: React.FC = () => {
  // 매니페스토 섹션의 스크롤 진행도를 추적하는 ref
  const manifestoRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: manifestoRef,
    offset: ['start end', 'end start'],
  });

  const heroItems = [
    { label: '01' },
    { label: '02' },
    { label: '03' },
    { label: '04' },
    { label: '05' },
  ];

  return (
    <HomeWrapper>
      {/* 히어로: 360° 회전 모델 뷰어 */}
      <HeroSection>
        <HeroViewerContainer>
          <RotatingViewer autoRotate={true} />
          <HeroOverlayInfo>
            <LookLabel>SEASON 01 / 01</LookLabel>
            <LookTitle>THE ORIGIN</LookTitle>
          </HeroOverlayInfo>
        </HeroViewerContainer>
      </HeroSection>

      {/* 매니페스토: 스크롤 시 단어별로 나타나는 브랜드 문구 */}
      <ManifestoSection ref={manifestoRef}>
        <ManifestoText>
          <ScrollRevealText
            text="CREATED IN THE STUDIO, CRAFTED FOR THE WORLD. BOLD, FUNCTIONAL AND ENDLESSLY VERSATILE, OUR DESIGNS EMPOWER INDIVIDUALS TO EXPRESS THEMSELVES. A VISION TO DEFINE YOUR OWN STYLE, WITH NO LIMITS AND NO APOLOGIES."
            progress={scrollYProgress}
          />
        </ManifestoText>
      </ManifestoSection>

      {/* 컬렉션 프리뷰: 상품 카드 그리드 */}
      <CollectionSection>
        <CollectionLabel>SEASON 01 / 01</CollectionLabel>
        <CollectionTitle
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          COLLECTION
        </CollectionTitle>
        <CollectionGrid>
          {heroItems.map((item, index) => (
            <CollectionCard
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 0.4, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ opacity: 0.7, scale: 1.02 }}
            >
              {item.label}
            </CollectionCard>
          ))}
        </CollectionGrid>
        <DiscoverLink to="/products">
          <ProductCount>12 PRODUCTS</ProductCount>
          DISCOVER
        </DiscoverLink>
      </CollectionSection>
    </HomeWrapper>
  );
};

export default HomePage;
