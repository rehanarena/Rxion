import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <h1 className="text-8xl font-extrabold text-red-600">404</h1>
      <h2 className="mt-2 text-2xl font-semibold text-gray-800">
        Page Not Found
      </h2>
      <p className="mt-4 text-lg text-gray-600 text-center max-w-md">
        Sorry, the page you are looking for doesn't exist or has been moved. 
        Please check the URL or return to the homepage.
      </p>
      <button
        className="mt-6 px-8 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg shadow-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
        onClick={() => navigate("/")}
      >
        Go Back Home
      </button>
    </main>
  );
};

export default NotFound;
