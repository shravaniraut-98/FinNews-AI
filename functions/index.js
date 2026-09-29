const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// Financial News Dataset (Live Server-Side Engine)
const NEWS_DATASET = [
    {
        id: 1,
        title: "RBI Keeps Repo Rate Unchanged at 6.5% Amid Inflation Watch",
        description: "The Reserve Bank of India Monetary Policy Committee decided to maintain the benchmark repo rate at 6.5%, focusing on withdrawal of accommodation to align inflation with the 4% target.",
        source: "Economic Times",
        publishedAt: "10 minutes ago",
        category: "Banking",
        region: "India",
        sentiment: "Neutral",
        importance: "High",
        image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80",
        summary: "The Reserve Bank of India kept benchmark interest rates steady to balance economic growth while keeping consumer inflation in check.",
        whatHappened: "The RBI Monetary Policy Committee voted to keep the key lending rate unchanged at 6.5% for the policy meeting.",
        whyItMatters: "Steady interest rates keep home loan and car loan EMIs stable, while ensuring commercial banks maintain steady deposit interest yields for savers.",
        keyTakeaways: [
            "Benchmark repo rate remains fixed at 6.5%",
            "RBI projects annual real GDP growth at 7.0%",
            "Consumer price inflation target maintained at 4.5% for FY25"
        ],
        whoIsAffected: "Home loan borrowers, bank depositors, commercial banks, and real estate developers across India.",
        terms: [
            {
                name: "Repo Rate",
                explanation: "The key interest rate at which the central bank (RBI) lends short-term money to commercial banks."
            },
            {
                name: "Inflation",
                explanation: "The rate at which general prices for goods and services increase over time, eroding purchasing power."
            },
            {
                name: "MPC",
                explanation: "Monetary Policy Committee — the committee responsible for fixing the benchmark interest rate in India."
            }
        ],
        url: "https://economictimes.indiatimes.com"
    },
    {
        id: 2,
        title: "Federal Reserve Signals Potential Rate Cut as US Inflation Cools to 2.9%",
        description: "Federal Reserve Chairman indicated that monetary policy adjustments are approaching as consumer price metrics normalize near the central bank's long-term target.",
        source: "Financial Times",
        publishedAt: "25 minutes ago",
        category: "Economy",
        region: "Global",
        sentiment: "Positive",
        importance: "High",
        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
        summary: "The US Federal Reserve is preparing to lower interest rates as price pressures ease across energy, goods, and services.",
        whatHappened: "US inflation slowed to a 2.9% annual rate, prompting Fed officials to signal upcoming reductions in borrowing costs.",
        whyItMatters: "Lower US interest rates generally boost global equity markets, weaken the US dollar, and increase foreign capital flows into emerging markets.",
        keyTakeaways: [
            "US Consumer Price Index (CPI) dropped below 3.0%",
            "Stock markets reacted positively with broad equity index gains",
            "Global central banks expected to follow easing monetary policy"
        ],
        whoIsAffected: "Global investors, mortgage holders, multinational corporations, and currency traders.",
        terms: [
            {
                name: "Federal Reserve",
                explanation: "The central bank of the United States that oversees national monetary policy."
            },
            {
                name: "CPI",
                explanation: "Consumer Price Index — a primary metric used to measure average price changes in goods and services."
            }
        ],
        url: "https://www.ft.com"
    },
    {
        id: 3,
        title: "NVIDIA Surpasses $3 Trillion Valuation Driven by Next-Gen AI Chip Demand",
        description: "NVIDIA equity market cap reached landmark highs as global tech enterprises surge orders for Blackwell architecture AI microprocessors and datacenter hardware.",
        source: "Reuters",
        publishedAt: "40 minutes ago",
        category: "Technology",
        region: "Global",
        sentiment: "Positive",
        importance: "High",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
        summary: "High demand for specialized AI hardware propelled semiconductor giant NVIDIA into the top tier of global stock valuations.",
        whatHappened: "NVIDIA's market capitalization crossed $3 Trillion following record quarterly revenue guidance from cloud computing providers building generative AI tools.",
        whyItMatters: "The massive expansion in AI hardware spending reflects a fundamental shift in corporate infrastructure budgets worldwide.",
        keyTakeaways: [
            "Quarterly datacenter revenue expanded by over 200% year-over-year",
            "Tech sector equities led S&P 500 and NASDAQ gains",
            "Demand for high-bandwidth memory semiconductor chips remains supply-constrained"
        ],
        whoIsAffected: "Technology companies, cloud providers, retail investors, and semiconductor suppliers.",
        terms: [
            {
                name: "Market Cap",
                explanation: "Market Capitalization — the total monetary value of all outstanding shares of a publicly traded company."
            },
            {
                name: "Bull Market",
                explanation: "A financial market condition where asset prices are continuously rising or expected to rise."
            }
        ],
        url: "https://www.reuters.com"
    },
    {
        id: 4,
        title: "Tata Motors Commercial Vehicle Division Reports 18% Profit Surge",
        description: "Tata Motors posted strong quarterly performance behind robust domestic fleet demand, expansion in electric bus orders, and margin improvements in JLR operations.",
        source: "Business Standard",
        publishedAt: "1 hour ago",
        category: "Automotive",
        region: "India",
        sentiment: "Positive",
        importance: "Medium",
        image: "https://images.unsplash.com/photo-1556742049-0a67dd0a581e?auto=format&fit=crop&w=800&q=80",
        summary: "Tata Motors profit increased due to heavy vehicle demand across Indian infrastructure projects and higher sales of premium JLR vehicles.",
        whatHappened: "Automotive leader Tata Motors reported an 18% jump in net profit alongside record EBITDA margins across its passenger and commercial vehicle portfolio.",
        whyItMatters: "Commercial vehicle sales serve as a key economic barometer for industrial activity, logistics demand, and infrastructure expansion in India.",
        keyTakeaways: [
            "Net consolidated profit rose 18% year-over-year",
            "EV commercial bus fleet orders doubled in metro transit tenders",
            "Free cash flow generation hit multi-quarter highs"
        ],
        whoIsAffected: "Auto sector shareholders, component suppliers, fleet operators, and logistics buyers.",
        terms: [
            {
                name: "EBITDA",
                explanation: "Earnings Before Interest, Taxes, Depreciation, and Amortization — a measure of core operational profitability."
            },
            {
                name: "Margin",
                explanation: "The percentage ratio of profit earned relative to total revenue generated."
            }
        ],
        url: "https://www.business-standard.com"
    },
    {
        id: 5,
        title: "Apple Announces New Generative AI Strategy Integrated Across iOS Devices",
        description: "Apple unveiled its native artificial intelligence ecosystem, partnering with leading LLM providers to bring automated summarization and smart Siri features to smartphones.",
        source: "Wall Street Journal",
        publishedAt: "2 hours ago",
        category: "Technology",
        region: "Global",
        sentiment: "Positive",
        importance: "Medium",
        image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80",
        summary: "Apple is embedding artificial intelligence directly into its device operating systems, boosting consumer hardware upgrade cycles.",
        whatHappened: "Apple introduced on-device AI tools for news summarization, automated writing assistance, and enhanced Siri workflow integration.",
        whyItMatters: "Bringing AI functionality to hundreds of millions of smartphone users accelerates consumer adoption of AI applications globally.",
        keyTakeaways: [
            "On-device processing prioritizes user privacy while running lightweight models",
            "Analyst consensus expects accelerated iPhone upgrade cycle",
            "Services segment revenue projected to expand"
        ],
        whoIsAffected: "Consumer electronics buyers, software developers, and Apple investors.",
        terms: [
            {
                name: "Services Revenue",
                explanation: "Income generated from subscription products like iCloud, App Store, and digital media services."
            }
        ],
        url: "https://www.wsj.com"
    },
    {
        id: 6,
        title: "Global Crude Oil Prices Dip to $78 as OPEC+ Outlines Production Plan",
        description: "Brent crude futures declined 2% after member nations outlined a phased plan to restore voluntary crude oil production cuts starting later this year.",
        source: "Bloomberg",
        publishedAt: "3 hours ago",
        category: "Energy",
        region: "Global",
        sentiment: "Negative",
        importance: "Medium",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
        summary: "Oil prices dropped as major oil-exporting countries prepared to gradually increase oil supplies into the global market.",
        whatHappened: "Brent crude settled below $78 a barrel following announcements from OPEC+ members regarding output normalization schedules.",
        whyItMatters: "Cheaper crude oil reduces import bill costs for oil-importing nations like India, helping to lower transport fuel costs and ease inflation.",
        keyTakeaways: [
            "Brent crude futures dropped 2.1% to $78.40 per barrel",
            "Lower oil import prices help reduce national trade deficit metrics",
            "Airlines and logistics firms benefit from reduced fuel overhead"
        ],
        whoIsAffected: "Oil producers, airline transport firms, refiners, and retail fuel consumers.",
        terms: [
            {
                name: "OPEC+",
                explanation: "Organization of the Petroleum Exporting Countries plus allied oil-producing nations that coordinate crude supply."
            },
            {
                name: "Trade Deficit",
                explanation: "An economic condition where a nation imports more total value in goods/services than it exports."
            }
        ],
        url: "https://www.bloomberg.com"
    }
];

