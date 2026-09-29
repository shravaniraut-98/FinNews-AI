/**
 * FINNEWS AI - API Service Module
 * Handles communication with FastAPI backend with seamless mock data fallback.
 * Server-side API key architecture: No secret API keys exposed in frontend JavaScript.
 */

// Automatically use relative path on production (Firebase Hosting rewrites) or local server when running locally
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    && window.location.port === '8000'
    ? "http://localhost:8000"
    : "";

// Comprehensive Mock Data for Frontend Stage & Offline Demo Mode
const MOCK_NEWS_DATA = [
    {
        id: 1,
        title: "RBI Keeps Repo Rate Unchanged at 6.5% Amid Inflation Watch",
        description: "The Reserve Bank of India Monetary Policy Committee decided to maintain the benchmark repo rate at 6.5%, focusing on withdrawal of accommodation to align inflation with the 4% target.",
        source: "Economic Times",
        publishedAt: "2 hours ago",
        category: "Banking",
        region: "India",
        sentiment: "Neutral",
        importance: "High",
        image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80",
        summary: "The Reserve Bank of India kept benchmark interest rates steady to balance economic growth while keeping consumer inflation in check.",
        whatHappened: "The RBI Monetary Policy Committee voted to keep the key lending rate unchanged at 6.5% for the seventh consecutive policy meeting.",
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
        publishedAt: "3 hours ago",
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
        publishedAt: "4 hours ago",
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
        publishedAt: "5 hours ago",
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
        publishedAt: "6 hours ago",
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
        publishedAt: "8 hours ago",
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
    },
    {
        id: 7,
        title: "Sun Pharma Acquires European Specialty Pharma Firm for $450 Million",
        description: "Sun Pharmaceutical Industries announced a definitive agreement to acquire a European dermatology pipeline provider, expanding its global specialty formulation footprint.",
        source: "Mint",
        publishedAt: "9 hours ago",
        category: "Pharma",
        region: "India",
        sentiment: "Positive",
        importance: "Medium",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
        summary: "Leading Indian drug maker Sun Pharma expanded its overseas presence by purchasing a European specialty medical formulations company.",
        whatHappened: "Sun Pharma signed a $450M acquisition deal to acquire a specialized European pharmaceutical company focused on skin treatments.",
        whyItMatters: "Cross-border acquisitions enable Indian pharma firms to capture higher-margin branded drug markets across North America and Europe.",
        keyTakeaways: [
            "All-cash transaction valued at $450 Million",
            "Adds 12 patented specialty products to Sun Pharma's global portfolio",
            "Transaction expected to be accretive to earnings within 18 months"
        ],
        whoIsAffected: "Pharmaceutical investors, healthcare analysts, and specialty drug markets.",
        terms: [
            {
                name: "Acquisition",
                explanation: "A corporate transaction where one business purchases controlling interest in another enterprise."
            },
            {
                name: "Patent",
                explanation: "An exclusive legal right granted to an inventor to manufacture, use, or sell a drug formulation."
            }
        ],
        url: "https://www.livemint.com"
    },
    {
        id: 8,
        title: "Tesla Accelerates Full Self-Driving Rollout and Lower-Cost EV Production",
        description: "Electric vehicle pioneer Tesla confirmed plans to initiate production of affordable EV platforms while expanding deployment of its autonomous driving software package.",
        source: "CNBC",
        publishedAt: "10 hours ago",
        category: "Automotive",
        region: "Global",
        sentiment: "Positive",
        importance: "Medium",
        image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
        summary: "Tesla is accelerating manufacturing of lower-cost electric cars to expand adoption and compete in high-volume global vehicle segments.",
        whatHappened: "Tesla management reaffirmed late 2024 production timelines for new affordable electric vehicle models utilizing existing manufacturing lines.",
        whyItMatters: "Lower-cost electric cars broaden EV market adoption and drive competitive pricing pressure across traditional auto manufacturers.",
        keyTakeaways: [
            "Affordable EV platform on track for production launch",
            "FSD software miles driven crossed 1 Billion milestone",
            "Energy storage battery deployment grew 125% quarter-over-quarter"
        ],
        whoIsAffected: "Electric vehicle buyers, auto competitors, lithium suppliers, and Tesla shareholders.",
        terms: [
            {
                name: "EV",
                explanation: "Electric Vehicle — an automobile powered by electric motors utilizing energy stored in rechargeable batteries."
            }
        ],
        url: "https://www.cnbc.com"
    }
];

/**
 * Checks FastAPI backend server availability.
 * Times out after 2 seconds to keep UI responsive.
 */
async function checkHealth() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: "GET",
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            return { online: true, mode: 'live', message: 'Operational' };
        }
        return { online: false, mode: 'demo', message: 'System Ready' };
    } catch (err) {
        clearTimeout(timeoutId);
        return { online: false, mode: 'demo', message: 'System Ready' };
    }
}

/**
 * Fetches latest financial news articles.
 * Supports real-time News API search and category filtering.
 */
