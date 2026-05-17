import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiCpu, FiMapPin, FiAward, FiUsers, FiArrowRight, FiMap } from 'react-icons/fi';
import WaveButton from '../components/ui/WaveButton';
import Card from '../components/ui/Card';

gsap.registerPlugin(ScrollTrigger);

/* ============================================
   ANIMATED COUNTER HOOK
   ============================================ */
function useAnimatedCounter(target, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!startOnView || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          function animate(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutQuart
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          }
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, startOnView]);

  return { count, ref };
}

/* ============================================
   CLEANER CHARACTER SVG (Sketch style)
   ============================================ */
function CleanerCharacter({ className = '' }) {
  return (
    <div className={className}>
      <img
        src="/assets/cleaner-character.png"
        alt="Cleaner character with broom"
        className="hero-cleaner-img"
      />
    </div>
  );
}

/* ============================================
   SCATTER LEAVES (near broom)
   ============================================ */
function ScatterLeaves() {
  return (
    <div className="hero-scatter-leaves">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="hero-scatter-leaf"
          style={{
            width: 8 + Math.random() * 8,
            height: 8 + Math.random() * 8,
            left: `${-20 + Math.random() * 40}px`,
            bottom: `${Math.random() * 20}px`,
            opacity: 0,
          }}
        >
          <svg viewBox="0 0 12 12" fill="none">
            <ellipse cx="6" cy="6" rx="5" ry="3" fill="#4ade80" transform={`rotate(${Math.random() * 360} 6 6)`} />
          </svg>
        </div>
      ))}
    </div>
  );
}

/* ============================================
   HOMEPAGE COMPONENT
   ============================================ */
