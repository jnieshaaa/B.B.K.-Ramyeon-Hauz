import React, { useState } from 'react';
import type { Inquiry, ContactInfo } from '../../models/MenuModel';

interface FooterProps {
  contactInfo: ContactInfo;
  submitInquiry: (inquiry: Omit<Inquiry, 'id' | 'status' | 'timestamp'>) => void;
}

export default function Footer({ contactInfo, submitInquiry }: FooterProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Please enter at least your Name and Phone number so we can reach you!");
      return;
    }
    setSubmitted(true);
    
    submitInquiry({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      message: formData.message
    });

    setTimeout(() => {
      alert(`Thank you, ${formData.name}! Your inquiry for B.B.K. Ramyeon Hauz has been received. We will contact you at ${formData.phone} shortly.`);
      setFormData({ name: '', phone: '', email: '', message: '' });
      setSubmitted(false);
    }, 800);
  };

  return (
    <footer id="inquiries" className="bg-[#5B240B] text-white py-16 md:py-24 px-6 md:px-12 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        
        {/* Section Header inside Footer */}
        <div className="text-left mb-10 flex flex-col gap-3 max-w-2xl">
          <span className="text-xs text-[#FAF1D6] font-black uppercase tracking-widest">
            Dine In Reservation & Inquiries
          </span>
          <h2 className="text-3xl font-black text-white m-0">Get in Touch with Us</h2>
          <p className="text-[#FAF1D6]/70 text-sm leading-relaxed m-0">
            Have questions about our DIY boiling pots, catering packages, or want to book a group dine-in? Drop us a message below!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Column 1: Contact details & Map Card */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs text-[#FAF1D6]/75 uppercase tracking-widest font-black m-0">Phone Number</h4>
                  <a href={`tel:${contactInfo.phone.replace(/\s+/g, '')}`} className="text-white hover:text-[#FAF1D6] font-bold text-base no-underline">
                    {contactInfo.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs text-[#FAF1D6]/75 uppercase tracking-widest font-black m-0">Email Address</h4>
                  <a href={`mailto:${contactInfo.email}`} className="text-white hover:text-[#FAF1D6] font-bold text-base no-underline">
                    {contactInfo.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs text-[#FAF1D6]/75 uppercase tracking-widest font-black m-0">Facebook Messenger</h4>
                  <a href={contactInfo.messengerLink} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#FAF1D6] font-bold text-base no-underline">
                    {contactInfo.messengerName}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs text-[#FAF1D6]/75 uppercase tracking-widest font-black m-0">Our Location</h4>
                  <p className="text-white text-sm m-0 leading-relaxed">
                    {contactInfo.address}
                  </p>
                  <small className="text-[#FAF1D6]/50 text-xs mt-1">
                    (Near {contactInfo.landmarkNear}, in front of {contactInfo.landmarkFront})
                  </small>
                </div>
              </div>
            </div>

            {/* Styled Map Landmark Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 max-w-md">
              <div className="flex items-center gap-3 border-b border-white/10 pb-3 text-sm text-[#FAF1D6] font-extrabold uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                <strong>Location Landmark Guide</strong>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 text-xs text-white/80 py-1">
                  <span>{contactInfo.landmarkNear}</span>
                </div>
                <div className="border-t border-dashed border-white/10 my-1"></div>
                <div className="flex items-center gap-3 text-xs py-1 text-[#FAF1D6] font-extrabold">
                  <strong>B.B.K. Ramyeon Hauz</strong>
                </div>
                <div className="border-t border-dashed border-white/10 my-1"></div>
                <div className="flex items-center gap-3 text-xs text-white/80 py-1">
                  <span>{contactInfo.landmarkFront}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Inquiry Reservation Form */}
          <div>
            <div className="bg-[#FAF1D6] text-[#5B240B] rounded-3xl p-6 md:p-8 shadow-xl border border-[#5B240B]/10 font-sans">
              <h3 className="text-xl font-black m-0 mb-1">Dine-In Inquiry Form</h3>
              <p className="text-xs text-slate-500 m-0 mb-6 leading-relaxed">Submit your details, and we'll save you a spot at our DIY boiling tables.</p>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="inquiry-name" className="text-xs font-bold uppercase tracking-wider text-[#5B240B]/80">Full Name *</label>
                  <input
                    type="text"
                    id="inquiry-name"
                    className="w-full px-4 py-3 bg-white border border-[#5B240B]/15 rounded-xl text-[#5B240B] text-sm font-semibold placeholder-[#5B240B]/40 focus:border-[#D65113] outline-none transition-all box-border font-sans"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="inquiry-phone" className="text-xs font-bold uppercase tracking-wider text-[#5B240B]/80">Phone Number *</label>
                    <input
                      type="tel"
                      id="inquiry-phone"
                      className="w-full px-4 py-3 bg-white border border-[#5B240B]/15 rounded-xl text-[#5B240B] text-sm font-semibold placeholder-[#5B240B]/40 focus:border-[#D65113] outline-none transition-all box-border font-sans"
                      placeholder="e.g. 0975 184 1209"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="inquiry-email" className="text-xs font-bold uppercase tracking-wider text-[#5B240B]/80">Email Address (Optional)</label>
                    <input
                      type="email"
                      id="inquiry-email"
                      className="w-full px-4 py-3 bg-white border border-[#5B240B]/15 rounded-xl text-[#5B240B] text-sm font-semibold placeholder-[#5B240B]/40 focus:border-[#D65113] outline-none transition-all box-border font-sans"
                      placeholder="e.g. name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="inquiry-message" className="text-xs font-bold uppercase tracking-wider text-[#5B240B]/80">Order Specifications & Message</label>
                  <textarea
                    id="inquiry-message"
                    className="w-full px-4 py-3 bg-white border border-[#5B240B]/15 rounded-xl text-[#5B240B] text-sm font-semibold placeholder-[#5B240B]/40 focus:border-[#D65113] outline-none transition-all box-border font-sans resize-y"
                    rows={4}
                    placeholder="Tell us your customized DIY bowl components, preferred date and time, or general questions..."
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#D65113] hover:bg-[#5B240B] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#D65113]/25 hover:shadow-xl transition-all border-none cursor-pointer outline-none text-center disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  disabled={submitted}
                >
                  {submitted ? 'Submitting Inquiry...' : 'Submit Dine-In Request'}
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Footer Bottom copyright */}
        <div className="mt-8 pt-8 border-t border-white/10 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:justify-between items-center gap-4 text-xs text-[#FAF1D6]/60 font-semibold">
            <p className="m-0">&copy; {new Date().getFullYear()} B.B.K. Ramyeon Hauz. All Rights Reserved.</p>
            <p className="tracking-[0.25em] text-[#FAF1D6] uppercase font-black m-0">MAKE • EAT • ENJOY</p>
          </div>
        </div>

      </div>
    </footer>
  );
}
