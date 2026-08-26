import React, { useState } from 'react';

export default function Footer() {
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
    // In a real application, you would send this to a server.
    setTimeout(() => {
      alert(`Thank you, ${formData.name}! Your inquiry for B.B.K. Ramyeon Hauz has been received. We will contact you at ${formData.phone} shortly.`);
      setFormData({ name: '', phone: '', email: '', message: '' });
      setSubmitted(false);
    }, 800);
  };

  return (
    <footer id="inquiries" className="footer-section">
      <div className="footer-container">
        
        {/* Section Header inside Footer */}
        <div className="section-header align-left">
          <span className="section-subtitle">Dine In Reservation & Inquiries</span>
          <h2 className="section-title text-light">Get in Touch with Us</h2>
          <p className="section-desc text-muted">
            Have questions about our DIY boiling pots, catering packages, or want to book a group dine-in? Drop us a message below!
          </p>
        </div>

        <div className="footer-grid">
          
          {/* Column 1: Contact details & Map Card */}
          <div className="footer-info-col">
            <div className="contact-details-list">
              <div className="contact-item">
                <div className="contact-icon-wrapper">📞</div>
                <div className="contact-text">
                  <h4>Phone Number</h4>
                  <a href="tel:09751841209">0975 184 1209</a>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon-wrapper">✉️</div>
                <div className="contact-text">
                  <h4>Email Address</h4>
                  <a href="mailto:bbkramyeonhauz@gmail.com">bbkramyeonhauz@gmail.com</a>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon-wrapper">💬</div>
                <div className="contact-text">
                  <h4>Facebook Messenger</h4>
                  <a href="https://m.me/" target="_blank" rel="noopener noreferrer">B B K Ramyeon Hauz</a>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon-wrapper">📍</div>
                <div className="contact-text">
                  <h4>Our Location</h4>
                  <p>A. Bonifacio Street, Brgy. 7B, San Pablo City, Philippines, 4000</p>
                  <small className="address-notes">(Near Maligaya Bakery, in front of Crispy King)</small>
                </div>
              </div>
            </div>

            {/* Styled Map Landmark Card */}
            <div className="map-landmark-card">
              <div className="landmark-header">
                <span className="landmark-dot animate-pulse"></span>
                <strong>Location Landmark Guide</strong>
              </div>
              <div className="landmark-body">
                <div className="landmark-row">
                  <span className="icon">🏪</span>
                  <span>Maligaya Bakery (Near Us)</span>
                </div>
                <div className="landmark-divider"></div>
                <div className="landmark-row active">
                  <span className="icon">🍜</span>
                  <strong>B.B.K. Ramyeon Hauz</strong>
                </div>
                <div className="landmark-divider"></div>
                <div className="landmark-row">
                  <span className="icon">🍗</span>
                  <span>Crispy King (In Front)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Inquiry Reservation Form */}
          <div className="footer-form-col">
            <div className="inquiry-form-card">
              <h3>Dine-In Inquiry Form</h3>
              <p>Submit your details, and we'll save you a spot at our DIY boiling tables.</p>
              
              <form onSubmit={handleSubmit} className="inquiry-form">
                <div className="form-group">
                  <label htmlFor="inquiry-name">Full Name *</label>
                  <input
                    type="text"
                    id="inquiry-name"
                    className="form-control"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-grid-fields">
                  <div className="form-group">
                    <label htmlFor="inquiry-phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="inquiry-phone"
                      className="form-control"
                      placeholder="e.g. 0975 184 1209"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inquiry-email">Email Address (Optional)</label>
                    <input
                      type="email"
                      id="inquiry-email"
                      className="form-control"
                      placeholder="e.g. name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="inquiry-message">Order Specifications & Message</label>
                  <textarea
                    id="inquiry-message"
                    className="form-control textarea"
                    rows={4}
                    placeholder="Tell us your customized DIY bowl components, preferred date and time, or general questions..."
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className={`btn-form-submit ${submitted ? 'loading' : ''}`}
                  disabled={submitted}
                >
                  {submitted ? 'Submitting Inquiry...' : 'Submit Dine-In Request'}
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Footer Bottom copyright */}
        <div className="footer-bottom">
          <div className="footer-bottom-divider"></div>
          <div className="footer-bottom-row">
            <p>&copy; {new Date().getFullYear()} B.B.K. Ramyeon Hauz. All Rights Reserved.</p>
            <p className="footer-bottom-tagline">MAKE • EAT • ENJOY</p>
          </div>
        </div>

      </div>
    </footer>
  );
}
