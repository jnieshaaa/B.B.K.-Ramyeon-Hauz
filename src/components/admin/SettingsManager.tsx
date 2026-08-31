import React, { useState } from 'react';
import type { ContactInfo } from '../../models/MenuModel';

interface SettingsManagerProps {
  contactInfo: ContactInfo;
  updateContactInfo: (newInfo: ContactInfo) => void;
}

export default function SettingsManager({ contactInfo, updateContactInfo }: SettingsManagerProps) {
  const [phone, setPhone] = useState(contactInfo.phone);
  const [email, setEmail] = useState(contactInfo.email);
  const [messengerName, setMessengerName] = useState(contactInfo.messengerName);
  const [messengerLink, setMessengerLink] = useState(contactInfo.messengerLink);
  const [address, setAddress] = useState(contactInfo.address);
  const [landmarkNear, setLandmarkNear] = useState(contactInfo.landmarkNear);
  const [landmarkFront, setLandmarkFront] = useState(contactInfo.landmarkFront);

  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !email.trim() || !address.trim()) {
      alert('Phone, Email, and Address fields are required.');
      return;
    }

    setSaving(true);
    updateContactInfo({
      phone: phone.trim(),
      email: email.trim(),
      messengerName: messengerName.trim(),
      messengerLink: messengerLink.trim(),
      address: address.trim(),
      landmarkNear: landmarkNear.trim(),
      landmarkFront: landmarkFront.trim()
    });

    setTimeout(() => {
      setSaving(false);
      alert('Store settings and footer details updated successfully!');
    }, 500);
  };

  return (
    <div className="settings-page-container font-sans max-w-2xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 box-border mb-6">
        <h3 className="text-base font-extrabold text-slate-900 m-0 mb-2">Edit Client Website Footer Contact Details</h3>
        <p className="text-xs text-slate-400 m-0 mb-6">Changes saved here will immediately update the inquiries card, phone links, email mailto triggers, location text, and landmark guides inside the visitor landing page.</p>

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="settings-phone" className="text-xs font-bold text-slate-700">Phone Number *</label>
              <input
                type="text"
                id="settings-phone"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs font-semibold text-slate-950 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border"
                placeholder="e.g. 0975 184 1209"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="settings-email" className="text-xs font-bold text-slate-700">Email Address *</label>
              <input
                type="email"
                id="settings-email"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs font-semibold text-slate-955 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border"
                placeholder="e.g. store@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="settings-messenger-name" className="text-xs font-bold text-slate-700">Facebook Messenger Display Name</label>
              <input
                type="text"
                id="settings-messenger-name"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs font-semibold text-slate-955 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border"
                placeholder="e.g. B B K Ramyeon Hauz"
                value={messengerName}
                onChange={(e) => setMessengerName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="settings-messenger-link" className="text-xs font-bold text-slate-700">Facebook Messenger Link URL</label>
              <input
                type="url"
                id="settings-messenger-link"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs font-semibold text-slate-955 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border"
                placeholder="e.g. https://m.me/username"
                value={messengerLink}
                onChange={(e) => setMessengerLink(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="settings-address" className="text-xs font-bold text-slate-700">Location Address *</label>
            <input
              type="text"
              id="settings-address"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs font-semibold text-slate-955 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border"
              placeholder="Store address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="settings-landmark-near" className="text-xs font-bold text-slate-700">Landmark: Near Us</label>
              <input
                type="text"
                id="settings-landmark-near"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs font-semibold text-slate-955 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border"
                placeholder="e.g. Maligaya Bakery (Near Us)"
                value={landmarkNear}
                onChange={(e) => setLandmarkNear(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="settings-landmark-front" className="text-xs font-bold text-slate-700">Landmark: In Front</label>
              <input
                type="text"
                id="settings-landmark-front"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs font-semibold text-slate-955 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border"
                placeholder="e.g. Crispy King (In Front)"
                value={landmarkFront}
                onChange={(e) => setLandmarkFront(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-slate-900 text-white border-none py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-md shadow-blue-500/15 hover:shadow-lg transition-all outline-none text-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saving}
          >
            {saving ? 'Saving changes...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
