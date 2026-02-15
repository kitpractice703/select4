import styled from 'styled-components';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import RotatingViewer from '../components/viewer/RotatingViewer';

const HomeWrapper = styled.div`
  width: 100%;
`;

/* ── Hero Section with 360° Viewer ── */
const HeroSection = styled.section`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
`;

const HeroViewerContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

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

/* ── Manifesto Section ── */
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

/* ── Collection Preview ── */
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

/* ── Word-by-word scroll animation component ── */
const WordContainer = styled.span`
  display: inline;
`;

const AnimatedWord = styled(motion.span)`
  display: inline-block;
  margin-right: 0.3em;
`;

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

const Word: React.FC<{
  word: string;
  range: [number, number];
  progress: import('framer-motion').MotionValue<number>;
}> = ({ word, range, progress }) => {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return <AnimatedWord style={{ opacity }}>{word}</AnimatedWord>;
};

/* ── Page Component ── */
const HomePage: React.FC = () => {
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
      {/* Hero - 360° Rotating Model Viewer */}
      <HeroSection>
        <HeroViewerContainer>
          <RotatingViewer autoRotate={true} />
          <HeroOverlayInfo>
            <LookLabel>SEASON 01 / 01</LookLabel>
            <LookTitle>THE ORIGIN</LookTitle>
          </HeroOverlayInfo>
        </HeroViewerContainer>
      </HeroSection>

      {/* Manifesto with word-by-word scroll reveal */}
      <ManifestoSection ref={manifestoRef}>
        <ManifestoText>
          <ScrollRevealText
            text="CREATED IN THE STUDIO, CRAFTED FOR THE WORLD. BOLD, FUNCTIONAL AND ENDLESSLY VERSATILE, OUR DESIGNS EMPOWER INDIVIDUALS TO EXPRESS THEMSELVES. A VISION TO DEFINE YOUR OWN STYLE, WITH NO LIMITS AND NO APOLOGIES."
            progress={scrollYProgress}
          />
        </ManifestoText>
      </ManifestoSection>

      {/* Collection Preview */}
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
