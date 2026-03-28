// Logic: Load jobs into the HTML
const jobsContainer = document.getElementById('jobs');
const newsContainer = document.getElementById('news-container');

// --- API CONFIGURATION ---
// WARNING: Keys are visible in frontend-only mode.
const FINDWORK_TOKEN = '69d926c1efac94d21b71312a139f02230ffe6127';
const WORLD_NEWS_API_KEY = '3aa0ad6044cc4351b2cdd966f0015659';
const REQUEST_TIMEOUT = 30000; // Increased to 30 seconds for slow proxies

const PROXY_URL = 'https://api.allorigins.win/raw?url=';

const loadingPlaceholder = `
        <div id="loading-notice" style="text-align:center; padding: 20px 20px 0 20px;">
            <p style="font-size: 1.2rem; color: #333;">Loading latest jobs from our sources...</p>
            <p style="color: #666;">The server may take a moment to wake up. While you wait, check these platforms:</p>
        </div>`;

async function loadJobs() {
    if (!jobsContainer) return; // Stop if we are on a page without the jobs list

    // Show a loading message and visa sponsorship platforms while fetching
    jobsContainer.innerHTML = `
        ${loadingPlaceholder}
        <div class="jobs-grid">
            
            <div class="job-card">
                <h3>LinkedIn</h3>
                <p>Use the job search filters to find roles offering "visa sponsorship" from companies worldwide.</p>
                <a href="https://www.linkedin.com/jobs/" target="_blank" rel="noopener noreferrer" class="apply-btn">Visit LinkedIn</a>
            </div>

            <div class="job-card">
                <h3>Relocate.me</h3>
                <p>A specialized job board for tech professionals seeking jobs with relocation and visa support.</p>
                <a href="https://relocate.me/" target="_blank" rel="noopener noreferrer" class="apply-btn">Visit Relocate.me</a>
            </div>

            <div class="job-card">
                <h3>Hired</h3>
                <p>A platform where companies apply to you, often including relocation packages for tech talent.</p>
                <a href="https://hired.com/" target="_blank" rel="noopener noreferrer" class="apply-btn">Visit Hired</a>
            </div>

            <div class="job-card">
                <h3>EURES</h3>
                <p>The official European Commission portal for job mobility, connecting seekers with employers in Europe.</p>
                <a href="https://ec.europa.eu/eures/" target="_blank" rel="noopener noreferrer" class="apply-btn">Visit EURES</a>
            </div>

            <div class="job-card">
                <h3>Otta</h3>
                <p>A modern job search platform with a specific filter to find tech jobs that sponsor visas.</p>
                <a href="https://otta.com/" target="_blank" rel="noopener noreferrer" class="apply-btn">Visit Otta</a>
            </div>

            <div class="job-card">
                <h3>Wellfound (formerly AngelList)</h3>
                <p>The top platform for startup jobs, many of which are open to international talent.</p>
                <a href="https://wellfound.com/" target="_blank" rel="noopener noreferrer" class="apply-btn">Visit Wellfound</a>
            </div>

            <div class="job-card">
                <h3>Landing.jobs</h3>
                <p>A tech recruitment platform focused on European jobs that frequently offer relocation packages.</p>
                <a href="https://landing.jobs/" target="_blank" rel="noopener noreferrer" class="apply-btn">Visit Landing.jobs</a>
            </div>

            <div class="job-card">
                <h3>Jobbatical</h3>
                <p>Focuses on jobs that come with a full relocation package for a smooth international move.</p>
                <a href="https://jobbatical.com/" target="_blank" rel="noopener noreferrer" class="apply-btn">Visit Jobbatical</a>
            </div>

            <div class="job-card">
                <h3>Indeed Worldwide</h3>
                <p>Use country-specific versions (e.g., indeed.de) and search for "visa sponsorship" as a keyword.</p>
                <a href="https://www.indeed.com/" target="_blank" rel="noopener noreferrer" class="apply-btn">Visit Indeed</a>
            </div>

            <div class="job-card">
                <h3>Glassdoor</h3>
                <p>Search for jobs and check company reviews for insights on their visa sponsorship policies.</p>
                <a href="https://www.glassdoor.com/Job/" target="_blank" rel="noopener noreferrer" class="apply-btn">Visit Glassdoor</a>
            </div>
        </div>
        <div id="aggregated-jobs-list" class="jobs-grid"></div>
        <p id="wait-msg" style="text-align:center; margin-top: 40px; font-weight: bold; color: var(--primary-color);">Our aggregated job list will appear below shortly...</p>
    `;

    const jobListContainer = document.getElementById('aggregated-jobs-list');
    const waitMsg = document.getElementById('wait-msg');

    const fetchAndDisplay = async (fetchFn) => {
        const jobs = await fetchFn();
        if (jobs && jobs.length > 0) {
            // Remove loading UI elements on first successful batch
            const loadingNotice = document.getElementById('loading-notice');
            if (loadingNotice) loadingNotice.remove();
            if (waitMsg) waitMsg.remove();
            
            renderJobs(jobs, jobListContainer);
        }
    };

    // Fire all fetches in parallel - they will update the UI as they resolve
    fetchAndDisplay(fetchFindwork);
    fetchAndDisplay(fetchRemotive);
    fetchAndDisplay(fetchRemoteOK);

    // Fallback: If after 15 seconds nothing has loaded, show a warning
    setTimeout(() => {
        if (jobListContainer && jobListContainer.children.length === 0) {
            if (waitMsg) waitMsg.innerHTML = "Sources are taking longer than usual. Please refresh if jobs don't appear.";
        }
    }, 15000);
}

