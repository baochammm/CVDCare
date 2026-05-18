import { useState } from "react";
import { Hospital } from 'lucide-react';
import { Link } from "react-router";
import useLogin from "../hooks/useLogin";
import { getErrorMessage } from "../lib/getErrorMessage";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    userName: "",
    password: "",
  });

  const { isPending, error, loginMutation } = useLogin();

  const handleLogin = () => {
    if (!loginData.userName.trim()) {
      return;
    }
    if (!loginData.password) {
      return;
    }
    loginMutation(loginData);
  };

  return (
    <div className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">

        {/* LOGIN FORM SECTION */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <Hospital className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              CVD Care
            </span>
          </div>

          {/* Error handling */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{getErrorMessage(error)}</span>
            </div>
          )}

          <div className="w-full">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Welcome Back</h2>
                <p className="text-sm opacity-70">Please enter your login details.</p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="form-control w-full space-y-2">
                  <label className="label">
                    <span className="label-text">User Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="charleswright"
                    className="input input-bordered w-full"
                    value={loginData.userName}
                    onChange={(e) => setLoginData({ ...loginData, userName: e.target.value })}
                  />
                </div>

                <div className="form-control w-full space-y-2">
                  <label className="label">
                    <span className="label-text">Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="********"
                    className="input input-bordered w-full"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  />
                </div>

                <button
                  className="btn btn-primary w-full"
                  onClick={handleLogin}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Signing in...
                    </>
                  ) : "Sign In"}
                </button>

                <div className="text-center mt-4">
                  <p className="text-sm">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-primary hover:underline">
                      Create one
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* IMAGE SECTION */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            <div className="relative aspect-square max-w-sm mx-auto">
              <img src="/hospital.png" alt="Health prediction illustration" className="w-full h-full" />
            </div>
            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">Predict Your Health, Take Control of Your Future</h2>
              <p className="opacity-70">
                Enter your health information and get personalized insights to improve your lifestyle
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;