"use client";
import Link from "next/link";
import { FiClock, FiStar } from "react-icons/fi";
import { useDuration } from "@/lib/books";
import { formatTime } from "@/lib/access";
import type { Book } from "@/lib/types";
export function Duration({ url }: { url: string }) {
  const duration = useDuration(url);
  return <>{duration === undefined ? "--:--" : formatTime(duration)}</>;
}
export function Skeleton({
  kind = "card",
}: {
  kind?: "card" | "selected" | "detail" | "line";
}) {
  return (
    <div
      className={"skeleton skeleton-" + kind}
      role="status"
      aria-label="Loading content"
    />
  );
}
export default function BookCard({ book }: { book: Book }) {
  return (
    <Link className="book-card" href={"/book/" + book.id}>
      {book.subscriptionRequired && (
        <span className="premium-pill">Premium</span>
      )}
      <img src={book.imageLink} alt={book.title} />
      <h3>{book.title}</h3>
      <p className="book-author">{book.author}</p>
      <p className="book-subtitle">{book.subTitle}</p>
      <div className="book-meta">
        <span>
          <FiClock />
          <Duration url={book.audioLink} />
        </span>
        <span>
          <FiStar />
          {book.averageRating}
        </span>
      </div>
    </Link>
  );
}
