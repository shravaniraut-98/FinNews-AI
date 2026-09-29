/**
 * FINNEWS AI - Filters & Search Module
 * Handles category filtering, keyword search, region selection, saved articles, and sorting.
 */

/**
 * Filters and sorts articles based on user inputs.
 * 
 * @param {Array} articles - Array of article objects
 * @param {string} category - Selected category filter ('All', 'Markets', 'Banking', etc.)
 * @param {string} searchQuery - Search input string
 * @param {string} sortBy - Sort order ('latest', 'oldest', 'relevant')
 * @param {string} region - Region selection ('all', 'India', 'Global')
 * @param {boolean} showSavedOnly - Flag to filter only saved bookmarked articles
 * @param {Array} savedIds - Array of saved article IDs
 * @returns {Array} - Processed array of matching articles
 */
function filterAndSortArticles(articles, category = 'All', searchQuery = '', sortBy = 'latest', region = 'all', showSavedOnly = false, savedIds = []) {
    if (!articles || !Array.isArray(articles)) {
        return [];
    }

    let result = [...articles];

    // 1. Saved Articles Only Filter
    if (showSavedOnly) {
        result = result.filter(article => savedIds.includes(Number(article.id)));
    }

    // 2. Region Filtering
    if (region && region.toLowerCase() !== 'all') {
        const regLower = region.toLowerCase().trim();
        result = result.filter(article => 
            article.region && article.region.toLowerCase() === regLower
        );
    }

    // 3. Category Filtering with Smart Aliasing
    if (category && category.toUpperCase() !== 'ALL') {
        const catUpper = category.toUpperCase().trim();
        result = result.filter(article => {
            if (!article.category) return true;
            const articleCat = article.category.toUpperCase().trim();
            const articleRegion = (article.region || '').toUpperCase().trim();

            if (catUpper === 'GLOBAL') {
                return articleRegion === 'GLOBAL' || articleCat === 'GLOBAL';
            }
            if (catUpper === 'MARKETS') {
                return ['BANKING', 'ECONOMY', 'MARKETS', 'FINANCE'].includes(articleCat);
            }
            if (catUpper === 'BUSINESS') {
                return ['BUSINESS', 'ECONOMY', 'AUTOMOTIVE', 'PHARMA', 'TECHNOLOGY'].includes(articleCat);
            }
            return articleCat === catUpper || articleCat.includes(catUpper) || catUpper.includes(articleCat);
        });
    }

    // 4. Keyword Search
    if (searchQuery && searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        
        const strictMatches = result.filter(article => {
            const titleMatch = article.title && article.title.toLowerCase().includes(query);
            const descMatch = article.description && article.description.toLowerCase().includes(query);
            const sourceMatch = article.source && article.source.toLowerCase().includes(query);
            const catMatch = article.category && article.category.toLowerCase().includes(query);
            const summaryMatch = article.summary && article.summary.toLowerCase().includes(query);
            const whatMatch = article.whatHappened && article.whatHappened.toLowerCase().includes(query);
            const whyMatch = article.whyItMatters && article.whyItMatters.toLowerCase().includes(query);
            const whoMatch = article.whoIsAffected && article.whoIsAffected.toLowerCase().includes(query);
            
            const takeawayMatch = article.keyTakeaways && article.keyTakeaways.some(t => 
                t && t.toLowerCase().includes(query)
            );

            const termMatch = article.terms && article.terms.some(t => 
                (t.name && t.name.toLowerCase().includes(query)) ||
                (t.explanation && t.explanation.toLowerCase().includes(query))
            );

            return titleMatch || descMatch || sourceMatch || catMatch || summaryMatch || whatMatch || whyMatch || whoMatch || takeawayMatch || termMatch;
        });

        // If strict filter yielded matches, use them; otherwise fallback to broader searching across all articles
        if (strictMatches.length > 0) {
            result = strictMatches;
        } else {
            // Broad search across all articles ignoring strict category filter
            result = articles.filter(article => {
                const fullText = `${article.title} ${article.description} ${article.summary} ${article.category}`.toLowerCase();
                return query.split(/\s+/).some(word => word.length > 2 && fullText.includes(word));
            });
        }
    }


    // 5. Sorting
    result.sort((a, b) => {
        if (sortBy === 'oldest') {
            return Number(a.id) - Number(b.id);
        } else if (sortBy === 'relevant') {
            // Relevancy ranking heuristic
            if (searchQuery && searchQuery.trim().length > 0) {
                const q = searchQuery.toLowerCase().trim();
                const aTitleMatch = a.title && a.title.toLowerCase().includes(q) ? 3 : 0;
                const bTitleMatch = b.title && b.title.toLowerCase().includes(q) ? 3 : 0;
                const aImp = a.importance === 'High' ? 2 : (a.importance === 'Medium' ? 1 : 0);
                const bImp = b.importance === 'High' ? 2 : (b.importance === 'Medium' ? 1 : 0);
                return (bTitleMatch + bImp) - (aTitleMatch + aImp);
            }
            return Number(b.id) - Number(a.id);
        } else {
            // 'latest' default
            return Number(b.id) - Number(a.id);
        }
    });

    return result;
}
