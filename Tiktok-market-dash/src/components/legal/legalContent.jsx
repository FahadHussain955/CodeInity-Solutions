export const TermsContent = ({ onOpenPrivacy }) => (
  <div className="space-y-6 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
    <section>
      <h2 className="font-body-md text-body-md font-semibold text-on-surface mb-2">1. Acceptance of terms</h2>
      <p>
        By creating a Nexora account or using the Nexora dashboard, you agree to these temporary Terms &amp; Conditions.
        If you do not agree, do not use the service.
      </p>
    </section>

    <section>
      <h2 className="font-body-md text-body-md font-semibold text-on-surface mb-2">2. The service</h2>
      <p>
        Nexora provides analytics, store operations tooling, and TikTok advertising workflows for commerce teams.
        Features may be incomplete, change without notice, or be unavailable during this pre-production phase.
      </p>
    </section>

    <section>
      <h2 className="font-body-md text-body-md font-semibold text-on-surface mb-2">3. Accounts</h2>
      <p>
        You must register before signing in. You are responsible for keeping your login credentials secure and for
        activity under your account. Google Sign-Up creates an account in our database; Google Sign-In only works for
        accounts that already exist.
      </p>
    </section>

    <section>
      <h2 className="font-body-md text-body-md font-semibold text-on-surface mb-2">4. Acceptable use</h2>
      <p>
        Do not misuse Nexora, attempt unauthorized access, interfere with other users, or use the platform for unlawful
        activity. We may suspend accounts that violate these rules.
      </p>
    </section>

    <section>
      <h2 className="font-body-md text-body-md font-semibold text-on-surface mb-2">5. Data &amp; third parties</h2>
      <p>
        Connecting store or advertising platforms may share data between Nexora and those providers under their own
        terms. You are responsible for having the rights to connect those accounts.
      </p>
    </section>

    <section>
      <h2 className="font-body-md text-body-md font-semibold text-on-surface mb-2">6. Disclaimer</h2>
      <p>
        The service is provided “as is” without warranties of any kind. Nexora is not liable for indirect, incidental,
        or consequential damages arising from use of this temporary build.
      </p>
    </section>

    <section>
      <h2 className="font-body-md text-body-md font-semibold text-on-surface mb-2">7. Contact</h2>
      <p>
        Questions about these terms can be sent to{' '}
        <a href="mailto:legal@nexora.app" className="text-primary hover:text-primary-fixed-variant transition-colors">
          legal@nexora.app
        </a>
        .
        {onOpenPrivacy && (
          <>
            {' '}
            Also see our{' '}
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="text-primary hover:text-primary-fixed-variant transition-colors font-medium"
            >
              Privacy Policy
            </button>
            .
          </>
        )}
      </p>
    </section>
  </div>
);

export const PrivacyContent = ({ onOpenTerms }) => (
  <div className="space-y-6 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
    <section>
      <h2 className="font-body-md text-body-md font-semibold text-on-surface mb-2">1. Overview</h2>
      <p>
        This temporary Privacy Policy explains how Nexora collects and uses information while you use our dashboard.
        It will be replaced with a final policy before a production launch.
      </p>
    </section>

    <section>
      <h2 className="font-body-md text-body-md font-semibold text-on-surface mb-2">2. Information we collect</h2>
      <p>Depending on how you sign up, we may store:</p>
      <ul className="list-disc pl-5 mt-2 space-y-1">
        <li>Name and email address</li>
        <li>Password hash (email/password accounts only)</li>
        <li>Google account identifiers and profile photo when you use Google Sign-Up</li>
        <li>Basic usage and session data needed to keep you signed in</li>
      </ul>
    </section>

    <section>
      <h2 className="font-body-md text-body-md font-semibold text-on-surface mb-2">3. How we use information</h2>
      <p>
        We use account data to authenticate you, provide dashboard features, improve reliability, and communicate
        important service updates. We do not sell personal information.
      </p>
    </section>

    <section>
      <h2 className="font-body-md text-body-md font-semibold text-on-surface mb-2">4. Google authentication</h2>
      <p>
        If you register with Google, Google shares basic profile details with Nexora so we can create your account.
        Signing in with Google later only works after that registration exists in our database.
      </p>
    </section>

    <section>
      <h2 className="font-body-md text-body-md font-semibold text-on-surface mb-2">5. Storage &amp; security</h2>
      <p>
        Account records are stored in our application database. Access tokens are issued after a successful sign-in.
        You should use a strong password and sign out on shared devices.
      </p>
    </section>

    <section>
      <h2 className="font-body-md text-body-md font-semibold text-on-surface mb-2">6. Retention</h2>
      <p>
        We keep account data while your account remains active. You may request deletion by contacting support during
        this temporary phase.
      </p>
    </section>

    <section>
      <h2 className="font-body-md text-body-md font-semibold text-on-surface mb-2">7. Contact</h2>
      <p>
        Privacy questions:{' '}
        <a href="mailto:privacy@nexora.app" className="text-primary hover:text-primary-fixed-variant transition-colors">
          privacy@nexora.app
        </a>
        .
        {onOpenTerms && (
          <>
            {' '}
            Also read our{' '}
            <button
              type="button"
              onClick={onOpenTerms}
              className="text-primary hover:text-primary-fixed-variant transition-colors font-medium"
            >
              Terms &amp; Conditions
            </button>
            .
          </>
        )}
      </p>
    </section>
  </div>
);
