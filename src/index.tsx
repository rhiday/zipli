import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LoadingScreen } from "./components/LoadingScreen";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./components/AuthProvider";
import { Donate } from "./screens/Donate/Donate";
import { Explore } from "./screens/Explore/Explore";
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

const App = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/signin" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/verification-success" element={<VerificationSuccess />} />
      </Route>

      {/* Protected routes */}
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Donate />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/donations/:id" element={<DonationDetails />} />
        <Route path="/new-donation" element={<NewDonation />} />
        <Route path="/new-donation/step2" element={<DonationStep2 />} />
        <Route path="/new-donation/step3" element={<DonationStep3 />} />
        <Route path="/new-donation/step4" element={<DonationStep4 />} />
        <Route path="/new-donation/voice" element={<VoiceInput />} />
        <Route path="/new-donation/confirmation" element={<DonationConfirmation />} />
        <Route path="/request" element={<NewRequest />} />
        <Route path="/request/calendar" element={<RequestCalendar />} />
        <Route path="/rescue/thank-you" element={<RescueThankYouPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/messages" element={<div>Messages Coming Soon</div>} />
      </Route>

      {/* Public routes */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <StrictMode>
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  </StrictMode>
);