import { useState } from 'react';
import { Icon } from './Reveal.jsx';

export default function ResultCard({ content, contentType, onRegenerate, isLoading }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can reject on insecure origins / denied permission.
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-slide-up">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border">
        <div className="min-w-0">
          <span className="eyebrow-pill mb-1.5">
            <Icon name="doc" className="w-3.5 h-3.5 text-forest-700" />
            Draft
          </span>
          <h3 className="font-semibold text-ink text-sm">{contentType}</h3>
          <p className="text-sage-500 text-xs mt-0.5">{content.length} characters · not sent anywhere</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="btn-secondary text-xs px-3 py-1.5 min-h-0"
          >
            {copied ? (
              <>
                <Icon name="check" className="w-3.5 h-3.5 text-forest-600" />
                Copied
              </>
            ) : (
              <>
                <Icon name="doc" className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="btn-primary text-xs px-3 py-1.5 min-h-0"
          >
            <Icon name="history" className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 overflow-auto">
        <pre className="whitespace-pre-wrap break-words font-sans text-sm text-ink leading-relaxed">{content}</pre>
      </div>
    </div>
  );
}