// Helper: Financial Dictionary for custom text processing
const FINANCIAL_DICTIONARY = {
    "repo rate": "The benchmark interest rate set by central bank to lend to commercial banks.",
    "inflation": "The rate at which general price level for goods and services rises.",
    "cpi": "Consumer Price Index measuring overall price changes.",
    "ebitda": "Earnings Before Interest, Taxes, Depreciation, and Amortization.",
    "market cap": "Total market value of all outstanding company shares.",
    "fed": "Federal Reserve — the central banking system of the US.",
    "opec": "Organization of Petroleum Exporting Countries managing oil supply."
};

// Health Check Endpoint
app.get("/health", (req, res) => {
    res.json({
        online: true,
        mode: "live",
        status: "Operational",
        serverTime: new Date().toISOString(),
        service: "FinNews AI Live Backend Engine",
        version: "2.0.0"
    });
});

// Helper: Extract financial terms for live News API articles
function extractTermsFromText(text) {
    const detected = [];
    const lower = (text || '').toLowerCase();
    for (const [term, explanation] of Object.entries(FINANCIAL_DICTIONARY)) {
        if (lower.includes(term)) {
            detected.push({
                name: term.toUpperCase(),
                explanation: explanation
            });
        }
    }
    return detected.length > 0 ? detected : [
        { name: "MARKET SENTIMENT", explanation: "The overall attitude of investors toward a particular security or financial market." }
    ];
}

