import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
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

import "./App.css";

import LoadingSpinner from "./components/screens/LoadingSpinner";

// =======================
// Theme default
// =======================
if (!document.documentElement.getAttribute("data-theme")) {
  document.documentElement.setAttribute("data-theme", "light");
}

if (!document.documentElement.getAttribute("language")) {
  document.documentElement.setAttribute("language", "en");
}

// =======================
// Layout Wrapper
// =======================
const MainBodyWrapper = ({ children, isSignedIn }) => {
  const location = useLocation();

  const isAuthPage =
    location.pathname.startsWith("/signin") ||
    location.pathname.startsWith("/signup") ||
    location.pathname.startsWith("/verify") ||
    location.pathname.startsWith("/forgot-password") ||
    location.pathname.startsWith("/reset-password");

  return (
    <div
      className={isSignedIn && !isAuthPage ? "mainBody signedIn" : "mainBody signedIn"}
    >
      {children}
    </div>
  );
};

// =======================
// App
// =======================
const App = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // =======================
  // Session check
  // =======================
  useEffect(() => {
    const token = localStorage.getItem("Token");
    const timestamp = localStorage.getItem("sessionTimestamp");
    const now = new Date().getTime();

    if (token && timestamp) {
      const diff = now - parseInt(timestamp, 10);
      const hours = diff / (1000 * 60 * 60);

      if (hours >= 24) {
        handleSignOut();
      } else {
        setIsSignedIn(true);
      }
    }

    setIsLoading(false);
  }, []);

  // =======================
  // Auth handlers
  // =======================
  const handleSignIn = () => {
    setIsSignedIn(true);
  };

  const handleSignOut = () => {
    localStorage.clear();
    setIsSignedIn(false);
  };

  if (isLoading)
    return (
      <div className="ad-details-page">
        <LoadingSpinner open={isLoading} />
      </div>
    );

  const ProtectedRoute = ({ isSignedIn, children }) => {
    const token = localStorage.getItem("Token");

    if (!isSignedIn || !token) {
      return <Navigate to="/home" replace />;
    }

    return children;
  };

  return (
    <Router>
      <TopHeader onSignOut={handleSignOut} isSignedIn={isSignedIn} />

      <MainBodyWrapper isSignedIn={isSignedIn}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/signin" element={<SignIn onSignIn={handleSignIn} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify/:token" element={<VerifyAccount />} />
          <Route path="/ad/:id" element={<AdDetails />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isSignedIn={isSignedIn}>
                <Profile onSignOut={handleSignOut} isSignedIn={isSignedIn} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post-ad"
            element={
              <ProtectedRoute isSignedIn={isSignedIn}>
                <PostAd />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute isSignedIn={isSignedIn}>
                <AllUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/categories"
            element={
              <ProtectedRoute isSignedIn={isSignedIn}>
                <AllCategories />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ads"
            element={
              <ProtectedRoute isSignedIn={isSignedIn}>
                <AllAds />
              </ProtectedRoute>
            }
          />

          <Route
            path="/saved-ads"
            element={
              <ProtectedRoute isSignedIn={isSignedIn}>
                <SavedAds />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-ads"
            element={
              <ProtectedRoute isSignedIn={isSignedIn}>
                <MyAds />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isSignedIn={isSignedIn}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/support"
            element={
              <ProtectedRoute isSignedIn={isSignedIn}>
                <SupportPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </MainBodyWrapper>

      <Footer />
    </Router>
  );
};

export default App;