async function fetchFindwork() {
    if (!FINDWORK_TOKEN || FINDWORK_TOKEN.includes('YOUR_')) return [];
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
        
        const targetUrl = 'https://findwork.dev/api/jobs/';
        const resp = await fetch(`${PROXY_URL}${encodeURIComponent(targetUrl)}`, {
            headers: { 'Authorization': `Token ${FINDWORK_TOKEN}` },
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        const data = await resp.json();
        return data.results.map(job => ({
            title: job.role,
            company: job.company_name,
            location: job.location || 'Remote',
            type: job.employment_type,
            salary: "Competitive",
            url: job.url,
            badge: "Findwork"
        }));
    } catch (e) { return []; }
}

async function fetchRemotive() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        const targetUrl = 'https://remotive.com/api/remote-jobs';
        const resp = await fetch(`${PROXY_URL}${encodeURIComponent(targetUrl)}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await resp.json();
        return data.jobs.map(job => ({
            title: job.title,
            company: job.company_name,
            location: job.candidate_required_location,
            type: "Remote",
            salary: job.salary || "Not Disclosed",
            url: job.url,
            badge: "Remotive"
        }));
    } catch (e) { return []; }
}

async function fetchRemoteOK() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        const targetUrl = 'https://remoteok.com/api';
        const resp = await fetch(`${PROXY_URL}${encodeURIComponent(targetUrl)}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await resp.json();
        return data.slice(1).map(job => ({
            title: job.position,
            company: job.company,
            location: job.location || 'Remote',
            type: "Varies",
            salary: "Competitive",
            url: job.url,
            badge: "RemoteOK"
        }));
    } catch (e) { return []; }
}

// --- Job Renderer ---
function renderJobs(allJobs, container = jobsContainer) {
    if (!container) return;
    
    const fragment = document.createDocumentFragment();

    allJobs.forEach(job => {
        const card = document.createElement('div');
        card.className = 'job-card';
        
        // Security Fix: Use textContent and createElement to prevent XSS
        const h3 = document.createElement('h3');
        h3.textContent = job.title + ' ';
        
        const badge = document.createElement('span');
        badge.style.cssText = "font-size:0.8rem; background:#eee; padding:2px 5px; border-radius:3px;";
        badge.textContent = job.badge;
        h3.appendChild(badge);

        const createDetail = (label, value) => {
            const p = document.createElement('p');
            const strong = document.createElement('strong');
            strong.textContent = label + ': ';
            p.appendChild(strong);
            p.appendChild(document.createTextNode(value || 'N/A'));
            return p;
        };

        const link = document.createElement('a');
        link.href = job.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer"; // Security Fix: Prevent tabnabbing
        link.className = "apply-btn";
        link.textContent = "Apply Now";

        card.appendChild(h3);
        card.appendChild(createDetail('Company', job.company));
        card.appendChild(createDetail('Location', job.location));
        card.appendChild(createDetail('Type', job.type));
        card.appendChild(createDetail('Salary', job.salary));
        card.appendChild(link);
        
        fragment.appendChild(card);
    });
    
    container.appendChild(fragment);
}