// Helper: Detect sentiment from live news text
function detectSentimentFromText(text) {
    const lower = (text || '').toLowerCase();
    if (/\b(surge|gain|profit|soar|record|rise|boost|jump|bullish|upgrade)\b/.test(lower)) return "Positive";
    if (/\b(dip|decline|drop|fall|loss|plunge|recession|cut|bearish|downgrade)\b/.test(lower)) return "Negative";
    return "Neutral";
}

// Helper: Time ago string formatter
function formatTimeAgoString(dateStr) {
    try {
        const diffMs = Date.now() - new Date(dateStr).getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        if (diffMins < 60) return `${Math.max(1, diffMins)} mins ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hours ago`;
        return `${Math.floor(diffHours / 24)} days ago`;
    } catch (e) {
        return "Recently";
    }
}

// Fetch Latest Financial News Endpoint (supports Real-Time News API)
app.get("/api/news", async (req, res) => {
    const category = req.query.category;
    const region = req.query.region;
    const search = req.query.search;
    const newsApiKey = req.query.newsApiKey || req.query.apiKey || process.env.NEWS_API_KEY;

    // 1. If News API Key is available, fetch real-time news from NewsAPI.org
    if (newsApiKey) {
        try {
            let newsUrl = "";
            if (search) {
                const query = encodeURIComponent(search + " (finance OR market OR economy OR business OR stock)");
                newsUrl = `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=12&apiKey=${newsApiKey}`;
            } else {
                let catParam = "business";
                if (category && category.toLowerCase() === "technology") catParam = "technology";
                newsUrl = `https://newsapi.org/v2/top-headlines?category=${catParam}&language=en&pageSize=12&apiKey=${newsApiKey}`;
            }

            const newsRes = await fetch(newsUrl);
            if (newsRes.ok) {
                const data = await newsRes.json();
                if (data.articles && data.articles.length > 0) {
                    const formattedArticles = data.articles.map((item, index) => {
                        const fullText = (item.title || '') + ' ' + (item.description || '');
                        return {
                            id: 1000 + index + 1,
                            title: item.title || "Financial Headline",
                            description: item.description || item.content || "Latest news update.",
                            source: item.source ? item.source.name : "NewsAPI",
                            publishedAt: item.publishedAt ? formatTimeAgoString(item.publishedAt) : "Just now",
                            category: category && category.toUpperCase() !== 'ALL' ? category.toUpperCase() : 'BUSINESS',
                            region: region && region.toLowerCase() !== 'all' ? region : 'Global',
                            sentiment: detectSentimentFromText(fullText),
                            importance: index < 3 ? "High" : "Medium",
                            image: item.urlToImage || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
                            summary: item.description || item.title,
                            whatHappened: item.content || item.description || item.title,
                            whyItMatters: "Directly impacts financial markets, sector valuation, and investor sentiment.",
                            keyTakeaways: [
                                `Reported live by ${item.source ? item.source.name : 'NewsAPI'}`,
                                `Published ${item.publishedAt ? new Date(item.publishedAt).toLocaleTimeString() : 'recently'}`,
                                "Monitored by global financial market analysts"
                            ],
                            whoIsAffected: "Retail investors, corporate decision-makers, and market participants.",
                            terms: extractTermsFromText(fullText),
                            url: item.url,
                            isLiveNewsApi: true
                        };
                    });
                    return res.json(formattedArticles);
                }
            }
        } catch (err) {
            console.warn("Live News API request failed in /api/news endpoint:", err.message);
        }
    }

    // 2. Public Live Financial News RSS Fetch (when no News API Key is set)
    try {
        let searchQuery = search ? `${search} financial market` : (category && category.toUpperCase() !== 'ALL' ? `${category} financial news` : 'financial markets stock news');
        const rssFeedUrl = `https://api.rss2json.com/v1/api.json?rss_url=` + encodeURIComponent(`https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=en-US&gl=US&ceid=US:en`);
        const rssRes = await fetch(rssFeedUrl);
        if (rssRes.ok) {
            const rssData = await rssRes.json();
            if (rssData.items && rssData.items.length > 0) {
                const liveRssArticles = rssData.items.slice(0, 10).map((item, index) => {
                    const fullText = (item.title || '') + ' ' + (item.description || '');
                    const cleanTitle = item.title ? item.title.split(' - ')[0] : 'Financial Headline';
                    const sourceName = item.title && item.title.includes(' - ') ? item.title.split(' - ').pop() : 'Financial News';
                    return {
                        id: 3000 + index + 1,
                        title: cleanTitle,
                        description: item.description ? item.description.replace(/<[^>]*>/g, '').trim() : cleanTitle,
                        source: sourceName,
                        publishedAt: item.pubDate ? formatTimeAgoString(item.pubDate) : "Recently",
                        category: category && category.toUpperCase() !== 'ALL' ? category.toUpperCase() : 'MARKETS',
                        region: region && region.toLowerCase() !== 'all' ? region : 'Global',
                        sentiment: detectSentimentFromText(fullText),
                        importance: index < 3 ? "High" : "Medium",
                        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
                        summary: item.description ? item.description.replace(/<[^>]*>/g, '').trim() : cleanTitle,
                        whatHappened: cleanTitle,
                        whyItMatters: "Directly impacts financial markets, macroeconomic sentiment, and investment decisions.",
                        keyTakeaways: [
                            `Reported live by ${sourceName}`,
                            `Published ${item.pubDate ? new Date(item.pubDate).toLocaleTimeString() : 'recently'}`,
                            "Updated from global financial market news feeds"
                        ],
                        whoIsAffected: "Investors, consumers, market participants, and financial analysts.",
                        terms: extractTermsFromText(fullText),
                        url: item.link,
                        isLiveRss: true
                    };
                });

                if (liveRssArticles.length > 0) {
                    return res.json(liveRssArticles);
                }
            }
        }
    } catch (e) {
        console.warn("Public RSS live news fetch failed in backend:", e.message);
    }

    // 3. Fallback to internal dataset
    let results = [...NEWS_DATASET];

    if (category && category.toUpperCase() !== "ALL") {
        results = results.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }

    if (region && region.toLowerCase() !== "all") {
        results = results.filter(item => item.region.toLowerCase() === region.toLowerCase());
    }

    if (search) {
        const query = search.toLowerCase();
        results = results.filter(item =>
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.summary.toLowerCase().includes(query)
        );
    }

    res.json(results);
});



