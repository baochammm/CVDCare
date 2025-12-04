import {Navigate, Route, Routes } from "react-router";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { Toaster } from "react-hot-toast";
import useAuthUser from "./hooks/useAuthUser";
import PredictionPage from "./pages/PredictionPage";
import HomePage from "./pages/HomePage";
import ResultPage from "./pages/ResultPage";
import HistoryPage from "./pages/HistoryPage";
import Layout from "./components/Layout";

const App = () => {
  const { authUser } = useAuthUser();

  const isAuthenticated = Boolean(authUser);

  return (
  <div className="h-screen" data-theme="corporate">
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout showSidebar={true}>
                <HomePage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !isAuthenticated ? <SignUpPage /> : <Navigate to="/" />
          }
        />
        <Route
          path="/login"
          element={
            !isAuthenticated ? <LoginPage /> : <Navigate to="/" />
          }
        />
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
      </Routes>

      <Toaster />
    </div>
  )
};

export default App;