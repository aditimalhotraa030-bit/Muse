import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";

export default function Footer() {
  return (
    <footer className="bg-[#5f3f33] border-t border-[#4d3228] mt-24 text-[#f4ccaf]">
      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <Image 
                src="/muse-logo.png" 
                alt="Muse by Kashish Logo" 
                width={370} 
                height={337} 
                className="w-auto h-16 md:h-20 object-contain"
              />
            </Link>
            <p className="text-sm text-[#f4ccaf]/80 leading-relaxed max-w-xs">
              Handcrafted with intention, designed for the modern muse. Premium artificial jewelry that tells your story.
            </p>
          </div>

          {/* Shop Links */}
          <div className="space-y-6">
            <h4 className="font-medium text-[#f4ccaf] tracking-wide uppercase text-sm">Shop</h4>
            <ul className="space-y-3">
              <li><Link href="/suits" className="text-sm text-[#f4ccaf]/80 hover:text-white transition-colors">Suits</Link></li>
              <li><Link href="/new-arrivals" className="text-sm text-[#f4ccaf]/80 hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/shop" className="text-sm text-[#f4ccaf]/80 hover:text-white transition-colors">All Jewelry</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-6">
            <h4 className="font-medium text-[#f4ccaf] tracking-wide uppercase text-sm">Support</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-[#f4ccaf]/80 hover:text-white transition-colors">Our Story</Link></li>
              <li><Link href="/contact" className="text-sm text-[#f4ccaf]/80 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/faqs" className="text-sm text-[#f4ccaf]/80 hover:text-white transition-colors">FAQs</Link></li>
              <li><Link href="/track-order" className="text-sm text-[#f4ccaf]/80 hover:text-white transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Get In Touch */}
          <div className="space-y-6">
            <h4 className="font-medium text-[#f4ccaf] tracking-wide uppercase text-sm">Get In Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#f4ccaf] shrink-0" />
                <span className="text-sm text-[#f4ccaf]/80">Bareilly, Uttar Pradesh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#f4ccaf] shrink-0" />
                <a href="tel:+919897110086" className="text-sm text-[#f4ccaf]/80 hover:text-white transition-colors">+91 98971 10086</a>
              </li>
            </ul>
            <div className="flex gap-4 pt-2">
              <a 
                href="https://www.instagram.com/musebykashish.co/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full border border-[#f4ccaf]/30 flex items-center justify-center text-[#f4ccaf] hover:border-[#f4ccaf] hover:text-white hover:bg-white/10 transition-colors" 
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#4d3228]">
        <div className="container mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#f4ccaf]/60">
            &copy; {new Date().getFullYear()} muse by Kashish. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-[#f4ccaf]/60 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-[#f4ccaf]/60 hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/shipping" className="text-xs text-[#f4ccaf]/60 hover:text-white transition-colors">Shipping Policy</Link>
            <Link href="/returns" className="text-xs text-[#f4ccaf]/60 hover:text-white transition-colors">Return Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
