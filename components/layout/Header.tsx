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

export function Header() {
  const pathname = usePathname();
  const isArchitect = pathname === "/architect";

  return (
    <header
      style={{
        flexShrink: 0,
        padding: "16px 36px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(8,8,13,0.8)",
        backdropFilter: "blur(8px)",
        zIndex: 10,
      }}
    >
      <div>
        <h1
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          The State of Iceberg
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: "#b0b0c8",
            marginTop: "4px",
            letterSpacing: "0.01em",
          }}
        >
          An interactive map of Iceberg engine, catalog, and platform compatibility
        </p>
      </div>
      <nav aria-label="Main navigation" style={{ display: "flex", gap: "4px" }}>
        <Link
          href="/"
          aria-current={!isArchitect ? "page" : undefined}
          style={{
            padding: "8px 20px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.01em",
            textDecoration: "none",
            transition: "all 0.15s",
            backgroundColor: !isArchitect ? "rgba(255,255,255,0.08)" : "transparent",
            color: !isArchitect ? "#ffffff" : "#7878a0",
            border: !isArchitect ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
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
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.01em",
            textDecoration: "none",
            transition: "all 0.15s",
            backgroundColor: isArchitect ? "rgba(255,255,255,0.08)" : "transparent",
            color: isArchitect ? "#ffffff" : "#7878a0",
            border: isArchitect ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
          }}
        >
          Architect
        </Link>
      </nav>
    </header>
  );
}
