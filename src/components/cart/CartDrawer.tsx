import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: ${({ theme }) => theme.zIndex.overlay};
  cursor: pointer;
`;

const Drawer = styled(motion.aside)`
  position: fixed;
  top: 0;
  right: 0;
  width: 420px;
  max-width: 90vw;
  height: 100%;
  background: ${({ theme }) => theme.colors.background};
  z-index: ${({ theme }) => theme.zIndex.modal};
  padding: ${({ theme }) => theme.spacing['2xl']};
  display: flex;
  flex-direction: column;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.1);
`;

const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

const DrawerTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const CloseButton = styled(motion.button)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const EmptyMessage = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  opacity: 0.5;
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing['3xl']};
`;

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          <Drawer
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <DrawerHeader>
              <DrawerTitle>Bag (00)</DrawerTitle>
              <CloseButton
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                CLOSE
              </CloseButton>
            </DrawerHeader>
            <EmptyMessage>Your bag is empty</EmptyMessage>
          </Drawer>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
