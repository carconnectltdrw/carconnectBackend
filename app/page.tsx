"use client"

import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Leadership } from "@/components/leadership"
import { Projects } from "@/components/projects"
import { AboutModal } from "@/components/about-modal"
import { Mail, Phone, MapPin, Send } from "lucide-react"
import Link from "next/link"
import { Chatbot } from "@/components/chatbot" // imported chatbot
import { useState } from "react"

export default function LandingPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage("")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitMessage("Message sent successfully!")
        setFormData({ name: "", email: "", message: "" })
      } else {
        setSubmitMessage(data.error || "Failed to send message. Please try again.")
      }
    } catch (error) {
      setSubmitMessage("Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <section id="about" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">Who We Are</h2>
            <p className="text-xl text-slate-600 leading-relaxed font-medium">
              CarConnect Ltd is building the digital highway for Rwanda. We create secure, trusted platforms that bridge
              the gap between technology and traditional transportation.
            </p>
            <AboutModal />
          </div>
        </div>
      </section>
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Join the Network",
                text: "Download the app and register as a driver or user in minutes.",
              },
              {
                step: "02",
                title: "Select Service",
                text: "Choose from our range of secure delivery or mobility solutions.",
              },
              {
                step: "03",
                title: "Safe Arrival",
                text: "Track your journey or package in real-time until it reaches its destination.",
              },
            ].map((s, i) => (
              <div key={i} className="space-y-4">
                <div className="w-16 h-16 bg-brand-green rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-lg shadow-brand-green/20">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{s.title}</h3>
                <p className="text-slate-600 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Features />
      <Leadership />
      <Projects />
      <section id="contact" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
            <div className="space-y-12">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900">Contact Us</h2>
              <div className="space-y-8">
                <div className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-green">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Us</p>
                    <a
                      href="mailto:carconnectltd.rw@gmail.com"
                      className="text-lg font-bold text-slate-900 hover:text-brand-green"
                    >
                      carconnectltd.rw@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-blue">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Call Us</p>
                    <p className="text-lg font-bold text-slate-900">+250 780 114 522</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-900">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Visit Us</p>
                    <p className="text-lg font-bold text-slate-900">Kicukiro, Kigali – Rwanda</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-premium">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white border-slate-200 rounded-2xl h-14 px-6 focus:ring-2 focus:ring-brand-green outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white border-slate-200 rounded-2xl h-14 px-6 focus:ring-2 focus:ring-brand-green outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white border-slate-200 rounded-3xl min-h-[160px] p-6 focus:ring-2 focus:ring-brand-green outline-none transition-all"
                    placeholder="How can we help you?"
                  />
                </div>
                {submitMessage && (
                  <div className={`p-4 rounded-2xl text-center font-medium ${
                    submitMessage.includes("successfully")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    {submitMessage}
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-green h-14 rounded-full font-bold text-lg shadow-lg shadow-brand-green/20 hover:bg-brand-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send Message"} <Send size={20} className="ml-2" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <Chatbot /> {/* replaced static bubble with functional chatbot */}
      <footer className="py-20 border-t border-slate-100 bg-slate-50">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-12 items-start">
          <div className="space-y-6">
            <Image src="/logo.png" alt="CarConnect Ltd" width={180} height={50} className="h-10 w-auto" />
            <p className="text-sm text-slate-500 leading-relaxed">
              Leading the digital transformation of mobility and logistics in Rwanda. Simple. Secure. Smart.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900">Company</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="#about" className="hover:text-brand-green">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#leaders" className="hover:text-brand-green">
                  Leadership
                </Link>
              </li>
              <li>
                <Link href="#projects" className="hover:text-brand-green">
                  Projects
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900">Services</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="#mobility-app" className="hover:text-brand-green">
                  Mobility App
                </Link>
              </li>
              <li>
                <Link href="#delivery-and-tracking" className="hover:text-brand-green">
                  Package Delivery
                </Link>
              </li>
              <li>
                <Link href="#delivery-and-tracking" className="hover:text-brand-green">
                  Tracking
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4 text-sm text-slate-600">
            <h4 className="font-bold text-slate-900">Contact</h4>
            <p>Kicukiro, Kigali – Rwanda</p>
            <p>carconnectltd.rw@gmail.com</p>
          </div>
        </div>
        <div className="container mx-auto px-4 pt-12 mt-12 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">
            © 2025 CarConnect Ltd. Created for Excellence in Rwanda.
          </p>
        </div>
      </footer>
    </main>
  )
}
