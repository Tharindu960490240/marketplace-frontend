import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import TopHeader from "./components/screens/TopHeader";
import Footer from "./components/screens/Footer";
import Home from "./components/screens/Home";
import SignIn from "./components/screens/SignIn";
import ForgotPassword from "./components/screens/ForgotPassword";
import ResetPassword from "./components/screens/ResetPassword";
import SignUp from "./components/screens/SignUp";
import VerifyAccount from "./components/screens/VerifyAccount";
import AdDetails from "./components/screens/AdDetails";
import PostAd from "./components/screens/PostAd";
import Profile from "./components/screens/Profile";
import AllUsers from "./components/screens/AllUsers";
import AllCategories from "./components/screens/AllCategories";
import AllAds from "./components/screens/AllAds";
import SavedAds from "./components/screens/SavedAds";
import MyAds from "./components/screens/MyAds";
import AdminDashboard from "./components/screens/Dashboard";
import SupportPage from "./components/screens/SupportPage";
import LoadingSpinner from "./components/screens/LoadingSpinner";

import { PreferencesProvider } from "./context/PreferencesContext";
import { NotifyProvider } from "./context/NotifyContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

import "./App.css";

/* ================= ROUTE GUARDS =================
   Defined outside App so React keeps the same component
   between renders (pages no longer remount and lose state). */

const ProtectedRoute = ({ roles = [], children }) => {
  const { isSignedIn, user } = useAuth();
  const location = useLocation();

  if (!isSignedIn) {
    return (
      <Navigate to="/signin" replace state={{ from: location.pathname }} />
    );
  }
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

const GuestRoute = ({ children }) => {
  const { isSignedIn } = useAuth();
  return isSignedIn ? <Navigate to="/home" replace /> : children;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

/* ================= SHELL ================= */

const AppShell = () => {
  const { ready } = useAuth();

  if (!ready) return <LoadingSpinner open />;

  return (
    <div className="app-root">
      <ScrollToTop />
      <TopHeader />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/ad/:id" element={<AdDetails />} />

          <Route
            path="/signin"
            element={
              <GuestRoute>
                <SignIn />
              </GuestRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestRoute>
                <SignUp />
              </GuestRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify/:token" element={<VerifyAccount />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute roles={["user", "admin"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute roles={["user", "admin"]}>
                <SupportPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/post-ad"
            element={
              <ProtectedRoute roles={["user"]}>
                <PostAd />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved-ads"
            element={
              <ProtectedRoute roles={["user"]}>
                <SavedAds />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-ads"
            element={
              <ProtectedRoute roles={["user"]}>
                <MyAds />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ads"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AllAds />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AllUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AllCategories />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

const App = () => (
  <PreferencesProvider>
    <NotifyProvider>
      <AuthProvider>
        <Router>
          <AppShell />
        </Router>
      </AuthProvider>
    </NotifyProvider>
  </PreferencesProvider>
);

export default App;
