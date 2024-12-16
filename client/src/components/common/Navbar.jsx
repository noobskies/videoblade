// client/src/components/common/Navbar.jsx
import { UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-primary-600">VideoBlade</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex space-x-4">
                <Link 
                  to="/" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <UserButton 
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;