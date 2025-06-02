import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, UserCheck, Key, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col min-h-[calc(100vh-14rem)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Secure Identity Management for Your Digital World
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Iymra Accounts provides a centralized authentication system with advanced user management for your entire ecosystem.
          </p>
          {user ? (
            <Link to="/profile" className="inline-block bg-white text-indigo-600 font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-gray-100 transition-colors">
              Go to Your Account
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login" className="inline-block bg-white text-indigo-600 font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-gray-100 transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="inline-block bg-transparent text-white font-semibold px-8 py-3 rounded-lg border-2 border-white hover:bg-white hover:text-indigo-600 transition-colors">
                Create Account
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Powerful Identity Features
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Shield className="w-10 h-10" />}
              title="Secure Authentication"
              description="Industry-standard authentication with email verification and JWT token security."
            />
            <FeatureCard 
              icon={<UserCheck className="w-10 h-10" />}
              title="Extended User Profiles"
              description="Flexible user data schema supporting rich profile information with customizable fields."
            />
            <FeatureCard 
              icon={<Key className="w-10 h-10" />}
              title="Access Management"
              description="Granular control of user access with token-based authentication system."
            />
            <FeatureCard 
              icon={<Globe className="w-10 h-10" />}
              title="Future-Ready"
              description="Built for growth with OAuth 2.0, OpenID Connect, and multi-factor authentication."
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-gray-100 dark:bg-gray-700 py-16 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-8 text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Create your Iymra account today and experience secure, streamlined identity management.
          </p>
          <Link to="/register" className="inline-block bg-indigo-600 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4 text-indigo-600 dark:text-indigo-400">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

export default HomePage;