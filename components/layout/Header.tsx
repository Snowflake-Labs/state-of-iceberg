// Copyright 2026 Snowflake Inc.
// SPDX-License-Identifier: Apache-2.0
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/theme";

export function Header() {
  const pathname = usePathname();
  const isArchitect = pathname === "/architect";
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      style={{
        flexShrink: 0,
        padding: "16px 36px",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "var(--bg-surface)",
        backdropFilter: "blur(8px)",
        zIndex: 10,
      }}
    >
      <div>
        <h1
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--text-bright)",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          The State of Iceberg
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "var(--text-secondary)",
            marginTop: "4px",
            letterSpacing: "0.01em",
          }}
        >
          An interactive map of Iceberg engine, catalog, and platform compatibility
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <nav aria-label="Main navigation" style={{ display: "flex", gap: "4px" }}>
          <Link
            href="/"
            aria-current={!isArchitect ? "page" : undefined}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.01em",
              textDecoration: "none",
              transition: "all 0.15s",
              backgroundColor: !isArchitect ? "var(--bg-hover)" : "transparent",
              color: !isArchitect ? "var(--text-bright)" : "var(--text-muted)",
              border: !isArchitect ? "1px solid var(--border-subtle)" : "1px solid transparent",
            }}
          >
            Explore
          </Link>
          <Link
            href="/architect"
            aria-current={isArchitect ? "page" : undefined}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.01em",
              textDecoration: "none",
              transition: "all 0.15s",
              backgroundColor: isArchitect ? "var(--bg-hover)" : "transparent",
              color: isArchitect ? "var(--text-bright)" : "var(--text-muted)",
              border: isArchitect ? "1px solid var(--border-subtle)" : "1px solid transparent",
            }}
          >
            Architect
          </Link>
        </nav>
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          style={{
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid var(--border-subtle)",
            backgroundColor: "transparent",
            color: "var(--text-muted)",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-bright)";
            e.currentTarget.style.backgroundColor = "var(--bg-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-muted)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          {theme === "dark" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
