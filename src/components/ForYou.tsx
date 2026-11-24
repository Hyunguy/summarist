"use client";
import Link from "next/link";
import { FiPlay } from "react-icons/fi";
import Shell from "./Shell";
import BookCard, { Duration, Skeleton } from "./BookCard";
import { useBooks } from "@/lib/books";
import type { Book } from "@/lib/types";
function BookRow({
  status,
  title,
  subtitle,
}: {
  status: string;
  title: string;
  subtitle: string;
}) {
  const { data, error, retry } = useBooks("/getBooks?status=" + status);
  const books = Array.isArray(data) ? data : [];
  return (
    <section className="book-section">
      <h2>{title}</h2>
      <p className="section-subtitle">{subtitle}</p>
      {error ? (
        <div role="alert">
          {error}
          <button className="text-button" onClick={retry}>
            Retry
          </button>
        </div>
      ) : (
        <div className="book-row">
          {data
            ? books.map((book: Book) => <BookCard key={book.id} book={book} />)
            : Array.from({ length: 5 }, (_, i) => <Skeleton key={i} />)}
        </div>
      )}
    </section>
  );
}
export default function ForYou() {
  const selected = useBooks("/getBooks?status=selected");
  const book = Array.isArray(selected.data) ? selected.data[0] : selected.data;
  return (
    <Shell>
      <h2>Selected just for you</h2>
      {selected.error ? (
        <p role="alert">
          {selected.error}
          <button onClick={selected.retry}>Retry</button>
        </p>
      ) : book ? (
        <Link className="selected-book" href={"/book/" + book.id}>
          <div className="selected-subtitle">{book.subTitle}</div>
          <img src={book.imageLink} alt={book.title} />
          <div className="selected-info">
            <h3>{book.title}</h3>
            <p>{book.author}</p>
            <span className="selected-play">
              <i>
                <FiPlay />
              </i>
              <Duration url={book.audioLink} />
            </span>
          </div>
        </Link>
      ) : (
        <Skeleton kind="selected" />
      )}
      <BookRow
        status="recommended"
        title="Recommended For You"
        subtitle="We think you’ll like these"
      />
      <BookRow
        status="suggested"
        title="Suggested Books"
        subtitle="Browse those books"
      />
    </Shell>
  );
}
