import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth"
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore"
import { auth, db } from "./firebase"
import PersonalInfoStep from "./common/components/register-steps/PersonalInfoStep"
import AccountSecurityStep from "./common/components/register-steps/AccountSecurityStep"
import ContactPreferencesStep from "./common/components/register-steps/ContactPreferencesStep"
import EmailVerificationStep from "./common/components/register-steps/EmailVerificationStep"
import WelcomeStep from "./common/components/register-steps/WelcomeStep"

function RegisterForm() {
  const navigate = useNavigate()

  // Step + Form States
  const [currentStep, setCurrentStep] = useState(() => {
    const savedStep = sessionStorage.getItem("registerStep")
    return savedStep ? Number(savedStep) : 1
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [referralModalOpen, setReferralModalOpen] = useState(true)
  const [referralInput, setReferralInput] = useState("")
  const [referralError, setReferralError] = useState("")
  const [referralValid, setReferralValid] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthDate: "",
    gender: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    receivePromotions: false,
    agreeToTerms: false,
    referralCode: "" // ✅ Store referral here
  })

  const totalSteps = 5

  const updateFormData = (data) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    setCurrentStep((prev) => {
      const next = prev + 1
      sessionStorage.setItem("registerStep", next)
      return next
    })
  }

  const prevStep = () => {
    setCurrentStep((prev) => {
      const prevStep = prev - 1
      sessionStorage.setItem("registerStep", prevStep)
      return prevStep
    })
  }

  // ✅ Check referral validity whenever input changes (debounced)
  useEffect(() => {
    if (!referralInput.trim()) {
      setReferralError("")
      setReferralValid(false)
      return
    }

    const timer = setTimeout(async () => {
      try {
        const q = query(
          collection(db, "loyalty"),
          where("referral_code", "==", referralInput.trim())
        )
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          setReferralError("Invalid referral code. Please check and try again.")
          setReferralValid(false)
        } else {
          setReferralError("")
          setReferralValid(true)
        }
      } catch (err) {
        console.error("Error checking referral:", err)
        setReferralError("Something went wrong. Please try again later.")
        setReferralValid(false)
      }
    }, 500) // debounce 500ms

    return () => clearTimeout(timer)
  }, [referralInput])

  const handleRegistration = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")
  
    try {
      // Check if email is already registered
      const signInMethods = await fetchSignInMethodsForEmail(auth, formData.email)
      if (signInMethods.length > 0) {
        setError("An account with this email already exists. Please use a different email address.")
        setIsLoading(false)
        return
      }
  
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user
  
      // 1️⃣ Save personal info
      const personalInfo = {
        uid: user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email.toLowerCase().trim(),
        birthDate: formData.birthDate,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber,
        emailVerified: false,
      }
      await setDoc(doc(db, "users", user.uid), personalInfo)
  
      // 2️⃣ Save account info
      const accountInfo = {
        userId: user.uid,
        role: "client",
        status: "active",
        receivePromotions: formData.receivePromotions,
        agreeToTerms: formData.agreeToTerms,
        createdAt: new Date().toISOString(),
      }
      await setDoc(doc(db, "clients_account", user.uid), accountInfo)
  
      // 3️⃣ Handle referral (if any)
      if (formData.referralCode) {
        const referralQuery = query(
          collection(db, "loyalty"),
          where("referral_code", "==", formData.referralCode)
        )
        const referralSnapshot = await getDocs(referralQuery)
  
        if (!referralSnapshot.empty) {
          const refDoc = referralSnapshot.docs[0]
          const refData = refDoc.data()
  
          // a) Add a record to referrals collection
          await setDoc(doc(collection(db, "referrals")), {
            newUserId: user.uid,
            referralCode: formData.referralCode,
            account_id: refData.account_id,
            branch_id: refData.branch_id,
            timestamp: new Date().toISOString(),
          })
  
          // b) Increment loyalty points by 300
          await setDoc(doc(db, "loyalty", refDoc.id), {
            points: (refData.points || 0) + 300
          }, { merge: true })
        }
      }
  
      setSuccess("Account created successfully! Please check your email for verification.")
  
      // ✅ Move to welcome step
      setCurrentStep(5)
      sessionStorage.setItem("registerStep", 5)
  
    } catch (error) {
      console.error("Registration error:", error)
      setError("Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }
  

  // Cleanup on unmount
  useEffect(() => {
    return () => sessionStorage.removeItem("registerStep")
  }, [])

  // Referral modal
  const renderReferralModal = () => {
    if (!referralModalOpen) return null
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-96 flex flex-col items-center">
          {/* Logo */}
          <img
            src="/logo.png"
            alt="Salon Logo"
            className="h-16 w-auto mb-4"
          />

          <h2 className="text-xl font-bold text-[#160B53] text-center mb-4">
            Were you referred?
          </h2>
          <p className="text-gray-600 text-sm text-center mb-4">
            Enter your referral code below to earn rewards.
          </p>

          <input
            type="text"
            value={referralInput}
            onChange={(e) => setReferralInput(e.target.value)}
            placeholder="Enter referral code"
            className="w-full border rounded-lg p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-[#160B53]"
          />

          {/* Error / Success messages */}
          {referralError && (
            <p className="text-red-500 text-sm mb-2">{referralError}</p>
          )}
          {referralValid && (
            <p className="text-green-600 text-sm mb-2">Referral code is valid</p>
          )}

          <div className="flex justify-end gap-3 w-full mt-2">
            <button
              onClick={() => setReferralModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Skip
            </button>
            <button
              onClick={() => {
                if (referralValid) {
                  setFormData((prev) => ({ ...prev, referralCode: referralInput.trim() }))
                  setReferralModalOpen(false)
                }
              }}
              disabled={!referralValid}
              className={`px-4 py-2 rounded-lg text-white ${
                referralValid
                  ? "bg-[#160B53] hover:bg-[#0f073d]"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 relative">
      {renderReferralModal()}

      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#160B53] mb-4">Register an Account</h1>
          <p className="text-gray-600">Sign up your David's Salon account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <p className="text-green-700 text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Render steps */}
        {currentStep === 1 && (
          <PersonalInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onNavigateToLogin={() => navigate("/")}
          />
        )}
        {currentStep === 2 && (
          <AccountSecurityStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
            onNavigateToLogin={() => navigate("/")}
          />
        )}
        {currentStep === 3 && (
          <ContactPreferencesStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
            onNavigateToLogin={() => navigate("/")}
          />
        )}
        {currentStep === 4 && (
          <EmailVerificationStep
            formData={formData}
            onNext={handleRegistration}
            onBack={prevStep}
            onNavigateToLogin={() => navigate("/")}
            isLoading={isLoading}
          />
        )}
        {currentStep === 5 && (
          <WelcomeStep onNavigateToLogin={() => navigate("/")} />
        )}
      </div>
    </div>
  )
}

export default RegisterForm
