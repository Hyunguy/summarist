"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { FiPlay, FiPause, FiRotateCcw, FiRotateCw } from "react-icons/fi";
import Shell from "./Shell";
import { Skeleton } from "./BookCard";
import { LoginPrompt } from "./Settings";
import { useBooks } from "@/lib/books";
import { useAppStore } from "@/lib/store";
import { formatTime } from "@/lib/access";
import { updateLibrary } from "@/lib/library";
export default function Player({ id }: { id: string }) {
  const { data, error, retry } = useBooks(
    "/getBook?id=" + encodeURIComponent(id),
  );
  const book = Array.isArray(data) ? data[0] : data;
  const { user, ready, plan, subscriptionReady } = useAppStore();
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false),
    [time, setTime] = useState(0),
    [duration, setDuration] = useState(0),
    [font, setFont] = useState(18),
    [audioError, setAudioError] = useState("");
  async function toggle() {
    if (!audio.current) return;
    try {
      if (audio.current.paused) await audio.current.play();
      else audio.current.pause();
      setAudioError("");
    } catch {
      setAudioError("Audio could not play. Please try again.");
    }
  }
  function seek(value: number) {
    if (audio.current) {
      audio.current.currentTime = Math.max(0, Math.min(duration, value));
      setTime(audio.current.currentTime);
    }
  }
  async function finish() {
    if (user && book)
      try {
        await updateLibrary(user.uid, book, { finished: true });
      } catch {
        setAudioError("Finished listening. Your library could not be updated.");
      }
  }
  return (
    <Shell
      player
      fontControls={
        <div className="font-controls" aria-label="Text size">
          {[16, 18, 22, 26].map((size) => (
            <button
              key={size}
              style={{ fontSize: size }}
              aria-label={"Text size " + size}
              aria-pressed={font === size}
              onClick={() => setFont(size)}
            >
              Aa
            </button>
          ))}
        </div>
      }
    >
      {error ? (
        <p role="alert">
          {error}
          <button onClick={retry}>Retry</button>
        </p>
      ) : !book || !ready || (user && !subscriptionReady) ? (
        <Skeleton kind="detail" />
      ) : !user ? (
        <LoginPrompt message="Log in to read and listen to this book." />
      ) : book.subscriptionRequired && plan === "basic" ? (
        <div className="login-prompt">
          <h2>Unlock this book with Premium</h2>
          <Link className="btn" href="/choose-plan">
            Choose a plan
          </Link>
        </div>
      ) : (
        <>
          <article className="reader">
            <h1>{book.title}</h1>
            <div className="book-summary" style={{ fontSize: font }}>
              {book.summary}
            </div>
          </article>
          <audio
            ref={audio}
            src={book.audioLink}
            preload="metadata"
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => {
              setPlaying(false);
              finish();
            }}
            onError={() =>
              setAudioError(
                "Audio is unavailable. Check your connection and try again.",
              )
            }
          />
          <section className="audio-player" aria-label="Audio player">
            <div className="audio-book">
              <img src={book.imageLink} alt="" />
              <div>
                <strong>{book.title}</strong>
                <p>{book.author}</p>
              </div>
            </div>
            <div className="audio-controls">
              <div className="audio-buttons">
                <button
                  aria-label="Back 10 seconds"
                  onClick={() => seek(time - 10)}
                >
                  <FiRotateCcw />
                  <small>10</small>
                </button>
                <button
                  className="play-button"
                  aria-label={playing ? "Pause" : "Play"}
                  onClick={toggle}
                >
                  {playing ? <FiPause /> : <FiPlay />}
                </button>
                <button
                  aria-label="Forward 10 seconds"
                  onClick={() => seek(time + 10)}
                >
                  <FiRotateCw />
                  <small>10</small>
                </button>
              </div>
              <div className="audio-progress">
                <span>{formatTime(time)}</span>
                <input
                  aria-label="Audio position"
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.1"
                  value={time}
                  onChange={(e) => seek(Number(e.target.value))}
                />
                <span>{formatTime(duration)}</span>
              </div>
              {audioError && (
                <p className="form-error" role="alert">
                  {audioError}
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </Shell>
  );
}