// Logic: Load News from World News API
async function loadNews() {
    if (!newsContainer) return; // Stop if we are not on the news page

    if (!WORLD_NEWS_API_KEY || WORLD_NEWS_API_KEY.includes('YOUR_')) {
        console.warn("⚠️ WORLD_NEWS_API_KEY is not set. News section will remain empty.");
        newsContainer.innerHTML = '<p style="text-align:center;">Please configure your News API key to see latest updates.</p>';
        return;
    }

    newsContainer.innerHTML = '<p style="text-align:center;">Loading latest news...</p>';

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        // Reduced count to 10 to save API points and improve speed
        const targetUrl = `https://api.worldnewsapi.com/search-news?text=remote+work+tech&language=en&number=50&api-key=${WORLD_NEWS_API_KEY}`;
        const resp = await fetch(`${PROXY_URL}${encodeURIComponent(targetUrl)}`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (resp.status === 401) throw new Error("Invalid API Key");
        if (resp.status === 402) throw new Error("Daily API Limit Reached");
        if (resp.status === 403) throw new Error("API Access Forbidden");
        if (!resp.ok) throw new Error(`HTTP Error ${resp.status}`);

        const data = await resp.json();
        
        newsContainer.innerHTML = '';

        if (!data.news || data.news.length === 0) {
            newsContainer.innerHTML = '<p style="text-align:center;">No news found at the moment.</p>';
            return;
        }

        const grid = document.createElement('div');
        grid.style.cssText = "display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;";

        data.news.forEach(article => {
            const card = document.createElement('div');
            card.className = 'job-card'; // Reusing job-card style for consistency
            card.style.display = 'flex';
            card.style.flexDirection = 'column';

            if (article.image) {
                const img = document.createElement('img');
                img.src = article.image;
                img.style.cssText = "width:100%; height:150px; object-fit:cover; border-radius:4px; margin-bottom:10px;";
                img.onerror = () => img.style.display = 'none'; // Hide if broken
                card.appendChild(img);
            }

            const h3 = document.createElement('h3');
            h3.textContent = article.title;
            
            const p = document.createElement('p');
            p.textContent = article.text ? article.text.substring(0, 100) + '...' : 'Click to read more.';
            
            const link = document.createElement('a');
            link.href = article.url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.className = "apply-btn";
            link.textContent = "Read Article";
            link.style.marginTop = "auto"; // Push to bottom

            card.appendChild(h3);
            card.appendChild(p);
            card.appendChild(link);
            grid.appendChild(card);
        });
        
        newsContainer.appendChild(grid);

    } catch (error) {
        console.error('News API Error:', error);
        let userMessage = "Could not load news at this moment.";
        
        if (error.message.includes("API Limit") || error.status === 402) {
            userMessage = "News limit reached for today. Please check back tomorrow!";
        } else if (error.message.includes("Forbidden") || error.status === 403) {
            userMessage = "Access denied by News API. Please check if your API key is active and allows requests from your current domain.";
        } else if (error.name === 'AbortError') {
            userMessage = "The news source is taking too long to respond. Please try refreshing.";
        }

        newsContainer.innerHTML = `<p style="text-align:center; color: #666; padding: 20px; border: 1px dashed #ccc; border-radius: 8px;">${userMessage}</p>`;
    }
}

// Cookie Consent Logic
function initCookieBanner() { 
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');

    if (banner && !localStorage.getItem('cookiesAccepted')) { 
        banner.style.display = 'block';
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            banner.style.display = 'none';
        });
    }
}

