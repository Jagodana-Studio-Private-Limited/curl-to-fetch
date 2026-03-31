"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Code2, AlertCircle, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { parseCurl, toFetch, toAxios, toXHR } from "@/lib/curl-parser";

type OutputFormat = "fetch" | "axios" | "xhr";

const PLACEHOLDER = `curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{"name":"Alice","email":"alice@example.com"}'`;

export function CurlToFetchTool() {
  const [input, setInput] = useState("");
  const [format, setFormat] = useState<OutputFormat>("fetch");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const convert = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please paste a curl command first.");
      setOutput("");
      return;
    }
    try {
      const parsed = parseCurl(trimmed);
      if (!parsed.url) {
        setError("Could not detect a URL in the curl command. Make sure it starts with 'curl'.");
        setOutput("");
        return;
      }
      let result = "";
      if (format === "fetch") result = toFetch(parsed);
      else if (format === "axios") result = toAxios(parsed);
      else result = toXHR(parsed);
      setOutput(result);
      setError("");
    } catch {
      setError("Could not parse the curl command. Please check the syntax.");
      setOutput("");
    }
  }, [input, format]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setError("");
  }, []);

  // Re-convert when format changes if we already have output
  const handleFormatChange = useCallback(
    (val: string) => {
      const f = val as OutputFormat;
      setFormat(f);
      if (input.trim()) {
        const trimmed = input.trim();
        try {
          const parsed = parseCurl(trimmed);
          if (parsed.url) {
            let result = "";
            if (f === "fetch") result = toFetch(parsed);
            else if (f === "axios") result = toAxios(parsed);
            else result = toXHR(parsed);
            setOutput(result);
            setError("");
          }
        } catch {
          // ignore
        }
      }
    },
    [input]
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Input */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/30">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-brand inline-block" />
            curl command
          </div>
          {input && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear input"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
        <textarea
          className="w-full min-h-[160px] p-4 bg-transparent font-mono text-sm resize-y focus:outline-none placeholder:text-muted-foreground/40"
          placeholder={PLACEHOLDER}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          aria-label="curl command input"
        />
      </div>

      {/* Format Selector + Convert Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Tabs
          value={format}
          onValueChange={handleFormatChange}
          className="flex-1"
        >
          <TabsList className="w-full sm:w-auto grid grid-cols-3 bg-muted/60">
            <TabsTrigger value="fetch" className="text-sm">
              fetch
            </TabsTrigger>
            <TabsTrigger value="axios" className="text-sm">
              axios
            </TabsTrigger>
            <TabsTrigger value="xhr" className="text-sm">
              XHR
            </TabsTrigger>
            {/* hidden content panels — we handle output ourselves */}
            <TabsContent value="fetch" />
            <TabsContent value="axios" />
            <TabsContent value="xhr" />
          </TabsList>
        </Tabs>

        <Button
          size="lg"
          onClick={convert}
          className="gap-2 bg-gradient-to-r from-brand to-brand-accent text-white shadow-md shadow-brand/20 sm:w-auto"
        >
          Convert
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Output */}
      <AnimatePresence>
        {output && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/30">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Code2 className="w-4 h-4 text-brand" />
                {format === "fetch"
                  ? "fetch (JavaScript)"
                  : format === "axios"
                  ? "axios"
                  : "XMLHttpRequest"}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-brand/10 hover:bg-brand/20 text-brand transition-colors"
                aria-label="Copy output"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto font-mono text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
              {output}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick examples */}
      {!output && !input && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <p className="text-xs text-muted-foreground mb-3">Try an example:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              {
                label: "GET with auth",
                cmd: `curl -H "Authorization: Bearer tok_abc123" https://api.example.com/profile`,
              },
              {
                label: "POST JSON",
                cmd: `curl -X POST https://api.example.com/items -H "Content-Type: application/json" -d '{"name":"Widget"}'`,
              },
              {
                label: "Basic auth",
                cmd: `curl -u admin:secret https://api.example.com/admin/users`,
              },
            ].map((ex) => (
              <button
                key={ex.label}
                onClick={() => setInput(ex.cmd)}
                className="text-xs px-3 py-1.5 rounded-full border border-border/50 hover:border-brand/40 hover:bg-brand/5 text-muted-foreground hover:text-foreground transition-all"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
