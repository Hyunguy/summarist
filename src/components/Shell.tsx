"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import {
  FiHome,
  FiBookmark,
  FiEdit3,
  FiSearch,
  FiSettings,
  FiHelpCircle,
  FiLogIn,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { firebaseServices } from "@/lib/firebase";
import { useAppStore } from "@/lib/store";
import { useBooks } from "@/lib/books";
import type { Book } from "@/lib/types";
export default function Shell({
  children,
  player = false,
  fontControls,
}: {
  children: React.ReactNode;
  player?: boolean;
  fontControls?: React.ReactNode;
}) {
  const path = usePathname(),
    router = useRouter();
  const { user, openAuth, sidebarOpen, setSidebar } = useAppStore();
  const [query, setQuery] = useState(""),
    [debounced, setDebounced] = useState(""),
    [searchOpen, setSearchOpen] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    setSidebar(false);
    setSearchOpen(false);
  }, [path, setSidebar]);
  const search = useBooks(
    debounced
      ? "/getBooksByAuthorOrTitle?search=" + encodeURIComponent(debounced)
      : null,
  );
  const results = Array.isArray(search.data)
    ? search.data
    : search.data
      ? [search.data]
      : [];
  async function logout() {
    try {
      await signOut(firebaseServices().auth);
      router.push("/for-you");
    } catch {
      setError("Unable to log out. Please try again.");
    }
  }
  const item = (href: string, text: string, Icon: typeof FiHome) => (
    <Link
      className={"side-link " + (path === href ? "active" : "")}
      href={href}
    >
      <Icon />
      {text}
    </Link>
  );
  return (
    <div className={"app-shell " + (player ? "player-shell" : "")}>
      <header className="app-header">
        <button
          className="menu-toggle"
          aria-label="Open sidebar"
          onClick={() => setSidebar(true)}
        >
          <FiMenu />
        </button>
        <div className="search-wrap">
          <div className="search-input">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSearchOpen(false);
              }}
              aria-label="Search for books"
              placeholder="Search for books"
            />
            <FiSearch />
          </div>
          {searchOpen && query.trim() && (
            <div
              className="search-results"
              role="region"
              aria-label="Search results"
            >
              {query.trim() !== debounced || (!search.data && !search.error) ? (
                <p role="status">Searching…</p>
              ) : search.error ? (
                <p role="alert">{search.error}</p>
              ) : results.length ? (
                results.map((book: Book) => (
                  <Link
                    key={book.id}
                    href={"/book/" + book.id}
                    onClick={() => setSearchOpen(false)}
                  >
                    <img src={book.imageLink} alt="" />
                    <div>
                      <strong>{book.title}</strong>
                      <p>{book.author}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p>No books found.</p>
              )}
            </div>
          )}
        </div>
      </header>
      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Close sidebar"
          onClick={() => setSidebar(false)}
        />
      )}
      <aside className={"sidebar " + (sidebarOpen ? "open" : "")}>
        <Link href="/">
          <img
            className="sidebar-logo"
            src="/assets/logo.png"
            alt="Summarist home"
          />
        </Link>
        <button
          className="sidebar-close"
          onClick={() => setSidebar(false)}
          aria-label="Close sidebar"
        >
          <FiX />
        </button>
        <nav className="sidebar-top" aria-label="Main navigation">
          {item("/for-you", "For you", FiHome)}
          {item("/library", "My Library", FiBookmark)}
          <span className="side-link unavailable" aria-disabled="true">
            <FiEdit3 />
            Highlights
          </span>
          <span className="side-link unavailable" aria-disabled="true">
            <FiSearch />
            Search
          </span>
        </nav>
        {fontControls}
        <div className="sidebar-bottom">
          {item("/settings", "Settings", FiSettings)}
          <span className="side-link unavailable" aria-disabled="true">
            <FiHelpCircle />
            Help & Support
          </span>
          <button
            className="side-link"
            onClick={() => (user ? logout() : openAuth())}
          >
            {user ? <FiLogOut /> : <FiLogIn />}
            {user ? "Logout" : "Login"}
          </button>
          {error && <p className="form-error">{error}</p>}
        </div>
      </aside>
      <main className="app-content">{children}</main>
    </div>
  );
}
