// client/src/pages/SignUp.jsx
import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Start managing your social media content today
          </p>
        </div>
        <SignUp 
          routing="path" 
          path="/sign-up" 
          signInUrl="/sign-in"
          redirectUrl="/"
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-blue-600 hover:bg-blue-700 text-white",
              footerActionLink: 
                "text-blue-600 hover:text-blue-800"
            }
          }}
        />
      </div>
    </div>
  );
};

export default SignUpPage;