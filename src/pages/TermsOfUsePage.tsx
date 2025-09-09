import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function TermsOfUsePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mr-3 no-focus-active text-foreground hover:text-foreground"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-lg font-semibold">Terms of Use</h1>
      </header>

      {/* Content */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="prose prose-sm max-w-none text-xs leading-relaxed space-y-4">
          <div className="text-center mb-6">
            <h1 className="text-lg font-bold mb-2">Terms and Conditions for Amaksub Data</h1>
            <p className="text-xs text-muted-foreground">Effective Date: 10/08/2025</p>
          </div>

          <p className="text-xs">
            Welcome to Amaksub Data. By downloading, accessing, or using our mobile application, you agree to be bound by the following Terms and Conditions. Please read carefully.
          </p>

          <div className="space-y-4">
            <section>
              <h2 className="text-sm font-semibold mb-2">1. Eligibility</h2>
              <p className="text-xs">
                You must be at least 18 years old to use Amaksub Data. By creating an account, you confirm that you meet this requirement.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-2">2. Account Registration</h2>
              <p className="text-xs">
                To use our services, you must provide accurate information including your full name, username, email address, phone number, password, and PIN. You are responsible for maintaining the confidentiality of your login credentials and PIN. Any activity carried out under your account will be deemed your responsibility.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-2">3. Virtual Accounts</h2>
              <p className="text-xs">
                Each user is assigned a virtual account to facilitate transactions. You agree not to use this virtual account for illegal or fraudulent purposes. We reserve the right to suspend or terminate accounts involved in suspicious activity.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-2">4. Services Provided</h2>
              <p className="text-xs">Amaksub Services provides access to:</p>
              <ul className="text-xs list-disc list-inside ml-4 space-y-1">
                <li>Data and airtime purchases</li>
                <li>Bill payments (electricity, TV, internet, etc.)</li>
                <li>Secure payment processing through your virtual account</li>
                <li>Referral rewards (where applicable)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-2">5. Payments & Refunds</h2>
              <p className="text-xs">
                All transactions are final once completed. Refunds are only issued in cases of system error or failed delivery verified by our support team. We are not responsible for incorrect information provided by the user (e.g., wrong phone number, wrong account number).
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-2">6. User Responsibilities</h2>
              <ul className="text-xs list-disc list-inside ml-4 space-y-1">
                <li>Provide accurate information during registration and transactions</li>
                <li>Keep your PIN and password secure</li>
                <li>Use the app only for lawful purposes</li>
                <li>Notify us immediately if you suspect unauthorized access to your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-2">7. Prohibited Activities</h2>
              <p className="text-xs">You may not:</p>
              <ul className="text-xs list-disc list-inside ml-4 space-y-1">
                <li>Use the app for money laundering, fraud, or any unlawful purpose</li>
                <li>Share or sell your virtual account</li>
                <li>Attempt to hack, reverse-engineer, or disrupt the app's services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-2">8. Limitation of Liability</h2>
              <p className="text-xs">Amaksub Services is not liable for:</p>
              <ul className="text-xs list-disc list-inside ml-4 space-y-1">
                <li>Delays or failures caused by network providers or third-party services</li>
                <li>Loss of funds due to incorrect information provided by the user</li>
                <li>Unauthorized access due to negligence in safeguarding your login details</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-2">9. Termination</h2>
              <p className="text-xs">
                We reserve the right to suspend or terminate your account at any time if you violate these Terms, engage in fraud, or misuse our services.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-2">10. Updates to Terms</h2>
              <p className="text-xs">
                We may modify these Terms and Conditions at any time. Continued use of the app after updates means you agree to the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-2">11. Governing Law</h2>
              <p className="text-xs">
                These Terms shall be governed by and construed under the laws of Nigeria.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-2">12. Contact Us</h2>
              <p className="text-xs">
                For inquiries or support regarding these Terms, contact:
              </p>
              <div className="text-xs ml-4">
                <p>Email: support@amaksub.com</p>
                <p>Phone: 08029686989</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}