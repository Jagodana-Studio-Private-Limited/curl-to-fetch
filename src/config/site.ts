export const siteConfig = {
  // ====== CUSTOMIZE THESE FOR EACH TOOL ======
  name: "cURL to Fetch",
  title: "cURL to Fetch Converter — Convert curl to JavaScript fetch / axios",
  description:
    "Instantly convert curl commands to JavaScript fetch, axios, or XMLHttpRequest code. Free browser-only tool — no signup required.",
  url: "https://curl-to-fetch.tools.jagodana.com",
  ogImage: "/opengraph-image",

  // Header
  headerIcon: "Code", // lucide-react icon name
  brandAccentColor: "#6366f1", // indigo accent

  // SEO
  keywords: [
    "curl to fetch",
    "curl to javascript",
    "curl to axios",
    "convert curl command",
    "curl converter",
    "fetch API converter",
    "curl to XMLHttpRequest",
  ],
  applicationCategory: "DeveloperApplication",

  // Theme
  themeColor: "#6366f1",

  // Branding
  creator: "Jagodana",
  creatorUrl: "https://jagodana.com",
  twitterHandle: "@jagodana",

  // Social Profiles
  socialProfiles: [
    "https://twitter.com/jagodana",
  ],

  // Links
  links: {
    github: "https://github.com/Jagodana-Studio-Private-Limited/curl-to-fetch",
    website: "https://jagodana.com",
  },

  // Footer
  footer: {
    about:
      "cURL to Fetch is a free developer tool that converts curl commands into JavaScript fetch, axios, or XMLHttpRequest code in seconds.",
    featuresTitle: "Features",
    features: [
      "Convert to fetch / axios / XHR",
      "Handles headers & request body",
      "Supports all HTTP methods",
      "100% browser-based, no backend",
    ],
  },

  // Hero Section
  hero: {
    badge: "Free Developer Tool",
    titleLine1: "Convert curl to",
    titleGradient: "JavaScript Code",
    subtitle:
      "Paste any curl command and instantly get equivalent JavaScript fetch, axios, or XMLHttpRequest code. Works 100% in your browser — no API key, no signup.",
  },

  // Feature Cards
  featureCards: [
    {
      icon: "⚡",
      title: "Instant Conversion",
      description:
        "Paste a curl command and get clean JavaScript code immediately.",
    },
    {
      icon: "🔧",
      title: "3 Output Formats",
      description:
        "Choose between fetch, axios, or XMLHttpRequest based on your project.",
    },
    {
      icon: "🔒",
      title: "100% Private",
      description:
        "Everything runs in your browser — your curl commands never leave your machine.",
    },
  ],

  // Related Tools
  relatedTools: [
    {
      name: "JSON Path Finder",
      url: "https://json-path-finder.tools.jagodana.com",
      icon: "🔍",
      description: "Find and extract JSON paths from any JSON object.",
    },
    {
      name: "HTTP Status Debugger",
      url: "https://http-status-debugger.tools.jagodana.com",
      icon: "🌐",
      description: "Look up and understand any HTTP status code.",
    },
    {
      name: "Regex Playground",
      url: "https://regex-playground.tools.jagodana.com",
      icon: "🧪",
      description: "Build, test & debug regular expressions in real-time.",
    },
    {
      name: "Latency Budget Calculator",
      url: "https://latency-budget-calculator.tools.jagodana.com",
      icon: "⏱️",
      description: "Plan your web performance latency budget.",
    },
    {
      name: "Favicon Generator",
      url: "https://favicon-generator.tools.jagodana.com",
      icon: "🎨",
      description: "Generate all favicon sizes + manifest from any image.",
    },
    {
      name: "Color Palette Explorer",
      url: "https://color-palette-explorer.tools.jagodana.com",
      icon: "🎭",
      description: "Extract color palettes from any image.",
    },
  ],

  // HowTo Steps
  howToSteps: [
    {
      name: "Paste your curl command",
      text: "Copy any curl command (from API docs, terminal, etc.) and paste it into the input box.",
      url: "",
    },
    {
      name: "Choose output format",
      text: "Select fetch, axios, or XMLHttpRequest depending on your project needs.",
      url: "",
    },
    {
      name: "Copy the JavaScript code",
      text: "Click copy and paste the generated JavaScript code directly into your project.",
      url: "",
    },
  ],
  howToTotalTime: "PT1M",

  // FAQ
  faq: [
    {
      question: "What curl commands does this support?",
      answer:
        "The tool supports all common curl options including -X (method), -H (headers), -d / --data / --data-raw / --data-binary (request body), --json, -u (basic auth), -b (cookies), -L (follow redirects), --compressed, and URL as positional argument.",
    },
    {
      question: "Does this tool send my data anywhere?",
      answer:
        "No. Everything runs 100% in your browser using JavaScript. Your curl commands are never sent to any server.",
    },
    {
      question: "Can I convert curl to axios?",
      answer:
        "Yes — just select 'axios' as the output format and the tool generates ready-to-use axios code with the correct method, headers, and body.",
    },
    {
      question: "Why is this useful?",
      answer:
        "API docs and tutorials often use curl examples. This tool saves you from manually translating them to fetch/axios code every time — a common developer workflow.",
    },
  ],

  // Pages
  pages: {
    "/": {
      title: "cURL to Fetch Converter — Convert curl to JavaScript fetch / axios",
      description:
        "Instantly convert curl commands to JavaScript fetch, axios, or XMLHttpRequest code. Free browser-only tool — no signup required.",
      changeFrequency: "weekly" as const,
      priority: 1,
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;
