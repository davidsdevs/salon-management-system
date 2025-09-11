import { useState, useEffect, useRef } from "react"
import { User, Mail, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { fetchSignInMethodsForEmail } from "firebase/auth"
import { auth, db } from "../../../firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

function PersonalInfoStep({ formData, updateFormData, onNext, onNavigateToLogin }) {
  const [errors, setErrors] = useState({})
  const [emailStatus, setEmailStatus] = useState("idle") // idle, checking, valid, invalid
  const [emailError, setEmailError] = useState("")
  const lastCheckedEmail = useRef("")

  const normalizeEmail = (email) => email.trim().toLowerCase()

  // Firestore email check
  const checkEmailInFirestore = async (email) => {
    const usersRef = collection(db, "users") // adjust collection name if different
    const q = query(usersRef, where("email", "==", email))
    const snapshot = await getDocs(q)
    return !snapshot.empty
  }

  // Firebase Auth email check
  const checkEmailInAuth = async (email) => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email)
      return methods.length > 0
    } catch (err) {
      console.error("Firebase Auth check error:", err)
      return false
    }
  }

  // Combined check
  const checkEmailExists = async (email) => {
    const normalized = normalizeEmail(email)
    if (!normalized) {
      setEmailStatus("idle")
      setEmailError("")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalized)) {
      setEmailStatus("invalid")
      setEmailError("Please enter a valid email address")
      return
    }

    setEmailStatus("checking")
    setEmailError("")
    lastCheckedEmail.current = normalized

    try {
      // 1. Firestore
      const firestoreExists = await checkEmailInFirestore(normalized)
      if (lastCheckedEmail.current !== normalized) return // ignore stale results
      if (firestoreExists) {
        setEmailStatus("invalid")
        setEmailError("An account with this email already exists")
        return
      }

      // 2. Firebase Auth
      const authExists = await checkEmailInAuth(normalized)
      if (lastCheckedEmail.current !== normalized) return
      if (authExists) {
        setEmailStatus("invalid")
        setEmailError("An account with this email already exists")
        return
      }

      // If neither exist
      setEmailStatus("valid")
      setEmailError("")
    } catch (err) {
      console.error("Email check error:", err)
      setEmailStatus("invalid")
      setEmailError("Unable to verify email. Please try again later.")
    }
  }

  // Debounce email validation
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (formData.email) checkEmailExists(formData.email)
    }, 500)
    return () => clearTimeout(timeout)
  }, [formData.email])

  const handleEmailChange = (e) => {
    updateFormData({ email: e.target.value })
    setEmailStatus("idle")
    setEmailError("")
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.birthDate) newErrors.birthDate = "Birth date is required"
    if (!formData.gender) newErrors.gender = "Gender is required"
    if (emailStatus !== "valid") newErrors.email = "Please enter a valid and unique email address"

    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) onNext()
  }

  const isNextButtonDisabled = () => {
    return (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.birthDate ||
      !formData.gender ||
      emailStatus !== "valid"
    )
  }

  const getEmailInputClasses = () => {
    let base = "w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#160B53] focus:border-transparent"
    if (emailStatus === "valid") return base + " border-green-300 bg-green-50"
    if (emailStatus === "invalid") return base + " border-red-300 bg-red-50"
    if (emailStatus === "checking") return base + " border-blue-300 bg-blue-50"
    return base + " border-gray-300"
  }

  const renderEmailStatusIcon = () => {
    if (emailStatus === "checking") return <Loader2 className="absolute right-3 top-3 h-5 w-5 text-blue-500 animate-spin" />
    if (emailStatus === "valid") return <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-green-500" />
    if (emailStatus === "invalid") return <XCircle className="absolute right-3 top-3 h-5 w-5 text-red-500" />
    return null
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg p-8" style={{ border: '1px solid #DBDBDB', boxShadow: '0 2px 15px 0 rgba(0, 0, 0, 0.25)' }}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-[#160B53] mb-2">Personal Information</h2>
          <p className="text-gray-600">Please fill in the required information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => updateFormData({ firstName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#160B53] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => updateFormData({ lastName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#160B53] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleEmailChange}
                className={getEmailInputClasses()}
              />
              {renderEmailStatusIcon()}
            </div>
            {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Birth Date</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => updateFormData({ birthDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#160B53] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => updateFormData({ gender: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#160B53] focus:border-transparent"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isNextButtonDisabled()}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors mt-6 ${
              isNextButtonDisabled()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#160B53] text-white hover:bg-[#2d1b69]"
            }`}
          >
            Next
          </button>
        </form>
      </div>
    </div>
  )
}

export default PersonalInfoStep