// Get & Simplify Specific News Article Endpoint
app.get("/api/simplify/:id", (req, res) => {
    const articleId = parseInt(req.params.id, 10);
    const article = NEWS_DATASET.find(a => a.id === articleId) || NEWS_DATASET[0];
    
    // Add server processing timestamp and metadata
    const simplifiedResponse = {
        ...article,
        processedBy: "FinNews AI Live Backend Engine",
        timestamp: new Date().toISOString()
    };

    res.json(simplifiedResponse);
});

// Helper: Intelligent Fallback Chat Generator (used when Gemini API Key is not supplied)
function generateBackendFallbackReply(query, sources = []) {
    const q = query.toLowerCase().trim();

    if (/^(hi|hello|hey|namaste|greetings)[\s!.]*$/i.test(q)) {
        return `Hello! 👋 I am **FinNews AI Assistant** powered by Google Gemini & News API.\n\nI can help you analyze market headlines, break down financial terms (like Repo Rate, Inflation, EBITDA), and track company news.\n\n💡 *Tip: Add your free Google Gemini API Key in Chat Settings (⚙️) to unlock live generative responses!*`;
    }

    if (q.includes('inflation') || q.includes('cpi')) {
        return `📊 **Inflation & Consumer Price Metrics**\n\n• **What is Inflation?** Inflation measures the rate at which prices for goods and services increase over time, eroding purchasing power.\n• **Current Market Context:** Central banks worldwide are balancing interest rates to bring consumer inflation closer to their target range (typically 2%-4%).\n• **Impact on You:** Rising inflation increases everyday living costs and pushes central banks to raise interest rates, making loans more expensive.`;
    }

    if (q.includes('repo rate') || q.includes('rbi')) {
        return `🏛️ **RBI Repo Rate & Monetary Policy**\n\n• **Repo Rate:** The key benchmark interest rate at which the Reserve Bank of India lends money to commercial banks.\n• **Current Status:** RBI keeps the repo rate at 6.5% to balance steady economic growth while keeping inflation in check.\n• **Impact on You:** Keeps home loan and car loan EMIs predictable while giving stable fixed deposit (FD) returns for savers.`;
    }

    if (q.includes('fed') || q.includes('federal reserve') || q.includes('rate cut')) {
        return `🏦 **Federal Reserve Monetary Policy**\n\n• **US Fed Signals:** The US Federal Reserve has signaled potential interest rate cuts as US inflation slows towards 2.9%.\n• **Global Impact:** Lower US borrowing costs tend to boost stock markets globally, weaken the US Dollar, and encourage capital flow into emerging markets.`;
    }

    if (q.includes('nvidia') || q.includes('ai') || q.includes('chip')) {
        return `🚀 **NVIDIA & Enterprise AI Hardware**\n\n• **Valuation:** NVIDIA's market cap surged past $3 Trillion driven by immense global demand for Blackwell architecture AI chips.\n• **Datacenter Growth:** Datacenter revenues expanded over 200% year-over-year as tech giants invest heavily in AI infrastructure.`;
    }

    // Default intelligent summary using sources
    let newsSummary = "";
    if (sources && sources.length > 0) {
        newsSummary = "\n\n📰 **Relevant Financial Stories:**\n" + sources.map(s => `• **${s.title}** (*${s.source}*)`).join("\n");
    }

    return `💡 **FinNews AI Financial Summary for "${query}":**\n\nFinancial markets are driven by central bank interest rates, corporate earnings, and global macroeconomic indicators.${newsSummary}\n\n💡 *Tip: Add your free Google Gemini API Key in Chat Settings (⚙️) to unlock full generative AI capabilities!*`;
}

