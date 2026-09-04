import { useState, useMemo } from 'react';
import type { Inquiry } from '../../../models/MenuModel';

interface BookingsManagerProps {
  inquiries: Inquiry[];
  resolveInquiry: (id: string) => void;
  deleteInquiry: (id: string) => void;
}

export default function BookingsManager({
  inquiries,
  resolveInquiry,
  deleteInquiry
}: BookingsManagerProps) {
  const [bookingSearch, setBookingSearch] = useState('');

  // Filters bookings
  const filteredInquiries = useMemo(() => {
    return inquiries.filter(i => {
      return i.name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
             i.phone.includes(bookingSearch) ||
             i.message.toLowerCase().includes(bookingSearch.toLowerCase());
    });
  }, [inquiries, bookingSearch]);

  const handleResolveInquiry = (inq: Inquiry) => {
    resolveInquiry(inq.id);
    alert(`Inquiry from "${inq.name}" marked as completed.`);
  };

  const handleDeleteInquiry = (inq: Inquiry) => {
    if (window.confirm(`Delete inquiry record from "${inq.name}"?`)) {
      deleteInquiry(inq.id);
      alert('Inquiry record deleted.');
    }
  };

  return (
    <div className="bookings-page-container">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm mb-6 box-border font-sans">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 flex-wrap">
          <div className="flex items-center m-0">
            <h3 className="text-sm font-extrabold text-slate-900 m-0">Active Customer Reservation Inquiries</h3>
          </div>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search name, phone, message specs..."
              className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs font-semibold text-slate-950 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border"
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
            />
            {bookingSearch && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 bg-none border-none cursor-pointer outline-none"
                onClick={() => setBookingSearch('')}
              >
                &times;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white font-sans">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Date Received</th>
              <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Customer Name</th>
              <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Contact Info</th>
              <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200 w-[45%]">Inquiry Message / DIY Bowl Specs</th>
              <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Status</th>
              <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInquiries.length > 0 ? (
              filteredInquiries.map((inq) => (
                <tr key={inq.id} className={`hover:bg-slate-50/50 transition-colors ${
                  inq.status === 'pending' ? 'bg-blue-50/10' : ''
                }`}>
                  <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                    <span className="text-xs text-slate-500 font-semibold">
                      {inq.timestamp}
                    </span>
                  </td>
                  <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                    <strong className="text-slate-955 font-bold text-[15px]">{inq.name}</strong>
                  </td>
                  <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                    <div className="flex flex-col gap-1">
                      <a href={`tel:${inq.phone}`} className="text-blue-600 hover:underline font-bold text-[13px]">
                        Phone: {inq.phone}
                      </a>
                      {inq.email && (
                        <a href={`mailto:${inq.email}`} className="text-slate-500 hover:underline text-[11px]">
                          Email: {inq.email}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                    {inq.message?.startsWith('[BBK_ORDER_TXN:') ? (() => {
                      try {
                        const match = inq.message.match(/\[BBK_ORDER_TXN:([^\]]+)\]:(.+)$/s);
                        if (match && match[2]) {
                          const order = JSON.parse(match[2]);
                          return (
                            <div className="flex flex-col gap-1 p-2 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="bg-[#D65113] text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                                  Order #{order.transactionNumber}
                                </span>
                                <span className="font-bold text-[#5B240B]">
                                  {order.diningOption === 'dine-in' ? '🍜 DINE-IN' : '🛍️ TAKEOUT'}
                                </span>
                                <span className="text-slate-400">•</span>
                                <span className="font-black text-slate-800">PHP {order.total}</span>
                              </div>
                              <p className="text-slate-600 m-0 font-medium text-[11px]">
                                {order.items?.length || 0} item(s): {order.items?.map((it: any) => `${it.name} (x${it.quantity})`).join(', ')}
                              </p>
                            </div>
                          );
                        }
                      } catch (e) {
                        // Fallback to raw message
                      }
                      return (
                        <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-line m-0">
                          {inq.message}
                        </p>
                      );
                    })() : (
                      <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-line m-0">
                        {inq.message || <span className="italic opacity-50">No message provided.</span>}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                    {inq.status === 'pending' ? (
                      <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">Pending Review</span>
                    ) : (
                      <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">Completed</span>
                    )}
                  </td>
                  <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                    <div className="flex gap-2 justify-center">
                      {inq.status === 'pending' && (
                        <button
                          type="button"
                          className="bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200/50 hover:border-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all"
                          onClick={() => handleResolveInquiry(inq)}
                        >
                          Complete
                        </button>
                      )}
                      <button
                        type="button"
                        className="bg-red-50 hover:bg-red-600 text-red-500 hover:text-white border border-red-200/50 hover:border-red-600 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all"
                        onClick={() => handleDeleteInquiry(inq)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-8 border-b border-slate-100 text-center text-sm text-slate-500 italic">
                  No dine-in bookings or inquiries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