async function fetchNews(params = {}) {
    const { category = 'ALL', region = 'all', search = '', newsApiKey = '' } = params;

    const queryParams = new URLSearchParams();
    if (category && category !== 'ALL') queryParams.append('category', category);
    if (region && region !== 'all') queryParams.append('region', region);
    if (search) queryParams.append('search', search);
    if (newsApiKey) queryParams.append('newsApiKey', newsApiKey);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    // 1. Try backend server /api/news
    try {
        const response = await fetch(`${API_BASE_URL}/api/news${queryString}`);
        if (response.ok) {
            const data = await response.json();
            return { success: true, isDemo: false, data: data };
        }
        throw new Error("Backend non-200 response");
    } catch (error) {
        console.warn("Backend unavailable or static mode, attempting client-side News API...", error.message);
    }

    // 2. Client-side direct call to NewsAPI.org if News API Key is configured in browser
    if (newsApiKey) {
        try {
            let newsUrl = "";
            if (search) {
                const q = encodeURIComponent(search + " (finance OR market OR economy OR business)");
                newsUrl = `https://newsapi.org/v2/everything?q=${q}&language=en&sortBy=publishedAt&pageSize=12&apiKey=${newsApiKey}`;
            } else {
                let catParam = "business";
                if (category && category.toLowerCase() === "technology") catParam = "technology";
                newsUrl = `https://newsapi.org/v2/top-headlines?category=${catParam}&language=en&pageSize=12&apiKey=${newsApiKey}`;
            }

            const newsRes = await fetch(newsUrl);
            if (newsRes.ok) {
                const data = await newsRes.json();
                if (data.articles && data.articles.length > 0) {
                    const formattedArticles = data.articles.map((item, index) => ({
                        id: 2000 + index + 1,
                        title: item.title || "Financial Story",
                        description: item.description || item.content || "Real-time news coverage.",
                        source: item.source ? item.source.name : "NewsAPI",
                        publishedAt: item.publishedAt ? new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
                        category: category && category !== 'ALL' ? category : 'BUSINESS',
                        region: region && region !== 'all' ? region : 'Global',
                        sentiment: /profit|gain|surge|record/i.test(item.title) ? 'Positive' : /drop|fall|cut|loss/i.test(item.title) ? 'Negative' : 'Neutral',
                        importance: index < 3 ? "High" : "Medium",
                        image: item.urlToImage || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
                        summary: item.description || item.title,
                        whatHappened: item.content || item.description || item.title,
                        whyItMatters: "Directly impacts market movements, investor sentiment, and sector valuation.",
                        keyTakeaways: [
                            `Reported live by ${item.source ? item.source.name : 'NewsAPI'}`,
                            "Updated real-time from financial markets"
                        ],
                        whoIsAffected: "Market participants, investors, and industry analysts.",
                        terms: [
                            { name: "MARKET SENTIMENT", explanation: "The overall attitude of investors toward a security or financial market." }
                        ],
                        url: item.url,
                        isLiveNewsApi: true
                    }));
                    return { success: true, isDemo: false, data: formattedArticles, isLiveNewsApi: true };
                }
            }
        } catch (err) {
            console.warn("Client direct NewsAPI fetch failed:", err.message);
        }
    }

    // 3. Client-side public live financial news RSS fetch (no API key required)
    try {
        let searchQuery = search ? `${search} financial market` : (category && category.toUpperCase() !== 'ALL' ? `${category} financial news` : 'financial markets stock news');
        const rssUrl = `https://api.rss2json.com/v1/api.json?rss_url=` + encodeURIComponent(`https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=en-US&gl=US&ceid=US:en`);
        const rssRes = await fetch(rssUrl);
        if (rssRes.ok) {
            const rssData = await rssRes.json();
            if (rssData.items && rssData.items.length > 0) {
                const formattedArticles = rssData.items.slice(0, 12).map((item, index) => {
                    const cleanTitle = item.title ? item.title.split(' - ')[0] : 'Financial Headline';
                    const sourceName = item.title && item.title.includes(' - ') ? item.title.split(' - ').pop() : 'Financial News';
                    return {
                        id: 3000 + index + 1,
                        title: cleanTitle,
                        description: item.description ? item.description.replace(/<[^>]*>/g, '').trim() : cleanTitle,
                        source: sourceName,
                        publishedAt: item.pubDate ? new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
                        category: category && category.toUpperCase() !== 'ALL' ? category.toUpperCase() : 'BUSINESS',
                        region: region && region.toLowerCase() !== 'all' ? region : 'Global',
                        sentiment: /profit|gain|surge|record/i.test(cleanTitle) ? 'Positive' : /drop|fall|cut|loss/i.test(cleanTitle) ? 'Negative' : 'Neutral',
                        importance: index < 3 ? "High" : "Medium",
                        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
                        summary: item.description ? item.description.replace(/<[^>]*>/g, '').trim() : cleanTitle,
                        whatHappened: cleanTitle,
                        whyItMatters: "Directly impacts financial markets, macroeconomic sentiment, and investment decisions.",
                        keyTakeaways: [
                            `Reported live by ${sourceName}`,
                            "Updated real-time from financial market feeds"
                        ],
                        whoIsAffected: "Market participants, investors, and industry analysts.",
                        terms: [
                            { name: "MARKET SENTIMENT", explanation: "The overall attitude of investors toward a security or financial market." }
                        ],
                        url: item.link,
                        isLiveRss: true
                    };
                });
                if (formattedArticles.length > 0) {
                    return { success: true, isDemo: false, data: formattedArticles, isLiveRss: true };
                }
            }
        }
    } catch (err) {
        console.warn("Client RSS live news fetch failed:", err.message);
    }

    // 4. Fallback to mock dataset with client filtering
    let results = [...MOCK_NEWS_DATA];
    if (category && category !== 'ALL') {
        results = results.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }
    if (region && region !== 'all') {
        results = results.filter(item => item.region.toLowerCase() === region.toLowerCase());
    }
    if (search) {
        const q = search.toLowerCase();
        results = results.filter(item =>
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.summary.toLowerCase().includes(q)
        );
    }

    return { success: true, isDemo: true, data: results };
}