// Newsletter Validation & AJAX Submission
function initFormspreeAjax() {
    // This targets only forms that are set up to submit to Formspree
    const forms = document.querySelectorAll('form[action*="formspree.io"]');
    forms.forEach(form => {
        const emailInput = form.querySelector('input[name="email"]');
        if (emailInput) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault(); // Prevent default redirect

                const email = emailInput.value.trim();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (!emailRegex.test(email)) {
                    alert('Please enter a valid email address.');
                    emailInput.focus();
                    return;
                }

                // Show loading state
                const button = form.querySelector('button[type="submit"]');
                const originalText = button ? button.textContent : 'Go';
                if (button) {
                    button.textContent = 'Sending...';
                    button.disabled = true;
                }

                try {
                    const response = await fetch(form.action, {
                        method: form.method,
                        body: new FormData(form),
                        headers: { 'Accept': 'application/json' }
                    });

                    if (response.ok) {
                        alert('Submitted successfully! The page will now refresh.');
                        window.location.reload();
                    } else {
                        let errorMessage = 'Oops! There was a problem submitting your form.';
                        try {
                            const data = await response.json();
                            // Formspree returns an 'errors' array for field-specific problems
                            if (data.errors) {
                                errorMessage = data.errors.map(error => error.message).join("\n");
                            } 
                            // It might return a single 'error' for general issues
                            else if (data.error) {
                                errorMessage = data.error;
                            }
                        } catch (e) {
                            // If the response isn't valid JSON, we'll just use the generic error.
                            console.error("Could not parse Formspree error response:", e);
                        }
                        alert(errorMessage);
                    }
                } catch (error) {
                    // If AJAX fails (e.g. network error), fall back to standard redirect
                    console.error("AJAX submission failed, falling back to standard submit:", error);
                    form.submit();
                } finally {
                    if (button) {
                        button.textContent = originalText;
                        button.disabled = false;
                    }
                }
            });
        }
    });
}

// Contact Form (EmailJS) Submission
function initEmailJSContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    // --- Modal Logic for Success Message ---
    const successModal = document.getElementById('success-modal');
    let showSuccessConfirmation = () => alert('Message sent successfully!'); // Fallback

    if (successModal) {
        const closeModalBtn = successModal.querySelector('.close-button');
        const hideModal = () => successModal.classList.remove('visible');
        
        // Overwrite the fallback function with the modal logic
        showSuccessConfirmation = () => successModal.classList.add('visible');

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', hideModal);
        }
        // Also close if user clicks the overlay outside the modal content
        window.addEventListener('click', (event) => {
            if (event.target === successModal) hideModal();
        });
    }
    // --- End Modal Logic ---

    // ⚠️ CRITICAL: The Public Key must match the account owning the Service ID.
    // Find this at: https://dashboard.emailjs.com/admin/account
    emailjs.init({
        publicKey: 'Fdnz8ImnJgqwLeeC0',
    });

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const button = contactForm.querySelector('button[type="submit"]');
        const originalText = button.textContent;
        button.textContent = 'Sending...';
        button.disabled = true;

        // ⚠️ IMPORTANT: You need to add your EmailJS Service ID and Template ID here
        // These are found in your EmailJS dashboard.
        const serviceID = 'service_f1h2o09';
        const templateID = 'template_4jwkvq7';

        emailjs.sendForm(serviceID, templateID, this)
            .then(() => {
                showSuccessConfirmation(); // This will either show the modal or the alert
                contactForm.reset(); 
            }, (err) => {
                let errorMessage = 'Oops! There was a problem sending your message.';

                // Improved error detection for 404 "Account not found"
                if (err && (err.status === 404 || (err.text && err.text.toLowerCase().includes("not found")))) {
                    errorMessage = 'EmailJS Error: Account or Service not found. Please verify your Public Key and Service ID.';
                } else if (err && err.status === 412) {
                    errorMessage = 'Email service authentication failed. Please contact the administrator to reconnect the Gmail API.';
                } else if (err && err.text) {
                    errorMessage = `Error: ${err.text}`;
                }
                alert(errorMessage);
                console.error('EmailJS Error:', err);
            })
            .finally(() => {
                button.textContent = originalText;
                button.disabled = false;
            });
    });
}

// CV Checklist Logic (Resources Page)
function initChecklist() {
    const checkboxes = document.querySelectorAll('.checklist-item input');
    const result = document.getElementById('checklist-result');

    if (checkboxes.length > 0 && result) {
        checkboxes.forEach(box => {
            box.addEventListener('change', () => {
                const allChecked = Array.from(checkboxes).every(cb => cb.checked);
                result.style.display = allChecked ? 'block' : 'none';
            });
        });
    }
}

