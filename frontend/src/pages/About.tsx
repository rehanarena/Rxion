import React from "react";

const About: React.FC = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-6">
      <div className="max-w-3xl bg-white shadow-lg rounded-2xl p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">About Rxion</h1>
        <p className="text-gray-600 text-lg mb-6">
          Welcome to <strong>Rxion</strong>, your trusted platform for online doctor consultations and 
          hassle-free appointment booking. With a vast network of experienced doctors, Rxion makes 
          healthcare accessible, convenient, and efficient for everyone.
        </p>
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">Our Mission</h2>
        <p className="text-gray-600 mb-6">
          Our mission is to bridge the gap between patients and healthcare professionals by 
          providing a seamless digital experience. Whether you need a quick consultation or 
          want to book an in-person appointment, Rxion ensures quality healthcare is just a click away.
        </p>
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">Why Choose Rxion?</h2>
        <ul className="text-gray-600 text-left mb-6 list-disc list-inside">
          <li><strong>Online Appointments</strong> – Easily book consultations with top doctors.</li>
          <li><strong>Virtual Consultations</strong> – Get expert medical advice from the comfort of your home.</li>
          <li><strong>Wide Network of Doctors</strong> – Access specialists from various medical fields.</li>
          <li><strong>Secure & Reliable</strong> – Your health data is safe and confidential.</li>
        </ul>
        <p className="text-lg font-semibold text-gray-700"> Experience the future of healthcare with Rxion!</p>
      </div>
    </div>
  );
};

export default About;