/**
 * Requests AI simplification for a specific article.
 */
async function simplifyNews(articleId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/simplify/${articleId}`);
        if (response.ok) {
            const data = await response.json();
            return { success: true, isDemo: false, data: data };
        }
        throw new Error("Simplify API error");
    } catch (error) {
        const match = MOCK_NEWS_DATA.find(a => a.id === Number(articleId)) || MOCK_NEWS_DATA[0];
        return { success: true, isDemo: true, data: match };
    }
}

/**
 * Sends user message to Gemini API and News API Chatbot endpoint.
 * Connects to express backend /api/chat or executes client-side fallback.
 */
async function sendChatMessage(message, options = {}) {
    const { geminiApiKey, newsApiKey, articles = [] } = options;

    // 1. Try Backend Endpoint /api/chat
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: message,
                geminiApiKey: geminiApiKey || undefined,
                newsApiKey: newsApiKey || undefined
            })
        });

        if (response.ok) {
            const data = await response.json();
            if (data && data.reply) {
                return {
                    success: true,
                    reply: data.reply,
                    sources: data.sources || [],
                    modelUsed: data.modelUsed || 'Google Gemini API',
                    newsApiUsed: data.newsApiUsed || false
                };
            }
        }
    } catch (err) {
        console.warn("Backend /api/chat unavailable, attempting direct client integration...", err.message);
    }

    // 2. Direct Client-Side Gemini & News API integration if Keys provided
    let newsContext = "";
    let newsSources = [];

    if (newsApiKey) {
        try {
            const query = encodeURIComponent(message.slice(0, 50));
            const newsRes = await fetch(`https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=3&apiKey=${newsApiKey}`);
            if (newsRes.ok) {
                const newsData = await newsRes.json();
                if (newsData.articles && newsData.articles.length > 0) {
                    newsSources = newsData.articles.map(a => ({
                        title: a.title,
                        source: a.source ? a.source.name : 'NewsAPI',
                        url: a.url
                    }));
                    newsContext = "LIVE NEWS API CONTEXT:\n" + newsData.articles.map(a => `- ${a.title}: ${a.description || ''}`).join("\n");
                }
            }
        } catch (e) {
            console.warn("Client NewsAPI fetch failed:", e.message);
        }
    }

    if (geminiApiKey) {
        try {
            const promptText = `You are FinNews AI Chatbot, an expert financial analyst powered by Google Gemini.
Explain financial concepts and news in simple, accessible markdown formatting.
${newsContext}
User Question: "${message}"`;

            let geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
            let geminiRes = await fetch(geminiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: promptText }] }],
                    generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
                })
            });

            if (!geminiRes.ok) {
                geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
                geminiRes = await fetch(geminiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ role: "user", parts: [{ text: promptText }] }],
                        generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
                    })
                });
            }

            if (geminiRes.ok) {
                const geminiData = await geminiRes.json();
                const textReply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
                if (textReply) {
                    return {
                        success: true,
                        reply: textReply,
                        sources: newsSources,
                        modelUsed: "Google Gemini 2.5 Flash",
                        newsApiUsed: Boolean(newsApiKey)
                    };
                }
            }
        } catch (e) {
            console.warn("Client Direct Gemini API call failed:", e.message);
        }
    }

    // 3. Fallback Engine Response
    const fallbackText = typeof generateChatbookAIResponse === 'function' 
        ? generateChatbookAIResponse(message, articles) 
        : `FinNews AI Engine: Here is the latest financial information regarding "${message}".`;

    return {
        success: true,
        reply: fallbackText,
        sources: newsSources,
        modelUsed: "FinNews AI Engine",
        newsApiUsed: false
    };
}

