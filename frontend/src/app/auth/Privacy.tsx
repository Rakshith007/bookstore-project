import { useState } from 'react';
import PrivacyPopup from '../../components/layout/PrivacyPopup';

const Footer = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
      <PrivacyPopup 
        isOpen={showPrivacy} 
        onClose={() => setShowPrivacy(false)} 
      />
  );
};

export default Footer;