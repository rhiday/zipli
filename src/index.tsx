import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LoadingScreen } from "./components/LoadingScreen";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./components/AuthProvider";
import { Explore } from "./screens/Explore/Explore";
import { Donate } from "./screens/Donate/Donate";
import { Receive } from "./screens/Receive/Receive";
import { DonationDetails } from "./screens/Receive/DonationDetails";
import { RescueThankYouPage } from "./screens/Receive/RescueThankYouPage";
import { NewDonation } from "./screens/NewDonation/NewDonation";
import { DonationStep2 } from "./screens/NewDonation/DonationStep2";
import { DonationStep3 } from "./screens/NewDonation/DonationStep3";
import { DonationStep4 } from "./screens/NewDonation/DonationStep4";
import { ThankYouPage } from "./screens/NewDonation/ThankYouPage";
import { VoiceInput } from "./screens/NewDonation/VoiceInput";
import { Auth } from "./screens/Auth/Auth";
import { Login } from "./screens/Auth/Login";
import { Register } from "./screens/Auth/Register";
import { VerificationSuccess } from "./screens/Auth/VerificationSuccess";
import { ResetPassword } from "./screens/Auth/ResetPassword";
import { UpdatePassword } from "./screens/Auth/UpdatePassword";
import { EmailVerification } from "./screens/Auth/EmailVerification";
import { useAuth } from "./components/AuthProvider";
import { NotFound } from "./screens/NotFound";
import { UserProfile } from "./screens/Profile/UserProfile";
import { ErrorPage } from "./screens/ErrorPage";
import { DonationConfirmation } from "./screens/NewDonation/DonationConfirmation";
import { AuthLayout } from "./screens/Auth/AuthLayout";
import { RequireAuth } from "./components/RequireAuth";
import { NewRequest } from "./screens/Request/NewRequest";
import { RequestCalendar } from "./screens/Request/RequestCalendar";
import { RequestConfirm } from "./screens/Request/RequestConfirm";
import { RequestThankYou } from "./screens/Request/RequestThankYou";
import { RescueConfirm } from "./screens/Receive/RescueConfirm";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/signin" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/verify/success" element={<VerificationSuccess />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/verify/pending" element={<EmailVerification />} />
          <Route path="/auth/verify" element={<EmailVerification />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/receive/thank-you" element={
            <ProtectedRoute>
              <RescueThankYouPage />
            </ProtectedRoute>
          } />
          <Route path="/receive/:id" element={
            <ProtectedRoute>
              <DonationDetails />
            </ProtectedRoute>
          } />
          <Route path="/receive/confirm-rescue/:id" element={
            <ProtectedRoute>
              <RescueConfirm />
            </ProtectedRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Donate />
            </ProtectedRoute>
          } />
          <Route path="/explore" element={
            <ProtectedRoute>
              <Explore />
            </ProtectedRoute>
          } />
          <Route path="/receive" element={
            <ProtectedRoute>
              <Receive />
            </ProtectedRoute>
          } />
          <Route path="/request/new" element={
            <ProtectedRoute>
              <NewRequest />
            </ProtectedRoute>
          } />
          <Route path="/request/calendar" element={
            <ProtectedRoute>
              <RequestCalendar />
            </ProtectedRoute>
          } />
          <Route path="/request/confirm" element={
            <ProtectedRoute>
              <RequestConfirm />
            </ProtectedRoute>
          } />
          <Route path="/request/thank-you" element={
            <ProtectedRoute>
              <RequestThankYou />
            </ProtectedRoute>
          } />
          <Route path="/new-donation/thank-you" element={
            <ProtectedRoute>
              <ThankYouPage />
            </ProtectedRoute>
          } />
          <Route path="/new-donation/step4" element={
            <ProtectedRoute>
              <DonationStep4 />
            </ProtectedRoute>
          } />
          <Route path="/new-donation/voice" element={
            <ProtectedRoute>
              <VoiceInput />
            </ProtectedRoute>
          } />
          <Route path="/new-donation/step3" element={
            <ProtectedRoute>
              <DonationStep3 />
            </ProtectedRoute>
          } />
          <Route path="/new-donation/step2" element={
            <ProtectedRoute>
              <DonationStep2 />
            </ProtectedRoute>
          } />
          <Route path="/new-donation" element={
            <ProtectedRoute>
              <NewDonation />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          <Route path="/donate/confirmation" element={
            <ProtectedRoute>
              <DonationConfirmation />
            </ProtectedRoute>
          } />
          
          {/* Redirect root to auth if not authenticated */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);