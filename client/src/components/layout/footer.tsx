import React from "react";
import { Link } from "wouter";
import { Github, Twitter, Linkedin, Database } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-background border-t border-border mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 gap-10 md:grid-cols-4">

        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">DataNestX</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A trusted marketplace to buy and sell exclusive, high-quality datasets.
            Connect data creators with data seekers worldwide.
          </p>
          <div className="flex gap-4 mt-6">
            <a
              href="#"
              aria-label="Twitter"
              className="text-muted-foreground hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="#"
              aria-label="GitHub"
              className="text-muted-foreground hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="text-muted-foreground hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Marketplace */}
        <nav aria-label="Marketplace">
          <h3 className="text-sm font-semibold text-foreground mb-4">Marketplace</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/marketplace">
                <span className="hover:text-primary transition-colors cursor-pointer">
                  Browse Datasets
                </span>
              </Link>
            </li>
            <li>
              <span className="text-muted-foreground">Categories</span>
            </li>
            <li>
              <span className="text-muted-foreground">Popular Datasets</span>
            </li>
            <li>
              <span className="text-muted-foreground">New Arrivals</span>
            </li>
          </ul>
        </nav>

        {/* For Sellers */}
        <nav aria-label="For Sellers">
          <h3 className="text-sm font-semibold text-foreground mb-4">For Sellers</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/upload-dataset">
                <span className="hover:text-primary transition-colors cursor-pointer">
                  Upload Dataset
                </span>
              </Link>
            </li>
            <li>
              <span className="text-muted-foreground">Seller Guide</span>
            </li>
            <li>
              <span className="text-muted-foreground">Pricing Guidelines</span>
            </li>
            <li>
              <span className="text-muted-foreground">Quality Standards</span>
            </li>
          </ul>
        </nav>

        {/* Support */}
        <nav aria-label="Support">
          <h3 className="text-sm font-semibold text-foreground mb-4">Support</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <span className="text-muted-foreground">Help Center</span>
            </li>
            <li>
              <span className="text-muted-foreground">Contact Us</span>
            </li>
            <li>
              <span className="text-muted-foreground">Privacy Policy</span>
            </li>
            <li>
              <span className="text-muted-foreground">Terms of Service</span>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-border mt-12 py-6 text-center text-sm">
        <span className="text-foreground font-semibold">
          © {new Date().getFullYear()} DataNestX
        </span>
        <span className="text-muted-foreground">. All rights reserved.</span>
      </div>
    </footer>
  );
};
