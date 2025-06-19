import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center fade-in-mobile">
        <img src="/logoTransparent.png" alt="Face2BrandAI Logo" className="mx-auto mb-6 h-24 w-48 sm:h-32 sm:w-64 object-cover object-center pop-mobile" />
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline ripple-mobile">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
