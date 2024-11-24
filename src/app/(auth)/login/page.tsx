'use client';

import { FC, useState } from 'react';
import { signIn } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import Button from '@/components/ui/Button';

const Page: FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function loginWithGoogle() {
    setIsLoading(true);
    try {
      await signIn('google');
    } catch (error) {
      toast.error('Something went wrong with your login.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-indigo-200 flex flex-col items-center justify-center p-6 text-gray-800">
      {/* Logo Section */}
      <div className="relative mb-6 w-[150px] h-[150px] flex items-center justify-center bg-white rounded-full shadow-lg">
        <Image
          src='/logo.png'
          alt="ChatApp Logo"
          layout="fill"
          className="rounded-full object-cover scale-[1] object-center"
        />
      </div>

      <h2 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 mb-4">
        SAMVAAD
      </h2>
      <h1 className="text-3xl font-medium mb-4 text-center text-gray-700">
        Your Gateway to Real-Time Conversations
      </h1>
      <p className="text-xl text-gray-600 text-center mb-8">
        Experience seamless connections like never before.
      </p>

      {/* Google Login Button */}
      <Button
        onClick={loginWithGoogle}
        disabled={isLoading}
        className={`flex items-center justify-center gap-3 text-white hover: font-medium py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 ${isLoading ? 'cursor-not-allowed opacity-50' : ''
          }`}
      >
        {isLoading && <span className="loader mr-2"></span>}
        {!isLoading && (
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path fill="#4285F4" d="M22.5 12.3c0-.7-.1-1.4-.2-2H12v4.3h5.9c-.3 1.4-1 2.6-2.2 3.4v2.8h3.6c2-2 3.2-4.7 3.2-8.1z" />
            <path fill="#34A853" d="M12 23c2.9 0 5.5-.9 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.8 0-5.3-1.9-6.2-4.5H2.2v2.9C4 20.5 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.8 14.1c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2.1V7.1H2.2C1.4 8.6 1 10.2 1 12s.4 3.4 1.2 4.9l2.6-2.3z" />
            <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.6l3.1-3.1C17.4 2.1 14.9 1 12 1 7.7 1 4 3.5 2.2 7.1L5.8 9c.9-2.6 3.3-4.6 6.2-4.6z" />
          </svg>
        )}
        Sign in with Google
      </Button>

      {/* Features Section */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl w-full">
        {[{ icon: '💬', title: 'Chat', description: 'Real-time text messaging.' },
        { icon: '📞', title: 'Calls', description: 'Voice & video calling.' },
        { icon: '🔔', title: 'Notifications', description: 'Instant alerts.' },
        { icon: '🤖', title: 'AI Chatbot', description: 'Smart chatbot assistance.' },
        ].map((feature, index) => (
          <div
            key={index}
            className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
          >
            <div className="text-5xl mb-4">{feature.icon}</div>
            <h3 className="font-bold text-xl">{feature.title}</h3>
            <p className="text-md text-gray-600 text-center">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
