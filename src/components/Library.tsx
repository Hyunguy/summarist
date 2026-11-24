"use client";
import { useState } from "react";
import Shell from "./Shell";
import BookCard, { Skeleton } from "./BookCard";
import { LoginPrompt } from "./Settings";
import { useAppStore } from "@/lib/store";
export default function Library() {
  const { user, ready, library, libraryReady, serviceError } = useAppStore();
  const [tab, setTab] = useState<"saved" | "finished">("saved");
  const books = library.filter((entry) => entry[tab]);
  return (
    <Shell>
      <h1 className="page-heading">My Library</h1>
      {!ready || (!!user && !libraryReady) ? (
        <Skeleton kind="detail" />
      ) : !user ? (
        <LoginPrompt message="Log in to your account to see your library." />
      ) : (
        <>
          <div className="library-tabs">
            <button
              className={tab === "saved" ? "active" : ""}
              onClick={() => setTab("saved")}
            >
              Saved books
            </button>
            <button
              className={tab === "finished" ? "active" : ""}
              onClick={() => setTab("finished")}
            >
              Finished books
            </button>
          </div>
          {serviceError && (
            <p className="form-error" role="alert">
              {serviceError}
            </p>
          )}
          {books.length ? (
            <div className="library-grid">
              {books.map((entry) => (
                <BookCard key={entry.book.id} book={entry.book} />
              ))}
            </div>
          ) : (
            <div className="library-empty">
              <h2>
                {tab === "saved"
                  ? "Save your favorite books!"
                  : "Finish a book to see it here."}
              </h2>
              <p>
                {tab === "saved"
                  ? "When you save a book, it will appear here."
                  : "Books you listen to until the end will appear here."}
              </p>
            </div>
          )}
        </>
      )}
    </Shell>
  );
}
