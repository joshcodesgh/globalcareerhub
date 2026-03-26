// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Use CORS to allow requests from your frontend
app.use(cors());

// --- Server-Side Job Fetchers ---

async function fetchFindworkJobs() {
    const findworkToken = process.env.FINDWORK_TOKEN;
    if (!findworkToken) return [];

    try {
        const response = await axios.get('https://findwork.dev/api/jobs/', {
            headers: { 'Authorization': `Token ${findworkToken}` }
        });
        return response.data.results.map(job => ({
            title: job.role,
            company: job.company_name,
            location: job.location || (job.remote ? 'Remote' : 'Not specified'),
            type: job.employment_type,
            salary: (job.salary && job.salary.min_value) ? `$${job.salary.min_value} - $${job.salary.max_value}` : "Competitive",
            url: job.url,
            badge: "Findwork"
        }));
    } catch (error) {
        console.error('Findwork.dev Error:', error.message);
        return [];
    }
}

async function fetchRemotiveJobs() {
    try {
        const response = await axios.get('https://remotive.com/api/remote-jobs');
        return response.data.jobs.map(job => ({
            title: job.title,
            company: job.company_name,
            location: job.candidate_required_location,
            type: job.job_type ? job.job_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Varies',
            salary: job.salary || "Not Disclosed",
            url: job.url,
            badge: "Remotive"
        }));
    } catch (error) {
        console.error('Remotive Error:', error.message);
        return [];
    }
}

async function fetchRemoteOkJobs() {
    try {
        const response = await axios.get('https://remoteok.com/api');
        return response.data.slice(1).map(job => {
            let salaryDisplay = "Competitive";
            if (job.salary_min && job.salary_max) salaryDisplay = `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`;
            return {
                title: job.position,
                company: job.company,
                location: job.location || 'Remote',
                type: "Varies",
                salary: salaryDisplay,
                url: job.url,
                badge: "RemoteOK"
            };
        });
    } catch (error) {
        console.error('RemoteOK Error:', error.message);
        return [];
    }
}

// --- API Endpoints ---

app.get('/api/jobs', async (req, res) => {
    console.log("Received request for /api/jobs");
    const jobPromises = [
        fetchFindworkJobs(),
        fetchRemotiveJobs(),
        fetchRemoteOkJobs()
    ];

    const results = await Promise.allSettled(jobPromises);

    let allJobs = [];
    results.forEach(result => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
            allJobs = allJobs.concat(result.value);
        } else if (result.status === 'rejected') {
            console.error('A job source failed to load:', result.reason);
        }
    });

    // Shuffle the jobs so sources are mixed
    allJobs.sort(() => Math.random() - 0.5);

    res.json(allJobs);
});

app.get('/api/news', async (req, res) => {
    console.log("Received request for /api/news");
    const apiKey = process.env.WORLD_NEWS_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "News API key not configured." });
    }

    try {
        const url = `https://api.worldnewsapi.com/search-news?text=jobs+technology&language=en&number=45&api-key=${apiKey}`;
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('World News API Error:', error.message);
        res.status(500).json({ error: "Failed to fetch news." });
    }
});


app.listen(PORT, () => {
    console.log(`✅ Global Career Hub backend is running on http://localhost:${PORT}`);
    console.log("Waiting for requests from the frontend...");
});