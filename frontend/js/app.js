/**
 * FINNEWS AI - Main Application Controller
 * Connects API, UI renderer, filter logic, localStorage state, and user interactions.
 */

// Application State
const AppState = {
    allArticles: [],
    filteredArticles: [],
    selectedCategory: 'ALL',
    selectedRegion: 'all', // 'all', 'India', 'Global'
    searchQuery: '',
    sortBy: 'latest',
    showSavedOnly: false,
    savedArticleIds: [], // loaded from localStorage
    savedArticlesObjects: [], // loaded from localStorage to persist live articles
    recentlyViewedIds: [], // loaded from localStorage
    isBackendOnline: false,
    geminiApiKey: '',
    newsApiKey: ''
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Initializing FinNews AI Financial Intelligence Dashboard...");

    // 1. Load LocalStorage States
    loadLocalStorageState();

    // 2. Initial Health Check
    await checkBackendHealth();

    // 3. Load Initial Financial News Data
    await loadNewsData();

    // 4. Setup Event Listeners
    setupEventListeners();
});

/**
 * Loads Saved Articles, Recently Viewed, and API Keys from localStorage
 */
function loadLocalStorageState() {
    try {
        const saved = localStorage.getItem('finnews_saved_articles');
        if (saved) {
            AppState.savedArticleIds = JSON.parse(saved).map(Number);
        }

        const savedObjs = localStorage.getItem('finnews_saved_articles_objects');
        if (savedObjs) {
            AppState.savedArticlesObjects = JSON.parse(savedObjs);
        }

        const recent = localStorage.getItem('finnews_recently_viewed');
        if (recent) {
            AppState.recentlyViewedIds = JSON.parse(recent).map(Number);
        }

        AppState.geminiApiKey = localStorage.getItem('finnews_gemini_key') || '';
        AppState.newsApiKey = localStorage.getItem('finnews_news_key') || '';

        updateChatbookModelBadge();
    } catch (e) {
        console.warn("LocalStorage state read warning:", e);
        AppState.savedArticleIds = [];
        AppState.savedArticlesObjects = [];
        AppState.recentlyViewedIds = [];
        AppState.geminiApiKey = '';
        AppState.newsApiKey = '';
    }
}

/**
 * Updates Chatbook Status Tag according to active keys
 */
function updateChatbookModelBadge() {
    const tag = document.getElementById('chatbook-model-tag');
    if (!tag) return;

    if (AppState.geminiApiKey && AppState.newsApiKey) {
        tag.textContent = '✨ Gemini 2.5 + Live News API';
        tag.style.backgroundColor = '#DCFCE7';
        tag.style.color = '#15803D';
    } else if (AppState.geminiApiKey) {
        tag.textContent = '✨ Gemini 2.5 Active';
        tag.style.backgroundColor = '#F3E8FF';
        tag.style.color = '#6D28D9';
    } else if (AppState.newsApiKey) {
        tag.textContent = '📰 Live News API Active';
        tag.style.backgroundColor = '#E0F2FE';
        tag.style.color = '#0369A1';
    } else {
        tag.textContent = '⚡ FinNews AI Engine (Add Key for Gemini 2.5)';
        tag.style.backgroundColor = '#F3E8FF';
        tag.style.color = '#6D28D9';
    }
}


/**
 * Persists Saved Article IDs and Objects to localStorage
 */
function saveSavedArticlesToStorage() {
    try {
        localStorage.setItem('finnews_saved_articles', JSON.stringify(AppState.savedArticleIds));
        localStorage.setItem('finnews_saved_articles_objects', JSON.stringify(AppState.savedArticlesObjects));
    } catch (e) {
        console.warn("LocalStorage save error:", e);
    }
}

/**
 * Adds an article ID to Recently Viewed in localStorage
 */
function addRecentlyViewed(articleId) {
    const idNum = Number(articleId);
    AppState.recentlyViewedIds = [idNum, ...AppState.recentlyViewedIds.filter(i => i !== idNum)].slice(0, 10);
    try {
        localStorage.setItem('finnews_recently_viewed', JSON.stringify(AppState.recentlyViewedIds));
    } catch (e) {
        console.warn("LocalStorage write error:", e);
    }
}

