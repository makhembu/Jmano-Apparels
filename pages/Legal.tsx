
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BackButton } from '../components/ui/BackButton';
import { SEO } from '../components/SEO';

export const Privacy: React.FC = () => {
  const { settings } = useApp();
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <SEO title="Privacy Policy | Jambo Apparels" description="Detailed information about how we collect, use, and protect your data." />
      <BackButton className="mb-6" />
      <h1 className="text-3xl font-serif font-bold mb-6 text-brand-dark">Privacy Policy</h1>
      
      <div className="prose max-w-none font-light text-gray-700 space-y-6">
        <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>

        <section>
          <h2 className="text-xl font-bold text-brand-dark mb-3">1. Identity of the Data Controller</h2>
          <p>
            This website is operated by <strong>Jambo Apparels</strong> ("we", "us", or "our"). 
            For the purposes of the General Data Protection Regulation (GDPR), we are the Data Controller.
          </p>
          <p className="mt-2">
            <strong>Contact Address:</strong> {settings.contactAddress || '123 Scripture Lane, London, UK'}<br/>
            <strong>Email:</strong> {settings.contactEmail || 'privacy@jamboapparels.com'}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-brand-dark mb-3">2. Data We Collect & Legal Basis</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 border">Data Type</th>
                  <th className="p-2 border">Purpose</th>
                  <th className="p-2 border">Legal Basis</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border">Identity (Name, Email, Address)</td>
                  <td className="p-2 border">Processing orders, account management</td>
                  <td className="p-2 border">Contractual Necessity</td>
                </tr>
                <tr>
                  <td className="p-2 border">Financial (Transaction IDs)</td>
                  <td className="p-2 border">Payment processing, accounting</td>
                  <td className="p-2 border">Legal Obligation</td>
                </tr>
                <tr>
                  <td className="p-2 border">Technical (IP, Device Info)</td>
                  <td className="p-2 border">Site security, fraud prevention</td>
                  <td className="p-2 border">Legitimate Interest</td>
                </tr>
                <tr>
                  <td className="p-2 border">Usage Data (Analytics)</td>
                  <td className="p-2 border">Improving website performance</td>
                  <td className="p-2 border">Explicit Consent</td>
                </tr>
                <tr>
                  <td className="p-2 border">Marketing Data</td>
                  <td className="p-2 border">Newsletters, promotions</td>
                  <td className="p-2 border">Explicit Consent</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-brand-dark mb-3">3. Data Retention</h2>
          <p>We only retain your personal data for as long as necessary to fulfil the purposes we collected it for:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account Data:</strong> Until you delete your account or after 2 years of inactivity.</li>
            <li><strong>Order Records:</strong> 7 years (required for UK tax/accounting law).</li>
            <li><strong>Analytics Data:</strong> 14 months (Google Analytics retention setting).</li>
            <li><strong>Marketing Data:</strong> Until you withdraw consent (unsubscribe).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-brand-dark mb-3">4. Third-Party Processors</h2>
          <p>We share data with specific third parties to provide our services. All have valid Data Processing Agreements (DPAs).</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Supabase:</strong> Database and Authentication hosting (AWS infrastructure).</li>
            <li><strong>Vercel:</strong> Website hosting and edge functions.</li>
            <li><strong>PayPal / Stripe:</strong> Secure payment processing. (We do not store card details).</li>
            <li><strong>Google Analytics:</strong> Usage tracking (only with consent).</li>
            <li><strong>Resend / SendGrid:</strong> Transactional email delivery.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-brand-dark mb-3">5. Your Rights</h2>
          <p>Under GDPR, you have the following rights:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Right to Access:</strong> You can request a copy of all data we hold about you. (Available in Dashboard).</li>
            <li><strong>Right to Erasure:</strong> You can request deletion of your account. (Available in Dashboard). Note: We may retain anonymized order data for tax purposes.</li>
            <li><strong>Right to Rectification:</strong> You can update your profile details at any time.</li>
            <li><strong>Right to Object:</strong> You can opt-out of marketing emails via the "Unsubscribe" link.</li>
            <li><strong>Right to Withdraw Consent:</strong> You can change cookie preferences via the link in the footer.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-brand-dark mb-3">6. International Transfers</h2>
          <p>
            Some of our service providers (e.g., Google, Supabase) may process data outside the UK/EEA. 
            We ensure these transfers are protected by appropriate safeguards, such as Standard Contractual Clauses (SCCs) or adequacy decisions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-brand-dark mb-3">7. Contact & Complaints</h2>
          <p>
            If you have concerns about our use of your personal data, please contact us at {settings.contactEmail}. 
            You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) in the UK.
          </p>
        </section>
      </div>
    </div>
  );
};

