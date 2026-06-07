import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, FileText, Code, Users, Newspaper, Briefcase, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const handleThemeEvent = (e) => setIsDark(e.detail);
    window.addEventListener('theme-changed', handleThemeEvent);
    return () => window.removeEventListener('theme-changed', handleThemeEvent);
  }, []);

  return isDark;
}

function BackButton({ isDark }) {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(-1)}
      style={{ color: isDark ? '#9ca3af' : '#374151' }}
      className={`inline-flex items-center gap-2 text-sm transition-colors mb-8 group ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>
      <span 
        style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
        className="w-8 h-8 rounded-full border flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/10 transition-all">
        <ArrowLeft className="w-4 h-4" />
      </span>
      Back
    </button>
  );
}

const PageTemplate = ({ title, icon, lastUpdated, children, isDark }) => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="w-full max-w-4xl px-4 md:px-6 py-12 mx-auto">
      <BackButton isDark={isDark} />
      <motion.div initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : '#ffffff', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)' }}
        className="glass-panel p-8 md:p-12 rounded-3xl border transition-colors duration-500">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-primary/20 rounded-xl text-primary">{icon}</div>
          <h1 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-3xl font-bold transition-colors duration-500">{title}</h1>
        </div>
        {lastUpdated && <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="mb-8 text-sm transition-colors duration-500">Last updated: {lastUpdated}</p>}
        <div className="space-y-8 leading-relaxed transition-colors duration-500" style={{ color: isDark ? '#d1d5db' : '#374151' }}>{children}</div>
      </motion.div>
    </div>
  );
};

export function TermsOfService() {
  const isDark = useTheme();
  return (
    <PageTemplate title="Terms of Service" icon={<FileText className="w-6 h-6" />} lastUpdated="May 2026" isDark={isDark}>
      <section>
        <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-semibold mb-3 transition-colors duration-500">1. Agreement to Terms</h2>
        <p>By accessing or using Extensio.ai, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site</p>
      </section>
      <section>
        <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-semibold mb-3 transition-colors duration-500">2. Use License</h2>
        <p>Permission is granted to temporarily use one copy of Extensio.ai's materials for personal, non-commercial transitory viewing only. Extensions you generate are owned by you; you may publish them to any browser extension marketplace</p>
      </section>
      <section>
        <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-semibold mb-3 transition-colors duration-500">3. Prohibited Uses</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Generating extensions intended to harm, surveil or deceive users</li>
          <li>Reverse-engineering the Extensio.ai - AI generation pipeline</li>
          <li>Sharing API credentials or account access with unauthorized third parties</li>
          <li>Generating malware, spyware or code that bypasses browser security policies</li>
        </ul>
      </section>
      <section>
        <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-semibold mb-3 transition-colors duration-500">4. Disclaimer</h2>
        <p>Extensio.ai's services are provided "as is." We make no warranties, expressed or implied and hereby disclaim all other warranties including, without limitation, implied warranties of merchantability or fitness for a particular purpose</p>
      </section>
    </PageTemplate>
  );
}

export function PrivacyPolicy() {
  const isDark = useTheme();
  return (
    <PageTemplate title="Privacy Policy" icon={<FileText className="w-6 h-6" />} lastUpdated="May 2026" isDark={isDark}>
      <section>
        <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-semibold mb-3 transition-colors duration-500">1. Information We Collect</h2>
        <p>We collect information you provide directly: your name, email address and the prompts you submit for extension generation. We do not sell or share this information with third parties</p>
      </section>
      <section>
        <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-semibold mb-3 transition-colors duration-500">2. How We Use Information</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>To process and deliver your extension generation requests</li>
          <li>To authenticate your account and maintain security</li>
          <li>To improve our AI models (anonymized and aggregated only)</li>
          <li>To send transactional emails (e.g., generation complete notifications)</li>
        </ul>
      </section>
      <section>
        <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-semibold mb-3 transition-colors duration-500">3. Data Retention</h2>
        <p>Generated extension files are stored for 30 days. Account data is retained until you delete your account</p>
      </section>
      <section>
        <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-semibold mb-3 transition-colors duration-500">4. Cookies</h2>
        <p>We use strictly necessary cookies for authentication. We do not use tracking or advertising cookies. Third-party analytics are opt-in only</p>
      </section>
    </PageTemplate>
  );
}

export function Security() {
  const isDark = useTheme();
  return (
    <PageTemplate title="Security" icon={<ShieldCheck className="w-6 h-6" />} lastUpdated="May 2026" isDark={isDark}>
      <section>
        <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-semibold mb-3 transition-colors duration-500">Our Commitment</h2>
        <p>Security is built into every layer of Extensio.ai. Your prompts and generated code belong strictly to you and are securely isolated per user</p>
      </section>
      <section>
        <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-semibold mb-3 transition-colors duration-500">Infrastructure</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>All data encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
          <li>JWT-based authentication with short-lived access tokens</li>
          <li>Rate limiting and DDoS protection on all API endpoints</li>
          <li>Automated security scanning on all generated extension code</li>
        </ul>
      </section>
      <section>
        <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-semibold mb-3 transition-colors duration-500">Report a Vulnerability</h2>
        <p>If you discover a security issue, please disclose responsibly to <a href="mailto:suryanshsinghchauhanthakur@gmail.com" className="text-primary hover:underline">suryanshsinghchauhanthakur@gmail.com</a>, I will respond within 24 hours</p>
      </section>
    </PageTemplate>
  );
}

export function Changelog() {
  const isDark = useTheme();
  return (
    <PageTemplate title="Changelog" icon={<FileText className="w-6 h-6" />} isDark={isDark}>
      <section>
        <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-semibold mb-1 transition-colors duration-500">v2.0 - Coming Soon</h2>
        <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-xs mb-3 transition-colors duration-500">We are working on it</p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Launched AI Extension Generator Pipeline with real Manifest V3 output</li>
          <li>Added Workspace Dashboard for managing, versioning and downloading extensions</li>
          <li>Implemented real-time job polling with progress indicators</li>
          <li>Smart prompt parser:- detects dark mode, ad blocking, tab manager, timer and notes intents</li>
        </ul>
      </section>
      <section>
        <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-semibold mb-1 transition-colors duration-500">v1.0</h2>
        <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-xs mb-3 transition-colors duration-500">Released May 2026</p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Beta access released to early users</li>
          <li>Introduced premium plans with advanced generation quota</li>
          <li>Added Admin Dashboard for platform monitoring</li>
        </ul>
      </section>
    </PageTemplate>
  );
}

export function APIDocs() {
  const isDark = useTheme();
  return (
    <PageTemplate title="API Documentation" icon={<Code className="w-6 h-6" />} isDark={isDark}>
      <section>
        <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-semibold mb-3 transition-colors duration-500">REST API Overview</h2>
        <p>The Extensio.ai Developer API allows enterprise customers to programmatically generate browser extensions. All endpoints require a Bearer token</p>
      </section>
      <section>
        <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-semibold mb-3 transition-colors duration-500">Endpoints</h2>
        <div className="space-y-4 font-mono text-sm">
          <div 
            style={{ 
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)'
            }}
            className="border rounded-xl p-4 transition-colors duration-500">
            <span className="text-green-400 font-bold">POST</span>
            <span style={{ color: isDark ? '#d1d5db' : '#374151' }} className="ml-2">/api/generate</span>
            <p className="text-gray-500 text-xs mt-1 font-sans">Submit a prompt. Returns a jobId to poll for status</p>
          </div>
          <div 
            style={{ 
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)'
            }}
            className="border rounded-xl p-4 transition-colors duration-500">
            <span className="text-blue-400 font-bold">GET</span>
            <span style={{ color: isDark ? '#d1d5db' : '#374151' }} className="ml-2">/api/generate/status/:jobId</span>
            <p className="text-gray-500 text-xs mt-1 font-sans">Poll generation progress (status, progress %, resultUrl)</p>
          </div>
          <div 
            style={{ 
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)'
            }}
            className="border rounded-xl p-4 transition-colors duration-500">
            <span className="text-blue-400 font-bold">GET</span>
            <span style={{ color: isDark ? '#d1d5db' : '#374151' }} className="ml-2">/api/downloads/:token</span>
            <p className="text-gray-500 text-xs mt-1 font-sans">Download the generated extension as a .zip file</p>
          </div>
          <div 
            style={{ 
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)'
            }}
            className="border rounded-xl p-4 transition-colors duration-500">
            <span className="text-blue-400 font-bold">GET</span>
            <span style={{ color: isDark ? '#d1d5db' : '#374151' }} className="ml-2">/api/projects</span>
            <p className="text-gray-500 text-xs mt-1 font-sans">List all your generated extensions</p>
          </div>
        </div>
      </section>
      <section>
        <p className="text-sm text-gray-400">Full API access is currently available to Enterprise clients</p>
      </section>
    </PageTemplate>
  );
}

export function AboutUs() {
  const isDark = useTheme();
  return (
    <PageTemplate title="About Us" icon={<Users className="w-6 h-6" />} isDark={isDark}>
      <section>
        <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-semibold mb-3 transition-colors duration-500">Our Mission</h2>
        <p>We are a team of Ai researchers and developers on a mission to democratize software development. Extensio.ai was built to bridge the gap between human ideas and functional browser extensions - no code required</p>
      </section>
      <section>
        <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-semibold mb-3 transition-colors duration-500">The Story</h2>
        <p>Founded in 2025, Extensio.ai started as an internal tool to automate repetitive Chrome extension boilerplate. After sharing it with a small group of beta users, the response was overwhelming. Today, we serve thousands of creators, developers and non-technical users worldwide</p>
      </section>
      <section>
        <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-semibold mb-3 transition-colors duration-500">Our Values</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong style={{ color: isDark ? '#ffffff' : '#111827' }} className="transition-colors duration-500">Accessibility</strong> - Powerful tools should be usable by everyone</li>
          <li><strong style={{ color: isDark ? '#ffffff' : '#111827' }} className="transition-colors duration-500">Quality</strong> - We output production-ready, Manifest V3 compliant code</li>
          <li><strong style={{ color: isDark ? '#ffffff' : '#111827' }} className="transition-colors duration-500">Privacy</strong> - Your ideas are yours. We don't train on your prompts without consent</li>
        </ul>
      </section>
    </PageTemplate>
  );
}

export function Blog() {
  const isDark = useTheme();
  return (
    <PageTemplate title="Blog" icon={<Newspaper className="w-6 h-6" />} isDark={isDark}>
      <section>
        <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-semibold mb-1 transition-colors duration-500">The Future of AI Code Generation</h2>
        <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-xs mb-3 transition-colors duration-500">Published May 2026</p>
        <p>Browser extensions are just the beginning. Our engine is actively learning and optimizing itself for the future of ambient computing - from browser utilities to OS-level automations</p>
      </section>
      <section>
        <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-semibold mb-1 transition-colors duration-500">Why Manifest V3 Matters</h2>
        <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-xs mb-3 transition-colors duration-500">Published May 2026</p>
        <p>Chrome's Manifest V3 transition has been controversial in the developer community. We explain what changed, why it matters for privacy and how Extensio.ai handles it automatically so you don't have to</p>
      </section>
      <section>
        <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-semibold mb-1 transition-colors duration-500">From Idea to Chrome Web Store in 60 Seconds</h2>
        <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-xs mb-3 transition-colors duration-500">Published may 2026</p>
        <p>A step-by-step walkthrough of generating, downloading and publishing a browser extension built entirely with Extensio.ai - no code written by hand</p>
      </section>
    </PageTemplate>
  );
}

export function Careers() {
  const isDark = useTheme();
  return (
    <PageTemplate title="Careers" icon={<Briefcase className="w-6 h-6" />} isDark={isDark}>
      <section>
        <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-semibold mb-3 transition-colors duration-500">Join the Mission</h2>
        <p>We're a small, passionate team building technology that makes software creation accessible to everyone. If you're excited about AI-powered developer tools, we'd love to hear from you</p>
      </section>
      <section>
        <h2 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-xl font-semibold mb-3 transition-colors duration-500">Open Roles</h2>
        <div className="space-y-4">
          {[
            { role: 'Senior ML Engineer', type: 'Full-time · Remote', desc: 'Build and improve our extension code generation models' },
            { role: 'Full-Stack Developer', type: 'Full-time · Remote', desc: 'Work on our React frontend and Node.js backend pipeline' },
            { role: 'Developer Relations', type: 'Full-time · Remote', desc: 'Help developers get the most out of our platform and API' },
          ].map(({ role, type, desc }) => (
            <div key={role} 
              style={{ 
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)'
              }}
              className="border rounded-xl p-5 transition-colors duration-500">
              <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="font-semibold transition-colors duration-500">{role}</h3>
              <p className="text-xs text-primary mb-2">{type}</p>
              <p style={{ color: isDark ? '#9ca3af' : '#374151' }} className="text-sm transition-colors duration-500">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-sm mt-4">Apply only to learn not for money</p>
      </section>
    </PageTemplate>
  );
}
export function Contact() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const navigate = useNavigate();
  const isDark = useTheme();
  return (
    <div className="w-full max-w-4xl px-4 md:px-6 py-12 mx-auto">
      <BackButton isDark={isDark} />
      <motion.div initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.8)', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
        className="glass-panel p-8 md:p-12 rounded-3xl border transition-colors duration-500">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-primary/20 rounded-xl text-primary"><Mail className="w-6 h-6" /></div>
          <h1 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-3xl font-bold transition-colors duration-500">Contact Us</h1>
        </div>
        <p style={{ color: isDark ? '#9ca3af' : '#374151' }} className="mb-8 transition-colors duration-500">We love to hear from you. Please reach out with any questions, feedback or support requests</p>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            {[
              { icon: <Mail className="w-5 h-5" />, title: 'Email', sub: 'I am here to help you', link: { href: 'mailto:suryanshsinghchauhanthakur@gmail.com', text: 'G-mail' } },
              { icon: <MapPin className="w-5 h-5" />, title: 'Office', sub: "We don't have HQ", text: 'We are team not company' },
              { icon: <Phone className="w-5 h-5" />, title: 'Phone', sub: 'Anytime', link: { href: 'tel:+8874518917', text: '+91 88745 18917' } },
            ].map(({ icon, title, sub, link, text }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="p-3 bg-primary/20 rounded-xl text-primary">{icon}</div>
                <div>
                  <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="font-semibold mb-1 transition-colors duration-500">{title}</h3>
                  <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="text-sm transition-colors duration-500">{sub}</p>
                  {link && <a href={link.href} className="text-primary hover:underline text-sm mt-1 block">{link.text}</a>}
                  {text && <p style={{ color: isDark ? '#d1d5db' : '#374151' }} className="text-sm mt-1 whitespace-pre-line transition-colors duration-500">{text}</p>}
                </div>
              </div>
            ))}
          </div>

          <div 
            style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff', borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)' }}
            className="border rounded-2xl p-6 transition-colors duration-500">
            <h3 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-lg font-semibold mb-4 transition-colors duration-500">Send us a message</h3>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); alert('Message sent! We\'ll get back to you soon.'); }}>
              <div className="space-y-1">
                <label style={{ color: isDark ? '#9ca3af' : '#374151' }} className="block text-xs font-semibold uppercase tracking-wider ml-1 transition-colors duration-500">Name</label>
                <input type="text" placeholder='Full Name'
                  style={{ 
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                    color: isDark ? '#ffffff' : '#111827',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)'
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary transition-all duration-500" required />
              </div>
              <div className="space-y-1">
                <label style={{ color: isDark ? '#9ca3af' : '#374151' }} className="block text-xs font-semibold uppercase tracking-wider ml-1 transition-colors duration-500">Email</label>
                <input type="email" placeholder="Enter your email address"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                    color: isDark ? '#ffffff' : '#111827',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)'
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary transition-all duration-500" required />
              </div>
              <div className="space-y-1">
                <label style={{ color: isDark ? '#9ca3af' : '#374151' }} className="block text-xs font-semibold uppercase tracking-wider ml-1 transition-colors duration-500">Message</label>
                <textarea rows="4" placeholder="Write your message here . . ."
                  style={{ 
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                    color: isDark ? '#ffffff' : '#111827',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)'
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary resize-none transition-all duration-500" required></textarea>
              </div>
              <button className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-colors text-sm shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
