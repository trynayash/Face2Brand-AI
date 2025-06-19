import React from 'react';
import { Shield, FileText, Users, AlertTriangle, Mail, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Back to Home Arrow */}
      <button
        onClick={() => navigate('/')}
        aria-label="Back to Home"
        className="absolute top-6 left-6 bg-white/80 hover:bg-white rounded-full p-2 shadow transition-colors z-10"
      >
        <svg width="28" height="28" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      {/* Terms Logo */}
      <div className="bg-white/90 rounded-2xl shadow-xl p-8 max-w-2xl w-full border border-purple-100">
        {/* Centered Terms Logo above heading */}
        <img src="/terms.png" alt="Terms Logo" className="h-16 w-16 rounded-xl mx-auto mb-4 object-cover max-w-full" />
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-blue-700">Terms & Conditions</h1>
          <p className="text-gray-500 mb-2">Face2Brand AI – Educational Project</p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          
          {/* Project Overview */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <Heart className="w-6 h-6 text-purple-500 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Project Overview</h2>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Face2Brand AI</strong> is a student project built for
                  <a
                    href="https://gdg.community.dev/events/details/google-gdg-cloud-new-delhi-presents-google-cloud-community-days-2025/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-purple-600 underline hover:text-purple-800 transition-colors mx-1"
                  >
                    Google Cloud Community Days 2025
                  </a>
                  and is intended for educational and demonstration purposes only. This application demonstrates AI-powered brand recognition capabilities and is created 
                  exclusively for educational, demonstration, and learning purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Intellectual Property */}
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Intellectual Property Rights</h2>
                <div className="space-y-3 text-gray-700">
                  <p>We deeply respect intellectual property rights and acknowledge the following:</p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      All third-party logos, trademarks, and brand assets (including Google Cloud, company logos, etc.) 
                      remain the exclusive property of their respective owners and rights holders.
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Usage of these assets is strictly limited to educational demonstration within this project's scope.
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      No commercial use, redistribution, or modification of proprietary assets is intended or permitted.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimers */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Important Disclaimers</h2>
                <div className="space-y-3 text-gray-700">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white/60 rounded-xl p-4">
                      <h3 className="font-semibold mb-2">No Official Affiliation</h3>
                      <p className="text-sm">This project is not officially affiliated with, endorsed by, or sponsored by Google, Google Cloud, or any other organization whose assets may appear.</p>
                    </div>
                    <div className="bg-white/60 rounded-xl p-4">
                      <h3 className="font-semibold mb-2">Educational Purpose</h3>
                      <p className="text-sm">All content, features, and demonstrations are created purely for educational learning and skill development purposes.</p>
                    </div>
                    <div className="bg-white/60 rounded-xl p-4">
                      <h3 className="font-semibold mb-2">No Copyright Infringement</h3>
                      <p className="text-sm">No copyright infringement is intended. Fair use principles are applied where applicable for educational purposes.</p>
                    </div>
                    <div className="bg-white/60 rounded-xl p-4">
                      <h3 className="font-semibold mb-2">Student Project</h3>
                      <p className="text-sm">This is a non-commercial student project created to showcase technical skills and innovative thinking.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Responsibilities */}
          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <Users className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">User Responsibilities</h2>
                <div className="space-y-2 text-gray-700">
                  <p>• Use this application responsibly and in accordance with its educational purpose</p>
                  <p>• Respect all intellectual property rights of third parties</p>
                  <p>• Do not use this project for any commercial or unauthorized purposes</p>
                  <p>• Understand that results are for demonstration purposes and may not be 100% accurate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <Mail className="w-6 h-6 text-purple-500 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact & Copyright Concerns</h2>
                <p className="text-gray-700">
                  If you are a copyright holder and believe your rights have been infringed, or if you have 
                  any questions about this project, please contact us immediately. We are committed to 
                  addressing any legitimate concerns promptly and respectfully.
                </p>
                <div className="mt-4 p-4 bg-white/60 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> We take intellectual property rights seriously and will cooperate 
                    fully to resolve any issues while maintaining the educational value of this project.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-sm text-gray-600">Made with passion for learning</span>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Terms;