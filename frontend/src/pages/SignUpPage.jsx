import { useState } from "react";
import { Hospital } from 'lucide-react';
import { Link } from "react-router";

import useSignUp from "../hooks/useSignUp";
import { getErrorMessage } from "../lib/getErrorMessage";

const SignUpPage = () => {
  const [signupData, setSignupData] = useState({
    userName: "",
    email: "",
    password: "",
  });

  const { isPending, error, signupMutation } = useSignUp();

  const handleSignup = (e) => {
    e.preventDefault();
    signupMutation(signupData);
  };

  return (
    <div className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        
        {/* SIGNUP FORM - LEFT SIDE */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <Hospital className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              CVD Care
            </span>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{getErrorMessage(error)}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleSignup}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Create an Account</h2>
                  <p className="text-sm opacity-70">
                    Understand your health better with CVD Care
                  </p>
                </div>

                <div className="space-y-3">
                  {/* USERNAME */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">User Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="charleswright"
                      className="input input-bordered w-full"
                      value={signupData.userName}
                      onChange={(e) => setSignupData({ ...signupData, userName: e.target.value })}
                      required
                    />
                  </div>

                  {/* EMAIL */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="charleswright@gmail.com"
                      className="input input-bordered w-full"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>

                  {/* PASSWORD */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="********"
                      className="input input-bordered w-full"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                    <p className="text-xs opacity-70 mt-1">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  {/* TERMS CHECKBOX */}
                  <div className="form-control">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="checkbox checkbox-sm" required />
                      <span className="text-xs leading-tight">
                        I agree to the{" "}
                        <span
                          className="text-primary hover:underline cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById("terms_modal").showModal();
                          }}
                        >
                          terms of service
                        </span>{" "}
                        and{" "}
                        <span
                          className="text-primary hover:underline cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById("privacy_modal").showModal();
                          }}
                        >
                          privacy policy
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <button className="btn btn-primary w-full" type="submit">
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Loading...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <div className="text-center mt-4">
                  <p className="text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* SIGNUP FORM - RIGHT SIDE */}
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

      {/* TERMS OF SERVICE MODAL */}
      <dialog id="terms_modal" className="modal">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Terms of Service</h3>
          <div className="text-sm space-y-3 max-h-96 overflow-y-auto">
            <p><strong>1. Acceptance of Terms</strong></p>
            <p>By accessing and using CVD Care, you accept and agree to be bound by these Terms of Service.</p>
            <p><strong>2. Use of Service</strong></p>
            <p>CVD Care is intended for informational purposes only. The cardiovascular disease risk predictions provided by this system are not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider.</p>
            <p><strong>3. User Responsibilities</strong></p>
            <p>You are responsible for providing accurate health information. Inaccurate data may result in unreliable predictions. You agree not to misuse the service or attempt to access it through unauthorized means.</p>
            <p><strong>4. Data Usage</strong></p>
            <p>Health data you provide is used solely for generating cardiovascular disease risk predictions. We do not share your personal health information with third parties.</p>
            <p><strong>5. Limitation of Liability</strong></p>
            <p>CVD Care shall not be liable for any medical decisions made based on the predictions provided by this system. Users assume full responsibility for their healthcare decisions.</p>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-primary">Close</button>
            </form>
          </div>
        </div>
      </dialog>

      {/* PRIVACY POLICY MODAL */}
      <dialog id="privacy_modal" className="modal">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Privacy Policy</h3>
          <div className="text-sm space-y-3 max-h-96 overflow-y-auto">
            <p><strong>1. Information We Collect</strong></p>
            <p>We collect personal information including your name, email address, and health data such as age, gender, blood pressure, cholesterol, and glucose levels that you provide when using CVD Care.</p>
            <p><strong>2. How We Use Your Information</strong></p>
            <p>Your information is used to generate cardiovascular disease risk predictions, maintain your prediction history, and improve the accuracy of our machine learning models.</p>
            <p><strong>3. Data Security</strong></p>
            <p>We implement appropriate security measures to protect your personal and health information against unauthorized access, alteration, or disclosure.</p>
            <p><strong>4. Data Retention</strong></p>
            <p>Your data is retained as long as your account remains active. You may request deletion of your account and associated data at any time through the Profile settings.</p>
            <p><strong>5. Your Rights</strong></p>
            <p>You have the right to access, correct, or delete your personal information. You can manage your data through your account settings or by contacting our support team.</p>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-primary">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default SignUpPage;