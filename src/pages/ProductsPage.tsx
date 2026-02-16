import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// 임시 상품 데이터 (백엔드 연동 전 목업용)
const MOCK_PRODUCTS = Array.from({ length: 21 }, (_, i) => ({
  id: i + 1,
  number: String(i + 1).padStart(2, '0'),
  name: `Product ${i + 1}`,
  slug: `product-${i + 1}`,
}));

// 카테고리(캡슐) 목록 데이터
const CATEGORIES = [
  { id: 1, label: 'CAPSULE 01 / 02', title: 'SIGNATURE DROP', count: 21 },
  { id: 2, label: 'CAPSULE 02 / 02', title: 'BASICS', count: 6 },
];

/* ── 스타일 컴포넌트 ── */

// 페이지 전체 래퍼 (상하 여백 포함)
const PageWrapper = styled.div`
  padding-top: 120px;
  padding-bottom: 100px;
  min-height: 100vh;
`;

// 우측 상단 고정 뷰 토글 영역
const ViewToggle = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.xl};
  z-index: ${({ theme }) => theme.zIndex.header};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ViewLabel = styled.span`
  opacity: 0.5;
`;

// 카테고리 헤더: 캡슐 라벨 + 제목
const CategoryHeader = styled.div`
  padding: 0 ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

const CategoryLabel = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.5;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

// 카테고리 제목 (등장 애니메이션 적용)
const CategoryTitle = styled(motion.h1)`
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  font-weight: ${({ theme }) => theme.fontWeights.black};
  text-transform: uppercase;
  letter-spacing: -0.02em;
  line-height: 1;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes['2xl']};
  }
`;

// 상품 수 정보 영역
const ProductsInfo = styled.div`
  padding: 0 ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  display: flex;
  gap: ${({ theme }) => theme.spacing.xl};
  align-items: center;
`;

const ProductsLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const ProductsCount = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  opacity: 0.5;
`;

// 반응형 상품 그리드 (데스크톱 6열 → 태블릿 4열 → 모바일 2열)
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1px;
  padding: 0 ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

// 개별 상품 카드 (호버 시 배경색 변경)
const ProductCard = styled(motion.div)`
  position: relative;
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
  cursor: pointer;
  overflow: hidden;
`;

// 상품 이미지 자리 (현재 플레이스홀더)
const ProductImagePlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 3 / 4;
  background: ${({ theme }) => theme.colors.gray[300]};
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse at center,
      transparent 40%,
      rgba(0, 0, 0, 0.03) 100%
    );
  }
`;

const PlaceholderIcon = styled.div`
  width: 60px;
  height: 80px;
  border: 2px solid ${({ theme }) => theme.colors.gray[400]};
  border-radius: 4px;
  opacity: 0.3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.gray[500]};
`;

const ProductNumber = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  opacity: 0.4;
`;

const StyledLink = styled(Link)`
  display: block;
`;

/* ── 상품 목록 페이지 컴포넌트 ── */
const ProductsPage: React.FC = () => {
  const category = CATEGORIES[0];

  return (
    <PageWrapper>
      <ViewToggle>
        <ViewLabel>VIEW</ViewLabel>
        PRODUCTS
      </ViewToggle>

      {/* 카테고리 헤더: 캡슐 라벨 + 타이틀 */}
      <CategoryHeader>
        <CategoryLabel>{category.label}</CategoryLabel>
        <CategoryTitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {category.title}
        </CategoryTitle>
      </CategoryHeader>

      {/* 상품 수 표시 */}
      <ProductsInfo>
        <ProductsLabel>PRODUCTS</ProductsLabel>
        <ProductsCount>{category.count}</ProductsCount>
      </ProductsInfo>

      {/* 상품 카드 그리드 */}
      <Grid>
        {MOCK_PRODUCTS.map((product, index) => (
          <StyledLink to={`/products/${product.slug}`} key={product.id}>
            <ProductCard
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.03,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
            >
              <ProductImagePlaceholder>
                <PlaceholderIcon>{product.number}</PlaceholderIcon>
              </ProductImagePlaceholder>
              <ProductNumber>{product.number}</ProductNumber>
            </ProductCard>
          </StyledLink>
        ))}
      </Grid>
    </PageWrapper>
  );
};

export default ProductsPage;
