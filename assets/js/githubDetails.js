async function loadFrameworkRepos() {
    const username = "spy235";
    const listEl = document.getElementById("repo-list");

    try {
        // Fetch all repositories of the user
        const res = await fetch(`https://api.github.com/users/${username}/repos`);
        const repos = await res.json();

        // Filter only repos containing "framework"
        const frameworkRepos = repos.filter(r =>
            r.name.toLowerCase().includes("framework")
        );

        // If no repo found
        if (frameworkRepos.length === 0) {
            listEl.innerHTML = "<li>No Framework repositories found.</li>";
            return;
        }

        // Clear loading text
        listEl.innerHTML = "";

        // Build repo cards dynamically
        frameworkRepos.forEach(async repo => {

            const apiBase = repo.url;

            // Fetch languages
            const langRes = await fetch(apiBase + "/languages");
            const languages = await langRes.json();
            const total = Object.values(languages).reduce((a, b) => a + b, 0);

            const langFormatted = Object.keys(languages).map(lang => {
                const pct = Math.round((languages[lang] / total) * 100);
                return `${lang} (${pct}%)`;
            }).join(", ");

            // Fetch commit count using pagination
            const commitRes = await fetch(`${repo.url}/commits?per_page=1`);
            const link = commitRes.headers.get("Link");
            let commitCount = "?";

            if (link) {
                const match = link.match(/&page=(\d+)>; rel="last"/);
                if (match) commitCount = match[1];
            }

            // Create UI element
            const li = document.createElement("li");
            li.innerHTML = `
                <h4><a href="${repo.html_url}" target="_blank">${repo.name}</a></h4>
                <p>${repo.description || "No description available."}</p>

                <ul>
                    <li><strong>Last updated:</strong> <span style="color: yellow;">${new Date(repo.pushed_at).toLocaleString()}</span></li>
                    <li><strong>Commits:</strong> <span style="color: yellow;">${commitCount}</span></li>
                    <li><strong>Languages:</strong> <span style="color: yellow;">${langFormatted}</span></li>
                </ul>
            `;

            listEl.appendChild(li);
        });

    } catch (error) {
        console.error("Error loading repos:", error);
        listEl.innerHTML = "<li>Error fetching repository data.</li>";
    }
}

// Auto run on page load
loadFrameworkRepos();
