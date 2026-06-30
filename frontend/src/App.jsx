import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { Toaster } from "react-hot-toast";
import useAuthUser from "./hooks/useAuthUser";
import PredictionPage from "./pages/PredictionPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ResultPage from "./pages/ResultPage";
import HistoryPage from "./pages/HistoryPage";
import SupportRequestPage from "./pages/SupportRequestPage";
import Layout from "./components/Layout";
import AdminDashboard from "./pages/AdminDashboard";

const App = () => {
  const { authUser } = useAuthUser();
  const isAuthenticated = Boolean(authUser);

  return (
    <div className="h-screen" data-theme="corporate">
      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : authUser.role === "admin" ? (
              <Navigate to="/admin" />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* SIGNUP */}
        <Route
          path="/signup"
          element={
            !isAuthenticated ? <SignUpPage /> : <Navigate to="/" />
          }
        />

        {/* HOME USER */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              authUser.role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                <Layout showSidebar={true}>
                  <HomePage />
                </Layout>
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* PREDICT */}
        <Route
          path="/predict"
          element={
            isAuthenticated ? (
              <Layout showSidebar={true}>
                <PredictionPage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* RESULT */}
        <Route
          path="/result"
          element={
            isAuthenticated ? (
              <Layout showSidebar={true}>
                <ResultPage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* HISTORY */}
        <Route
          path="/history"
          element={
            isAuthenticated ? (
              <Layout showSidebar={true}>
                <HistoryPage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              <Layout showSidebar={true}>
                <ProfilePage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            isAuthenticated && authUser.role === "admin" ? (
              <Layout showSidebar={false}>
                <AdminDashboard />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* SUPPORT REQUEST */}
        <Route
          path="/request"
          element={
            isAuthenticated ? (
              <Layout showSidebar={true}>
                <SupportRequestPage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