export const Terms: React.FC = () => {
  const { settings } = useApp();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <SEO title="Terms & Conditions | Jambo Apparels" />
      <BackButton className="mb-6" />
      <h1 className="text-3xl font-serif font-bold mb-6 text-brand-dark">Terms & Conditions</h1>
      <div className="prose max-w-none whitespace-pre-wrap font-light text-gray-700">
         {settings.termsConditions || "Please contact support for full terms."}
      </div>
    </div>
  );
};

export const Returns: React.FC = () => {
  const { settings } = useApp();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <SEO title="Returns Policy | Jambo Apparels" />
      <BackButton className="mb-6" />
      <h1 className="text-3xl font-serif font-bold mb-6 text-brand-dark">Returns & Refunds</h1>
      <div className="prose max-w-none whitespace-pre-wrap font-light text-gray-700">
        {settings.returnPolicy || "Standard 30-day return policy applies."}
      </div>
    </div>
  );
};

export const Cookies: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
    <SEO title="Cookie Policy | Jambo Apparels" />
    <BackButton className="mb-6" />
    <h1 className="text-3xl font-serif font-bold mb-6 text-brand-dark">Cookie Policy</h1>
    
    <p className="mb-6">
        We use cookies to improve your experience. Below is a detailed list of the cookies we use. 
        You can manage your preferences at any time using the "Cookie Settings" link in the footer.
    </p>

    <div className="space-y-8">
        <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Necessary Cookies (Always Active)</h3>
            <p className="text-sm text-gray-600 mb-3">Essential for the website to function securely and correctly.</p>
            <table className="w-full text-sm border border-gray-200">
                <thead className="bg-gray-50 text-left">
                    <tr><th className="p-2 border">Name</th><th className="p-2 border">Purpose</th><th className="p-2 border">Duration</th></tr>
                </thead>
                <tbody>
                    <tr><td className="p-2 border font-mono">sb-access-token</td><td className="p-2 border">Maintains your secure login session.</td><td className="p-2 border">Session</td></tr>
                    <tr><td className="p-2 border font-mono">jambo_cookie_consent</td><td className="p-2 border">Stores your cookie consent preferences.</td><td className="p-2 border">1 Year</td></tr>
                    <tr><td className="p-2 border font-mono">dt_cart</td><td className="p-2 border">Remembers items in your shopping cart.</td><td className="p-2 border">Local Storage</td></tr>
                </tbody>
            </table>
        </section>

        <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Analytics Cookies (Optional)</h3>
            <p className="text-sm text-gray-600 mb-3">Help us improve our website by collecting and reporting information on how you use it. IPs are anonymized.</p>
            <table className="w-full text-sm border border-gray-200">
                <thead className="bg-gray-50 text-left">
                    <tr><th className="p-2 border">Name</th><th className="p-2 border">Purpose</th><th className="p-2 border">Duration</th></tr>
                </thead>
                <tbody>
                    <tr><td className="p-2 border font-mono">_ga</td><td className="p-2 border">Google Analytics: Distinguishes users.</td><td className="p-2 border">2 Years</td></tr>
                    <tr><td className="p-2 border font-mono">_gid</td><td className="p-2 border">Google Analytics: Distinguishes users.</td><td className="p-2 border">24 Hours</td></tr>
                </tbody>
            </table>
        </section>
    </div>
  </div>
);
