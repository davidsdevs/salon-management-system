import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
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

  const handleRegistration = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, formData.email)
      if (signInMethods.length > 0) {
        setError("An account with this email already exists. Please use a different email address.")
        setIsLoading(false)
        return
      }

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
        referralCode: formData.referralCode || null, // ✅ Store referral if provided
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

  // Progress bar renderer
  const renderProgressBar = () => {
    return (
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center space-x-4 mb-4">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
                step <= currentStep ? "bg-[#160B53]" : "bg-gray-300"
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="w-full max-w-md bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#160B53] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        <p className="text-gray-600 mt-2 text-sm">
          Step {currentStep} of {totalSteps}
        </p>
      </div>
    )
  }

  // Step renderer
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onNavigateToLogin={() => navigate("/")}
          />
        )
      case 2:
        return (
          <AccountSecurityStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
            onNavigateToLogin={() => navigate("/")}
          />
        )
      case 3:
        return (
          <ContactPreferencesStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
            onNavigateToLogin={() => navigate("/")}
          />
        )
      case 4:
        return (
          <EmailVerificationStep
            formData={formData}
            onNext={handleRegistration}
            onBack={prevStep}
            onNavigateToLogin={() => navigate("/")}
            isLoading={isLoading}
          />
        )
      case 5:
        return <WelcomeStep onNavigateToLogin={() => navigate("/")} />
      default:
        return null
    }
  }

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
            className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#160B53]"
          />

          <div className="flex justify-end gap-3 w-full">
            <button
              onClick={() => {
                setReferralModalOpen(false)
              }}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Skip
            </button>
            <button
              onClick={() => {
                setFormData((prev) => ({ ...prev, referralCode: referralInput }))
                setReferralModalOpen(false)
              }}
              className="px-4 py-2 rounded-lg bg-[#160B53] text-white hover:bg-[#0f073d]"
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

        {renderProgressBar()}
        {renderCurrentStep()}
      </div>
    </div>
  )
}

export default RegisterForm