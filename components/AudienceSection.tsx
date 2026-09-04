"use client";

import { useState } from "react";
import { Store, GraduationCap, Users } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const AUDIENCE_META = [
  {
    icon: Store,
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=700&h=700&fit=crop",
    gradient: "from-wine to-brand",
  },
  {
    icon: GraduationCap,
    image: "https://images.unsplash.com/photo-1427504494785-cdda5f45fb4d?w=700&h=700&fit=crop",
    gradient: "from-brand to-orange",
  },
  {
    icon: Users,
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=700&h=700&fit=crop",
    gradient: "from-orange to-accent",
  },
];

function AudienceImage({ image, gradient }: { image: string; gradient: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-transform duration-500 group-hover:scale-110`}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image}
      alt=""
      onError={() => setFailed(true)}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
    />
  );
}

export default function AudienceSection() {
  const { dict } = useLanguage();

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-cream via-white to-cream">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink mb-4">
            {dict.audience.title}
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl">
            {dict.audience.description}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {dict.audience.items.map((audience, index) => {
            const { icon: Icon, image, gradient } = AUDIENCE_META[index];
            return (
              <div
                key={audience.title}
                className="group relative overflow-hidden rounded-2xl h-96 sm:h-[450px] flex flex-col justify-end cursor-pointer"
              >
                {/* Imagem de fundo — se falhar a carregar, cai automaticamente para um gradiente da marca (nunca fica em branco) */}
                <AudienceImage image={image} gradient={gradient} />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/60 to-transparent" />

                {/* Content */}
                <div className="relative z-10 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-brand/20 rounded-full flex items-center justify-center">
                      <Icon size={24} className="text-brand" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3 font-serif">
                    {audience.title}
                  </h3>
                  <p className="text-cream/90 leading-relaxed">
                    {audience.description}
                  </p>
                </div>

                {/* Hover accent */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-brand via-accent to-transparent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