/**
 * Checks FastAPI backend status and updates status badge.
 */
async function checkBackendHealth() {
    const status = await checkHealth();
    AppState.isBackendOnline = status.online;
    updateSystemStatus(status.online, status.message);
}

/**
 * Loads news articles from API/Mock and updates UI.
 * Supports real-time News API queries when News API Key is configured.
 */
async function loadNewsData() {
    const result = await fetchNews({
        category: AppState.selectedCategory,
        region: AppState.selectedRegion,
        search: AppState.searchQuery,
        newsApiKey: AppState.newsApiKey
    });
    if (result && result.success) {
        AppState.allArticles = result.data;
        updateDashboardAndExplorer();
    } else {
        const errorContainer = document.getElementById('error-state');
        renderErrorState(errorContainer, 'news_failure', () => loadNewsData());
    }
}

/**
 * Filters articles according to current AppState and updates view.
 */
function updateDashboardAndExplorer() {
    const container = document.getElementById('articles-container');
    const emptyState = document.getElementById('empty-state');
    const counter = document.getElementById('results-counter');
    const savedTabBtn = document.getElementById('btn-saved-articles');

    // Update Saved Tab Count Label
    if (savedTabBtn) {
        savedTabBtn.textContent = `★ Saved (${AppState.savedArticleIds.length})`;
    }

    // Filter & Sort
    AppState.filteredArticles = filterAndSortArticles(
        AppState.allArticles,
        AppState.selectedCategory,
        AppState.searchQuery,
        AppState.sortBy,
        AppState.selectedRegion,
        AppState.showSavedOnly,
        AppState.savedArticleIds
    );

    // Update Counter
    if (counter) {
        if (AppState.showSavedOnly) {
            counter.innerHTML = `Showing <strong>${AppState.filteredArticles.length}</strong> saved articles`;
        } else {
            const liveBadge = AppState.newsApiKey ? ` <span class="badge-live-tag">📰 Real-Time News API</span>` : '';
            counter.innerHTML = `Showing <strong>${AppState.filteredArticles.length}</strong> of ${AppState.allArticles.length} stories${liveBadge}`;
        }
    }

    // Render Cards or Empty State
    if (AppState.filteredArticles.length === 0) {
        if (container) container.innerHTML = '';
        if (emptyState) {
            emptyState.classList.remove('hidden');
            const emptyTitle = emptyState.querySelector('h3');
            const emptyDesc = emptyState.querySelector('p');
            if (AppState.showSavedOnly) {
                if (emptyTitle) emptyTitle.textContent = "No saved articles yet";
                if (emptyDesc) emptyDesc.textContent = "Click the '☆ Save' button on any article card to bookmark financial stories here.";
            } else {
                if (emptyTitle) emptyTitle.textContent = "No financial stories match your search";
                if (emptyDesc) emptyDesc.textContent = "Try searching another company (e.g. Apple, Tata Motors), stock, topic, or clear your search filters.";
            }
        }
    } else {
        if (emptyState) emptyState.classList.add('hidden');
        renderArticles(container, AppState.filteredArticles, AppState.savedArticleIds);
    }

    // Update Dashboard Stats & Financial Brief
    renderStatCards({
        latestCount: AppState.allArticles.length,
        summariesCount: AppState.allArticles.length,
        lastUpdated: 'Just now'
    }, AppState.allArticles);
}

/**
 * Binds all interactive UI event listeners.
 */
let searchDebounceTimer = null;

