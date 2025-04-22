"use client"

import * as React from "react"

export function HamburgerButton({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-label="Open sidebar menu"
      className={`inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring sm:hidden ${className}`}
      onClick={onClick}
    >
      {/* Hamburger icon */}
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  )
}
