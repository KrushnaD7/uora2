"use client";

import { useState } from "react";
import { Download, Eye, X } from "lucide-react";
import Button from "@/components/ui/Button";

interface PdfModalProps {
  title: string;
  downloadUrl: string;
  viewUrl: string;
  hasPdf: boolean;
}

export default function ArticlePdfSection({
  title,
  downloadUrl,
  viewUrl,
  hasPdf,
}: PdfModalProps) {
  const [showPdf, setShowPdf] = useState(false);

  return (
    <>
      <div className="mt-6 flex flex-col gap-3">
        <Button onClick={() => setShowPdf(true)} className="w-full" size="lg">
          <Eye size={18} /> View PDF
        </Button>
        <Button href={downloadUrl} variant="secondary" className="w-full" size="lg">
          <Download size={18} /> Download PDF
        </Button>
      </div>
      {!hasPdf && (
        <p className="mt-3 text-center text-xs text-ink-400">
          PDF may not be available yet — download will use the submitted manuscript.
        </p>
      )}

      {showPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-line">
              <div className="min-w-0">
                <h2 className="font-display text-lg font-bold text-navy-950">Article PDF Preview</h2>
                <p className="text-sm text-ink-500 mt-0.5 truncate">{title}</p>
              </div>
              <button
                onClick={() => setShowPdf(false)}
                className="text-ink-400 hover:text-navy-900 transition-colors ml-4"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 min-h-0 p-6 bg-slate-100">
              <iframe
                src={viewUrl}
                title="Article PDF Preview"
                className="w-full h-[70vh] rounded-xl border border-line bg-white"
              />
            </div>
            <div className="flex gap-3 justify-end p-4 border-t border-line">
              <a
                href={downloadUrl}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-brand-700 hover:bg-brand-50 border border-brand-200 transition-colors text-sm"
              >
                <Download size={16} /> Download PDF
              </a>
              <button
                onClick={() => setShowPdf(false)}
                className="px-5 py-2.5 rounded-xl font-medium text-ink-600 hover:bg-slate-100 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
