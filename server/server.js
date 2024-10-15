const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Scrape multiple websites
app.post('/scrape-durations', async (req, res) => {
    const urls = req.body.urls; // Expecting an array of URLs

    if (!Array.isArray(urls)) {
        return res.status(400).json({ error: 'URLs must be provided as an array' });
    }

    try {
        const scrapePromises = urls.map(async (url) => {
            try {
                const response = await axios.get(url);

                // Check if we are getting an HTML response (instead of JSON or other expected format)
                if (!response.headers['content-type'].includes('text/html')) {
                    return { url, error: 'Expected HTML but received another content type' };
                }

                const html = response.data;
                const $ = cheerio.load(html);

                const durationElement = $('#main > div > div.th-content-container_main > div.th-hidden-800 > div > div:nth-child(7) > span:nth-child(2)').text();

                if (!durationElement) {
                    return { url, error: 'Duration element not found on the page' };
                }

                return { duration: durationElement };
            } catch (error) {
                // Handle errors such as network issues or 4xx/5xx responses
                console.error(`Error scraping ${url}:`, error.message);
                return { url, error: 'Failed to scrape this URL. ' + error.message };
            }
        });

        const results = await Promise.all(scrapePromises);
        res.json(results);

    } catch (error) {
        console.error('Error during scraping:', error);
        res.status(500).json({ error: 'An error occurred while scraping' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
