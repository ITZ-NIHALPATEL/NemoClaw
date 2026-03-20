// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

// Color helpers — disabled when NO_COLOR is set or stdout is not a TTY.
// Uses exact NVIDIA green #76B900 on truecolor terminals; 256-color otherwise.
const _c  = !process.env.NO_COLOR && process.stdout.isTTY;
const _tc = _c && (process.env.COLORTERM === "truecolor" || process.env.COLORTERM === "24bit");
const _G  = _c ? (_tc ? "\x1b[38;2;118;185;0m" : "\x1b[38;5;148m") : "";  // NVIDIA green #76B900
const _B  = _c ? "\x1b[1m"        : "";  // bold
const _D  = _c ? "\x1b[2m"        : "";  // dim
const _R  = _c ? "\x1b[0m"        : "";  // reset

export interface SelectOption {
  label: string;
  value: string;
  hint?: string;
}

export async function promptInput(question: string, defaultValue?: string): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout });
  const suffix = defaultValue ? ` [${defaultValue}]` : "";
  try {
    const answer = await rl.question(`${question}${suffix}: `);
    const trimmed = answer.trim();
    return trimmed || defaultValue || "";
  } finally {
    rl.close();
  }
}

export async function promptConfirm(question: string, defaultYes = true): Promise<boolean> {
  const rl = createInterface({ input: stdin, output: stdout });
  const hint = defaultYes ? "(Y/n)" : "(y/N)";
  try {
    const answer = await rl.question(`${question} ${hint}: `);
    const trimmed = answer.trim().toLowerCase();
    if (!trimmed) return defaultYes;
    return trimmed === "y" || trimmed === "yes";
  } finally {
    rl.close();
  }
}

export async function promptSelect(
  question: string,
  options: SelectOption[],
  defaultIndex = 0,
): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    console.log(`\n${question}\n`);
    for (let i = 0; i < options.length; i++) {
      const isDefault = i === defaultIndex;
      const marker = isDefault ? `${_G}▶${_R}` : " ";
      const label  = isDefault ? `${_B}${options[i].label}${_R}` : options[i].label;
      const optHint = options[i].hint;
      const hint = optHint ? `  ${_D}${optHint}${_R}` : "";
      console.log(`  ${marker} ${String(i + 1)}. ${label}${hint}`);
    }
    console.log("");

    for (;;) {
      const answer = await rl.question(
        `Select [1-${String(options.length)}] (default: ${String(defaultIndex + 1)}): `,
      );
      const trimmed = answer.trim();

      if (!trimmed) return options[defaultIndex].value;

      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num >= 1 && num <= options.length) {
        return options[num - 1].value;
      }

      console.log(`  Invalid choice. Enter a number between 1 and ${String(options.length)}.`);
    }
  } finally {
    rl.close();
  }
}
