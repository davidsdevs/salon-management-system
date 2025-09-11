import React, { useState } from "react";
import SidebarWithHeader from "./common/components/SidebarWithHeader.jsx";
import { useAuth } from "../contexts/AuthContext";

export default function ClientBookAppointment() {
  const { userProfile } = useAuth();

  const userInfo = {
    name: userProfile?.firstName || "Client",
    subtitle: userProfile?.email || "Salon Client",
    badge: "Client",
    profileImage: userProfile?.profileImage || "./placeholder.svg",
  };

  const [step, setStep] = useState(1);
  const [branch, setBranch] = useState({ id: "b1", name: "Main Branch" }); // mock branch
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedServices, setSelectedServices] = useState({});
  const [showWaiver, setShowWaiver] = useState(false);
  const [currentChemicalService, setCurrentChemicalService] = useState(null);

  const steps = ["Branch", "Date & Time", "Service & Stylist", "Summary"];

  // Mock stylists & services
  const mockStylists = [
    {
      name: "Alice Johnson",
      position: "Senior Stylist",
      remaining: 5,
      services: ["Haircut", "Color", "Shampoo", "Treatment"]
    },
    {
      name: "Bob Smith",
      position: "Stylist",
      remaining: 3,
      services: ["Haircut", "Shampoo"]
    }
  ];

  const serviceWorkloads = {
    Haircut: { price: 200, chemical: false },
    Color: { price: 500, chemical: true },
    Shampoo: { price: 100, chemical: false },
    Treatment: { price: 350, chemical: false }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const toggleService = (stylistName, service) => {
    setSelectedServices(prev => {
      const current = prev[stylistName] || [];
      if (current.includes(service)) {
        return { ...prev, [stylistName]: current.filter(s => s !== service) };
      } else {
        return { ...prev, [stylistName]: [...current, service] };
      }
    });
  };

  const handleServiceClick = (stylistName, service) => {
    if (serviceWorkloads[service].chemical) {
      setCurrentChemicalService({ stylistName, service });
      setShowWaiver(true);
    } else {
      toggleService(stylistName, service);
    }
  };

  const confirmWaiver = () => {
    toggleService(currentChemicalService.stylistName, currentChemicalService.service);
    setShowWaiver(false);
    setCurrentChemicalService(null);
  };

  const calculateTotal = () => {
    let total = 0;
    Object.values(selectedServices).forEach(arr => {
      arr.forEach(svc => {
        total += serviceWorkloads[svc]?.price || 0;
      });
    });
    return total;
  };

  return (
    <SidebarWithHeader userInfo={userInfo} pageTitle="Book Appointment">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-4">Book Your Appointment</h1>

        {/* Step indicators */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((label, idx) => (
            <div key={label} className="flex-1 flex flex-col items-center">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${
                step === idx + 1 ? "bg-[#160B53] text-white border-[#160B53]"
                : step > idx + 1 ? "bg-[#160B53] text-white border-[#160B53]"
                : "border-gray-300 text-gray-400"
              }`}>{idx + 1}</div>
              <span className="text-sm mt-2">{label}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow p-6">

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Select Date & Time</h2>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={e => setDate(e.target.value)}
                className="w-full border rounded p-2 mb-2"
              />
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full border rounded p-2 mb-2"
              />
              {date && time && (
                <div className="mt-2 p-3 rounded bg-blue-100 text-blue-900 border-l-4 border-blue-500 font-medium">
                  Stylists will be displayed in the next step.
                </div>
              )}
            </div>
          )}

          {/* Step 3: Stylists & Services */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Choose Stylist & Services</h2>
              {mockStylists.map((s, idx) => (
                <div key={idx} className="border p-4 rounded-xl mb-4 bg-blue-50">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-sm text-gray-700">{s.position}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {s.services.map(svc => {
                      const isSelected = selectedServices[s.name]?.includes(svc) || false;
                      return (
                        <button
                          key={svc}
                          onClick={() => handleServiceClick(s.name, svc)}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition ${
                            isSelected ? "bg-[#160B53] text-white border-[#160B53]" : "bg-white text-gray-700 border-gray-300"
                          }`}
                        >
                          {svc} – ₱{serviceWorkloads[svc].price}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">Remaining workload: {s.remaining}</div>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Summary */}
          {step === 4 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>
              <p><strong>Date:</strong> {new Date(date).toDateString()} at {time}</p>
              <p><strong>Branch:</strong> {branch.name}</p>
              <ul className="list-disc pl-5 mt-2">
                {Object.entries(selectedServices).map(([stylist, services]) =>
                  services.map((svc, idx) => (
                    <li key={stylist+idx}>{svc} with {stylist} – ₱{serviceWorkloads[svc].price}</li>
                  ))
                )}
              </ul>
              <p className="mt-2 font-semibold">Total: ₱{calculateTotal()}</p>
              <button
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
                onClick={() => alert("Mock booking saved!")}
              >
                Confirm Booking
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            {step > 1 && <button onClick={prevStep} className="px-4 py-2 border rounded">Previous</button>}
            {step < 4 && <button onClick={nextStep} className="ml-auto px-4 py-2 bg-[#160B53] text-white rounded" disabled={step === 2 && (!date || !time)}>Next</button>}
          </div>
        </div>

        {/* Chemical Waiver Modal */}
        {showWaiver && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white p-6 rounded-lg max-w-sm">
              <h2 className="font-bold text-lg">Chemical Service Waiver</h2>
              <p className="mt-2">You are about to book {currentChemicalService.service} with {currentChemicalService.stylistName}. Please confirm that you accept the chemical service risks.</p>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setShowWaiver(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button onClick={confirmWaiver} className="px-4 py-2 bg-blue-600 text-white rounded">Confirm</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarWithHeader>
  );
}
