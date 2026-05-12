import ContactForm from "@/components/contact/ContactForm";
import ContactInfo  from "@/components/contact/ContactInfo";
import ContactMap   from "@/components/contact/ContactMap";
import { buildMeta } from "@/lib/seo";

export const metadata = buildMeta({
  title:       "Contact Us",
  description: "Get in touch with Make My Memory for custom orders, queries, or support. We reply within 24 hours.",
  path:        "/contact",
});

export default function ContactPage() {
  return (
    <div className="bg-canvas min-h-screen">

      {/* ── Dark hero ── */}
      <div className="bg-hero py-14 sm:py-20">
        <div className="section-wrap text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold
                           tracking-widest uppercase text-sage mb-5">
            <span className="w-5 h-px bg-sage" />
            Get in Touch
            <span className="w-5 h-px bg-sage" />
          </span>
          <h1
            className="font-serif font-bold text-white leading-tight mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.02em" }}
          >
            We&apos;d love to hear from you
          </h1>
          <p className="text-white/60 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            A question, a custom order, or just a hello — we&apos;re here and we reply within 24 hours.
          </p>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="section-wrap py-14 sm:py-20">
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-start">

          {/* ── Left col: info + form ── */}
          <div className="lg:col-span-3 space-y-10">

            {/* Contact info cards */}
            <ContactInfo />

            {/* Form card */}
            <div className="bg-white rounded-4xl p-7 sm:p-10 shadow-soft border border-stone-100">
              <div className="mb-7">
                <h2 className="font-serif font-bold text-ink text-xl sm:text-2xl mb-2">
                  Send us a message
                </h2>
                <p className="text-stone-500 text-sm">
                  Fill in the form below and we&apos;ll get back to you as soon as possible.
                </p>
              </div>
              <ContactForm />

              {/* Email fallback */}
              <p className="mt-6 text-center text-xs text-stone-400">
                Or email us directly at{" "}
                <a
                  href="mailto:support@makemymemory.com"
                  className="font-semibold text-ink hover:text-sage-dark
                             transition-colors underline underline-offset-2"
                >
                  support@makemymemory.com
                </a>
              </p>
            </div>
          </div>

          {/* ── Right col: map + hours ── */}
          <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-28">
            <ContactMap />
            <BusinessHours />
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Business hours card (server component, no interactivity needed) ── */
function BusinessHours() {
  const hours = [
    { day: "Monday – Friday", time: "10:00 AM – 7:00 PM" },
    { day: "Saturday",        time: "10:00 AM – 5:00 PM" },
    { day: "Sunday",          time: "Closed" },
  ];

  /* Detect today's row */
  const todayIndex = new Date().getDay(); // 0 = Sun, 6 = Sat
  const rowIndex = todayIndex === 0 ? 2 : todayIndex === 6 ? 1 : 0;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft border border-stone-100">
      <h3 className="font-semibold text-ink text-sm mb-4">Business Hours</h3>
      <ul className="space-y-2.5">
        {hours.map((h, i) => (
          <li
            key={h.day}
            className={`flex justify-between items-center text-sm rounded-xl px-3 py-2
                         transition-colors
                         ${i === rowIndex
                           ? "bg-sage/10 text-ink font-medium"
                           : "text-stone-500"
                         }`}
          >
            <span>{h.day}</span>
            <span className={h.time === "Closed" ? "text-stone-400" : ""}>
              {h.time}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[11px] text-stone-400">
        All times are in IST (Indian Standard Time).
      </p>
    </div>
  );
}
