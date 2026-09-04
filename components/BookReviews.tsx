"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Star } from "lucide-react";

interface ReviewDTO {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  authorName: string;
}

export default function BookReviews({ slug }: { slug: string }) {
  const { status } = useSession();
  const [average, setAverage] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const load = () => {
    fetch(`/api/livro/${slug}/avaliacoes`)
      .then((r) => r.json())
      .then((data) => {
        setAverage(data.average);
        setCount(data.count);
        setReviews(data.reviews);
      });
  };

  useEffect(load, [slug]);

  const submit = async () => {
    setSending(true);
    const res = await fetch(`/api/livro/${slug}/avaliacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    setSending(false);
    if (res.ok) {
      setComment("");
      load();
    }
  };

  return (
    <section className="mt-16 border-t border-line pt-10">
      <div className="flex items-center gap-3">
        <h2 className="font-serif text-lg font-semibold text-ink">Avaliações</h2>
        {average !== null && (
          <span className="flex items-center gap-1 text-sm text-foreground/60">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            {average.toFixed(1)} · {count} avaliação(ões)
          </span>
        )}
      </div>

      {status === "authenticated" && (
        <div className="mt-6 rounded-2xl border border-line p-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)} aria-label={`${n} estrelas`}>
                <Star size={18} className={n <= rating ? "fill-amber-400 text-amber-400" : "text-line"} />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Deixa a tua opinião sobre este livro..."
            className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm"
          />
          <button
            onClick={submit}
            disabled={sending}
            className="mt-2 rounded-full bg-brand px-5 py-2 text-xs font-semibold text-cream disabled:opacity-50"
          >
            Publicar avaliação
          </button>
        </div>
      )}

      <ul className="mt-6 space-y-4">
        {reviews.map((r) => (
          <li key={r.id} className="border-b border-line/60 pb-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-ink">{r.authorName}</span>
              <span className="flex items-center gap-0.5 text-xs text-amber-500">
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </span>
            </div>
            {r.comment && <p className="mt-1 text-foreground/70">{r.comment}</p>}
          </li>
        ))}
        {reviews.length === 0 && (
          <li className="text-sm text-foreground/50">Ainda sem avaliações — sê o primeiro a avaliar.</li>
        )}
      </ul>
    </section>
  );
}
