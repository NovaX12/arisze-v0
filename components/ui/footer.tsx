"use client"

import { Instagram, Linkedin } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Animated Wave Background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="absolute bottom-0 w-full h-32" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path
            d="M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z"
            fill="url(#wave-gradient-1)"
            className="wave-animation-1"
          />
          <path
            d="M0,80 C200,40 400,120 600,80 C800,40 1000,120 1200,80 L1200,120 L0,120 Z"
            fill="url(#wave-gradient-2)"
            className="wave-animation-2"
          />
          <path
            d="M0,100 C200,60 400,140 600,100 C800,60 1000,140 1200,100 L1200,120 L0,120 Z"
            fill="url(#wave-gradient-3)"
            className="wave-animation-3"
          />
          <defs>
            <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8a3ffc" />
              <stop offset="100%" stopColor="#a259ff" />
            </linearGradient>
            <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a259ff" />
              <stop offset="100%" stopColor="#ff4d6d" />
            </linearGradient>
            <linearGradient id="wave-gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff4d6d" />
              <stop offset="100%" stopColor="#8a3ffc" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Footer Content */}
      <div className="relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <Link href="/">
                <h3 className="text-2xl font-serif font-bold gradient-text italic mb-4 cursor-pointer hover:scale-105 transition-transform duration-300">
                  Arisze
                </h3>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Reimagining university social life in Kaunas, Lithuania. Connect, discover, and create lasting memories.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link
                  href="/events"
                  className="block text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  Events & Activities
                </Link>
                <Link
                  href="/community"
                  className="block text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  Community
                </Link>
                <Link
                  href="/ai-hub"
                  className="block text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  AI Hub
                </Link>
                <Link
                  href="/dashboard"
                  className="block text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  Dashboard
                </Link>
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <Link
                  href="/contact"
                  className="block text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  Contact Us
                </Link>
                <a href="#" className="block text-sm text-muted-foreground hover:text-accent transition-colors">
                  Help Center
                </a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-accent transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-accent transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">University Partners</h4>
              <div className="space-y-2">
                <a
                  href="https://www.vu.lt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  Vilnius University
                </a>
                <a
                  href="https://en.ktu.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  Kaunas University of Technology
                </a>
                <a
                  href="https://www.vdu.lt/en/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  Vytautas Magnus University
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-border pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-sm text-muted-foreground mb-4 md:mb-0">
                © 2025 Arisze. All rights reserved. Made with ❤️ for students in Kaunas.
              </p>

              <div className="flex justify-center space-x-6">
                <a
                  href="#"
                  className="group p-3 rounded-full border border-accent/30 hover:border-accent transition-all duration-300 hover:glow-effect hover:-translate-y-1"
                >
                  <Instagram className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </a>
                <a
                  href="#"
                  className="group p-3 rounded-full border border-accent/30 hover:border-accent transition-all duration-300 hover:glow-effect hover:-translate-y-1"
                >
                  <Linkedin className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
