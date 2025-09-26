import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, authLoading] = useAuthState(auth);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [branchInfo, setBranchInfo] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // 🔹 Load from localStorage or sessionStorage first
  useEffect(() => {
    const storedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));
    const storedBranch = 
      JSON.parse(localStorage.getItem("branchInfo")) ||
      JSON.parse(sessionStorage.getItem("branchInfo"));

    if (storedUser) {
      setUserProfile(storedUser);
      setUserRole(storedUser.role || "client");
    }
    if (storedBranch) {
      setBranchInfo(storedBranch);
    }
  }, []);

  // 🔹 Sync with Firebase Auth (refresh profile when logged in)
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      const fetchUserProfile = async () => {
        try {
          setProfileLoading(true);
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = { uid: user.uid, email: user.email, ...userDoc.data() };
            setUserProfile(data);
            setUserRole(data.role || "client");

            // Fetch branch information for staff users
            if (data.staffData?.branchId) {
              try {
                console.log('🔍 Fetching branch info for branchId:', data.staffData.branchId);
                const branchDoc = await getDoc(doc(db, "branches", data.staffData.branchId));
                if (branchDoc.exists()) {
                  const branchData = { id: branchDoc.id, ...branchDoc.data() };
                  console.log('✅ Branch info loaded:', branchData);
                  setBranchInfo(branchData);
                  
                  // Store branch info in same storage as user
                  if (localStorage.getItem("user")) {
                    localStorage.setItem("branchInfo", JSON.stringify(branchData));
                  } else {
                    sessionStorage.setItem("branchInfo", JSON.stringify(branchData));
                  }
                } else {
                  console.log('❌ Branch document not found for ID:', data.staffData.branchId);
                }
              } catch (branchError) {
                console.error("Error fetching branch info:", branchError);
              }
            } else {
              console.log('⚠️ No staffData.branchId found for user:', data.role);
              // Clear branch info for non-staff users
              setBranchInfo(null);
              localStorage.removeItem("branchInfo");
              sessionStorage.removeItem("branchInfo");
            }

            // overwrite storage (respect Remember Me)
            if (localStorage.getItem("user")) {
              localStorage.setItem("user", JSON.stringify(data));
            } else {
              sessionStorage.setItem("user", JSON.stringify(data));
            }
          } else {
            setUserRole("client"); // fallback
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserRole("client");
        } finally {
          setProfileLoading(false);
        }
      };
      fetchUserProfile();
    } else {
      setUserRole(null);
      setUserProfile(null);
      sessionStorage.removeItem("user");
      localStorage.removeItem("user");
    }
  }, [user, authLoading]);

  const refreshUserRole = async () => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = { uid: user.uid, email: user.email, ...userDoc.data() };
          setUserProfile(data);
          setUserRole(data.role || "client");

          // Fetch branch information for staff users
          if (data.staffData?.branchId) {
            try {
              console.log('🔍 RefreshUserRole - Fetching branch info for branchId:', data.staffData.branchId);
              const branchDoc = await getDoc(doc(db, "branches", data.staffData.branchId));
              if (branchDoc.exists()) {
                const branchData = { id: branchDoc.id, ...branchDoc.data() };
                console.log('✅ RefreshUserRole - Branch info loaded:', branchData);
                setBranchInfo(branchData);
                
                // Store branch info in same storage as user
                if (localStorage.getItem("user")) {
                  localStorage.setItem("branchInfo", JSON.stringify(branchData));
                } else {
                  sessionStorage.setItem("branchInfo", JSON.stringify(branchData));
                }
              } else {
                console.log('❌ RefreshUserRole - Branch document not found for ID:', data.staffData.branchId);
              }
            } catch (branchError) {
              console.error("Error fetching branch info:", branchError);
            }
          } else {
            console.log('⚠️ RefreshUserRole - No staffData.branchId found for user:', data.role);
            setBranchInfo(null);
            localStorage.removeItem("branchInfo");
            sessionStorage.removeItem("branchInfo");
          }

          // update whichever storage is in use
          if (localStorage.getItem("user")) {
            localStorage.setItem("user", JSON.stringify(data));
          } else {
            sessionStorage.setItem("user", JSON.stringify(data));
          }

          return data.role || "client";
        }
      } catch (error) {
        console.error("Error refreshing user role:", error);
      }
    }
    return null;
  };

  const logout = async () => {
    try {
      console.log("Starting logout process...");
      console.log("Before logout - user:", !!user, "userProfile:", !!userProfile);
      
      // Clear state immediately for better UX
      setUserRole(null);
      setUserProfile(null);
      setBranchInfo(null);
      sessionStorage.removeItem("user");
      localStorage.removeItem("user");
      sessionStorage.removeItem("branchInfo");
      localStorage.removeItem("branchInfo");
      
      console.log("Local state cleared");
      
      // Then sign out from Firebase
      await signOut(auth);
      
      console.log("Firebase signOut completed");
      
      // Force a small delay to ensure state updates
      setTimeout(() => {
        console.log("After logout - user:", !!user, "userProfile:", !!userProfile);
        console.log("isAuthenticated should be:", !!(user || userProfile));
      }, 100);
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if Firebase logout fails, we've already cleared local state
    }
  };

  const value = {
    user,
    userRole,
    userProfile,
    branchInfo,
    loading: authLoading,
    isAuthenticated: !!(user || userProfile), // ✅ check also from storage
    isClient: userRole === "client",
    isStylist: userRole === "stylist",
    isReceptionist: userRole === "receptionist",
    isBranchManager: userRole === "branch_manager",
    isInventoryController: userRole === "inventory_controller",
    isOperationalManager: userRole === "operational_manager",
    isBranchAdmin: userRole === "branch_admin",
    isSuperAdmin: userRole === "super_admin",
    refreshUserRole,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}