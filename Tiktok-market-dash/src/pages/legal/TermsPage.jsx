import LegalPageLayout from '@/layouts/LegalPageLayout';
import { TermsContent } from '@/components/legal/legalContent';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const TermsPage = () => (
  <LegalPageLayout title="Terms & Conditions">
    <TermsContent />
    <p className="pt-2">
      Also see our{' '}
      <Link to={ROUTES.PRIVACY} className="text-primary hover:text-primary-fixed-variant transition-colors">
        Privacy Policy
      </Link>
      .
    </p>
  </LegalPageLayout>
);

export default TermsPage;
