import { Copy, Check, Terminal, FileCode } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { highlight } from '../../lib/highlighter';

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
  showLineNumbers?: boolean;
}

function getLanguageIcon(language: string) {
  switch (language) {
    case 'bash':
    case 'shell':
    case 'powershell':
      return <Terminal size={14} className="text-green-400" />;
    default:
      return <FileCode size={14} className="text-blue-400" />;
  }
}

const LABELS: Record<string, string> = {
  csharp: 'C#',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  json: 'JSON',
  bash: 'Bash',
  shell: 'Shell',
  powershell: 'PowerShell',
  xml: 'XML',
  plaintext: 'Text',
};

function getLanguageLabel(language: string): string {
  return LABELS[language] ?? language.toUpperCase();
}

export function CodeBlock({
  code,
  language,
  filename,
  showLineNumbers = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState('');

  const normalizedCode = useMemo(
    () => code.trim().replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n'),
    [code],
  );

  useEffect(() => {
    let alive = true;
    highlight(normalizedCode, language)
      .then((html) => {
        if (alive) setHighlightedCode(html);
      })
      .catch(() => {
        const escaped = normalizedCode
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        if (alive) setHighlightedCode(`<pre class="shiki"><code>${escaped}</code></pre>`);
      });
    return () => {
      alive = false;
    };
  }, [normalizedCode, language]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(normalizedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = normalizedCode.split('\n');
  const shouldShowLineNumbers = showLineNumbers && lines.length > 1;

  return (
    <div className="group my-4 overflow-hidden rounded-xl border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-950 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-1.5 sm:flex">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            {getLanguageIcon(language)}
            <span className="max-w-37.5 truncate font-medium text-zinc-400 sm:max-w-none">
              {filename || getLanguageLabel(language)}
            </span>
          </div>
        </div>

        <button
          onClick={copyToClipboard}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all sm:gap-1.5 sm:px-2.5 ${
            copied
              ? 'border border-green-500/30 bg-green-500/20 text-green-400'
              : 'border border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
          }`}
          title="Copy code"
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? (
            <>
              <Check size={14} />
              <span className="hidden sm:inline">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="relative flex">
        {shouldShowLineNumbers && (
          <div className="w-8 shrink-0 select-none border-r border-zinc-800 bg-zinc-900/50 pb-3 pr-2 pt-3 text-right font-mono text-xs text-zinc-600 sm:w-12 sm:pb-4 sm:pr-3 sm:pt-4 sm:text-sm">
            {lines.map((_, i) => (
              <div key={i} className="h-5 sm:h-6">
                {i + 1}
              </div>
            ))}
          </div>
        )}
        <div
          className="shiki-wrapper flex-1 overflow-x-auto p-3 font-mono text-xs sm:p-4 sm:text-sm"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </div>
    </div>
  );
}
