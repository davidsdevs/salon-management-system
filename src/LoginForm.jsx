import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("🚀 Attempting login with:", email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("✅ Firebase login successful:", user.email);

      // 🔹 Fetch profile from `users/{uid}`
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("User profile not found. Contact admin.");
      }

      const userData = { uid: user.uid, email: user.email, ...userSnap.data() };
      console.log("📂 User profile:", userData);

      // 🔹 Store locally (respect Remember Me)
      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        sessionStorage.setItem("user", JSON.stringify(userData));
      }

      setSuccess("Login successful! Redirecting...");
      setError("");
      setEmail("");
      setPassword("");

      // 🔹 Map role → dashboard
      const roleMap = {
        client: "/client-dashboard",
        receptionist: "/receptionist-dashboard",
        "inventory-controller": "/inventory-dashboard",
        "branch-manager": "/branchmanager-dashboard",
        "branch-admin": "/branchadmin-dashboard",
        "operational-manager": "/operational-dashboard",
        stylist: "/stylist-dashboard",
        "super-admin": "/super-admin-dashboard",
        staff: "/staff-dashboard", // fallback
      };

      const dashboardPath = roleMap[userData.role] || "/client-dashboard";

      // 🔹 Example: special case receptionist → attach branchId
      if (userData.role === "receptionist" && userData.staffData?.branchId) {
        console.log("📍 Receptionist branchId:", userData.staffData.branchId);
      }

      console.log("➡️ Navigating to:", dashboardPath);

      setTimeout(() => {
        navigate(dashboardPath, { replace: true });
      }, 1000);
    } catch (error) {
      console.error("❌ Login error:", error);
      setError(getErrorMessage(error.code || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/user-not-found":
        return "No account found with this email address.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      default:
        return "Login failed. Please check your credentials and try again.";
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mt-[122px]">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-[#160B53] mb-2 font-poppins">
            Welcome Back
          </h2>
          <p className="text-gray-600 font-poppins">
            Sign in to your David's Salon account
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid #DBDBDB', boxShadow: '0 2px 15px 0 rgba(0, 0, 0, 0.25)' }}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-700 text-sm font-medium">{success}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2 font-poppins"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#160B53] focus:border-transparent font-poppins"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2 font-poppins"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#160B53] focus:border-transparent pr-12 font-poppins"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#160B53] focus:ring-[#160B53] border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700 font-poppins"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => console.log("Forgot password clicked")}
                  className="font-medium text-[#160B53] hover:text-[#2D1B69] font-poppins"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#160B53] hover:bg-[#2D1B69] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#160B53] transition-colors duration-200 font-poppins disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
