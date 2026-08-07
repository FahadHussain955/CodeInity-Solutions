import LegalPageLayout from '@/layouts/LegalPageLayout';
import { PrivacyContent } from '@/components/legal/legalContent';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const PrivacyPage = () => (
  <LegalPageLayout title="Privacy Policy">
    <PrivacyContent />
    <p className="pt-2">
      Also read our{' '}
      <Link to={ROUTES.TERMS} className="text-primary hover:text-primary-fixed-variant transition-colors">
        Terms &amp; Conditions
      </Link>
      .
    </p>
  </LegalPageLayout>
);

export default PrivacyPage;
