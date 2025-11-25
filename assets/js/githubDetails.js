async function fetchRepoStats() {
  const repo = 'spy235/playwright-framework';
  const apiBase = 'https://api.github.com/repos/' + repo;

  // Fetch repo metadata
  const repoRes = await fetch(apiBase);
  const repoData = await repoRes.json();

  // Last updated time (ISO → readable)
  const lastUpdated = new Date(repoData.pushed_at).toLocaleString();

  // Get languages
  const langRes = await fetch(apiBase + '/languages');
  const languages = await langRes.json();
  const languageList = Object.keys(languages)
    .map(lang => `${lang} (${Math.round((languages[lang] /
      Object.values(languages).reduce((a,b)=>a+b)) * 100)}%)`)
    .join(', ');

  // Get commit count (approx)
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

  // Inject into page
  document.getElementById("last-updated").textContent = lastUpdated;
  document.getElementById("commit-count").textContent = commitCount;
  document.getElementById("language-list").textContent = languageList;
}

fetchRepoStats();
