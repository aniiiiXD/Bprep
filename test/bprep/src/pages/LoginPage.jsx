// LoginPage.jsx
import React from 'react';

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="relative flex flex-col space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0 max-w-4xl w-full mx-4">
        {/* Login Form */}
        <div className="flex flex-col justify-center p-8 md:p-14 md:w-2/3">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-2">Welcome To Bprep</h1>
            <p className="text-gray-500">Login to continue</p>
          </div>

          <a
            href="https://bprep-backend-cikh309f6-aniiiixds-projects.vercel.app/api/OGoogle/auth/google"
            className="w-full py-3 px-4 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center justify-center space-x-2 transition duration-200 ease-in-out"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M43.61 20.11H42V20H24v8h11.3c-1.65 4.66-6.07 8-11.3 8-6.63 0-12-5.37-12-12s5.37-12 12-12c3.1 0 5.91 1.17 8.05 3.07l5.65-5.65C34.46 4.09 29.5 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22 22-9.8 22-22c0-1.47-.15-2.9-.39-4.39z"
                fill="#FFC107"
              />
              <path
                d="M6.31 14.69l6.57 4.82C13.87 11.5 18.62 8 24 8c3.1 0 5.91 1.17 8.05 3.07l5.65-5.65C34.46 4.09 29.5 2 24 2 16.31 2 9.61 6.37 6.31 14.69z"
                fill="#FF3D00"
              />
              <path
                d="M24 44c5.38 0 10.25-2.03 13.9-5.34l-6.4-5.41c-1.79 1.37-4.03 2.25-6.5 2.25-5.19 0-9.6-3.3-11.23-7.86l-6.53 5.03C9.46 39.56 16.15 44 24 44z"
                fill="#4CAF50"
              />
              <path
                d="M43.61 20.11H42V20H24v8h11.3c-.79 2.24-2.14 4.23-3.9 5.7l6.4 5.41c-.46.42 6.91-5.04 6.91-15.41 0-1.47-.15-2.9-.39-4.39z"
                fill="#1976D2"
              />
            </svg>
            <span>Sign in with Google</span>
          </a>

          <div id="login-message" className="text-center text-sm"></div>
        </div>

        {/* Image Section */}
        <div className="relative hidden md:block md:w-1/3">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 rounded-r-2xl overflow-hidden">
            <div
              className="flex flex-col justify-center items-center h-full p-8 text-center text-white"
              style={{
                backgroundImage: "url('./istockphoto-1470544060-612x612.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              <div className="relative z-10">
                <h2 className="text-4xl font-bold mb-4">Hello, Friend!</h2>
                <p className="text-lg leading-relaxed">
                  Login to access your Bprep account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;