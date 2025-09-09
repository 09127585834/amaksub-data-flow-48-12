import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "./pages/SplashScreen";
import OnboardingScreen from "./pages/OnboardingScreen";
import SignUpScreen from "./pages/SignUpScreen";
import LoginScreen from "./pages/LoginScreen";
import WelcomeLoginScreen from "./pages/WelcomeLoginScreen";
import ForgotPasswordScreen from "./pages/ForgotPasswordScreen";
import VerificationScreen from "./pages/VerificationScreen";
import PasswordResetVerificationScreen from "./pages/PasswordResetVerificationScreen";
import NewPasswordScreen from "./pages/NewPasswordScreen";
import TransactionPinScreen from "./pages/TransactionPinScreen";
import Dashboard from "./pages/Dashboard";
import ElectricityPage from "./pages/ElectricityPage";
import ElectricityReviewPage from "./pages/ElectricityReviewPage";
import ElectricityTransactionPinPage from "./pages/ElectricityTransactionPinPage";
import BillerSelectPage from "./pages/BillerSelectPage";
import ElectricityHistoryPage from "./pages/ElectricityHistoryPage";
import AirtimePage from "./pages/AirtimePage";
import AirtimeReviewPage from "./pages/AirtimeReviewPage";
import TransactionPinPage from "./pages/TransactionPinPage";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import ReceiptPage from "./pages/ReceiptPage";
import PrintCardsPage from "./pages/PrintCardsPage";
import PrintRechargeHistoryPage from "./pages/PrintRechargeHistoryPage";
import PrintRechargeDetailPage from "./pages/PrintRechargeDetailPage";
import TransactionHistoryPage from "./pages/TransactionHistoryPage";
import BeneficiaryPage from "./pages/BeneficiaryPage";
import ContactsPage from "./pages/ContactsPage";
import DataBundlePage from "./pages/DataBundlePage";
import DataBundleReviewPage from "./pages/DataBundleReviewPage";
import DataBundleTransactionPinPage from "./pages/DataBundleTransactionPinPage";
import AirtimeHistoryPage from "./pages/AirtimeHistoryPage";
import DataBundleHistoryPage from "./pages/DataBundleHistoryPage";
import RechargeCardPage from "./pages/RechargeCardPage";
import RechargeCardReviewPage from "./pages/RechargeCardReviewPage";
import DataCardPage from "./pages/DataCardPage";
import DataCardReviewPage from "./pages/DataCardReviewPage";
import DataCardTransactionPinPage from "./pages/DataCardTransactionPinPage";
import DataCardSuccessPage from "./pages/DataCardSuccessPage";
import DataCardReceiptPage from "./pages/DataCardReceiptPage";
import DataCardHistoryPage from "./pages/DataCardHistoryPage";
import TermsOfUsePage from "./pages/TermsOfUsePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import FailedTransactionReceiptPage from "./pages/FailedTransactionReceiptPage";
import WalletFundingReceiptPage from "./pages/WalletFundingReceiptPage";
import SortCodeInquiryPage from "./pages/SortCodeInquiryPage";
import CablePage from "./pages/CablePage";
import CablePlansPage from "./pages/CablePlansPage";
import CableHistoryPage from "./pages/CableHistoryPage";
import CableReviewPage from "./pages/CableReviewPage";
import CableTransactionPinPage from "./pages/CableTransactionPinPage";
import CablePurchaseSuccessPage from "./pages/CablePurchaseSuccessPage";
import ExamPage from "./pages/ExamPage";
import ExamHistoryPage from "./pages/ExamHistoryPage";
import ExamReviewPage from "./pages/ExamReviewPage";
import ExamTransactionPinPage from "./pages/ExamTransactionPinPage";
import NotFound from "./pages/NotFound";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./hooks/useAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LanguageProvider>
          <div className="fintech-light min-h-screen">
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              <Route path="/" element={<SplashScreen />} />
              <Route path="/onboarding" element={<OnboardingScreen />} />
              <Route path="/signup" element={<SignUpScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/welcome-login" element={<WelcomeLoginScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/verification" element={<VerificationScreen />} />
          <Route path="/password-reset-verification" element={<PasswordResetVerificationScreen />} />
          <Route path="/new-password" element={<NewPasswordScreen />} />
          <Route path="/transaction-pin" element={<TransactionPinScreen />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/electricity" element={<ElectricityPage />} />
              <Route path="/electricity/biller-select" element={<BillerSelectPage />} />
              <Route path="/electricity/history" element={<ElectricityHistoryPage />} />
               <Route path="/electricity/review" element={<ElectricityReviewPage />} />
               <Route path="/electricity/transaction-pin" element={<ElectricityTransactionPinPage />} />
                <Route path="/cable" element={<CablePage />} />
                <Route path="/cable/plans" element={<CablePlansPage />} />
                <Route path="/cable/review" element={<CableReviewPage />} />
                <Route path="/cable/transaction-pin" element={<CableTransactionPinPage />} />
                <Route path="/cable/purchase-success" element={<CablePurchaseSuccessPage />} />
                <Route path="/cable/history" element={<CableHistoryPage />} />
                <Route path="/exam" element={<ExamPage />} />
                <Route path="/exam/history" element={<ExamHistoryPage />} />
                <Route path="/exam/review" element={<ExamReviewPage />} />
                <Route path="/exam/transaction-pin" element={<ExamTransactionPinPage />} />
               <Route path="/airtime" element={<AirtimePage />} />
              <Route path="/airtime/review" element={<AirtimeReviewPage />} />
              <Route path="/airtime/transaction-pin" element={<TransactionPinPage />} />
              <Route path="/purchase-success" element={<PurchaseSuccessPage />} />
              <Route path="/receipt" element={<ReceiptPage />} />
           <Route path="/print-cards" element={<PrintCardsPage />} />
           <Route path="/print-recharge-history" element={<PrintRechargeHistoryPage />} />
           <Route path="/print-recharge-detail" element={<PrintRechargeDetailPage />} />
           <Route path="/transaction-history" element={<TransactionHistoryPage />} />
              <Route path="/beneficiary" element={<BeneficiaryPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
               <Route path="/data-bundle" element={<DataBundlePage />} />
               <Route path="/data-bundle/review" element={<DataBundleReviewPage />} />
               <Route path="/data-bundle/transaction-pin" element={<DataBundleTransactionPinPage />} />
               <Route path="/airtime-history" element={<AirtimeHistoryPage />} />
               <Route path="/data-bundle-history" element={<DataBundleHistoryPage />} />
               <Route path="/recharge-card" element={<RechargeCardPage />} />
               <Route path="/recharge-card/review" element={<RechargeCardReviewPage />} />
               <Route path="/recharge-card/transaction-pin" element={<TransactionPinPage />} />
                <Route path="/data-card" element={<DataCardPage />} />
                <Route path="/data-card/review" element={<DataCardReviewPage />} />
                <Route path="/data-card/transaction-pin" element={<DataCardTransactionPinPage />} />
                <Route path="/data-card-success" element={<DataCardSuccessPage />} />
                <Route path="/data-card-receipt" element={<DataCardReceiptPage />} />
                <Route path="/data-card-history" element={<DataCardHistoryPage />} />
               <Route path="/terms-of-use" element={<TermsOfUsePage />} />
               <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
               <Route path="/failed-transaction-receipt" element={<FailedTransactionReceiptPage />} />
               <Route path="/wallet-funding-receipt" element={<WalletFundingReceiptPage />} />
               <Route path="/sort-code-inquiry" element={<SortCodeInquiryPage />} />
               <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
          </div>
        </LanguageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;