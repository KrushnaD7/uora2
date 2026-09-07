"use client";

import { motion } from "framer-motion";

const reviewers = [
  { y: 26, label: "Reviewer A", verdict: "Accept" },
  { y: 76, label: "Reviewer B", verdict: "Minor rev." },
  { y: 126, label: "Reviewer C", verdict: "Accept" },
];

/**
 * How a manuscript actually moves through double-blind review: identities are
 * withheld on both sides, three independent verdicts converge, and the
 * handling editor issues one consolidated decision.
 */
export default function ReviewFlow() {
  return (
    <svg
      viewBox="0 0 420 172"
      role="img"
      aria-label="A submitted manuscript is sent to three anonymous reviewers, whose independent verdicts converge into a single editorial decision."
      className="h-auto w-full"
    >
      <defs>
        <linearGradient id="rf-flow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-brand-500)" />
          <stop offset="100%" stopColor="var(--color-accent-500)" />
        </linearGradient>
      </defs>

      {/* Connectors: submission → reviewers → decision */}
      {reviewers.map((reviewer, index) => (
        <g key={reviewer.label}>
          <motion.path
            d={`M104 86 C 140 86, 140 ${reviewer.y}, 168 ${reviewer.y}`}
            fill="none"
            stroke="url(#rf-flow)"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.25 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ delay: 0.15 + index * 0.12, duration: 0.7 }}
          />
          <motion.path
            d={`M300 ${reviewer.y} C 328 ${reviewer.y}, 328 86, 356 86`}
            fill="none"
            stroke="url(#rf-flow)"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.25 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ delay: 0.5 + index * 0.12, duration: 0.7 }}
          />
        </g>
      ))}

      {/* Submission */}
      <g>
        <rect
          x="8"
          y="62"
          width="96"
          height="48"
          rx="10"
          className="fill-navy-950"
        />
        <text
          x="56"
          y="82"
          textAnchor="middle"
          className="fill-white text-[11px] font-semibold"
        >
          Manuscript
        </text>
        <text
          x="56"
          y="97"
          textAnchor="middle"
          className="fill-navy-300 font-mono text-[9px]"
        >
          anonymised
        </text>
      </g>

      {/* Reviewers */}
      {reviewers.map((reviewer, index) => (
        <motion.g
          key={reviewer.label}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ delay: 0.3 + index * 0.12, duration: 0.5 }}
        >
          <rect
            x="168"
            y={reviewer.y - 20}
            width="132"
            height="40"
            rx="9"
            className="fill-white stroke-line"
            strokeWidth="1"
          />
          <circle cx="188" cy={reviewer.y} r="6" className="fill-brand-100" />
          <circle cx="188" cy={reviewer.y} r="2.5" className="fill-brand-600" />
          <text
            x="202"
            y={reviewer.y - 2}
            className="fill-navy-900 text-[10.5px] font-semibold"
          >
            {reviewer.label}
          </text>
          <text
            x="202"
            y={reviewer.y + 10}
            className="fill-ink-500 text-[9.5px]"
          >
            {reviewer.verdict}
          </text>
        </motion.g>
      ))}

      {/* Decision */}
      <motion.g
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ delay: 0.95, duration: 0.5 }}
        style={{ transformOrigin: "388px 86px" }}
      >
        <rect
          x="356"
          y="62"
          width="58"
          height="48"
          rx="10"
          className="fill-brand-600"
        />
        <text
          x="385"
          y="82"
          textAnchor="middle"
          className="fill-white text-[10.5px] font-semibold"
        >
          Editor
        </text>
        <text
          x="385"
          y="96"
          textAnchor="middle"
          className="fill-brand-100 text-[9.5px]"
        >
          decision
        </text>
      </motion.g>
    </svg>
  );
}
