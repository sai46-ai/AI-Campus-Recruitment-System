/**
 * LandingPage.js - Completely Refactored
 * Modern landing page with real 3D interactive elements,
 * scroll-driven animations, and immersive spatial experiences
 */

import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { isAuthenticated, getUserRole } from '../services/api';
import gsap from 'gsap';
import Navbar from '../components/Navbar';
import TiltCard from '../components/TiltCard';
import Button3D from '../components/Button3D';
import Hero3DScene from '../components/Hero3DScene';
// Using CSS-based 3D elements to prevent WebGL context exhaustion
import Floating3DElementsLite from '../components/Floating3DElementsLite';
import './LandingPage.css';
import logo from '../assets/logo.png';

function LandingPage() {

  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const processRef = useRef(null);
  const testimonialsRef = useRef(null);

  useEffect(() => {
    // Redirect if already logged in
    if (isAuthenticated()) {
      const role = getUserRole();
      navigate(role === 'recruiter' ? '/recruiter' : '/student');
    }
  }, [navigate]);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // GSAP scroll animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero section animations
      gsap.from('.hero-badge', {
        opacity: 0,
        y: -30,
        duration: 0.8,
        delay: 0.2,
        ease: 'power3.out'
      });

      gsap.from('.hero-title', {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 0.4,
        ease: 'power3.out'
      });

      gsap.from('.hero-subtitle', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        delay: 0.6,
        ease: 'power3.out'
      });

      gsap.from('.hero-buttons', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.8,
        ease: 'power3.out'
      });

      gsap.from('.hero-stats .stat-item', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.1,
        delay: 1,
        ease: 'power3.out'
      });

      // Scroll-triggered animations for sections
      const sections = [featuresRef, processRef, testimonialsRef];
      sections.forEach((ref) => {
        if (!ref.current) return;

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                gsap.from(entry.target.querySelectorAll('.animate-on-scroll'), {
                  opacity: 0,
                  y: 60,
                  duration: 0.8,
                  stagger: 0.15,
                  ease: 'power3.out'
                });
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.2 }
        );
        observer.observe(ref.current);
      });
    });

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Matching',
      description: 'Smart algorithms match students with the perfect job opportunities based on skills and preferences.',
      color: '#4dd0e1'
    },
    {
      icon: '📊',
      title: 'Real-time Analytics',
      description: 'Track applications, view AI match scores, and monitor recruitment progress instantly.',
      color: '#7c4dff'
    },
    {
      icon: '🎯',
      title: 'Smart Recommendations',
      description: 'Get personalized job recommendations tailored to your unique skill set and career goals.',
      color: '#00e676'
    },
    {
      icon: '⚡',
      title: 'Instant Applications',
      description: 'Apply to multiple jobs with one click and track your application status in real-time.',
      color: '#ffab00'
    },
    {
      icon: '🔒',
      title: 'Secure Platform',
      description: 'Your data is protected with enterprise-grade security and encryption protocols.',
      color: '#ff5252'
    },
    {
      icon: '📱',
      title: 'Mobile Ready',
      description: 'Access the platform from any device with our responsive, mobile-first design.',
      color: '#40c4ff'
    }
  ];

  const stats = [
    { number: '500+', label: 'Students Placed' },
    { number: '150+', label: 'Partner Companies' },
    { number: '95%', label: 'Success Rate' },
    { number: '24/7', label: 'AI Support' }
  ];

  const processSteps = [
    {
      step: '01',
      title: 'Create Profile',
      description: 'Sign up and build your comprehensive profile with skills, experience, and preferences.'
    },
    {
      step: '02',
      title: 'AI Analysis',
      description: 'Our AI analyzes your profile and matches you with relevant opportunities.'
    },
    {
      step: '03',
      title: 'Apply & Track',
      description: 'Apply to matched jobs with one click and track your applications in real-time.'
    },
    {
      step: '04',
      title: 'Get Hired',
      description: 'Connect with recruiters, ace interviews, and land your dream job.'
    }
  ];

  const testimonials = [
    {
      quote: "The AI matching helped me find the perfect job that matched my skills perfectly. Got hired within 2 weeks!",
      author: "Priya Sharma",
      role: "Software Developer at TCS",
      avatar: "PS"
    },
    {
      quote: "As a recruiter, this platform saved us hours of manual screening. The quality of candidates is outstanding.",
      author: "Rahul Verma",
      role: "HR Manager at Infosys",
      avatar: "RV"
    },
    {
      quote: "The real-time analytics helped me understand where to improve. Best campus recruitment platform!",
      author: "Ankit Kumar",
      role: "Data Analyst at Wipro",
      avatar: "AK"
    }
  ];

  return (
    <div className="landing-page">
      <Navbar />

      {/* Hero Section with 3D Background */}
      <section className="hero-section" ref={heroRef}>
        {/* 3D Hero Scene - Interactive floating objects */}
        <div className="hero-3d-container">
          <Hero3DScene />
        </div>

        {/* Animated Background Elements */}
        <div className="hero-bg">
          <div className="floating-orb orb-1"></div>
          <div className="floating-orb orb-2"></div>
          <div className="floating-orb orb-3"></div>
          <div className="grid-overlay"></div>
        </div>

        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-badge">
              <span className="badge-icon">✨</span>
              AI-Powered Campus Recruitment
            </div>

            <h1 className="hero-title">
              <span className="gradient-text">Smart Hiring</span>
              <br />
              For Smart Campuses
            </h1>

            <p className="hero-subtitle">
              Revolutionizing campus recruitment with AI-driven skill matching,
              real-time analytics, and seamless application tracking.
              Connect talent with opportunity like never before.
            </p>

            <div className="hero-buttons">
              <Button3D
                variant="primary"
                size="large"
                onClick={() => navigate('/register')}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
              >
                Get Started
              </Button3D>
              <Button3D
                variant="ghost"
                size="large"
                onClick={() => navigate('/login')}
              >
                Login
              </Button3D>
            </div>

            {/* Stats */}
            <div className="hero-stats" ref={statsRef}>
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <span className="stat-number">{stat.number}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-right">
            <TiltCard
              className="hero-visual-wrapper"
              intensity={12}
              glare={true}
              scale={1.02}
            >
              <div
                className="hero-visual"
                style={{
                  transform: `perspective(1000px) rotateY(${mousePos.x * 0.3}deg) rotateX(${-mousePos.y * 0.3}deg)`
                }}
              >
                <div className="visual-card main-card">
                  <img src={logo} alt="VVIT" className="visual-logo" />
                  <h3>VVIT University</h3>
                  <p>AI Campus Recruitment System</p>
                  <div className="card-glow"></div>
                </div>

                <div className="visual-card floating-card card-1">
                  <span className="card-icon">🎯</span>
                  <span>Match Score: 95%</span>
                </div>

                <div className="visual-card floating-card card-2">
                  <span className="card-icon">✅</span>
                  <span>Application Sent!</span>
                </div>

                <div className="visual-card floating-card card-3">
                  <span className="card-icon">🏢</span>
                  <span>15 New Jobs</span>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* Features Section with 3D Elements */}
      <section className="features-section" ref={featuresRef}>
        {/* Floating 3D elements in background */}
        <div className="section-3d-bg">
          <Floating3DElementsLite
            type="geometric"
            count={6}
            color="#4dd0e1"
            secondaryColor="#7c4dff"
            speed={0.5}
            interactive={true}
          />
        </div>

        <div className="section-content">
          <div className="section-header animate-on-scroll">
            <span className="section-badge">Features</span>
            <h2>Why Choose <span className="gradient-text">VVIT Recruit?</span></h2>
            <p>Powerful features designed to streamline your campus recruitment journey</p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <TiltCard
                key={index}
                className="feature-card-wrapper animate-on-scroll"
                intensity={8}
                glare={true}
                scale={1.03}
              >
                <div className="feature-card" style={{ '--feature-color': feature.color }}>
                  <div className="feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <div className="feature-glow"></div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="process-section" ref={processRef}>
        <div className="section-header animate-on-scroll">
          <span className="section-badge">Process</span>
          <h2>How It <span className="gradient-text">Works</span></h2>
          <p>Get started in four simple steps</p>
        </div>

        <div className="process-container">
          {/* 3D Objects that move on scroll */}
          <div className="process-3d-elements">
            <Floating3DElementsLite
              type="abstract"
              count={4}
              color="#7c4dff"
              secondaryColor="#00e676"
              speed={0.3}
              size={0.8}
            />
          </div>

          <div className="process-grid">
            {processSteps.map((step, index) => (
              <div key={index} className="process-step animate-on-scroll">
                <div className="step-number">{step.step}</div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                {index < processSteps.length - 1 && (
                  <div className="step-connector">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Showcase with 3D Background */}
      <section className="stats-showcase-section">
        <div className="stats-3d-bg">
          <Floating3DElementsLite
            type="mixed"
            count={8}
            color="#4dd0e1"
            secondaryColor="#ffab00"
            speed={0.4}
          />
        </div>

        <div className="stats-showcase-content">
          <div className="stats-showcase-header">
            <h2>Trusted by <span className="gradient-text">Thousands</span></h2>
            <p>Join the fastest-growing campus recruitment platform</p>
          </div>

          <div className="stats-showcase-grid">
            <div className="showcase-stat">
              <span className="showcase-number">10,000+</span>
              <span className="showcase-label">Active Students</span>
            </div>
            <div className="showcase-stat">
              <span className="showcase-number">500+</span>
              <span className="showcase-label">Companies Hiring</span>
            </div>
            <div className="showcase-stat">
              <span className="showcase-number">50,000+</span>
              <span className="showcase-label">Applications Processed</span>
            </div>
            <div className="showcase-stat">
              <span className="showcase-number">98%</span>
              <span className="showcase-label">User Satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section" ref={testimonialsRef}>
        <div className="section-header animate-on-scroll">
          <span className="section-badge">Testimonials</span>
          <h2>What Our <span className="gradient-text">Users Say</span></h2>
          <p>Success stories from students and recruiters</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <TiltCard
              key={index}
              className="testimonial-card animate-on-scroll"
              intensity={6}
              glare={true}
              scale={1.02}
            >
              <div className="testimonial-content">
                <div className="testimonial-quote">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="testimonial-text">{testimonial.quote}</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.avatar}</div>
                  <div className="author-info">
                    <span className="author-name">{testimonial.author}</span>
                    <span className="author-role">{testimonial.role}</span>
                  </div>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* CTA Section with 3D Elements */}
      <section className="cta-section">
        <div className="cta-3d-bg">
          <Floating3DElementsLite
            type="geometric"
            count={6}
            color="#7c4dff"
            secondaryColor="#4dd0e1"
            speed={0.6}
          />
        </div>

        <div className="cta-content">
          <h2>Ready to Transform Your Recruitment?</h2>
          <p>Join thousands of students and recruiters already using VVIT Recruit</p>
          <div className="cta-buttons">
            <Button3D variant="primary" size="large" onClick={() => navigate('/register')}>
              Create Free Account
            </Button3D>
            <Button3D variant="ghost" size="large" onClick={() => navigate('/login')}>
              Sign In
            </Button3D>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <img src={logo} alt="VVIT" />
            <p>AI Campus Recruitment System</p>
          </div>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
          <p className="copyright">
            © 2026 VVIT University. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
