import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, FileText, Code, Users, Newspaper, Briefcase, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function BackButton() {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(-1)}
      className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8 group">
      <span className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/10 transition-all">
        <ArrowLeft className="w-4 h-4" />
      </span>
      Back
    </button>
  );
}

const PageTemplate = ({ title, icon, lastUpdated, children }) => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="w-full max-w-4xl px-4 md:px-6 py-12 mx-auto">
      <BackButton />
      <motion.div initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 md:p-12 rounded-3xl border border-white/5">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-primary/20 rounded-xl text-primary">{icon}</div>
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
        {lastUpdated && <p className="text-gray-400 mb-8 text-sm">Last updated: {lastUpdated}</p>}
        <div className="space-y-8 text-gray-300 leading-relaxed">{children}</div>
      </motion.div>
    </div>
  );
};

export function TermsOfService() {
  return (
    <PageTemplate title="Terms of Service" icon={<FileText className="w-6 h-6" />} lastUpdated="May 2026">
      <section>
        <h2 className="text-xl font-semibold text-white mb-3">1. Agreement to Terms</h2>
        <p>By accessing or using Extensio.ai, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-white mb-3">2. Use License</h2>
        <p>Permission is granted to temporarily use one copy of Extensio.ai's materials for personal, non-commercial transitory viewing only. Extensions you generate are owned by you; you may publish them to any browser extension marketplace</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-white mb-3">3. Prohibited Uses</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Generating extensions intended to harm, surveil or deceive users</li>
          <li>Reverse-engineering the Extensio.ai - AI generation pipeline</li>
          <li>Sharing API credentials or account access with unauthorized third parties</li>
          <li>Generating malware, spyware or code that bypasses browser security policies</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-white mb-3">4. Disclaimer</h2>
        <p>Extensio.ai's services are provided "as is." We make no warranties, expressed or implied and hereby disclaim all other warranties including, without limitation, implied warranties of merchantability or fitness for a particular purpose</p>
      </section>
    </PageTemplate>
  );
}

export function PrivacyPolicy() {
  return (
    <PageTemplate title="Privacy Policy" icon={<FileText className="w-6 h-6" />} lastUpdated="May 2026">
      <section>
        <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
        <p>We collect information you provide directly: your name, email address and the prompts you submit for extension generation. We do not sell or share this information with third parties</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Information</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>To process and deliver your extension generation requests</li>
          <li>To authenticate your account and maintain security</li>
          <li>To improve our AI models (anonymized and aggregated only)</li>
          <li>To send transactional emails (e.g., generation complete notifications)</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-white mb-3">3. Data Retention</h2>
        <p>Generated extension files are stored for 30 days. Account data is retained until you delete your account</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-white mb-3">4. Cookies</h2>
        <p>We use strictly necessary cookies for authentication. We do not use tracking or advertising cookies. Third-party analytics are opt-in only</p>
      </section>
    </PageTemplate>
  );
}

export function Security() {
  return (
    <PageTemplate title="Security" icon={<ShieldCheck className="w-6 h-6" />} lastUpdated="May 2026">
      <section>
        <h2 className="text-xl font-semibold text-white mb-3">Our Commitment</h2>
        <p>Security is built into every layer of Extensio.ai. Your prompts and generated code belong strictly to you and are securely isolated per user</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-white mb-3">Infrastructure</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>All data encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
          <li>JWT-based authentication with short-lived access tokens</li>
          <li>Rate limiting and DDoS protection on all API endpoints</li>
          <li>Automated security scanning on all generated extension code</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-white mb-3">Report a Vulnerability</h2>
        <p>If you discover a security issue, please disclose responsibly to <a href="mailto:suryanshsinghchauhanthakur@gmail.com" className="text-primary hover:underline">suryanshsinghchauhanthakur@gmail.com</a>, I will respond within 24 hours</p>
      </section>
    </PageTemplate>
  );
}

