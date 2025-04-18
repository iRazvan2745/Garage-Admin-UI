"use client";

import { authClient, useSession } from "@/lib/auth-client";

import { useState, useRef } from "react";

export function AuthButton() {
  const { data: session } = useSession();
  const user = session?.user;
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (!user) {
    return (
      <button
        onClick={() => authClient.signIn()}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Sign In
      </button>
    );
  }

  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <div className="relative flex items-center gap-3">
      <button
        ref={buttonRef}
        className="flex items-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
        onClick={() => setMenuOpen((open) => !open)}
        aria-haspopup="true"
        aria-expanded={menuOpen}
      >
        <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-lg">
          {initials}
        </span>
        <span className="hidden sm:block max-w-[120px] truncate text-sm font-medium">
          {user.email}
        </span>
        <svg
          className={`w-4 h-4 ml-1 transition-transform ${menuOpen ? "rotate-180" : "rotate-0"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {menuOpen && (
        <div
          className="absolute right-0 top-12 mt-2 w-40 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded shadow-lg z-50 animate-fade-in"
          tabIndex={-1}
        >
          <button
            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-neutral-800 rounded-b transition-colors"
            onClick={() => {
              setMenuOpen(false);
              authClient.signOut();
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

