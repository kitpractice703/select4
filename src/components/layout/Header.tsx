import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const HeaderWrapper = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: ${({ theme }) => theme.zIndex.header};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Logo = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.black};
  font-style: italic;
  letter-spacing: -0.02em;
  text-transform: uppercase;
`;

const Nav = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
`;

const NavItem = styled(Link)<{ $active?: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: ${({ $active }) => ($active ? 1 : 0.6)};
  transition: opacity ${({ theme }) => theme.transitions.fast};

  &:hover {
    opacity: 1;
  }
`;

const NavCount = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  opacity: 0.5;
  margin-left: 2px;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const CartButton = styled(motion.button)`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 4px;
`;

interface HeaderProps {
  onCartClick?: () => void;
  cartCount?: number;
}

const Header: React.FC<HeaderProps> = ({ onCartClick, cartCount = 0 }) => {
  const location = useLocation();

  return (
    <HeaderWrapper>
      <LeftSection>
        <Logo to="/">SELECT</Logo>
        <Nav>
          <NavItem to="/products" $active={location.pathname === '/products'}>
            ALL
          </NavItem>
          <NavCount>27</NavCount>
          <NavItem to="/stories" $active={location.pathname.startsWith('/stories')}>
            STORIES
          </NavItem>
          <NavCount>04</NavCount>
        </Nav>
      </LeftSection>
      <RightSection>
        <CartButton
          onClick={onCartClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          BAG <NavCount>{String(cartCount).padStart(2, '0')}</NavCount>
        </CartButton>
      </RightSection>
    </HeaderWrapper>
  );
};

export default Header;
