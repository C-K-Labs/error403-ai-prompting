// ===================================
// DOM ELEMENTS
// ===================================

const introSection = document.getElementById('intro');
const introPage1 = document.getElementById('intro-page-1');
const introPage2 = document.getElementById('intro-page-2');
const introPage3 = document.getElementById('intro-page-3');
const playButton = document.getElementById('play-button');
const carolAudio = document.getElementById('carol-audio');
const mainNav = document.getElementById('main-nav');
const mainContent = document.getElementById('main-content');
const menuToggle = document.getElementById('menu-toggle');
const menuDropdown = document.getElementById('menu-dropdown');
const menuHome = document.querySelector('.menu-home');

// ===================================
// AUDIO & INTRO LOGIC
// ===================================

let isPlaying = false;
let currentIntroPage = 1;

if (playButton && carolAudio) {
    playButton.addEventListener('click', function () {
        if (!isPlaying) {
            carolAudio.play().catch(e => console.log('Audio error:', e));
            isPlaying = true;
            playButton.querySelector('.play-text').textContent = 'Playing...';
            playButton.querySelector('.play-icon').textContent = '⏸';
        } else {
            carolAudio.pause();
            isPlaying = false;
            playButton.querySelector('.play-text').textContent = 'Play';
            playButton.querySelector('.play-icon').textContent = '▶';
        }
    });

    carolAudio.addEventListener('ended', function () {
        transitionToPage(2);
    });
}

function transitionToPage(targetPage) {
    const pages = [null, introPage1, introPage2, introPage3];
    if (targetPage < 1 || targetPage > 3) return;

    if (currentIntroPage >= 1 && currentIntroPage <= 3) {
        const currentPageEl = pages[currentIntroPage];
        currentPageEl.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
        currentPageEl.style.transform = targetPage > currentIntroPage ? 'translateX(-100%)' : 'translateX(100%)';
        currentPageEl.style.opacity = '0';
        setTimeout(() => {
            currentPageEl.classList.remove('active');
            currentPageEl.style.transform = 'translateX(0)';
            currentPageEl.style.opacity = '1';
        }, 500);
    }
    setTimeout(() => {
        pages[targetPage].classList.add('active');
        currentIntroPage = targetPage;
    }, 500);
}

// Swipe Logic
let startX = 0;
let isDragging = false;

function setupSwipe(page, pageNumber) {
    const handleStart = (e) => {
        isDragging = true;
        startX = (e.type === 'touchstart') ? e.touches[0].clientX : e.clientX;
    };
    const handleEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;
        const currentX = (e.type === 'touchend') ? e.changedTouches[0].clientX : e.clientX;
        const deltaX = currentX - startX;
        
        if (deltaX < -50) transitionToPage(pageNumber + 1);
        else if (deltaX > 50 && pageNumber > 1) transitionToPage(pageNumber - 1);
    };

    page.addEventListener('mousedown', handleStart);
    page.addEventListener('mouseup', handleEnd);
    page.addEventListener('touchstart', handleStart);
    page.addEventListener('touchend', handleEnd);
}

if (introPage1) setupSwipe(introPage1, 1);
if (introPage2) setupSwipe(introPage2, 2);
if (introPage3) setupSwipe(introPage3, 3);

// ===================================
// NAVIGATION & MENU
// ===================================

const partMenuItems = document.querySelectorAll('.part-menu-item');

partMenuItems.forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const partNumber = this.getAttribute('data-part');

        if (introSection) introSection.style.display = 'none';
        if (mainNav) mainNav.classList.remove('hidden');
        if (mainContent) mainContent.classList.remove('hidden');

        document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
        
        const selectedPart = document.querySelector(targetId);
        if (selectedPart) {
            selectedPart.style.display = 'block';
            setupPartNavigation(partNumber);
        }
    });
});

if (menuToggle && menuDropdown) {
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        menuDropdown.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
        if (!menuDropdown.contains(e.target) && e.target !== menuToggle) {
            menuDropdown.classList.remove('active');
        }
    });
}

document.querySelectorAll('.menu-part-toggle').forEach(btn => {
    btn.addEventListener('click', function() {
        const partNum = this.getAttribute('data-part');
        const section = document.getElementById(`part${partNum}`);
        if(section) {
            document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
            section.style.display = 'block';
            setupPartNavigation(partNum);
            menuDropdown.classList.remove('active');
        }
    });
});

if (menuHome) {
    menuHome.addEventListener('click', (e) => {
        e.preventDefault();
        menuDropdown.classList.remove('active');
        mainNav.classList.add('hidden');
        mainContent.classList.add('hidden');
        if (introSection) {
            introSection.style.display = 'flex';
            currentIntroPage = 3;
            introPage1.classList.remove('active');
            introPage2.classList.remove('active');
            introPage3.classList.add('active');
        }
    });
}

// ===================================
// PART PAGINATION SYSTEM
// ===================================

