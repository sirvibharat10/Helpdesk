import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { Menu, X, ChevronDown } from "lucide-react";
import Button from "../components/Button";
import Input from "../components/Input";
import Dialog from "../components/Dialog";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoDialogOpen, setDemoDialogOpen] = useState(false);
  const [demoForm, setDemoForm] = useState({
    name: "",
    contactNumber: "",
    email: "",
    organization: "",
    interestedIn: "FREE_DEMO",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.sendDemoInquiry(demoForm);
      alert("Demo inquiry sent! We will contact you soon.");
      setDemoDialogOpen(false);
      setDemoForm({
        name: "",
        contactNumber: "",
        email: "",
        organization: "",
        interestedIn: "FREE_DEMO",
      });
    } catch (error) {
      alert("Failed to send inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 bg-white border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-900">
              🚀 SahaYak AI
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("home")}
              className="text-slate-600 hover:text-slate-900"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-slate-600 hover:text-slate-900"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-slate-600 hover:text-slate-900"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-slate-600 hover:text-slate-900"
            >
              Contact Us
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Login
            </Button>
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-slate-200">
            <div className="px-4 py-4 space-y-4">
              <button
                onClick={() => scrollToSection("home")}
                className="block w-full text-left text-slate-600"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="block w-full text-left text-slate-600"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="block w-full text-left text-slate-600"
              >
                Pricing
              </button>
              <Button onClick={() => navigate("/login")} className="w-full">
                Login
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-slate-900 mb-6">
              Meet the Last CRM You Will Ever Need
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Powerful AI-driven helpdesk and CRM solution designed to transform
              your customer support operations.
            </p>
            <Button
              onClick={() => setDemoDialogOpen(true)}
              className="text-lg px-8 py-4"
            >
              Let's Talk Growth
            </Button>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-slate-100 h-96 rounded-2xl flex items-center justify-center">
            <span className="text-6xl">👨‍💼</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Choose SahaYak AI?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Ticket Management", icon: "🎫" },
              { title: "Team Collaboration", icon: "👥" },
              { title: "AI-Powered Assistance", icon: "🤖" },
              { title: "Analytics & Reports", icon: "📊" },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {feature.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why We're Different
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Faster Resolution",
              "Centralized Communication",
              "Full Audit Trail",
              "Role-Based Access",
              "AI-Assisted Routing",
              "Easy Onboarding",
            ].map((advantage, i) => (
              <div
                key={i}
                className="p-6 border border-slate-200 rounded-xl hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-slate-900">{advantage}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            Simple, Transparent Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { name: "Monthly", price: "₹1,499", period: "/mo" },
              {
                name: "Yearly",
                price: "₹1,199",
                period: "/mo",
                badge: "Save 20%",
              },
            ].map((plan, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-xl border border-slate-200"
              >
                {plan.badge && (
                  <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {plan.name}
                </h3>
                <div className="text-4xl font-bold text-blue-900 mb-6">
                  {plan.price}
                  <span className="text-lg text-slate-600">{plan.period}</span>
                </div>
                <Button
                  onClick={() => setDemoDialogOpen(true)}
                  className="w-full"
                >
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">Book your FREE Demo Now</h2>
          <Button
            onClick={() => setDemoDialogOpen(true)}
            variant="secondary"
            className="text-lg px-8 py-4"
          >
            Schedule Demo
          </Button>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <h2 className="text-4xl font-bold text-center mb-12">Get in Touch</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-lg mb-2">Founder</h3>
            <p className="text-slate-600">Sahay Yadav</p>
            <p className="text-slate-600">CEO & Founder</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-lg mb-2">Contact</h3>
            <p className="text-slate-600">📞 +91 9876543210</p>
            <p className="text-slate-600">📧 contact@sahayak.ai</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400">
            © 2024 SahaYak AI. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Demo Dialog */}
      <Dialog
        open={demoDialogOpen}
        onOpenChange={setDemoDialogOpen}
        title="Book Your Free Demo"
      >
        <form onSubmit={handleDemoSubmit} className="space-y-4">
          <Input
            label="Name"
            required
            value={demoForm.name}
            onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
            placeholder="Your name"
          />
          <Input
            label="Contact Number"
            required
            value={demoForm.contactNumber}
            onChange={(e) =>
              setDemoForm({ ...demoForm, contactNumber: e.target.value })
            }
            placeholder="Your phone number"
          />
          <Input
            label="Email"
            type="email"
            required
            value={demoForm.email}
            onChange={(e) =>
              setDemoForm({ ...demoForm, email: e.target.value })
            }
            placeholder="Your email"
          />
          <Input
            label="Organization"
            required
            value={demoForm.organization}
            onChange={(e) =>
              setDemoForm({ ...demoForm, organization: e.target.value })
            }
            placeholder="Your organization"
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Interested In
            </label>
            <select
              value={demoForm.interestedIn}
              onChange={(e) =>
                setDemoForm({ ...demoForm, interestedIn: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900"
            >
              <option value="FREE_DEMO">Free Demo</option>
              <option value="MONTHLY_PLAN">Monthly Plan</option>
              <option value="YEARLY_PLAN">Yearly Plan</option>
              <option value="GENERAL_INQUIRY">General Inquiry</option>
            </select>
          </div>
          <Button type="submit" loading={submitting} className="w-full">
            Send Inquiry
          </Button>
        </form>
      </Dialog>
    </div>
  );
};

export default LandingPage;
