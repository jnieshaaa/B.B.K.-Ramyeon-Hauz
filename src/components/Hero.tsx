interface HeroProps {
  onExploreClick: () => void;
  onBuildClick: () => void;
}

export default function Hero({ onExploreClick, onBuildClick }: HeroProps) {
  return (
    <section className="hero-section">
      <div className="hero-grid">
        <div className="hero-content">
          <span className="hero-tagline">Satisfy Your Cravings</span>
          <h1 className="hero-title">
            DIY Korean <br />
            <span className="highlight-text">Ramyeon Hauz</span>
          </h1>
          <p className="hero-desc">
            Experience the ultimate noodle sensation where <strong>YOU</strong> are the chef! 
            Choose your signature noodle base, pile on delicious authentic toppings, and pair it with sweet Korean beverages. 
          </p>
          
          <div className="dine-in-card">
            <div className="dine-in-icon">🍜</div>
            <div>
              <h3>Visit & Dine In With Us</h3>
              <p>Monday to Sunday: <strong>9:00 AM – 9:00 PM</strong></p>
            </div>
          </div>

          <div className="hero-ctas">
            <button type="button" onClick={onBuildClick} className="btn-primary">
              Build Your Bowl
            </button>
            <button type="button" onClick={onExploreClick} className="btn-secondary">
              View Menu
            </button>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="hero-image-wrapper">
            <img 
              src="/assets/hero_ramyeon.jpg" 
              alt="Steaming bowl of custom DIY Korean Ramyeon" 
              className="hero-main-img"
            />
            <div className="visual-badge">
              <span className="badge-title">MAKE • EAT • ENJOY</span>
              <span className="badge-sub">DIY Ramyeon Concept</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
