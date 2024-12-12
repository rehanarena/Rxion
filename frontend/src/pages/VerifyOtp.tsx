import React, { useState, ChangeEvent, FormEvent } from "react";

const OtpVerify: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill("")); // State for 6-digit OTP
  const [message, setMessage] = useState<string>("");

  // Handle input change for each box
  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ): void => {
    const value = e.target.value;
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move focus to the next input
      if (value && e.target.nextSibling) {
        (e.target.nextSibling as HTMLInputElement).focus();
      }
    }
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const enteredOtp = otp.join("");
    if (enteredOtp.length === 6) {
      // Replace with your OTP verification logic
      console.log("OTP Submitted:", enteredOtp);
      setMessage("OTP Verified Successfully!");
    } else {
      setMessage("Please enter a valid 6-digit OTP.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-2">
          Enter Verification Code
        </h2>
        <p className="text-gray-600 text-center mb-4">
          OTP has been sent via email
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                maxLength={1}
                className="w-12 h-12 text-center text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ))}
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 transition duration-300"
          >
            Verify OTP
          </button>
        </form>
        {message && (
          <p
            className={`mt-4 text-center ${
              message.includes("Successfully")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default OtpVerify;
