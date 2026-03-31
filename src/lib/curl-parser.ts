/**
 * Parses a curl command string into structured components.
 */

export interface ParsedCurl {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
  auth: { user: string; pass: string } | null;
  cookies: string | null;
  followRedirects: boolean;
  compressed: boolean;
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  const s = input.trim().replace(/\\\n/g, " ").replace(/\s+/g, " ");

  while (i < s.length) {
    if (s[i] === " ") {
      i++;
      continue;
    }
    // quoted string
    if (s[i] === '"' || s[i] === "'") {
      const quote = s[i];
      i++;
      let token = "";
      while (i < s.length && s[i] !== quote) {
        if (s[i] === "\\" && i + 1 < s.length) {
          i++;
          token += s[i];
        } else {
          token += s[i];
        }
        i++;
      }
      i++; // skip closing quote
      tokens.push(token);
    } else {
      let token = "";
      while (i < s.length && s[i] !== " ") {
        token += s[i];
        i++;
      }
      tokens.push(token);
    }
  }
  return tokens;
}

export function parseCurl(raw: string): ParsedCurl {
  // Normalise multi-line
  const input = raw.replace(/\\\s*\n\s*/g, " ").trim();
  const tokens = tokenize(input);

  let url = "";
  let method = "";
  const headers: Record<string, string> = {};
  let body: string | null = null;
  let auth: { user: string; pass: string } | null = null;
  let cookies: string | null = null;
  let followRedirects = false;
  let compressed = false;

  // First token should be "curl"
  let idx = 0;
  if (tokens[idx]?.toLowerCase() === "curl") idx++;

  while (idx < tokens.length) {
    const tok = tokens[idx];

    // URL as positional arg (not a flag)
    if (!tok.startsWith("-")) {
      if (!url) url = tok;
      idx++;
      continue;
    }

    // --url VALUE or --url=VALUE
    if (tok === "--url") {
      url = tokens[++idx] ?? "";
      idx++;
      continue;
    }
    if (tok.startsWith("--url=")) {
      url = tok.slice(6);
      idx++;
      continue;
    }

    // -X METHOD or --request METHOD
    if (tok === "-X" || tok === "--request") {
      method = (tokens[++idx] ?? "GET").toUpperCase();
      idx++;
      continue;
    }
    if (tok.startsWith("-X")) {
      method = tok.slice(2).toUpperCase();
      idx++;
      continue;
    }
    if (tok.startsWith("--request=")) {
      method = tok.slice(10).toUpperCase();
      idx++;
      continue;
    }

    // -H HEADER or --header HEADER
    if (tok === "-H" || tok === "--header") {
      const h = tokens[++idx] ?? "";
      const colon = h.indexOf(":");
      if (colon !== -1) {
        const key = h.slice(0, colon).trim();
        const val = h.slice(colon + 1).trim();
        headers[key] = val;
      }
      idx++;
      continue;
    }
    if (tok.startsWith("--header=")) {
      const h = tok.slice(9);
      const colon = h.indexOf(":");
      if (colon !== -1) {
        headers[h.slice(0, colon).trim()] = h.slice(colon + 1).trim();
      }
      idx++;
      continue;
    }

    // -d / --data / --data-raw / --data-ascii / --data-binary / --json
    if (
      tok === "-d" ||
      tok === "--data" ||
      tok === "--data-raw" ||
      tok === "--data-ascii" ||
      tok === "--data-binary"
    ) {
      const d = tokens[++idx] ?? "";
      body = d.startsWith("@") ? `<contents of ${d.slice(1)}>` : d;
      idx++;
      continue;
    }
    if (tok.startsWith("--data=") || tok.startsWith("--data-raw=")) {
      const eq = tok.indexOf("=");
      const d = tok.slice(eq + 1);
      body = d.startsWith("@") ? `<contents of ${d.slice(1)}>` : d;
      idx++;
      continue;
    }
    if (tok === "--json") {
      const d = tokens[++idx] ?? "";
      body = d;
      if (!headers["Content-Type"] && !headers["content-type"]) {
        headers["Content-Type"] = "application/json";
      }
      if (!headers["Accept"] && !headers["accept"]) {
        headers["Accept"] = "application/json";
      }
      idx++;
      continue;
    }

    // -u / --user for basic auth
    if (tok === "-u" || tok === "--user") {
      const u = tokens[++idx] ?? "";
      const colon = u.indexOf(":");
      if (colon !== -1) {
        auth = { user: u.slice(0, colon), pass: u.slice(colon + 1) };
      } else {
        auth = { user: u, pass: "" };
      }
      idx++;
      continue;
    }

    // -b / --cookie
    if (tok === "-b" || tok === "--cookie") {
      cookies = tokens[++idx] ?? "";
      idx++;
      continue;
    }

    // -L / --location
    if (tok === "-L" || tok === "--location") {
      followRedirects = true;
      idx++;
      continue;
    }

    // --compressed
    if (tok === "--compressed") {
      compressed = true;
      idx++;
      continue;
    }

    // -o / --output (ignore value)
    if (tok === "-o" || tok === "--output" || tok === "--output-dir") {
      idx += 2;
      continue;
    }

    // skip unknown flags with value (heuristic: next token starts with -)
    // and unknown flags without value
    idx++;
  }

  // Default method
  if (!method) {
    method = body ? "POST" : "GET";
  }

  return { url, method, headers, body, auth, cookies, followRedirects, compressed };
}

