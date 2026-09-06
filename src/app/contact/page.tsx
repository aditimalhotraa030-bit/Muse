import PageHeader from "@/components/ui/PageHeader";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
      <PageHeader 
        title="Get in touch" 
        subtitle="We'd love to help you find your next favorite piece. Reach out the way that suits you best."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Contact", href: "/contact" }
        ]} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 max-w-5xl mx-auto mt-12">
        {/* Left: WhatsApp CTA */}
        <div className="flex flex-col">
          <Link 
            href="https://wa.me/919897110086" 
            target="_blank"
            className="w-full py-4 bg-[#25D366] text-white text-xs font-bold tracking-wider rounded-full hover:bg-[#128C7E] transition-colors uppercase flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-300"
          >
            <MessageCircle className="w-5 h-5" />
            Message us on WhatsApp
          </Link>
          
          <div className="mt-12 space-y-8">
            <div>
              <h3 className="font-serif text-xl text-heading mb-2">Visit our studio</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Bareilly, Uttar Pradesh, India
              </p>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="bg-surface border border-border p-8 rounded-lg shadow-sm">
          <h2 className="font-serif text-2xl text-heading mb-6">Send an enquiry</h2>
          
          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/70">Full name</label>
                <input 
                  type="text" 
                  placeholder="Your name" 
                  className="w-full px-4 py-3 bg-transparent border border-border rounded-md text-sm text-heading placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/70">Phone</label>
                <input 
                  type="tel" 
                  placeholder="+91" 
                  className="w-full px-4 py-3 bg-transparent border border-border rounded-md text-sm text-heading placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/70">Email</label>
              <input 
                type="email" 
                placeholder="you@example.com" 
                className="w-full px-4 py-3 bg-transparent border border-border rounded-md text-sm text-heading placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/70">Message</label>
              <textarea 
                placeholder="How can we help?" 
                rows={4}
                className="w-full px-4 py-3 bg-transparent border border-border rounded-md text-sm text-heading placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors resize-none"
              ></textarea>
            </div>
            
            <button 
              type="submit"
              className="w-full py-4 bg-primary text-primary-foreground text-xs font-bold tracking-wider rounded-full hover:bg-primary-hover transition-colors uppercase mt-4"
            >
              Send Enquiry
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