// Salary Calculator Logic (Resources Page)
function initSalaryCalculator() {
    const hourlyRateInput = document.getElementById('hourly-rate');
    const hoursWeekInput = document.getElementById('hours-week');
    const resultsContainer = document.getElementById('salary-results');

    if (!hourlyRateInput || !hoursWeekInput || !resultsContainer) return;

    const calculateAndDisplay = () => {
        const rate = parseFloat(hourlyRateInput.value) || 0;
        const hours = parseFloat(hoursWeekInput.value) || 0;

        if (rate <= 0 || hours <= 0) {
            resultsContainer.style.display = 'none';
            return;
        }

        const weekly = rate * hours;
        const monthly = weekly * 4.333; // Average weeks in a month
        const annually = monthly * 12;

        // Format as currency (USD)
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(amount);
        };

        resultsContainer.innerHTML = `
            <h4 style="margin-top: 0;">Estimated Earnings:</h4>
            <p><strong>Weekly:</strong> <span>${formatCurrency(weekly)}</span></p>
            <p><strong>Monthly:</strong> <span>${formatCurrency(monthly)}</span></p>
            <p><strong>Annually:</strong> <span>${formatCurrency(annually)}</span></p>
        `;
        resultsContainer.style.display = 'block';
    };

    hourlyRateInput.addEventListener('input', calculateAndDisplay);
    hoursWeekInput.addEventListener('input', calculateAndDisplay);
}

// Donation Form Logic (Donate Page)
function initDonationPage() {
    // --- Copy to Clipboard with User Feedback ---
    // Attached to window to be accessible from the inline onclick attribute
    window.copyToClipboard = function(text, buttonElement) {
        navigator.clipboard.writeText(text).then(() => {
            const originalIcon = buttonElement.innerHTML;
            buttonElement.innerHTML = '<i class="fas fa-check" style="color: green;"></i>';
            setTimeout(() => {
                buttonElement.innerHTML = originalIcon;
            }, 2000); // Revert back to copy icon after 2 seconds
        }).catch(err => {
            console.error('Could not copy text: ', err);
            alert('Failed to copy number.');
        });
    }
}

// Run when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadJobs();
    loadNews();
    initCookieBanner();

    // Initialize form handlers
    initFormspreeAjax(); // For newsletter forms
    initEmailJSContactForm(); // For the contact page form
    initChecklist(); // CV Checklist tool
    initSalaryCalculator(); // Salary Calculator tool
    initDonationPage(); // For the donation page

    // Back to Top Button Logic
    const backToTopButton = document.getElementById("back-to-top");
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                backToTopButton.style.display = "block";
            } else {
                backToTopButton.style.display = "none";
            }
        });
        backToTopButton.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // --- PWA Install Logic ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('Service Worker Registered'));
    }

    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent default browser install prompt
        e.preventDefault();
        deferredPrompt = e;
        // Show our custom install button
        showInstallButton();
    });

    function showInstallButton() {
        // Check if button already exists
        if (document.getElementById('install-pwa-btn')) return;

        const installBtn = document.createElement('button');
        installBtn.id = 'install-pwa-btn';
        installBtn.innerHTML = '<i class="fas fa-download"></i> Install App';
        installBtn.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            z-index: 999;
            background: #004d40;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 50px;
            font-weight: bold;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: inherit;
        `;

        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to install prompt: ${outcome}`);
                deferredPrompt = null;
                installBtn.remove();
            }
        });

        document.body.appendChild(installBtn);
    }

    // --- Fix Broken Images in Success Stories ---
    // If a Wikimedia image fails to load, replace it with an initial avatar
    const storyImages = document.querySelectorAll('.story-img');
    
    const replaceWithAvatar = (img) => {
        img.onerror = null; // Prevent infinite loop
        img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(img.alt)}&size=150&background=random&color=fff&font-size=0.5`;
    };

    storyImages.forEach(img => {
        img.addEventListener('error', () => replaceWithAvatar(img));
        // Check if image is already broken (loaded with 0 width or height)
        if (img.complete && (img.naturalHeight === 0 || img.naturalWidth === 0)) {
            replaceWithAvatar(img);
        }
    });
});