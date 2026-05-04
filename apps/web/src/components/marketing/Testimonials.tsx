interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatarColor: string;
}

const testimonials: Testimonial[] = [
  {
    quote: 'Launchpad AI helped us go from idea to live landing page in under 10 minutes. Incredible.',
    name: 'David Chen',
    role: 'Founder at Taskly',
    avatarColor: 'bg-blue-100 text-blue-600',
  },
  {
    quote: 'The copy and layout quality is on point. It\'s like having a senior marketer on demand.',
    name: 'Sarah Johnson',
    role: 'Growth Lead at Pixelly',
    avatarColor: 'bg-pink-100 text-pink-600',
  },
  {
    quote: 'Built-in PostHog analytics gives us instant insights to iterate and improve fast.',
    name: 'Mike Roberts',
    role: 'CEO at Meetwise',
    avatarColor: 'bg-emerald-100 text-emerald-600',
  },
];

function Avatar({ name, color }: { name: string; color: string }) {
  const initials = name.split(' ').map((n) => n[0]).join('');
  return (
    <div className={`size-10 rounded-full ${color} flex items-center justify-center text-[13px] font-bold shrink-0`}>
      {initials}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-20 lg:py-24 bg-white">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <h2 className="text-[clamp(1.25rem,2.5vw,1.5rem)] font-bold text-ink text-center mb-12">
          Loved by founders and marketers
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <article key={t.name} className="flex items-start gap-4">
              <Avatar name={t.name} color={t.avatarColor} />
              <div>
                <p className="text-[14px] text-ink-soft leading-relaxed mb-3">
                  "{t.quote}"
                </p>
                <div className="text-[13px] font-semibold text-ink">— {t.name}</div>
                <div className="text-[12px] text-ink-muted">{t.role}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