/* ============================================================
   Code generators
   ============================================================ */

function headersToObject(headers: Record<string, string>): string {
  const entries = Object.entries(headers);
  if (entries.length === 0) return "";
  const lines = entries.map(([k, v]) => `    "${k}": "${v}"`).join(",\n");
  return `{\n${lines}\n  }`;
}

export function toFetch(parsed: ParsedCurl): string {
  const { url, method, headers, body, auth, cookies } = parsed;

  // Merge auth into headers as Basic Auth
  const hdrs = { ...headers };
  if (auth) {
    const encoded = btoa(`${auth.user}:${auth.pass}`);
    hdrs["Authorization"] = `Basic ${encoded}`;
  }
  if (cookies) {
    hdrs["Cookie"] = cookies;
  }

  const opts: string[] = [];
  opts.push(`  method: "${method}"`);

  const hStr = headersToObject(hdrs);
  if (hStr) opts.push(`  headers: ${hStr}`);
  if (body) opts.push(`  body: ${JSON.stringify(body)}`);

  return `const response = await fetch("${url}", {\n${opts.join(",\n")}\n});\nconst data = await response.json();`;
}

export function toAxios(parsed: ParsedCurl): string {
  const { url, method, headers, body, auth, cookies } = parsed;

  const hdrs = { ...headers };
  if (cookies) hdrs["Cookie"] = cookies;

  const config: string[] = [];
  config.push(`  method: "${method.toLowerCase()}"`);
  config.push(`  url: "${url}"`);

  const hStr = headersToObject(hdrs);
  if (hStr) config.push(`  headers: ${hStr}`);
  if (body) config.push(`  data: ${JSON.stringify(body)}`);

  if (auth) {
    config.push(`  auth: {\n    username: "${auth.user}",\n    password: "${auth.pass}"\n  }`);
  }

  return `import axios from "axios";\n\nconst response = await axios({\n${config.join(",\n")}\n});\nconsole.log(response.data);`;
}

export function toXHR(parsed: ParsedCurl): string {
  const { url, method, headers, body, auth, cookies } = parsed;

  const hdrs = { ...headers };
  if (auth) {
    const encoded = btoa(`${auth.user}:${auth.pass}`);
    hdrs["Authorization"] = `Basic ${encoded}`;
  }
  if (cookies) hdrs["Cookie"] = cookies;

  const headerLines = Object.entries(hdrs)
    .map(([k, v]) => `xhr.setRequestHeader("${k}", "${v}");`)
    .join("\n");

  const sendLine = body ? `xhr.send(${JSON.stringify(body)});` : "xhr.send();";

  return `const xhr = new XMLHttpRequest();
xhr.open("${method}", "${url}");
${headerLines}${headerLines ? "\n" : ""}xhr.onreadystatechange = function () {
  if (xhr.readyState === 4) {
    const data = JSON.parse(xhr.responseText);
    console.log(data);
  }
};
${sendLine}`;
}
