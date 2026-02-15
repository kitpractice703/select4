import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Header from './Header';
import Footer from './Footer';
import { VignetteOverlay } from './Vignette';
import CartDrawer from '../cart/CartDrawer';
import { useState } from 'react';

const Main = styled.main`
  min-height: 100vh;
  position: relative;
  z-index: ${({ theme }) => theme.zIndex.content};
`;

const Layout: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <VignetteOverlay />
      <Header onCartClick={() => setIsCartOpen(true)} cartCount={0} />
      <Main>
        <Outlet />
      </Main>
      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Layout;
