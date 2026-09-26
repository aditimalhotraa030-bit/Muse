import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function ContactCTASection() {
  return (
    <section className="container mx-auto px-4 md:px-8 py-16 mb-8">
      <div 
        className="rounded-2xl md:rounded-3xl p-10 sm:p-12 md:p-16 text-center relative overflow-hidden shadow-xl border border-[#734e40]/40 bg-[#5f3f33]"
      >
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-[#f4ccaf] font-medium mb-4 drop-shadow-sm">
            Have a question or a custom request?
          </h2>
          <p className="text-[#f4ccaf]/90 mb-10 text-sm md:text-base leading-relaxed">
            Chat with us directly on WhatsApp for styling advice, order updates, or bulk orders. We usually reply within minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="https://wa.me/919897110086" 
              target="_blank"
              className="flex items-center gap-2 px-8 py-3.5 bg-[#25D366] text-white text-xs font-bold tracking-wider rounded-full hover:bg-[#128C7E] transition-all uppercase w-full sm:w-auto justify-center shadow-lg hover:scale-105 active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </Link>
            <Link 
              href="/contact" 
              className="px-8 py-3.5 bg-transparent border border-[#f4ccaf] text-[#f4ccaf] text-xs font-bold tracking-wider rounded-full hover:bg-[#f4ccaf] hover:text-[#5f3f33] transition-all uppercase w-full sm:w-auto text-center shadow-lg hover:scale-105 active:scale-95"
            >
              Contact Page
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
