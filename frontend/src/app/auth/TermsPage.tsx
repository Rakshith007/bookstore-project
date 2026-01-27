import { useState } from 'react';
import TermsPopup from '../../components/layout/TermsPopup';

const Footer = () => {
  const [showTerms, setShowTerms] = useState(false);

  return (
      <TermsPopup 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
      />
  );
};

export default Footer;