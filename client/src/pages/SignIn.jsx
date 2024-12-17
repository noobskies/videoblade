import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">
            VideoBlade
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your social media content
          </p>
        </div>
        
        <div className="bg-white shadow-xl rounded-xl py-4">
          <SignIn 
            afterSignInUrl="/"
            signUpUrl="/sign-up"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none p-0",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white w-full",
                formFieldInput: "w-full",
                footerActionLink: "text-blue-600 hover:text-blue-700"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;