import styled from 'styled-components';

const FooterWrapper = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: ${({ theme }) => theme.zIndex.header};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  pointer-events: none;
`;

const LeftLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  pointer-events: auto;
`;

const RightLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  pointer-events: auto;
`;

const FooterLink = styled.a`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.6;
  transition: opacity ${({ theme }) => theme.transitions.fast};

  &:hover {
    opacity: 1;
  }
`;

const Footer: React.FC = () => {
  return (
    <FooterWrapper>
      <LeftLinks>
        <FooterLink href="#">TERMS OF SERVICE</FooterLink>
        <FooterLink href="#">SHIPPING POLICY</FooterLink>
        <FooterLink href="#">SIZE GUIDE</FooterLink>
      </LeftLinks>
      <RightLinks>
        <FooterLink href="mailto:hello@selectstudio.com">
          HELLO@SELECTSTUDIO.COM
        </FooterLink>
        <FooterLink href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          INSTAGRAM
        </FooterLink>
      </RightLinks>
    </FooterWrapper>
  );
};

export default Footer;
