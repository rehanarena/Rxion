import React from "react";

const Contact: React.FC = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-6">
      <div className="max-w-3xl bg-white shadow-lg rounded-2xl p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
        <p className="text-gray-600 text-lg mb-6">
          Have questions or need assistance? Get in touch with us, and our team will be happy to help.
        </p>
        <form className="text-left">
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Name</label>
            <input type="text" className="w-full p-3 border rounded-lg" placeholder="Your Name" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input type="email" className="w-full p-3 border rounded-lg" placeholder="Your Email" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Message</label>
            <textarea className="w-full p-3 border rounded-lg" rows={4} placeholder="Your Message" required></textarea>
          </div>
          <button className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition">
            Send Message
          </button>
        </form>
        <p className="text-gray-600 mt-6">
          <br />
          📧 Email: support@rxion.com <br />
          📞 Phone: +123 456 789
        </p>
      </div>
    </div>
  );
};

export default Contact;