function setupEventListeners() {
    // --- 1. Fetch & Simplify Action Buttons ---
    const fetchMainBtn = document.getElementById('btn-fetch-main');
    const fetchHeroBtn = document.getElementById('btn-hero-fetch');
    const refreshNavBtn = document.getElementById('btn-refresh-nav');

    const handleFetchAction = () => {
        runMultiStageLoading(async () => {
            await loadNewsData();
            const explorerSection = document.getElementById('explorer');
            if (explorerSection) {
                explorerSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    };

    if (fetchMainBtn) fetchMainBtn.addEventListener('click', handleFetchAction);
    if (fetchHeroBtn) fetchHeroBtn.addEventListener('click', handleFetchAction);
    if (refreshNavBtn) refreshNavBtn.addEventListener('click', handleFetchAction);

    // --- 2. Category Filter Buttons ---
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            AppState.showSavedOnly = false;
            
            const savedTabBtn = document.getElementById('btn-saved-articles');
            if (savedTabBtn) savedTabBtn.classList.remove('active');

            categoryBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            AppState.selectedCategory = btn.getAttribute('data-category');
            
            if (AppState.newsApiKey) {
                await loadNewsData();
            } else {
                updateDashboardAndExplorer();
            }
        });
    });

    // Saved Articles Filter Tab
    const savedTabBtn = document.getElementById('btn-saved-articles');
    if (savedTabBtn) {
        savedTabBtn.addEventListener('click', () => {
            AppState.showSavedOnly = !AppState.showSavedOnly;
            
            if (AppState.showSavedOnly) {
                savedTabBtn.classList.add('active');
                categoryBtns.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
            } else {
                savedTabBtn.classList.remove('active');
                categoryBtns.forEach(b => {
                    if (b.getAttribute('data-category') === 'ALL') {
                        b.classList.add('active');
                        b.setAttribute('aria-selected', 'true');
                    }
                });
                AppState.selectedCategory = 'ALL';
            }
            updateDashboardAndExplorer();
        });
    }

    // --- 3. Region Switch (India / Global / All) ---
    const regionBtns = document.querySelectorAll('.region-btn');
    regionBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            regionBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.selectedRegion = btn.getAttribute('data-region') || 'all';
            
            if (AppState.newsApiKey) {
                await loadNewsData();
            } else {
                updateDashboardAndExplorer();
            }
        });
    });

    // --- 4. Search Input, Chips & Clear ---
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            AppState.searchQuery = e.target.value;
            
            if (clearSearchBtn) {
                if (e.target.value.length > 0) {
                    clearSearchBtn.classList.remove('hidden');
                } else {
                    clearSearchBtn.classList.add('hidden');
                }
            }

            if (AppState.newsApiKey) {
                clearTimeout(searchDebounceTimer);
                searchDebounceTimer = setTimeout(() => {
                    loadNewsData();
                }, 400);
            } else {
                updateDashboardAndExplorer();
            }
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', async () => {
            if (searchInput) searchInput.value = '';
            AppState.searchQuery = '';
            clearSearchBtn.classList.add('hidden');
            
            if (AppState.newsApiKey) {
                await loadNewsData();
            } else {
                updateDashboardAndExplorer();
            }
        });
    }

    // Search Example Chips
    const searchChips = document.querySelectorAll('.search-example-chip');
    searchChips.forEach(chip => {
        chip.addEventListener('click', async () => {
            const keyword = chip.getAttribute('data-query');
            if (keyword && searchInput) {
                searchInput.value = keyword;
                AppState.searchQuery = keyword;
                if (clearSearchBtn) clearSearchBtn.classList.remove('hidden');
                
                if (AppState.newsApiKey) {
                    await loadNewsData();
                } else {
                    updateDashboardAndExplorer();
                }

                const explorerSection = document.getElementById('explorer');
                if (explorerSection) {
                    explorerSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });


    // Reset Filters from Empty State
    const resetFiltersBtn = document.getElementById('btn-reset-filters');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            AppState.searchQuery = '';
            AppState.selectedCategory = 'ALL';
            AppState.selectedRegion = 'all';
            AppState.showSavedOnly = false;

            if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
            if (savedTabBtn) savedTabBtn.classList.remove('active');

            categoryBtns.forEach(b => {
                const cat = b.getAttribute('data-category');
                if (cat === 'ALL') {
                    b.classList.add('active');
                    b.setAttribute('aria-selected', 'true');
                } else {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                }
            });

            regionBtns.forEach(b => {
                if (b.getAttribute('data-region') === 'all') b.classList.add('active');
                else b.classList.remove('active');
            });

            updateDashboardAndExplorer();
        });
    }

    // --- 5. Sort Dropdown ---
    const sortDropdown = document.getElementById('sort-dropdown');
    if (sortDropdown) {
        sortDropdown.addEventListener('change', (e) => {
            AppState.sortBy = e.target.value;
            updateDashboardAndExplorer();
        });
    }

    // --- 6. Card Click Delegation (Read More, Explain, Save) ---
    const container = document.getElementById('articles-container');
    if (container) {
        container.addEventListener('click', (e) => {
            // Read More / View Explanation Button Click
            const viewBtn = e.target.closest('.btn-view-explanation');
            if (viewBtn) {
                const articleId = Number(viewBtn.getAttribute('data-id'));
                const article = AppState.allArticles.find(a => Number(a.id) === articleId);
                if (article) {
                    addRecentlyViewed(articleId);
                    const isSaved = AppState.savedArticleIds.includes(articleId);
                    openModal(article, AppState.allArticles, isSaved);
                }
                return;
            }

            // Quick Explain Button Click
            const explainBtn = e.target.closest('.btn-explain-quick');
            if (explainBtn) {
                const articleId = Number(explainBtn.getAttribute('data-id'));
                const article = AppState.allArticles.find(a => Number(a.id) === articleId);
                if (article) {
                    const firstTerm = article.terms && article.terms.length > 0 ? article.terms[0] : null;
                    if (firstTerm) {
                        showTermTooltip(explainBtn, firstTerm.name, firstTerm.explanation);
                    } else {
                        showTermTooltip(explainBtn, "AI Explanation", article.summary);
                    }
                }
                return;
            }

            // Save / Bookmark Button Click
            const saveBtn = e.target.closest('.btn-toggle-save');
            if (saveBtn) {
                const articleId = Number(saveBtn.getAttribute('data-id'));
                toggleSaveArticle(articleId);
                return;
            }

            // Financial Term Chip Click
            const termChip = e.target.closest('.term-chip');
            if (termChip) {
                const name = termChip.getAttribute('data-term-name');
                const exp = termChip.getAttribute('data-term-exp');
                showTermTooltip(termChip, name, exp);
            }
        });
    }

    // --- 7. Modal Actions & Ask AI Events ---
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalDismissBtn = document.getElementById('modal-dismiss-btn');
    const modalBackdrop = document.getElementById('article-modal');
    const modalSaveBtn = document.getElementById('modal-save-btn');

    // Original vs AI Simplified View Toggle Tabs
    const tabAiBtn = document.getElementById('btn-modal-tab-ai');
    const tabOriginalBtn = document.getElementById('btn-modal-tab-original');
    const modalAiBox = document.getElementById('modal-ai-box');
    const modalOriginalBox = document.getElementById('modal-original-box');

    if (tabAiBtn && tabOriginalBtn && modalAiBox && modalOriginalBox) {
        tabAiBtn.addEventListener('click', () => {
            tabAiBtn.classList.add('active');
            tabOriginalBtn.classList.remove('active');
            modalAiBox.classList.remove('hidden');
            modalOriginalBox.classList.add('hidden');
        });

        tabOriginalBtn.addEventListener('click', () => {
            tabOriginalBtn.classList.add('active');
            tabAiBtn.classList.remove('active');
            modalOriginalBox.classList.remove('hidden');
            modalAiBox.classList.add('hidden');
        });
    }

    // Explain Like I'm... Audience Selector Chips
    const audienceChips = document.querySelectorAll('.audience-chip');
    audienceChips.forEach(chip => {
        chip.addEventListener('click', () => {
            audienceChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            const level = chip.getAttribute('data-level') || 'beginner';
            const modal = document.getElementById('article-modal');
            const currentId = Number(modal.getAttribute('data-current-id'));
            const article = AppState.allArticles.find(a => Number(a.id) === currentId);
            if (article && typeof updateAudienceExplanation === 'function') {
                updateAudienceExplanation(article, level);
            }
        });
    });

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalDismissBtn) modalDismissBtn.addEventListener('click', closeModal);

    if (modalSaveBtn) {
        modalSaveBtn.addEventListener('click', () => {
            const modal = document.getElementById('article-modal');
            const currentId = Number(modal.getAttribute('data-current-id'));
            if (currentId) {
                toggleSaveArticle(currentId);
                const isSaved = AppState.savedArticleIds.includes(currentId);
                modalSaveBtn.textContent = isSaved ? '★ Saved' : '☆ Save Article';
                modalSaveBtn.className = `btn btn-secondary ${isSaved ? 'saved' : ''}`;
            }
        });
    }

    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            // Click related article inside modal
            const relatedCard = e.target.closest('.related-article-card');
            if (relatedCard) {
                const relatedId = Number(relatedCard.getAttribute('data-id'));
                const article = AppState.allArticles.find(a => Number(a.id) === relatedId);
                if (article) {
                    addRecentlyViewed(relatedId);
                    const isSaved = AppState.savedArticleIds.includes(relatedId);
                    openModal(article, AppState.allArticles, isSaved);
                }
                return;
            }

            if (e.target === modalBackdrop) {
                closeModal();
            }
        });
    }

    // Ask AI Section inside Modal
    const askAiSubmitBtn = document.getElementById('btn-ask-ai-submit');
    const askAiInput = document.getElementById('ask-ai-input');
    const askAiChips = document.querySelectorAll('.ask-ai-chip');

    const triggerAskAI = (question) => {
        if (!question || question.trim().length === 0) return;
        const modal = document.getElementById('article-modal');
        const currentId = Number(modal.getAttribute('data-current-id'));
        const article = AppState.allArticles.find(a => Number(a.id) === currentId);
        if (article) {
            handleAskAIQuestion(question, article);
        }
    };

    if (askAiSubmitBtn && askAiInput) {
        askAiSubmitBtn.addEventListener('click', () => {
            triggerAskAI(askAiInput.value);
        });

        askAiInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                triggerAskAI(askAiInput.value);
            }
        });
    }

    askAiChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const promptText = chip.getAttribute('data-prompt') || chip.textContent;
            if (askAiInput) askAiInput.value = promptText;
            triggerAskAI(promptText);
        });
    });

    // Keyboard & Tooltip dismiss
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            hideTermTooltip();
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.term-chip') && !e.target.closest('.term-tooltip-popover') && !e.target.closest('.btn-explain-quick')) {
            hideTermTooltip();
        }
    });

    // Mobile Nav Drawer Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            const isActive = navMenu.classList.toggle('active');
            mobileToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        });

        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // --- 8. API Keys Modal & Chatbook AI Assistant Event Listeners ---
    const btnOpenApiKeys = document.getElementById('btn-open-api-keys-modal');
    const apiKeysModal = document.getElementById('api-keys-modal');
    const btnCloseApiKeys = document.getElementById('btn-close-api-keys-modal');
    const btnCloseApiKeysX = document.getElementById('api-keys-modal-close-btn');
    const btnSaveApiKeys = document.getElementById('btn-save-api-keys');
    const btnClearApiKeys = document.getElementById('btn-clear-api-keys');

    const inputGeminiKey = document.getElementById('input-gemini-key');
    const inputNewsKey = document.getElementById('input-news-key');
    const apiKeysStatusMsg = document.getElementById('api-keys-status-msg');

    const openApiKeysModal = () => {
        if (!apiKeysModal) return;
        if (inputGeminiKey) inputGeminiKey.value = AppState.geminiApiKey || '';
        if (inputNewsKey) inputNewsKey.value = AppState.newsApiKey || '';
        apiKeysModal.classList.remove('hidden');
    };

    const closeApiKeysModal = () => {
        if (apiKeysModal) apiKeysModal.classList.add('hidden');
    };

    if (btnOpenApiKeys) btnOpenApiKeys.addEventListener('click', openApiKeysModal);
    if (btnCloseApiKeys) btnCloseApiKeys.addEventListener('click', closeApiKeysModal);
    if (btnCloseApiKeysX) btnCloseApiKeysX.addEventListener('click', closeApiKeysModal);

    if (apiKeysModal) {
        apiKeysModal.addEventListener('click', (e) => {
            if (e.target === apiKeysModal) closeApiKeysModal();
        });
    }

    if (btnSaveApiKeys) {
        btnSaveApiKeys.addEventListener('click', () => {
            const geminiVal = inputGeminiKey ? inputGeminiKey.value.trim() : '';
            const newsVal = inputNewsKey ? inputNewsKey.value.trim() : '';

            AppState.geminiApiKey = geminiVal;
            AppState.newsApiKey = newsVal;

            localStorage.setItem('finnews_gemini_key', geminiVal);
            localStorage.setItem('finnews_news_key', newsVal);

            updateChatbookModelBadge();

            if (apiKeysStatusMsg) {
                apiKeysStatusMsg.innerHTML = '✅ API Keys saved successfully! Chatbook is now connected.';
                apiKeysStatusMsg.style.color = '#16A34A';
            }

            setTimeout(() => {
                closeApiKeysModal();
                if (apiKeysStatusMsg) {
                    apiKeysStatusMsg.innerHTML = '🔒 API keys are stored locally in your browser session or securely processed via your backend API.';
                    apiKeysStatusMsg.style.color = 'inherit';
                }
            }, 1200);
        });
    }

    if (btnClearApiKeys) {
        btnClearApiKeys.addEventListener('click', () => {
            AppState.geminiApiKey = '';
            AppState.newsApiKey = '';
            if (inputGeminiKey) inputGeminiKey.value = '';
            if (inputNewsKey) inputNewsKey.value = '';

            localStorage.removeItem('finnews_gemini_key');
            localStorage.removeItem('finnews_news_key');

            updateChatbookModelBadge();

            if (apiKeysStatusMsg) {
                apiKeysStatusMsg.innerHTML = '🗑️ Saved API keys cleared.';
                apiKeysStatusMsg.style.color = '#DC2626';
            }
        });
    }

    // Chatbook AI Submission
    const chatbookInput = document.getElementById('chatbook-input');
    const chatbookSendBtn = document.getElementById('btn-chatbook-send');
    const chatbookPromptChips = document.querySelectorAll('.chatbook-prompt-chip');
    const floatingChatbookBtn = document.getElementById('floating-chatbook-btn');

    const handleChatbookSubmit = async (userText) => {
        const query = userText || (chatbookInput ? chatbookInput.value : '');
        if (!query || query.trim().length === 0) return;

        // 1. Append user message
        appendChatbookMessage('user', query);
        if (chatbookInput) chatbookInput.value = '';

        // 2. Show typing indicator
        if (typeof showChatbookTyping === 'function') {
            showChatbookTyping();
        }

        // 3. Call Gemini & News API chatbot service
        const response = await sendChatMessage(query, {
            geminiApiKey: AppState.geminiApiKey,
            newsApiKey: AppState.newsApiKey,
            articles: AppState.allArticles
        });

        // 4. Remove typing indicator & render reply
        if (typeof removeChatbookTyping === 'function') {
            removeChatbookTyping();
        }

        if (response && response.reply) {
            appendChatbookMessage('ai', response.reply, {
                sources: response.sources,
                modelUsed: response.modelUsed
            });
        }
    };

    if (chatbookSendBtn && chatbookInput) {
        chatbookSendBtn.addEventListener('click', () => {
            handleChatbookSubmit();
        });

        chatbookInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleChatbookSubmit();
            }
        });
    }

    chatbookPromptChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const prompt = chip.getAttribute('data-prompt') || chip.textContent;
            handleChatbookSubmit(prompt);
        });
    });

    if (floatingChatbookBtn) {
        floatingChatbookBtn.addEventListener('click', () => {
            const chatbookSection = document.getElementById('chatbook');
            if (chatbookSection) {
                chatbookSection.scrollIntoView({ behavior: 'smooth' });
                if (chatbookInput) {
                    setTimeout(() => chatbookInput.focus(), 600);
                }
            }
        });
    }
}


/**
 * Toggles Bookmark Save Status for an Article
 */
function toggleSaveArticle(articleId) {
    const idNum = Number(articleId);
    if (AppState.savedArticleIds.includes(idNum)) {
        AppState.savedArticleIds = AppState.savedArticleIds.filter(i => i !== idNum);
    } else {
        AppState.savedArticleIds.push(idNum);
    }
    saveSavedArticlesToStorage();
    updateDashboardAndExplorer();
}
