import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicyPage() {
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
        <h1 className="text-lg font-semibold">Privacy Policy</h1>
      </header>

      {/* Content */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="prose prose-sm max-w-none text-xs leading-relaxed space-y-4">
          <div className="text-center mb-6">
            <h1 className="text-lg font-bold mb-2">Privacy Policy for Amaksub Services</h1>
            <p className="text-xs text-muted-foreground">Effective Date: 10/08/2025</p>
          </div>

          <p className="text-xs">
            Amaksub Data ("we," "our," "us") values the privacy of our users and is committed to protecting their personal data. This Privacy Policy explains what information we collect, how we use it, and your rights as a user of our mobile application and services.
          </p>

          <div className="space-y-4">
            <section>
              <h2 className="text-sm font-semibold mb-2">1. Information We Collect</h2>
              <p className="text-xs">We may collect the following personal information when you register and use our app:</p>
              <ul className="text-xs list-disc list-inside ml-4 space-y-1">
                <li>Full Name</li>
                <li>Username</li>
                <li>Email Address</li>
                <li>Phone Number</li>
                <li>Password and Security PIN</li>
                <li>Virtual Account Details (assigned to you within the app)</li>
                <li>Transaction history and related payment records</li>
                <li>Device information, IP address, and app usage data (for security and performance monitoring)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-2">2. How We Use Your Information</h2>
              <p className="text-xs">We collect and use your information for the following purposes:</p>
              <ul className="text-xs list-disc list-inside ml-4 space-y-1">
                <li>To create and manage your account</li>
                <li>To provide you with a unique virtual account for payments and transactions</li>
                <li>To process airtime, data, and bill payment services</li>
                <li>To verify your identity and protect against fraud or unauthorized use</li>
                <li>To send you notifications, confirmations, and important updates</li>
                <li>To comply with legal and regulatory requirements</li>
                <li>To improve our app performance and customer support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-2">3. Data Sharing</h2>
              <p className="text-xs">
                We do not sell or rent your personal information to third parties. However, we may share your data with:
              </p>
              <ul className="text-xs list-disc list-inside ml-4 space-y-1">
                <li>Payment processors and financial institutions to complete transactions</li>
                <li>Regulatory bodies when required by law</li>
                <li>Service providers who help us operate and secure our app</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-2">4. Data Security</h2>
              <p className="text-xs">
                We use encryption, secure storage, and strict access controls to protect your personal data, including passwords and PINs. While we take industry-standard measures, no system is 100% secure. Users are advised to keep their login details confidential.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-2">5. Data Retention</h2>
              <p className="text-xs">
                We retain your information for as long as your account is active or as needed to comply with legal obligations. You may request account deletion by contacting support.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-2">6. Your Rights</h2>
              <p className="text-xs">As a user, you have the right to:</p>
              <ul className="text-xs list-disc list-inside ml-4 space-y-1">
                <li>Access and update your personal information</li>
                <li>Request deletion of your account and data (subject to legal requirements)</li>
                <li>Opt out of non-essential notifications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-2">7. Children's Privacy</h2>
              <p className="text-xs">
                Our services are intended for users aged 18 and above. We do not knowingly collect information from children.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-2">8. Updates to This Policy</h2>
              <p className="text-xs">
                We may update this Privacy Policy from time to time. You will be notified within the app or via email when significant changes occur.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-2">9. Contact Us</h2>
              <p className="text-xs">
                If you have questions, concerns, or requests related to this Privacy Policy, contact us at:
              </p>
              <div className="text-xs ml-4">
                <p>Email: support@amksub.com</p>
                <p>Phone: 08029686989</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}