// Custom Text Simplifier Endpoint
app.post("/api/custom-simplify", (req, res) => {
    const { text } = req.body || {};
    if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: "No financial text provided." });
    }

    // Extract detected terms
    const detectedTerms = [];
    const lowerText = text.toLowerCase();
    for (const [term, explanation] of Object.entries(FINANCIAL_DICTIONARY)) {
        if (lowerText.includes(term)) {
            detectedTerms.push({
                name: term.toUpperCase(),
                explanation: explanation
            });
        }
    }

    res.json({
        success: true,
        originalText: text,
        summary: `Simplified overview: ${text.slice(0, 150)}${text.length > 150 ? "..." : ""}`,
        detectedTerms: detectedTerms,
        keyTakeaways: [
            "Analyzed by FinNews AI Cloud Backend",
            `Identified ${detectedTerms.length} core financial jargon terms`
        ]
    });
});

// Google Gemini API + News API Powered Chatbot Endpoint
app.post("/api/chat", async (req, res) => {
    try {
        const { message, geminiApiKey, newsApiKey } = req.body || {};
        if (!message || message.trim().length === 0) {
            return res.status(400).json({ error: "Message content cannot be empty." });
        }

        const userGeminiKey = geminiApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        const userNewsKey = newsApiKey || process.env.NEWS_API_KEY;

        let newsContext = "";
        let newsSources = [];

        // 1. Fetch live context from News API if News API key is provided
        if (userNewsKey) {
            try {
                const query = encodeURIComponent(message.slice(0, 50));
                const newsUrl = `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=4&apiKey=${userNewsKey}`;
                const newsRes = await fetch(newsUrl);
                if (newsRes.ok) {
                    const newsData = await newsRes.json();
                    if (newsData.articles && newsData.articles.length > 0) {
                        newsSources = newsData.articles.map(a => ({
                            title: a.title,
                            source: a.source ? a.source.name : 'NewsAPI',
                            url: a.url
                        }));
                        newsContext = "LIVE NEWS API CONTEXT:\n" + newsData.articles.map(a => 
                            `- TITLE: ${a.title}\n  SOURCE: ${a.source ? a.source.name : ''}\n  DESCRIPTION: ${a.description || ''}\n  SUMMARY: ${a.content || ''}`
                        ).join("\n\n");
                    }
                }
            } catch (err) {
                console.warn("News API fetch failed in backend:", err.message);
            }
        }

        // Fallback to internal dataset if no News API results
        if (!newsContext) {
            const matchingArticles = NEWS_DATASET.filter(item => {
                const q = message.toLowerCase();
                return item.title.toLowerCase().includes(q) || 
                       item.description.toLowerCase().includes(q) ||
                       item.category.toLowerCase().includes(q);
            });
            const relevant = matchingArticles.length > 0 ? matchingArticles : NEWS_DATASET.slice(0, 3);
            newsSources = relevant.map(a => ({ title: a.title, source: a.source, url: a.url }));
            newsContext = "CURATED FINANCIAL NEWS DATASET CONTEXT:\n" + relevant.map(a =>
                `- TITLE: ${a.title}\n  SOURCE: ${a.source}\n  SUMMARY: ${a.summary}\n  WHAT HAPPENED: ${a.whatHappened}`
            ).join("\n\n");
        }

        // 2. Query Google Gemini API if Gemini API Key is available
        if (userGeminiKey) {
            try {
                const systemPrompt = `You are FinNews AI Chatbot, an expert financial analyst and news simplifier powered by Google Gemini and News API.

Your Goal:
1. Explain financial concepts, market headlines, stock trends, inflation, central bank decisions (RBI, Fed), and jargon in simple terms.
2. Use the provided news context to answer the user's question accurately.
3. Format your response cleanly using Markdown:
   - Bold text for key terms.
   - Bullet points (•) for takeaways.
   - Headings (###) for structure.
4. Keep explanations engaging, clear, and easy to read.

${newsContext}

User Query: "${message}"`;

                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${userGeminiKey}`;
                let geminiRes = await fetch(geminiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
                        generationConfig: { temperature: 0.3, maxOutputTokens: 1000 }
                    })
                });

                // Fallback to gemini-1.5-flash if 2.0 is unavailable
                if (!geminiRes.ok) {
                    const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${userGeminiKey}`;
                    geminiRes = await fetch(fallbackUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
                            generationConfig: { temperature: 0.3, maxOutputTokens: 1000 }
                        })
                    });
                }

                if (geminiRes.ok) {
                    const geminiData = await geminiRes.json();
                    const textReply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (textReply) {
                        return res.json({
                            success: true,
                            reply: textReply,
                            sources: newsSources,
                            modelUsed: "Google Gemini API",
                            newsApiUsed: Boolean(userNewsKey)
                        });
                    }
                } else {
                    const errData = await geminiRes.json().catch(() => ({}));
                    console.warn("Gemini API non-200:", errData);
                }
            } catch (err) {
                console.warn("Gemini API request failed:", err.message);
            }
        }

        // 3. Fallback engine response if no Gemini API Key or request failed
        const fallbackReply = generateBackendFallbackReply(message, newsSources);
        return res.json({
            success: true,
            reply: fallbackReply,
            sources: newsSources,
            modelUsed: "FinNews Financial AI Engine",
            newsApiUsed: Boolean(userNewsKey),
            keyPromptNeeded: !userGeminiKey
        });

    } catch (error) {
        console.error("Chat endpoint error:", error);
        res.status(500).json({ error: "Internal server error processing chat request." });
    }
});

exports.api = onRequest({ timeoutSeconds: 30, memory: "256MiB" }, app);

// Run local express dev server on port 8000 if started directly with Node
if (require.main === module) {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`🚀 FinNews AI Backend Server running at http://localhost:${PORT}`);
    });
}


