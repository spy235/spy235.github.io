async function fetchRepoStats(repo, prefix) {
  const apiBase = 'https://api.github.com/repos/' + repo;

  try {
    // Fetch repo metadata
    const repoRes = await fetch(apiBase);
    const repoData = await repoRes.json();

    // Last updated timestamp
    const lastUpdated = new Date(repoData.pushed_at).toLocaleString();

    // Fetch languages
    const langRes = await fetch(apiBase + '/languages');
    const languages = await langRes.json();
    const total = Object.values(languages).reduce((a,b)=>a+b, 0);

    const languageList = Object.keys(languages)
      .map(lang =>
        `${lang} (${Math.round((languages[lang] / total) * 100)}%)`
      )
      .join(', ');

    // Commit count (approx by last page)
    const commitsRes = await fetch(apiBase + '/commits?per_page=1');
    const linkHeader = commitsRes.headers.get('Link');
    let commitCount = 'unknown';

    if (linkHeader) {
      const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
      if (match) commitCount = match[1];
    } else {
      const commitsList = await commitsRes.json();
      commitCount = commitsList.length;
    }

    // Insert into DOM
    document.getElementById(`${prefix}-last-updated`).textContent = lastUpdated;
    document.getElementById(`${prefix}-commit-count`).textContent = commitCount;
    document.getElementById(`${prefix}-language-list`).textContent = languageList;

  } catch (err) {
    console.error('Error fetching repo stats:', err);
  }
}

// Fetch for both repositories
fetchRepoStats('spy235/playwright-framework', 'pw');
fetchRepoStats('spy235/Selenium-Framework', 'sel');
