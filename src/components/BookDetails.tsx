"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiStar,
  FiClock,
  FiMic,
  FiSun,
  FiBookOpen,
  FiBookmark,
} from "react-icons/fi";
import Shell from "./Shell";
import { Skeleton, Duration } from "./BookCard";
import { useBooks } from "@/lib/books";
import { useAppStore } from "@/lib/store";
import { accessDestination } from "@/lib/access";
import { updateLibrary } from "@/lib/library";
export default function BookDetails({ id }: { id: string }) {
  const { data, error, retry } = useBooks(
    "/getBook?id=" + encodeURIComponent(id),
  );
  const book = Array.isArray(data) ? data[0] : data;
  const { user, plan, ready, subscriptionReady, openAuth, library } =
    useAppStore();
  const [saveError, setSaveError] = useState(""),
    [saving, setSaving] = useState(false);
  const router = useRouter();
  const saved = library.find((entry) => entry.book.id === id)?.saved;
  function read(listen = false) {
    if (!book) return;
    const next = accessDestination(
      Boolean(user),
      plan,
      book.subscriptionRequired,
    );
    if (next === "auth") openAuth();
    else
      router.push(
        next === "plan"
          ? "/choose-plan"
          : "/player/" + book.id + (listen ? "?listen=1" : ""),
      );
  }
  async function save() {
    if (!book) return;
    if (!user) {
      openAuth();
      return;
    }
    setSaving(true);
    try {
      await updateLibrary(user.uid, book, { saved: !saved });
      setSaveError("");
    } catch {
      setSaveError("Unable to save this book. Please try again.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <Shell>
      {error ? (
        <p role="alert">
          {error}
          <button onClick={retry}>Retry</button>
        </p>
      ) : !book ? (
        <Skeleton kind="detail" />
      ) : (
        <div className="book-detail">
          <div className="book-detail-copy">
            <h1>
              {book.title}
              {book.subscriptionRequired && " (Premium)"}
            </h1>
            <h4>{book.author}</h4>
            <p className="book-detail-subtitle">{book.subTitle}</p>
            <div className="detail-stats">
              <span>
                <FiStar />
                {book.averageRating} ({book.totalRating} ratings)
              </span>
              <span>
                <FiClock />
                <Duration url={book.audioLink} />
              </span>
              <span>
                <FiMic />
                {book.type}
              </span>
              <span>
                <FiSun />
                {book.keyIdeas} Key ideas
              </span>
            </div>
            <div className="reading-actions">
              <button
                disabled={!ready || (!!user && !subscriptionReady)}
                onClick={() => read()}
              >
                <FiBookOpen />
                Read
              </button>
              <button
                disabled={!ready || (!!user && !subscriptionReady)}
                onClick={() => read(true)}
              >
                <FiMic />
                Listen
              </button>
            </div>
            <button className="save-book" disabled={saving} onClick={save}>
              <FiBookmark />
              {saving
                ? "Saving…"
                : saved
                  ? "Saved to My Library"
                  : "Add title to My Library"}
            </button>
            {saveError && (
              <p className="form-error" role="alert">
                {saveError}
              </p>
            )}
            <h2>What’s it about?</h2>
            <div className="book-tags">
              {book.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <p className="book-description">{book.bookDescription}</p>
            <h2>About the author</h2>
            <p className="book-description">{book.authorDescription}</p>
          </div>
          <img className="detail-cover" src={book.imageLink} alt={book.title} />
        </div>
      )}
    </Shell>
  );
}