export function Changelog() {
  return (
    <PageTemplate title="Changelog" icon={<FileText className="w-6 h-6" />}>
      <section>
        <h2 className="text-xl font-semibold text-white mb-1">v2.0 - Coming Soon</h2>
        <p className="text-xs text-gray-500 mb-3">We are working on it</p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Launched AI Extension Generator Pipeline with real Manifest V3 output</li>
          <li>Added Workspace Dashboard for managing, versioning and downloading extensions</li>
          <li>Implemented real-time job polling with progress indicators</li>
          <li>Smart prompt parser:- detects dark mode, ad blocking, tab manager, timer and notes intents</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-white mb-1">v1.0</h2>
        <p className="text-xs text-gray-500 mb-3">Released May 2026</p>
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
  return (
    <PageTemplate title="API Documentation" icon={<Code className="w-6 h-6" />}>
      <section>
        <h2 className="text-xl font-semibold text-white mb-3">REST API Overview</h2>
        <p>The Extensio.ai Developer API allows enterprise customers to programmatically generate browser extensions. All endpoints require a Bearer token</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-white mb-3">Endpoints</h2>
        <div className="space-y-4 font-mono text-sm">
          <div className="bg-surface border border-white/5 rounded-xl p-4">
            <span className="text-green-400 font-bold">POST</span>
            <span className="text-gray-300 ml-2">/api/generate</span>
            <p className="text-gray-500 text-xs mt-1 font-sans">Submit a prompt. Returns a jobId to poll for status</p>
          </div>
          <div className="bg-surface border border-white/5 rounded-xl p-4">
            <span className="text-blue-400 font-bold">GET</span>
            <span className="text-gray-300 ml-2">/api/generate/status/:jobId</span>
            <p className="text-gray-500 text-xs mt-1 font-sans">Poll generation progress (status, progress %, resultUrl)</p>
          </div>
          <div className="bg-surface border border-white/5 rounded-xl p-4">
            <span className="text-blue-400 font-bold">GET</span>
            <span className="text-gray-300 ml-2">/api/downloads/:token</span>
            <p className="text-gray-500 text-xs mt-1 font-sans">Download the generated extension as a .zip file</p>
          </div>
          <div className="bg-surface border border-white/5 rounded-xl p-4">
            <span className="text-blue-400 font-bold">GET</span>
            <span className="text-gray-300 ml-2">/api/projects</span>
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
  return (
    <PageTemplate title="About Us" icon={<Users className="w-6 h-6" />}>
      <section>
        <h2 className="text-xl font-semibold text-white mb-3">Our Mission</h2>
        <p>We are a team of Ai researchers and developers on a mission to democratize software development. Extensio.ai was built to bridge the gap between human ideas and functional browser extensions - no code required</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-white mb-3">The Story</h2>
        <p>Founded in 2025, Extensio.ai started as an internal tool to automate repetitive Chrome extension boilerplate. After sharing it with a small group of beta users, the response was overwhelming. Today, we serve thousands of creators, developers and non-technical users worldwide</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-white mb-3">Our Values</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong className="text-white">Accessibility</strong> - Powerful tools should be usable by everyone</li>
          <li><strong className="text-white">Quality</strong> - We output production-ready, Manifest V3 compliant code</li>
          <li><strong className="text-white">Privacy</strong> - Your ideas are yours. We don't train on your prompts without consent</li>
        </ul>
      </section>
    </PageTemplate>
  );
}

export function Blog() {
  return (
    <PageTemplate title="Blog" icon={<Newspaper className="w-6 h-6" />}>
      <section>
        <h2 className="text-xl font-semibold text-white mb-1">The Future of AI Code Generation</h2>
        <p className="text-xs text-gray-500 mb-3">Published May 2026</p>
        <p>Browser extensions are just the beginning. Our engine is actively learning and optimizing itself for the future of ambient computing - from browser utilities to OS-level automations</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-white mb-1">Why Manifest V3 Matters</h2>
        <p className="text-xs text-gray-500 mb-3">Published May 2026</p>
        <p>Chrome's Manifest V3 transition has been controversial in the developer community. We explain what changed, why it matters for privacy and how Extensio.ai handles it automatically so you don't have to</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-white mb-1">From Idea to Chrome Web Store in 60 Seconds</h2>
        <p className="text-xs text-gray-500 mb-3">Published may 2026</p>
        <p>A step-by-step walkthrough of generating, downloading and publishing a browser extension built entirely with Extensio.ai - no code written by hand</p>
      </section>
    </PageTemplate>
  );
}

export function Careers() {
  return (
    <PageTemplate title="Careers" icon={<Briefcase className="w-6 h-6" />}>
      <section>
        <h2 className="text-xl font-semibold text-white mb-3">Join the Mission</h2>
        <p>We're a small, passionate team building technology that makes software creation accessible to everyone. If you're excited about AI-powered developer tools, we'd love to hear from you</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-white mb-3">Open Roles</h2>
        <div className="space-y-4">
          {[
            { role: 'Senior ML Engineer', type: 'Full-time · Remote', desc: 'Build and improve our extension code generation models' },
            { role: 'Full-Stack Developer', type: 'Full-time · Remote', desc: 'Work on our React frontend and Node.js backend pipeline' },
            { role: 'Developer Relations', type: 'Full-time · Remote', desc: 'Help developers get the most out of our platform and API' },
          ].map(({ role, type, desc }) => (
            <div key={role} className="bg-surface border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold text-white">{role}</h3>
              <p className="text-xs text-primary mb-2">{type}</p>
              <p className="text-sm text-gray-400">{desc}</p>
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
  return (
    <div className="w-full max-w-4xl px-4 md:px-6 py-12 mx-auto">
      <BackButton />
      <motion.div initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 md:p-12 rounded-3xl border border-white/5">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-primary/20 rounded-xl text-primary"><Mail className="w-6 h-6" /></div>
          <h1 className="text-3xl font-bold">Contact Us</h1>
        </div>
        <p className="text-gray-400 mb-8">We love to hear from you. Please reach out with any questions, feedback or support requests</p>
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
                  <h3 className="font-semibold text-white mb-1">{title}</h3>
                  <p className="text-gray-400 text-sm">{sub}</p>
                  {link && <a href={link.href} className="text-primary hover:underline text-sm mt-1 block">{link.text}</a>}
                  {text && <p className="text-gray-300 text-sm mt-1 whitespace-pre-line">{text}</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-surface border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Send us a message</h3>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); alert('Message sent! We\'ll get back to you soon.'); }}>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Name</label>
                <input type="text" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
                <input type="email" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Message</label>
                <textarea rows="4" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary resize-none" required></textarea>
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