function setupPartNavigation(partNum) {
    const partSection = document.getElementById(`part${partNum}`);
    if (!partSection) return;

    const pages = partSection.querySelectorAll('.part-page');
    const totalPages = pages.length;
    let currentPage = 1;

    const prevBtn = document.getElementById(`prev-page-${partNum}`);
    const nextBtn = document.getElementById(`next-page-${partNum}`);

    function showPage(pageNumber) {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        
        pages.forEach(p => p.classList.remove('active'));
        const targetPage = document.getElementById(`page-${partNum}-${pageNumber}`);
        
        if (targetPage) {
            targetPage.classList.add('active');
            currentPage = pageNumber;
            partSection.querySelector('.part-container').scrollTop = 0;
            targetPage.scrollTop = 0;

            if (prevBtn) prevBtn.disabled = (currentPage === 1);
            if (nextBtn) {
                if (currentPage === totalPages) {
                    const nextPartNum = parseInt(partNum) + 1;
                    const nextPartSection = document.getElementById(`part${nextPartNum}`);
                    
                    if (nextPartSection) {
                        nextBtn.textContent = `Next: Part ${nextPartNum} →`;
                        nextBtn.onclick = () => {
                            partSection.style.display = 'none';
                            nextPartSection.style.display = 'block';
                            setupPartNavigation(nextPartNum);
                        };
                    } else {
                        nextBtn.textContent = 'Finish';
                        nextBtn.onclick = () => alert('Workshop Completed!');
                    }
                } else {
                    nextBtn.textContent = 'Next →';
                    nextBtn.onclick = () => showPage(currentPage + 1);
                }
            }
        }
    }

    if (prevBtn) prevBtn.onclick = () => showPage(currentPage - 1);
    showPage(1);
}

// ===================================
// UTILITIES & MODAL DATA
// ===================================

document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        navigator.clipboard.writeText(this.getAttribute('data-prompt'));
        const original = this.textContent;
        this.textContent = 'Copied!';
        this.classList.add('copied');
        setTimeout(() => {
            this.textContent = original;
            this.classList.remove('copied');
        }, 2000);
    });
});

const detailModal = document.getElementById('detail-modal');
const modalTitle = detailModal ? detailModal.querySelector('.modal-title') : null;
const modalBody = detailModal ? detailModal.querySelector('.modal-body') : null;
const modalClose = detailModal ? detailModal.querySelector('.modal-close') : null;

function openModal(title, content) {
    if (!detailModal) return;
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    detailModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    if (!detailModal) return;
    detailModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

if (detailModal) {
    modalClose.addEventListener('click', closeModal);
    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

const commandmentData = {
    verify: {
        title: '1. Never Trust, Always Verify',
        content: `<h4>Category: Accuracy & Verification</h4>
            <p>This is the most critical principle. AI models generate responses based on pattern prediction, not factual databases.</p>
            <h4>How to Apply</h4>
            <ul class="bias-list">
                <li><strong>Cross-reference important facts:</strong> Check AI outputs against reliable sources.</li>
                <li><strong>Ask for sources:</strong> Request the AI to cite where information comes from.</li>
                <li><strong>Use multiple AI tools:</strong> Compare responses across different models.</li>
            </ul>`
    },
    specific: {
        title: '2. Be Specific, Be Clear',
        content: `<h4>Category: Instruction Precision</h4>
            <p>Vague prompts produce vague results. AI models perform significantly better when given clear, specific instructions.</p>
            <h4>How to Apply</h4>
            <ul class="bias-list">
                <li><strong>Define the task precisely:</strong> Instead of "write about X", say "write a 500-word blog post about X".</li>
                <li><strong>Set clear constraints:</strong> Word count, format, tone, structure.</li>
            </ul>`
    },
    fingerprints: {
        title: '3. Erase AI Fingerprints',
        content: `<h4>Category: Output Quality</h4>
            <p>AI-generated content often has telltale patterns like "Moreover," "Furthermore," or excessive formality.</p>
            <h4>How to Apply</h4>
            <ul class="bias-list">
                <li><strong>Request natural language:</strong> Ask for conversational writing.</li>
                <li><strong>Ban specific phrases:</strong> Explicitly tell AI to avoid common crutches.</li>
            </ul>`
    },
    questions: {
        title: '4. Make AI Ask Questions',
        content: `<h4>Category: Interactive Refinement</h4>
            <p>AI shouldn't make assumptions when instructions are unclear. Encouraging it to ask clarifying questions leads to better outputs.</p>`
    },
    breakdown: {
        title: '5. Break It Down',
        content: `<h4>Category: Task Management</h4>
            <p>Large, complex tasks overwhelm AI models. Breaking problems into smaller steps dramatically improves output quality.</p>`
    }
};

const frameworkData = {
    rte: { title: 'RTE Framework', content: '<p>Role, Task, Expectation. Simple but effective for quick tasks.</p>' },
    crispe: { title: 'CRISPE Framework', content: '<p>Capacity, Role, Insight, Statement, Personality, Experiment.</p>' },
    costar: { title: 'CO-STAR Framework', content: '<p>Context, Objective, Style, Tone, Audience, Response.</p>' },
    fewshot: { title: 'Few-Shot Dilemma', content: '<p>Research shows providing too many examples can sometimes degrade performance (Overfitting).</p>' },
    overprompt: { title: 'Over-Prompting', content: '<p>Excessive constraints can confuse the AI. Balance guidance with flexibility.</p>' },
    json: { title: 'JSON Prompting', content: '<p>Using JSON structure in prompts helps get consistent, parseable data outputs.</p>' }
};

document.querySelectorAll('.commandment-card').forEach(c => {
    c.addEventListener('click', () => {
        const d = commandmentData[c.getAttribute('data-commandment')];
        if(d) openModal(d.title, d.content);
    });
});

document.querySelectorAll('.framework-item').forEach(i => {
    i.addEventListener('click', () => {
        const d = frameworkData[i.getAttribute('data-framework')];
        if(d) openModal(d.title, d.content);
    });
});

console.log('Full content workshop loaded.');