export default function Home() {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const cleanerRef = useRef(null);
  const scatterRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);

  // Fetch real stats from API
  const [realStats, setRealStats] = useState({ totalComplaints: 0, resolvedComplaints: 0, activeUsers: 0 });
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/complaints/stats`)
      .then(res => res.json())
      .then(data => setRealStats(data))
      .catch(() => {}); // Fail silently – counters stay at 0
  }, []);

  // Animated counters using real data
  const totalComplaints = useAnimatedCounter(realStats.totalComplaints);
  const resolvedComplaints = useAnimatedCounter(realStats.resolvedComplaints);
  const activeUsers = useAnimatedCounter(realStats.activeUsers);

  // GSAP scroll animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero text fade in
      gsap.fromTo(
        '.hero-title',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.hero-subtitle',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.hero-btn',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.5, ease: 'power3.out' }
      );

      // Cleaner character scroll animation
      if (cleanerRef.current) {
        gsap.fromTo(
          cleanerRef.current,
          { x: '-60vw', opacity: 0.3, scale: 0.8 },
          {
            x: '0',
            opacity: 1,
            scale: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top top',
              end: 'bottom center',
              scrub: 1.5,
            },
          }
        );
      }

      // Scatter leaves animation when cleaner reaches center
      if (scatterRef.current) {
        const leaves = scatterRef.current.querySelectorAll('.absolute');
        gsap.fromTo(
          leaves,
          { opacity: 0, scale: 0, y: 0 },
          {
            opacity: 0.8,
            scale: 1,
            y: () => -10 - Math.random() * 30,
            x: () => -20 + Math.random() * 40,
            rotation: () => Math.random() * 360,
            stagger: 0.08,
            duration: 0.6,
            ease: 'back.out(2)',
            scrollTrigger: {
              trigger: heroRef.current,
              start: '40% center',
              end: '60% center',
              scrub: false,
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Features cards stagger
      gsap.fromTo(
        '.feature-card',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 80%',
          },
        }
      );

      // Stats section
      gsap.fromTo(
        '.stat-card',
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          stagger: 0.12,
          duration: 0.7,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 80%',
          },
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="home-page">
      {/* ============ HERO SECTION ============ */}
      <section ref={heroRef} className="hero-section">
        {/* Decorative circles */}
        <div className="hero-bg-circle-1" />
        <div className="hero-bg-circle-2" />

        {/* Hero content */}
        <div className="hero-content">
          <div className="hero-title">
            <span className="hero-badge">
              🌿 Making Cities Cleaner Together
            </span>
            <h1 className="hero-heading">
              Clean<span className="hero-heading-highlight">City</span>
              <br />
              Connect
            </h1>
          </div>
          <p className="hero-subtitle hero-desc">
            Report waste, track cleanups, and make your city shine. 
            Powered by AI for smarter, faster resolutions.
          </p>
          <div className="hero-btn hero-btn-wrapper">
            <WaveButton size="lg" onClick={() => navigate('/signup')}>
              Get Started
              <FiArrowRight style={{ fontSize: '1.125rem' }} />
            </WaveButton>
          </div>
        </div>

        {/* Cleaner character (animated on scroll) */}
        <div ref={cleanerRef} className="hero-cleaner-wrapper">
          <CleanerCharacter className="hero-cleaner" />
          <div ref={scatterRef}>
            <ScatterLeaves />
          </div>
        </div>

        {/* Decorative leaf elements on sides */}
        <div className="hero-leaf hero-leaf--left-top">
          <svg width="60" height="80" viewBox="0 0 60 80" fill="none">
            <path d="M30 0 C50 20 55 50 30 80 C5 50 10 20 30 0Z" fill="#22c55e" />
            <path d="M30 10 L30 70" stroke="#16a34a" strokeWidth="1" opacity="0.5" />
          </svg>
        </div>
        <div className="hero-leaf hero-leaf--right-top">
          <svg width="45" height="65" viewBox="0 0 60 80" fill="none">
            <path d="M30 0 C50 20 55 50 30 80 C5 50 10 20 30 0Z" fill="#4ade80" />
          </svg>
        </div>
        <div className="hero-leaf hero-leaf--right-bottom">
          <svg width="35" height="50" viewBox="0 0 60 80" fill="none">
            <path d="M30 0 C50 20 55 50 30 80 C5 50 10 20 30 0Z" fill="#86efac" />
          </svg>
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section ref={featuresRef} className="home-section home-section--white">
        <div className="section-container section-container--xl">
          <div className="section-header">
            <h2 className="section-title">
              How It <span className="section-title-highlight">Works</span>
            </h2>
            <p className="section-subtitle">
              A smarter way to keep your city clean with cutting-edge technology
            </p>
          </div>

          <div className="features-grid">
            {[
              {
                icon: <FiCpu />,
                title: 'AI Detection',
                desc: 'Automatically classifies waste type and priority using Google Vision AI',
                color: 'bg-grad-1',
              },
              {
                icon: <FiMapPin />,
                title: 'Location Tracking',
                desc: 'Pin complaints on the map with precise GPS location',
                color: 'bg-grad-2',
              },
              {
                icon: <FiAward />,
                title: 'Reward Points',
                desc: 'Earn points for every resolved complaint and climb the leaderboard',
                color: 'bg-grad-3',
              },
              {
                icon: <FiUsers />,
                title: 'Community Impact',
                desc: 'Join thousands of citizens making a real difference in their cities',
                color: 'bg-grad-4',
              },
            ].map((feature, i) => (
              <div key={i} className="feature-card feature-card-wrapper">
                <Card className="feature-card-card" padding="">
                  <div className="feature-card-inner">
                    <div className={`feature-icon-wrapper ${feature.color}`}>
                      {feature.icon}
                    </div>
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-desc">{feature.desc}</p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ STATS SECTION ============ */}
      <section ref={statsRef} className="stats-section home-section home-section--gradient-stats">
        <div className="section-container section-container--lg">
          <div className="section-header">
            <h2 className="section-title">
              Our <span className="section-title-highlight">Impact</span>
            </h2>
            <p className="section-subtitle">Real numbers, real change</p>
          </div>

          <div className="stats-grid">
            {[
              { label: 'Total Complaints', counter: totalComplaints, suffix: '+', icon: '📋' },
              { label: 'Resolved', counter: resolvedComplaints, suffix: '+', icon: '✅' },
              { label: 'Active Users', counter: activeUsers, suffix: '+', icon: '👥' },
            ].map((stat, i) => (
              <div key={i} ref={stat.counter.ref} className="stat-card">
                <Card padding="">
                  <div className="stat-card-inner">
                    <span className="stat-icon">{stat.icon}</span>
                    <div className="counter-value stat-value">
                      {stat.counter.count.toLocaleString()}{stat.suffix}
                    </div>
                    <p className="stat-label">{stat.label}</p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-section--cta">
        <div className="section-container section-container--xs section-container--centered">
          <div className="cta-icon-wrapper">
            <div className="cta-icon-bg" />
            <span className="cta-icon">🌍</span>
          </div>
          <h2 className="section-title section-title--spaced">
            Ready to Make a <span className="section-title-highlight">Difference</span>?
          </h2>
          <p className="cta-desc">
            Every complaint reported brings your city one step closer to being clean. 
            Start reporting today and earn rewards!
          </p>
          <WaveButton size="lg" onClick={() => navigate('/signup')}>
            Start Reporting
            <FiArrowRight style={{ marginLeft: '8px', fontSize: '1.125rem' }} />
          </WaveButton>
        </div>
      </section>

      {/* ============ MAP TEASER SECTION ============ */}
      <section className="home-section home-section--gradient-map">
        <div className="section-container section-container--lg">
          <div className="glass-card map-teaser-card">
            <div className="map-teaser-inner">
              <div className="map-teaser-icon">
                <FiMap />
              </div>
              <h2 className="section-title section-title--spaced">
                Explore the <span className="section-title-highlight">Complaint Map</span>
              </h2>
              <p className="cta-desc">
                See all reported complaints in your area. Filter by waste type, status, 
                and date to get a clear picture of your city's cleanliness.
              </p>
              <WaveButton onClick={() => navigate('/complaint-map')}>
                <FiMap style={{ marginRight: '8px', fontSize: '1.125rem' }} />
                Explore Complaint Map
              </WaveButton>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-logo">
            <div className="footer-logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8.17 20C12.41 20 15.94 16.5 17 8Z" />
              </svg>
            </div>
            <span className="footer-logo-text">CleanCity Connect</span>
          </div>
          <p className="footer-text">
            © {new Date().getFullYear()} CleanCity Connect. Building cleaner cities together.
          </p>
          <div className="footer-links">
            <button onClick={() => navigate('/feedback')} className="footer-link">
              Feedback
            </button>
            <button onClick={() => navigate('/complaint-map')} className="footer-link">
              Map View
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
