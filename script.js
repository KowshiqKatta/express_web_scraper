document.getElementById('scrape-button').addEventListener('click', async () => {
    const links = document.getElementById('links').value.split('\n');
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    for (const link of links) {
        if (link) {
            const duration = await getDuration(link.trim());
            const resultItem = document.createElement('div');
            resultItem.textContent = `${link}: ${duration}`;
            resultsDiv.appendChild(resultItem);
        }
    }
});

async function getDuration(url) {
    try {
        const response = await fetch(`${url}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.duration || 'Duration not found.';
    } catch (error) {
        return `Error: ${error.message}`;
    }
}
