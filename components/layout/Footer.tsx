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

export function Footer() {
  return (
    <footer
      style={{
        flexShrink: 0,
        padding: "12px 36px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        backgroundColor: "rgba(8,8,13,0.9)",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          color: "#7878a0",
          lineHeight: 1.6,
        }}
      >
        This is an independent community resource and is not affiliated with or
        endorsed by any vendor listed. Capabilities should be verified against
        official documentation before making architectural decisions.
      </p>
    </footer>
  );
}
