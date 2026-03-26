// Logic: Load jobs into the HTML
const jobsContainer = document.getElementById('jobs');
const newsContainer = document.getElementById('news-container');

// Set the backend API URL. 
// Use 'http://localhost:3000' for local development and your production URL for deployment.
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : 'https://globalcarrerhub.up.railway.app'; // Updated to your actual Railway URL

async function loadJobs() {
    if (!jobsContainer) return; // Stop if we are on a page without the jobs list

    // Show a loading message and visa sponsorship platforms while fetching
    jobsContainer.innerHTML = `
        <div style="text-align:center; padding: 20px 20px 0 20px;">
            <p style="font-size: 1.2rem; color: #333;">Loading latest jobs from our sources...</p>
            <p style="color: #666;">While you wait, here are 10 great platforms for finding visa-sponsored roles:</p>
        </div>
        <div style="max-width: 1000px; margin: 20px auto; padding: 0 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            
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
        <p style="text-align:center; margin-top: 40px; font-weight: bold; color: var(--primary-color);">Our aggregated job list will appear below shortly...</p>
    `;

    // --- API Security Note ---
    // All API calls are now routed through our own backend server (server.js).
    // This keeps our API keys secure and off the client-side.

    try {
        // Fetch from our own backend server, which runs on localhost:3000
        const response = await fetch(`${API_BASE_URL}/api/jobs`);
        const allJobs = await response.json();

        // Clear loading message
        jobsContainer.innerHTML = '';

        if (!allJobs || allJobs.length === 0) {
            jobsContainer.innerHTML = '<p style="text-align:center;">Sorry, we could not load jobs from our sources at this moment. This may be due to a temporary API issue. Please try again later.</p>';
            return;
        }

        // Render all jobs
        renderJobs(allJobs);

    } catch (error) {
        console.error('Failed to load jobs from backend:', error);
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const helpText = isLocal 
            ? 'Please make sure the server is running by typing <code>node server.js</code> in your terminal.' 
            : 'The job service might be starting up. Please refresh the page in about 30 seconds.';
        jobsContainer.innerHTML = `<p style="text-align:center; color: red; font-weight: bold;"><b>Error: Could not connect to the backend server.</b><br>${helpText}</p>`;
    }
}

// --- Job Renderer ---
function renderJobs(allJobs) {
    if (!jobsContainer) return;
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

        jobsContainer.appendChild(card);
    });
}

// Logic: Load News from World News API
async function loadNews() {
    if (!newsContainer) return; // Stop if we are not on the news page

    newsContainer.innerHTML = '<p style="text-align:center;">Loading latest news...</p>';

    try {
        // Fetch news from our own backend server
        const response = await fetch(`${API_BASE_URL}/api/news`);
        const data = await response.json();

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
        console.error('Failed to load news from backend:', error);
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const helpText = isLocal 
            ? 'Please ensure the server is running by typing <code>node server.js</code> in your terminal.' 
            : 'The news service is temporarily unavailable. Please try again later.';
        newsContainer.innerHTML = `<p style="text-align:center; color: red; font-weight: bold;"><b>Error: Could not connect to the backend server.</b><br>${helpText}</p>`;
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

    // ⚠️ IMPORTANT: You need to add your EmailJS Public Key here
    // You can get this from your EmailJS account settings (Account > API Keys).
    emailjs.init({
        publicKey: 'nIpbHMsl-Wu6CsP0q',
    });

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const button = contactForm.querySelector('button[type="submit"]');
        const originalText = button.textContent;
        button.textContent = 'Sending...';
        button.disabled = true;

        // ⚠️ IMPORTANT: You need to add your EmailJS Service ID and Template ID here
        // These are found in your EmailJS dashboard.
        const serviceID = 'service_kwame';
        const templateID = 'template_z9xwu2e';

        emailjs.sendForm(serviceID, templateID, this)
            .then(() => {
                showSuccessConfirmation(); // This will either show the modal or the alert
                contactForm.reset(); 
            }, (err) => {
                let errorMessage = 'Oops! There was a problem sending your message. Please try again later.';
                if (err && err.text) {
                    errorMessage = `Error: ${err.text}`;
                }
                alert(errorMessage);
                console.error('EmailJS Error:', JSON.stringify(err));
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
        window.onscroll = function() {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                backToTopButton.style.display = "block";
            } else {
                backToTopButton.style.display = "none";
            }
        };
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