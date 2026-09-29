/**
 * FINNEWS AI - UI Renderer Module
 * Handles DOM manipulation, card rendering, modal dialogs, term tooltips, Ask AI responses, and loading states.
 */

let activeTooltipTimeout = null;

/**
 * Renders list of news cards into target container.
 */
function renderArticles(container, articles, savedIds = []) {
    if (!container) return;

    if (!articles || articles.length === 0) {
        container.innerHTML = '';
        return;
    }

    const cardsHtml = articles.map(article => {
        const catClass = article.category ? article.category.toLowerCase() : 'markets';
        const isSaved = savedIds.includes(Number(article.id));
        const saveLabel = isSaved ? '★ Saved' : '☆ Save';
        const saveClass = isSaved ? 'saved' : '';

        // Sentiment badge styling
        const sentiment = article.sentiment || 'Neutral';
        const sentimentClass = sentiment.toLowerCase();
        
        // Importance badge styling
        const importance = article.importance || 'Medium';
        const importanceClass = importance.toLowerCase();

        // Render Takeaways (max 3)
        const takeawaysHtml = (article.keyTakeaways || []).slice(0, 3).map(point => `
            <div class="takeaway-mini-item">
                <span class="check-icon">✓</span>
                <span>${escapeHtml(point)}</span>
            </div>
        `).join('');

        // Render Financial Term Chips
        const termsHtml = (article.terms || []).map(term => `
            <button class="term-chip" 
                    data-term-name="${escapeHtml(term.name)}" 
                    data-term-exp="${escapeHtml(term.explanation)}"
                    title="Click for explanation"
                    aria-label="Explain term ${escapeHtml(term.name)}">
                <span>📚 ${escapeHtml(term.name)}</span>
            </button>
        `).join('');

        return `
            <article class="news-card" data-id="${article.id}">
                <div class="card-media">
                    <img src="${article.image}" alt="${escapeHtml(article.title)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80'">
                    <span class="category-pill ${catClass} card-category-badge">${escapeHtml(article.category || 'News')}</span>
                    ${article.region ? `<span class="region-badge">${escapeHtml(article.region)}</span>` : ''}
                </div>

                <div class="card-body">
                    <div class="card-meta">
                        <span class="card-source">${escapeHtml(article.source)}</span>
                        <span class="card-time">${escapeHtml(article.publishedAt)}</span>
                    </div>

                    <h3 class="card-title">${escapeHtml(article.title)}</h3>
                    <p class="card-description">${escapeHtml(article.description)}</p>

                    <!-- AI SIMPLIFIED SECTION -->
                    <div class="card-ai-simplified">
                        <div class="ai-header">
                            <span class="ai-badge-title">🤖 AI SUMMARY</span>
                            <span class="ai-disclaimer-tag">AI Generated</span>
                        </div>
                        
                        <div class="summary-block">
                            <strong>What happened?</strong>
                            <p class="ai-summary-text">${escapeHtml(article.whatHappened || article.summary)}</p>
                        </div>

                        ${article.whyItMatters ? `
                        <div class="summary-block mt-2">
                            <strong>Why it matters:</strong>
                            <p class="ai-summary-subtext">${escapeHtml(article.whyItMatters)}</p>
                        </div>
                        ` : ''}
                    </div>

                    <!-- KEY TAKEAWAYS -->
                    <div class="card-takeaways">
                        <div class="section-label">KEY TAKEAWAYS</div>
                        <div class="takeaways-mini-list">
                            ${takeawaysHtml}
                        </div>
                    </div>

                    <!-- FINANCIAL TERMS -->
                    ${termsHtml ? `
                    <div class="card-terms">
                        <div class="section-label">FINANCIAL TERMS</div>
                        <div class="terms-chips-wrapper">
                            ${termsHtml}
                        </div>
                    </div>
                    ` : ''}

                    <!-- AI CLASSIFICATION BADGES -->
                    <div class="card-ai-badges">
                        <span class="meta-badge sentiment-${sentimentClass}" title="AI-generated sentiment classification">
                            Sentiment: <strong>${escapeHtml(sentiment)}</strong>
                        </span>
                        <span class="meta-badge importance-${importanceClass}" title="AI-generated relevance ranking">
                            Importance: <strong>${escapeHtml(importance)}</strong>
                        </span>
                    </div>

                    <!-- ACTIONS -->
                    <div class="card-actions">
                        <button class="btn btn-primary btn-sm btn-view-explanation" data-id="${article.id}">
                            Read More
                        </button>
                        <button class="btn btn-secondary btn-sm btn-explain-quick" data-id="${article.id}">
                            Explain
                        </button>
                        <button class="btn btn-bookmark btn-sm ${saveClass} btn-toggle-save" data-id="${article.id}">
                            ${saveLabel}
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join('');

    container.innerHTML = cardsHtml;
}

/**
 * Updates Dashboard Stat Cards & Financial Brief Overview
 */
function renderStatCards(stats = {}, articles = []) {
    const latestElem = document.getElementById('stat-latest-count');
    const summariesElem = document.getElementById('stat-summaries-count');
    const sourcesElem = document.getElementById('stat-sources-count');
    const updatedElem = document.getElementById('stat-last-updated');

    if (latestElem) latestElem.textContent = stats.latestCount ?? (articles.length || 6);
    if (summariesElem) summariesElem.textContent = stats.summariesCount ?? (articles.length || 6);
    
    const uniqueSources = new Set(articles.map(a => a.source)).size;
    if (sourcesElem) sourcesElem.textContent = stats.sourcesCount ?? (uniqueSources || 4);
    if (updatedElem) updatedElem.textContent = stats.lastUpdated ?? 'Just now';

    // Update Financial Brief Section
    const briefCount = document.getElementById('brief-story-count');
    const briefCategories = document.getElementById('brief-categories-list');
    const briefOverview = document.getElementById('brief-overview-text');

    if (briefCount) {
        briefCount.textContent = `${articles.length || 6} Important Stories Today`;
    }

    if (briefCategories && articles.length > 0) {
        const categories = [...new Set(articles.map(a => a.category))];
        briefCategories.innerHTML = categories.map(c => `
            <span class="brief-cat-pill">${escapeHtml(c)}</span>
        `).join('');
    }

    if (briefOverview && articles.length > 0) {
        const topTitle = articles[0]?.title || "Market trends and interest rate expectations";
        briefOverview.textContent = `Today's top stories focus on key market movements, monetary policy updates, and enterprise AI expansion across international sectors. Leading story: "${topTitle}".`;
    }
}

/**
 * Multi-Stage Loading Controller
 */
async function runMultiStageLoading(onComplete) {
    const overlay = document.getElementById('loading-overlay');
    const stageText = document.getElementById('loading-stage-text');
    const progressBar = document.getElementById('progress-bar-fill');
    const fetchBtnMain = document.getElementById('btn-fetch-main');
    const fetchBtnHero = document.getElementById('btn-hero-fetch');

    const dot1 = document.getElementById('step-dot-1');
    const dot2 = document.getElementById('step-dot-2');
    const dot3 = document.getElementById('step-dot-3');
    const dot4 = document.getElementById('step-dot-4');

    if (fetchBtnMain) fetchBtnMain.disabled = true;
    if (fetchBtnHero) fetchBtnHero.disabled = true;

    if (overlay) overlay.classList.remove('hidden');

    // Stage 1: Fetching
    if (stageText) stageText.textContent = "Step 1: Fetching financial news...";
    if (progressBar) progressBar.style.width = "25%";
    if (dot1) dot1.classList.add('active');
    if (dot2) dot2.classList.remove('active');
    if (dot3) dot3.classList.remove('active');
    if (dot4) dot4.classList.remove('active');
    await new Promise(r => setTimeout(r, 450));

    // Stage 2: Processing
    if (stageText) stageText.textContent = "Step 2: Processing articles...";
    if (progressBar) progressBar.style.width = "50%";
    if (dot2) dot2.classList.add('active');
    await new Promise(r => setTimeout(r, 500));

    // Stage 3: Generating AI Summaries
    if (stageText) stageText.textContent = "Step 3: Generating AI summaries...";
    if (progressBar) progressBar.style.width = "75%";
    if (dot3) dot3.classList.add('active');
    await new Promise(r => setTimeout(r, 500));

    // Stage 4: Preparing Results
    if (stageText) stageText.textContent = "Step 4: Preparing simplified results...";
    if (progressBar) progressBar.style.width = "100%";
    if (dot4) dot4.classList.add('active');
    await new Promise(r => setTimeout(r, 450));

    // Hide overlay & trigger callback
    if (overlay) overlay.classList.add('hidden');
    if (fetchBtnMain) fetchBtnMain.disabled = false;
    if (fetchBtnHero) fetchBtnHero.disabled = false;

    if (onComplete) onComplete();
}

/**
 * Updates summary content according to selected Explain Like I'm... audience level
 */
function updateAudienceExplanation(article, level = 'beginner') {
    const whatHappenedElem = document.getElementById('modal-what-happened');
    const whyMattersElem = document.getElementById('modal-why-matters');
    if (!whatHappenedElem || !whyMattersElem || !article) return;

    switch (level) {
        case 'college':
            whatHappenedElem.textContent = article.whatHappenedCollege || `${article.whatHappened || article.summary} From an academic perspective, this illustrates standard fiscal and monetary transmission mechanisms in modern market structures.`;
            whyMattersElem.textContent = article.whyItMattersCollege || `${article.whyItMatters || 'Crucial for understanding macroeconomic metrics.'} It provides concrete study examples for macroeconomic equilibrium, interest rate elasticity, and consumer demand theory.`;
            break;
        case 'finance':
            whatHappenedElem.textContent = article.whatHappenedFinance || `${article.whatHappened || article.summary} Key analytical drivers focus on yield curve adjustments, balance sheet liquidity ratios, and asset valuation re-pricing across equity and fixed-income markets.`;
            whyMattersElem.textContent = article.whyItMattersFinance || `${article.whyItMatters || 'Direct impact on portfolio allocation.'} Influences discount rate models (WACC), corporate credit default spreads, and institutional fund rebalancing strategies.`;
            break;
        case 'business':
            whatHappenedElem.textContent = article.whatHappenedBusiness || `${article.whatHappened || article.summary} For executive leadership, this signals strategic shifts in capital expenditure budgets, supply chain overheads, and competitive market positioning.`;
            whyMattersElem.textContent = article.whyItMattersBusiness || `${article.whyItMatters || 'Affects enterprise profit margins.'} Directly impacts commercial loan interest rates, operating margins, currency risk hedging, and enterprise pricing power.`;
            break;
        case 'beginner':
        default:
            whatHappenedElem.textContent = article.whatHappened || article.summary;
            whyMattersElem.textContent = article.whyItMatters || "This article impacts overall market sentiment, borrowing conditions, and consumer purchasing power in everyday language.";
            break;
    }
}

/**
 * Returns categorized impact statement for Banks, Businesses, Consumers, and Economy
 */
function getCategorizedImpact(article, categoryKey) {
    if (article.categorizedImpact && article.categorizedImpact[categoryKey]) {
        return article.categorizedImpact[categoryKey];
    }

    const cat = (article.category || '').toLowerCase();
    
    switch (categoryKey) {
        case 'banks':
            if (cat === 'banking' || article.title.includes('RBI') || article.title.includes('Rate')) {
                return "Directly affects commercial lending interest rates, net interest margins (NIM), and bank liquidity reserves.";
            }
            return "Influences credit growth, loan demand, and commercial bank deposit yields.";
        case 'businesses':
            if (cat === 'technology' || cat === 'startups') {
                return "Shapes enterprise software budgets, venture capital funding rounds, and technology infrastructure expansion.";
            }
            return "Affects corporate borrowing costs, capital expenditure (CapEx) planning, and quarterly profit margins.";
        case 'consumers':
            return "Impacts home loan and car loan EMIs, credit card interest rates, and everyday household purchasing power.";
        case 'economy':
            return "Shapes annual GDP growth forecasts, central bank monetary policy trajectory, and macroeconomic inflation targets.";
        default:
            return "Relevant context for market participants.";
    }
}

/**
 * Open Article Detail Modal
 */
function openModal(article, allArticles = [], isSaved = false) {
    const modal = document.getElementById('article-modal');
    if (!modal || !article) return;

    modal.setAttribute('data-current-id', article.id);

    // Basic Header & Image
    document.getElementById('modal-category').textContent = article.category || 'Markets';
    document.getElementById('modal-source').textContent = `${article.source} • ${article.publishedAt}`;
    document.getElementById('modal-title').textContent = article.title;
    document.getElementById('modal-description').textContent = article.description || article.summary;

    const modalImg = document.getElementById('modal-image');
    if (modalImg) {
        modalImg.src = article.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80';
        modalImg.alt = article.title;
    }

    // Reset Tabs to AI Simplified Active
    const tabAi = document.getElementById('btn-modal-tab-ai');
    const tabOrig = document.getElementById('btn-modal-tab-original');
    const boxAi = document.getElementById('modal-ai-box');
    const boxOrig = document.getElementById('modal-original-box');

    if (tabAi && tabOrig && boxAi && boxOrig) {
        tabAi.classList.add('active');
        tabOrig.classList.remove('active');
        boxAi.classList.remove('hidden');
        boxOrig.classList.add('hidden');
    }

    // In 30 Seconds Flash Summary
    const recapElem = document.getElementById('modal-recap-text');
    if (recapElem) {
        recapElem.textContent = article.recap30 || `⚡ ${article.title}: ${article.summary}`;
    }

    // Reset Audience Selector Chips to 'beginner'
    const audienceChips = document.querySelectorAll('.audience-chip');
    audienceChips.forEach(chip => {
        if (chip.getAttribute('data-level') === 'beginner') {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });

    // Populate AI Summary based on default audience level (beginner)
    updateAudienceExplanation(article, 'beginner');

    // Categorized Impact Grid
    const impactBanks = document.getElementById('impact-banks');
    const impactBusinesses = document.getElementById('impact-businesses');
    const impactConsumers = document.getElementById('impact-consumers');
    const impactEconomy = document.getElementById('impact-economy');

    if (impactBanks) impactBanks.textContent = article.impactBanks || getCategorizedImpact(article, 'banks');
    if (impactBusinesses) impactBusinesses.textContent = article.impactBusinesses || getCategorizedImpact(article, 'businesses');
    if (impactConsumers) impactConsumers.textContent = article.impactConsumers || getCategorizedImpact(article, 'consumers');
    if (impactEconomy) impactEconomy.textContent = article.impactEconomy || getCategorizedImpact(article, 'economy');

    // AI Classification Badges
    const sentimentElem = document.getElementById('modal-sentiment-badge');
    if (sentimentElem) {
        sentimentElem.textContent = `AI Sentiment: ${article.sentiment || 'Neutral'}`;
        sentimentElem.className = `meta-badge sentiment-${(article.sentiment || 'neutral').toLowerCase()}`;
    }

    const importanceElem = document.getElementById('modal-importance-badge');
    if (importanceElem) {
        importanceElem.textContent = `AI Importance: ${article.importance || 'Medium'}`;
        importanceElem.className = `meta-badge importance-${(article.importance || 'medium').toLowerCase()}`;
    }

    // Key Takeaways
    const takeawaysList = document.getElementById('modal-takeaways');
    if (takeawaysList) {
        takeawaysList.innerHTML = (article.keyTakeaways || []).map(item => `
            <li class="takeaway-modal-item">
                <span class="check-icon">✓</span>
                <span>${escapeHtml(item)}</span>
            </li>
        `).join('');
    }

    // Terms Grid (Financial Jargon Translator)
    const termsGrid = document.getElementById('modal-terms');
    if (termsGrid) {
        termsGrid.innerHTML = (article.terms || []).map(t => `
            <div class="modal-term-card">
                <div class="modal-term-name">📚 ${escapeHtml(t.name)}</div>
                <div class="modal-term-def"><strong>Simple Meaning:</strong> ${escapeHtml(t.explanation)}</div>
                <div class="modal-term-why mt-1 font-sm text-muted"><strong>Why It Matters:</strong> Key term to understand current news and economic policy.</div>
            </div>
        `).join('');
    }

    // Read original link
    const readBtn = document.getElementById('modal-read-original-btn');
    if (readBtn) readBtn.href = article.url || '#';

    // Save toggle in modal
    const saveModalBtn = document.getElementById('modal-save-btn');
    if (saveModalBtn) {
        saveModalBtn.textContent = isSaved ? '★ Saved' : '☆ Save Article';
        saveModalBtn.className = `btn btn-secondary ${isSaved ? 'saved' : ''}`;
    }

    // Reset Ask AI section output & input
    const askInput = document.getElementById('ask-ai-input');
    const askOutput = document.getElementById('ask-ai-response');
    if (askInput) askInput.value = '';
    if (askOutput) {
        askOutput.classList.add('hidden');
        askOutput.innerHTML = '';
    }

    // Render Related News (2-3 matching category or source)
    renderRelatedNews(article, allArticles);

    // Display modal
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

/**
 * Render Related Articles inside Modal
 */
function renderRelatedNews(currentArticle, allArticles) {
    const container = document.getElementById('modal-related-articles');
    if (!container) return;

    if (!allArticles || allArticles.length <= 1) {
        container.innerHTML = '<p class="text-muted font-sm">No related articles found.</p>';
        return;
    }

    const related = allArticles
        .filter(a => Number(a.id) !== Number(currentArticle.id))
        .filter(a => a.category === currentArticle.category || a.source === currentArticle.source || a.region === currentArticle.region)
        .slice(0, 3);

    if (related.length === 0) {
        const fallback = allArticles.filter(a => Number(a.id) !== Number(currentArticle.id)).slice(0, 3);
        container.innerHTML = fallback.map(a => renderRelatedCardSnippet(a)).join('');
        return;
    }

    container.innerHTML = related.map(a => renderRelatedCardSnippet(a)).join('');
}

function renderRelatedCardSnippet(article) {
    return `
        <div class="related-article-card btn-view-explanation" data-id="${article.id}">
            <span class="related-cat">${escapeHtml(article.category || 'News')}</span>
            <h5 class="related-title">${escapeHtml(article.title)}</h5>
            <span class="related-source">${escapeHtml(article.source)} • ${escapeHtml(article.publishedAt)}</span>
        </div>
    `;
}

/**
 * Handles Ask AI questions about the open article using Google Gemini API
 */
async function handleAskAIQuestion(question, article) {
    const outputContainer = document.getElementById('ask-ai-response');
    if (!outputContainer || !article) return;

    outputContainer.classList.remove('hidden');
    outputContainer.innerHTML = `
        <div class="ask-ai-loading">
            <div class="typing-dots"><span></span><span></span><span></span></div>
            <span style="margin-left: 8px;">✨ Google Gemini AI is analyzing this article...</span>
        </div>
    `;

    const articleContext = `ARTICLE TITLE: ${article.title}
SOURCE: ${article.source} (${article.publishedAt})
SUMMARY: ${article.summary}
WHAT HAPPENED: ${article.whatHappened || article.description}
WHY IT MATTERS: ${article.whyItMatters || ''}
KEY TAKEAWAYS: ${Array.isArray(article.keyTakeaways) ? article.keyTakeaways.join('; ') : ''}`;

    const promptMessage = `User Question about this article: "${question}"\n\nContext:\n${articleContext}`;

    const geminiKey = typeof AppState !== 'undefined' ? AppState.geminiApiKey : '';
    const newsKey = typeof AppState !== 'undefined' ? AppState.newsApiKey : '';

    let replyText = "";
    let modelUsed = "Google Gemini AI";

    try {
        const response = await sendChatMessage(promptMessage, {
            geminiApiKey: geminiKey,
            newsApiKey: newsKey,
            articles: [article]
        });

        if (response && response.reply) {
            replyText = response.reply;
            modelUsed = response.modelUsed || "Google Gemini AI";
        }
    } catch (err) {
        console.warn("Gemini article Q&A fallback:", err);
    }

    if (!replyText) {
        replyText = generateLocalAIAnswer(question, article);
    }

    outputContainer.innerHTML = `
        <div class="ask-ai-answer-card">
            <div class="answer-header">
                <span>✨ GEMINI AI ANSWER</span>
                <span class="ai-tag">${escapeHtml(modelUsed)}</span>
            </div>
            <div class="answer-text">${formatMarkdownToHtml(replyText)}</div>
        </div>
    `;
}

/**
 * Generates plain-English contextual AI answer based on article data
 */
function generateLocalAIAnswer(q, article) {
    const query = q.toLowerCase();
    
    if (query.includes('what happened') || query.includes('summary')) {
        return article.whatHappened || article.summary;
    }
    if (query.includes('new to finance') || query.includes('explain simply') || query.includes('beginner')) {
        return `**Simple Breakdown:** ${article.summary}\n\n**Why it matters:** ${article.whyItMatters}`;
    }
    if (query.includes('why does this matter') || query.includes('matter') || query.includes('importance')) {
        return article.whyItMatters || "This is important because market shifts directly influence interest rates, borrowing costs, and corporate earnings.";
    }
    if (query.includes('sector') || query.includes('who') || query.includes('affected')) {
        return `**Who is affected:** ${article.whoIsAffected || article.category} sector participants, consumers, and retail investors.`;
    }
    if (query.includes('term') || query.includes('difficult')) {
        if (article.terms && article.terms.length > 0) {
            return article.terms.map(t => `• **${t.name}:** ${t.explanation}`).join('\n');
        }
        return "Key terms in this article relate to standard financial indicators like Interest Rates, Inflation, and Market Capitalization.";
    }
    if (query.includes('30-second') || query.includes('quick')) {
        return `**30-Second Recap:** ${article.title}.\n\n${article.summary}`;
    }

    return `**Article Summary:** ${article.whatHappened || article.summary}\n\n**Market Impact:** ${article.whyItMatters || 'Monitored by market analysts.'}`;
}


/**
 * Close Article Detail Modal
 */
function closeModal() {
    const modal = document.getElementById('article-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

/**
 * Shows interactive popover tooltip for Financial Terms
 */
function showTermTooltip(targetElem, name, exp) {
    const tooltip = document.getElementById('term-tooltip');
    if (!tooltip) return;

    document.getElementById('tooltip-term-name').textContent = name;
    document.getElementById('tooltip-term-exp').textContent = exp;

    const rect = targetElem.getBoundingClientRect();
    tooltip.style.left = `${Math.min(window.innerWidth - 300, Math.max(10, rect.left))}px`;
    tooltip.style.top = `${rect.bottom + window.scrollY + 8}px`;

    tooltip.classList.remove('hidden');

    if (activeTooltipTimeout) clearTimeout(activeTooltipTimeout);
    activeTooltipTimeout = setTimeout(() => {
        hideTermTooltip();
    }, 4500);
}

function hideTermTooltip() {
    const tooltip = document.getElementById('term-tooltip');
    if (tooltip) tooltip.classList.add('hidden');
}

/**
 * Updates Nav System Status Badge
 */
function updateSystemStatus(isOnline, customText) {
    const dot = document.getElementById('status-dot');
    const text = document.getElementById('status-text');

    if (isOnline) {
        if (dot) dot.className = 'status-dot green';
        if (text) text.textContent = customText || 'Operational';
    } else {
        if (dot) dot.className = 'status-dot amber';
        if (text) text.textContent = customText || 'System Ready';
    }
}

/**
 * Reusable Error State Renderer
 */
function renderErrorState(container, type = 'backend_offline', onRetry) {
    if (!container) return;

    let title = "Unable to fetch financial news right now.";
    let desc = "Running in local demo mode. You can retry server connection below.";

    if (type === 'news_failure') {
        title = "Unable to retrieve the latest financial news.";
        desc = "Please verify network connectivity and click try again.";
    } else if (type === 'ai_failure') {
        title = "AI simplification is temporarily unavailable.";
        desc = "News articles were loaded, but AI insights could not be generated.";
    } else if (type === 'network_error') {
        title = "Network connection interrupted.";
        desc = "A network error occurred while fetching real-time financial updates.";
    }

    container.innerHTML = `
        <div class="error-banner-card">
            <div class="error-info">
                <span class="error-icon">⚠️</span>
                <div>
                    <h4 class="error-title">${title}</h4>
                    <p class="error-desc">${desc}</p>
                </div>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-error-retry">
                Try Again
            </button>
        </div>
    `;

    container.classList.remove('hidden');

    const retryBtn = document.getElementById('btn-error-retry');
    if (retryBtn && onRetry) {
        retryBtn.addEventListener('click', onRetry);
    }
}

function clearErrorState(container) {
    if (!container) return;
    container.innerHTML = '';
    container.classList.add('hidden');
}

// Utility function to escape HTML string
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Appends a message to the Chatbook AI section
 */
/**
 * Converts standard markdown syntax to clean HTML for chatbot messages
 */
function formatMarkdownToHtml(text) {
    if (!text) return "";

    let html = text;

    // Convert any legacy inline HTML tags to clean markdown first
    html = html.replace(/<br\s*\/?>/gi, '\n');
    html = html.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
    html = html.replace(/<em>(.*?)<\/em>/gi, '*$1*');
    html = html.replace(/<code>(.*?)<\/code>/gi, '`$1`');
    html = html.replace(/<small style="[^"]*">(.*?)<\/small>/gi, '_$1_');

    // Escape any dangerous unhandled raw tags safely
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Headings (### Heading)
    html = html.replace(/###\s+(.*?)(\n|$)/g, '<h4 class="chat-heading">$1</h4>');

    // Bold (**text**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic (*text* or _text_)
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Inline Code (`code`)
    html = html.replace(/`([^`]+)`/g, '<code class="chat-code">$1</code>');

    // Bullet points (• or - or numbered list 1.)
    html = html.replace(/^[•\-]\s+(.*?)(\n|$)/gm, '<li>$1</li>');
    html = html.replace(/^(\d+)\.\s+(.*?)(\n|$)/gm, '<li><strong>$1.</strong> $2</li>');
    html = html.replace(/(<li>.*?<\/li>)/gs, '<ul class="chat-bullet-list">$1</ul>');

    // Double line breaks and single line breaks
    html = html.replace(/\n\n/g, '<br><br>');
    html = html.replace(/\n/g, '<br>');

    return html;
}

/**
 * Shows animated typing indicator in Chatbook while waiting for Gemini API response
 */
function showChatbookTyping() {
    const chatContainer = document.getElementById('chatbook-messages');
    if (!chatContainer) return;

    removeChatbookTyping(); // avoid duplicates

    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatbook-msg msg-ai typing-msg';
    typingDiv.id = 'chatbook-typing-indicator';
    typingDiv.innerHTML = `
        <div class="msg-avatar">🤖</div>
        <div class="msg-content">
            <strong>FinNews Gemini AI:</strong>
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;

    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Removes typing indicator from Chatbook
 */
function removeChatbookTyping() {
    const typingElem = document.getElementById('chatbook-typing-indicator');
    if (typingElem) {
        typingElem.remove();
    }
}

/**
 * Appends user or AI message to Chatbook conversation
 */
function appendChatbookMessage(sender, text, options = {}) {
    const chatContainer = document.getElementById('chatbook-messages');
    if (!chatContainer) return;

    const isUser = sender === 'user';
    const msgDiv = document.createElement('div');
    msgDiv.className = `chatbook-msg ${isUser ? 'msg-user' : 'msg-ai'}`;

    const formattedContent = isUser ? escapeHtml(text) : formatMarkdownToHtml(text);

    let sourcesHtml = '';
    if (!isUser && options.sources && options.sources.length > 0) {
        sourcesHtml = `<div class="chat-sources-box"><span class="sources-title">📰 News Sources:</span> ${options.sources.map(s => `<a href="${escapeHtml(s.url || '#')}" target="_blank" rel="noopener" class="chat-source-tag">${escapeHtml(s.source)}: ${escapeHtml(s.title.slice(0, 45))}...</a>`).join(' ')}</div>`;
    }

    let modelBadge = '';
    if (!isUser && options.modelUsed) {
        modelBadge = `<span class="chat-model-badge">${escapeHtml(options.modelUsed)}</span>`;
    }

    msgDiv.innerHTML = `
        <div class="msg-avatar">${isUser ? '👤' : '🤖'}</div>
        <div class="msg-content">
            <div class="msg-header-row">
                <strong>${isUser ? 'You:' : 'FinNews Gemini AI:'}</strong>
                ${modelBadge}
            </div>
            <div class="msg-text-body">${formattedContent}</div>
            ${sourcesHtml}
        </div>
    `;

    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Generates Chatbook AI intelligent response for any user query using clean Markdown
 */
function generateChatbookAIResponse(query, articles = []) {
    if (!query || typeof query !== 'string') return "How can I help you with financial news or concepts today?";
    const rawQuery = query.trim();
    const q = rawQuery.toLowerCase();

    // 1. Greetings & Conversational Inputs
    if (/^(hi|hello|hey|namaste|greetings|hola|good morning|good afternoon|good evening)[\s!.]*$/i.test(q) || q === 'hi' || q === 'hello') {
        return `Hello! 👋 I am **FinNews AI Assistant**.\n\nI can help you understand financial headlines, simplify market jargon (like Repo Rate, Inflation, EBITDA), analyze stock trends, or break down economic concepts.\n\n💡 *Tip: Add your free Google Gemini API Key in Chat Settings (⚙️) to unlock live generative responses!*`;
    }

    if (q.includes('who are you') || q.includes('what can you do') || q.includes('help me') || q.includes('what is this bot')) {
        return `🤖 **I am your FinNews AI Financial Guide!**\n\nHere is what I can do for you:\n• **Explain Jargon:** Ask about terms like *Repo Rate, Inflation, P/E Ratio, Market Cap, SIP, EBITDA*.\n• **Summarize News:** Ask *"What's happening in markets today?"* or about companies like *NVIDIA, Apple, Tata Motors*.\n• **Learning & Advice Concepts:** Ask *"How to start investing?"*, *"What is a Mutual Fund?"*, or *"Explain Bull vs Bear market"*.\n\nTry typing any question or topic!`;
    }

    if (q.includes('thank') || q.includes('thanks') || q.includes('awesome') || q.includes('great response') || q.includes('good bot')) {
        return `You're very welcome! 😊 Glad I could help. Feel free to ask about any other financial terms, market news, or economic concepts anytime!`;
    }

    // 2. Market News & Today's Overview
    if (q.includes('today') || q.includes('headline') || q.includes('latest news') || q.includes('market update') || q.includes('what happened today')) {
        if (articles.length > 0) {
            const topTitles = articles.slice(0, 4).map(a => `• **${a.title}** (*${a.source}*)\n_${a.summary}_`).join('\n\n');
            return ` Here are today's top financial headlines:\n\n${topTitles}\n\n👉 Click on any article above or ask me specific questions about them!`;
        }
        return "Markets today are closely following central bank interest rate decisions, corporate quarterly earnings reports, and enterprise AI developments across global stock exchanges.";
    }

    // 3. Core Financial Knowledge Base & Topics
    if (q.includes('gold') || q.includes('gold rate') || q.includes('gold price') || q.includes('bullion') || q.includes('silver')) {
        return `✨ **Gold & Gold Rates Overview**\n\n• **What Drives Gold Rates?** Gold prices are influenced by global inflation, central bank gold reserves, market demand, and currency exchange rates (USD/INR).\n• **Safe-Haven Asset:** Investors buy gold during stock market volatility or economic uncertainty to protect their purchasing power.\n• **Ways to Invest:** Sovereign Gold Bonds (SGBs), Gold Mutual Funds & ETFs, Digital Gold, or physical gold coins/bullion.`;
    }

    if (q.includes('repo rate') || q.includes('repo') || q.includes('rbi repo') || q.includes('rbi rate') || q.includes('lending rate')) {
        return `🏛️ **Repo Rate & Central Bank Policy**\n\n• **Definition:** Repo Rate is the key interest rate at which central banks (like the RBI) lend money to commercial banks.\n• **When Repo Rate Rises:** Borrowing costs increase for home loans and car loan EMIs, helping lower high inflation.\n• **When Repo Rate Falls:** Borrowing becomes cheaper, boosting economic spending and loan growth.`;
    }

    if (q.includes('interest rate') || q.includes('interest rates') || q.includes('borrowing cost')) {
        return `🏦 **Interest Rates & Economic Impact**\n\n• **For Borrowers:** Higher interest rates increase monthly loan EMIs on home, car, and personal loans.\n• **For Savers:** Higher interest rates provide better returns on Fixed Deposits (FDs) and bank savings accounts.`;
    }

    if (q.includes('exchange rate') || q.includes('dollar rate') || q.includes('rupee') || q.includes('forex') || q.includes('usd inr')) {
        return `💱 **Exchange Rates & Forex**\n\nThe price of one currency relative to another (e.g., USD/INR). Currency values fluctuate based on national inflation, central bank interest rate differences, international trade deficits, and foreign capital flows.`;
    }

    if (q.includes('sip') || q.includes('systematic investment')) {
        return `📈 **SIP (Systematic Investment Plan)**\n\nA disciplined method to invest a fixed amount of money regularly (e.g. ₹500/month) into mutual funds.\n\n• **Rupee Cost Averaging:** You automatically buy more fund units when prices drop and fewer when prices rise.\n• **Compounding Power:** Returns earned generate additional returns over time.\n• **Low Entry Barrier:** Easy to start online with small monthly contributions.`;
    }

    if (q.includes('mutual fund') || q.includes('etf')) {
        return `📊 **Mutual Funds & ETFs**\n\n• **Mutual Fund:** Pools money from multiple investors to buy a professionally managed, diversified portfolio of stocks or bonds.\n• **ETF (Exchange Traded Fund):** Trades live on stock exchanges like individual company shares with lower expense fees.`;
    }

    if (q.includes('inflation') || q.includes('cpi') || q.includes('price rise')) {
        return `📊 **Inflation & Purchasing Power**\n\n• **What is Inflation?** The rate at which general prices for goods and services rise over time, reducing purchasing power.\n• **CPI (Consumer Price Index):** The standard metric used to measure consumer inflation.\n• **Target:** Central banks aim to keep inflation steady (around 2%-4%) to ensure wage growth keeps up with living expenses.`;
    }

    if (q.includes('ebitda')) {
        return `💼 **EBITDA**\n\n*Earnings Before Interest, Taxes, Depreciation, and Amortization*.\n\nIt measures a company's core operational profitability without distortion from debt financing, local tax rates, or non-cash accounting depreciation.`;
    }

    if (q.includes('market cap') || q.includes('market capitalization')) {
        return `🏷️ **Market Capitalization (Market Cap)**\n\nThe total value of all outstanding shares of a publicly traded company.\n\n• **Formula:** \`Share Price × Total Outstanding Shares\`\n• **Large-cap:** Market Cap > $10 Billion / ₹20,000 Cr (Industry leaders like Reliance, Apple).\n• **Mid-cap & Small-cap:** Higher growth potential with higher short-term price volatility.`;
    }

    if (q.includes('pe ratio') || q.includes('price to earnings') || q.includes('p/e')) {
        return `📊 **P/E Ratio (Price-to-Earnings)**\n\nCompares a company's stock price to its annual earnings per share (\`Share Price / EPS\`):\n\n• **High P/E:** Investors expect strong future profit growth (or the stock is trading at a premium).\n• **Low P/E:** Indicates potential undervaluation relative to industry peers.`;
    }

    if (q.includes('bull market') || q.includes('bear market') || q.includes('bull vs bear')) {
        return `🐂 vs 🐻 **Bull vs. Bear Market**\n\n• 🐂 **Bull Market:** Stock prices rise steadily over time, driven by economic growth, strong earnings, and investor optimism.\n• 🐻 **Bear Market:** Stock prices decline 20% or more from recent peak highs, accompanied by economic slowdown concerns.`;
    }

    if (q.includes('start investing') || q.includes('how to invest') || q.includes('beginner investment')) {
        return `💡 **4 Essential Steps to Start Investing:**\n\n1. **Build an Emergency Fund:** Keep 3-6 months of expenses safe in a liquid savings account or FD.\n2. **Start a Monthly SIP:** Invest in low-cost index funds (Nifty 50 or S&P 500).\n3. **Diversify Your Money:** Spread investments across equities, debt, and gold.\n4. **Stay Invested Long-term:** Discipline beats market timing—let compound interest grow your wealth.`;
    }

    if (q.includes('nvidia')) {
        return `🚀 **NVIDIA Corporation**\n\nSemiconductor pioneer leading the global enterprise AI revolution. Surging demand for its Blackwell AI microchips and datacenter GPUs pushed its stock market valuation beyond $3 Trillion.`;
    }

    if (q.includes('tata') || q.includes('tata motors')) {
        return `🚗 **Tata Motors**\n\nLeading Indian auto manufacturer posting strong profit expansion driven by commercial vehicle demand, Jaguar Land Rover (JLR) margin improvements, and electric transit bus orders.`;
    }

    if (q.includes('apple')) {
        return `📱 **Apple Inc.**\n\nTechnology giant embedding native Generative AI across iOS devices, driving hardware upgrade cycles and expanding high-margin services revenue (App Store, iCloud).`;
    }

    // Generic Dynamic Topic Fallback
    const stopWords = ['what', 'where', 'when', 'which', 'about', 'explain', 'tell', 'this', 'that', 'with', 'from', 'have', 'does', 'should', 'would', 'could', 'please', 'give', 'show', 'mean', 'meaning', 'is', 'are', 'the', 'for', 'and'];
    const words = q.replace(/[^a-z0-9\s]/gi, '').split(/\s+/).filter(w => w.length > 2 && !stopWords.includes(w));
    
    const topicName = words.length > 0 ? words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : rawQuery;

    return `💡 **Financial Summary: ${topicName}**\n\n• **Overview:** In financial markets, **${topicName}** is a key metric or economic factor.\n• **Why it matters:** Fluctuations in ${topicName} influence asset pricing, corporate earnings, and investor sentiment.\n• **Key Takeaway:** Understanding ${topicName} helps in evaluating investment risks and economic trends.\n\n💡 *Tip: Add your free Google Gemini API Key in Chat Settings (⚙️) to unlock live generative responses!*`;
}

/**
 * Displays temporary toast notification
 */
function showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; pointer-events: none;';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.style.cssText = `
        background: ${type === 'success' ? '#10B981' : type === 'warning' ? '#F59E0B' : '#7C3AED'};
        color: #FFFFFF;
        padding: 12px 20px;
        border-radius: 9999px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2);
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: auto;
    `;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}


