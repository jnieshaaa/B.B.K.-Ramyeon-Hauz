import React, { useState, useEffect } from 'react';
import type { ContactInfo } from '../../../models/MenuModel';

interface SettingsManagerProps {
  contactInfo: ContactInfo;
  updateContactInfo: (newInfo: ContactInfo) => void;
  maintenanceMode: { active: boolean; message: string };
  updateMaintenanceMode: (active: boolean, message?: string) => Promise<void>;
  cookingFee?: number;
  updateCookingFee?: (fee: number) => Promise<void>;
}

export default function SettingsManager({ 
  contactInfo, 
  updateContactInfo,
  maintenanceMode,
  updateMaintenanceMode,
  cookingFee = 20,
  updateCookingFee
}: SettingsManagerProps) {
  const [phone, setPhone] = useState(contactInfo.phone);
  const [email, setEmail] = useState(contactInfo.email);
  const [messengerName, setMessengerName] = useState(contactInfo.messengerName);
  const [messengerLink, setMessengerLink] = useState(contactInfo.messengerLink);
  const [address, setAddress] = useState(contactInfo.address);
  const [landmarkNear, setLandmarkNear] = useState(contactInfo.landmarkNear);
  const [landmarkFront, setLandmarkFront] = useState(contactInfo.landmarkFront);

  const [saving, setSaving] = useState(false);

  // Cooking fee state
  const [feeInput, setFeeInput] = useState<string>(cookingFee.toString());
  const [feeSaving, setFeeSaving] = useState(false);

  useEffect(() => {
    setFeeInput(cookingFee.toString());
  }, [cookingFee]);

  const handleSaveCookingFee = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(feeInput);
    if (isNaN(parsed) || parsed < 0) {
      alert('Please enter a valid non-negative cooking fee amount.');
      return;
    }
    setFeeSaving(true);
    if (updateCookingFee) {
      await updateCookingFee(parsed);
    }
    setFeeSaving(false);
  };

  // Maintenance states
  const [mtActive, setMtActive] = useState(maintenanceMode.active);
  const [mtMessage, setMtMessage] = useState(maintenanceMode.message);

  // Sync state if changed externally (e.g. initial fetch)
  useEffect(() => {
    setMtActive(maintenanceMode.active);
    setMtMessage(maintenanceMode.message);
  }, [maintenanceMode]);

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
    <div className="settings-page-container font-sans max-w-2xl mx-auto flex flex-col gap-6">
      
      {/* Catalog Price Update / Maintenance Mode Switch Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 box-border">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="text-base font-extrabold text-slate-900 m-0 mb-1">Catalog Price Update Mode</h3>
            <p className="text-xs text-slate-400 m-0 leading-relaxed">
              When turned ON, this hides product listings and suspends bowl customization on the customer site. 
              Clients will see a custom notification overlay instead. Use this while editing prices to prevent outdated bookings.
            </p>
          </div>
          
          {/* iOS Style Slide Switch Toggle */}
          <button
            type="button"
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
              mtActive ? 'bg-blue-600' : 'bg-slate-200'
            }`}
            onClick={async () => {
              const newActive = !mtActive;
              setMtActive(newActive);
              await updateMaintenanceMode(newActive, mtMessage);
            }}
            aria-label="Toggle maintenance mode"
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                mtActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Custom Maintenance Message Textarea */}
        {mtActive && (
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100 animate-slideIn">
            <label htmlFor="maintenance-msg" className="text-xs font-bold text-slate-700">Display Notice Message</label>
            <textarea
              id="maintenance-msg"
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs font-semibold text-slate-950 placeholder-slate-400 focus:border-blue-500 focus:bg-white outline-none transition-all box-border resize-none"
              placeholder="Enter message displayed to customers..."
              value={mtMessage}
              onChange={(e) => setMtMessage(e.target.value)}
            />
            <button
              type="button"
              className="self-end px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-colors border-none"
              onClick={async () => {
                await updateMaintenanceMode(mtActive, mtMessage);
              }}
            >
              Update Notice Message
            </button>
          </div>
        )}
      </div>

      {/* DIY Induction Cooking Fee Configuration Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 box-border">
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#D65113] flex items-center justify-center font-bold text-base">
              ♨️
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 m-0">DIY Cooking Fee (Dine-In)</h3>
              <p className="text-xs text-slate-400 m-0">Set the cooking fee charged for dine-in induction pot cooking.</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-3 mb-4 text-xs text-amber-900 leading-relaxed">
          <span className="font-bold">How it works:</span> When customers select <strong>Dine-In</strong> on their order or at the counter, this fee covers induction burner power, boiling water, soup broth, and utensils. If they select <strong>Takeout</strong> (raw packs), the cooking fee is automatically waived (₱0.00).
        </div>

        <form onSubmit={handleSaveCookingFee} className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative w-full sm:w-48">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₱</span>
              <input
                type="number"
                min="0"
                step="1"
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-sans text-sm font-bold text-slate-900 focus:border-[#D65113] focus:bg-white focus:ring-4 focus:ring-[#D65113]/10 outline-none transition-all box-border"
                placeholder="20"
                value={feeInput}
                onChange={(e) => setFeeInput(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={feeSaving}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#D65113] hover:bg-[#5B240B] text-white rounded-xl font-bold text-xs shadow-md shadow-[#D65113]/15 cursor-pointer transition-all border-none outline-none disabled:opacity-50"
            >
              {feeSaving ? 'Saving...' : 'Save Cooking Fee'}
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Presets:</span>
            {[0, 15, 20, 25, 30].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setFeeInput(preset.toString())}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer outline-none ${
                  feeInput === preset.toString()
                    ? 'bg-orange-100 border-[#D65113] text-[#D65113]'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                ₱{preset}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Footer Info Details Editor */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 box-border">
        <h3 className="text-base font-extrabold text-slate-900 m-0 mb-2">Edit Client Website Footer Contact Details</h3>
        <p className="text-xs text-slate-400 m-0 mb-6">Changes saved here will immediately update the inquiries card, phone links, email mailto triggers, location text, and landmark guides inside the visitor landing page.</p>

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="settings-phone" className="text-xs font-bold text-slate-700">Phone Number *</label>
              <input
                type="text"
                id="settings-phone"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs font-semibold text-slate-955 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border"
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
