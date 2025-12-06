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
const mainFooter = document.getElementById('main-footer');

// ===================================
// STATE
// ===================================

let isPlaying = false;
let canTransition = false;
let currentIntroPage = 1;

// ===================================
// AUDIO PLAYER
// ===================================

if (playButton && carolAudio) {
    playButton.addEventListener('click', function () {
        if (!isPlaying) {
            carolAudio.play().catch(function (error) {
                console.log('Audio not available');
                canTransition = true;
            });

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

    carolAudio.addEventListener('error', function () {
        canTransition = true;
    });
}

// ===================================
// SWIPE/DRAG FUNCTIONALITY (INTRO)
// ===================================

let startX = 0;
let startY = 0;
let currentX = 0;
let isDragging = false;
let currentPage = null;

function setupSwipe(page, pageNumber) {
    page.addEventListener('mousedown', (e) => handleStart(e, page, pageNumber));
    page.addEventListener('mousemove', (e) => handleMove(e, page));
    page.addEventListener('mouseup', (e) => handleEnd(e, page, pageNumber));
    page.addEventListener('mouseleave', (e) => handleEnd(e, page, pageNumber));

    page.addEventListener('touchstart', (e) => handleStart(e, page, pageNumber));
    page.addEventListener('touchmove', (e) => handleMove(e, page));
    page.addEventListener('touchend', (e) => handleEnd(e, page, pageNumber));
}

function handleStart(e, page, pageNumber) {
    isDragging = true;
    currentPage = pageNumber;

    if (e.type === 'touchstart') {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    } else {
        startX = e.clientX;
        startY = e.clientY;
    }
}

function handleMove(e, page) {
    if (!isDragging) return;

    if (e.type === 'touchmove') {
        currentX = e.touches[0].clientX;
    } else {
        currentX = e.clientX;
    }

    const deltaX = currentX - startX;

    if (Math.abs(deltaX) > 10) {
        e.preventDefault();
        page.style.transform = `translateX(${deltaX * 0.3}px)`;
        page.style.opacity = 1 - Math.abs(deltaX) / 1000;
    }
}

function handleEnd(e, page, pageNumber) {
    if (!isDragging) return;
    isDragging = false;

    const deltaX = currentX - startX;
    const threshold = 100;

    if (deltaX < -threshold) {
        transitionToPage(pageNumber + 1);
    } else if (deltaX > threshold && pageNumber > 1) {
        transitionToPage(pageNumber - 1);
    } else {
        page.style.transform = 'translateX(0)';
        page.style.opacity = '1';
    }
}

// Setup swipe for all intro pages
if (introPage1) setupSwipe(introPage1, 1);
if (introPage2) setupSwipe(introPage2, 2);
if (introPage3) setupSwipe(introPage3, 3);

// ===================================
// PAGE TRANSITIONS (INTRO)
// ===================================

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

// ===================================
// PART MENU NAVIGATION (INTRO PAGE 3)
// ===================================

const partMenuItems = document.querySelectorAll('.part-menu-item');

partMenuItems.forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        const partNumber = this.getAttribute('data-part');

        // Show main content
        if (introSection) introSection.style.display = 'none';
        if (mainNav) mainNav.classList.remove('hidden');
        if (mainContent) mainContent.classList.remove('hidden');
        if (mainFooter) mainFooter.classList.remove('hidden');

        // Show selected part
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });

        const selectedPart = document.querySelector(targetId);
        if (selectedPart) {
            selectedPart.style.display = 'block';
            
            // Initialize part page
            if (partNumber === '1' && typeof showPage1 === 'function') {
                showPage1(1);
            } else if (partNumber === '2' && typeof showPage2 === 'function') {
                showPage2(1);
            }
        }

        window.scrollTo(0, 0);
    });
});

// ===================================
// MAIN MENU FUNCTIONALITY
// ===================================

const menuToggle = document.getElementById('menu-toggle');
const menuDropdown = document.getElementById('menu-dropdown');
const menuPartToggles = document.querySelectorAll('.menu-part-toggle');
const menuHome = document.querySelector('.menu-home');

if (menuToggle && menuDropdown) {
    menuToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        menuDropdown.classList.toggle('active');
    });

    document.addEventListener('click', function (e) {
        if (!menuDropdown.contains(e.target) && e.target !== menuToggle) {
            menuDropdown.classList.remove('active');
        }
    });
}

menuPartToggles.forEach(toggle => {
    toggle.addEventListener('click', function (e) {
        e.stopPropagation();

        const partNum = this.getAttribute('data-part');
        const subsections = document.querySelector(`.menu-subsections[data-part="${partNum}"]`);

        this.classList.toggle('active');
        if (subsections) subsections.classList.toggle('active');

        menuPartToggles.forEach(otherToggle => {
            if (otherToggle !== this) {
                otherToggle.classList.remove('active');
                const otherPartNum = otherToggle.getAttribute('data-part');
                const otherSubsections = document.querySelector(`.menu-subsections[data-part="${otherPartNum}"]`);
                if (otherSubsections) {
                    otherSubsections.classList.remove('active');
                }
            }
        });
    });
});

if (menuHome) {
    menuHome.addEventListener('click', function (e) {
        e.preventDefault();

        menuDropdown.classList.remove('active');
        if (mainNav) mainNav.classList.add('hidden');
        if (mainContent) mainContent.classList.add('hidden');
        if (mainFooter) mainFooter.classList.add('hidden');

        if (introSection) {
            introSection.style.display = 'flex';
            if (introPage1) introPage1.classList.remove('active');
            if (introPage2) introPage2.classList.remove('active');
            if (introPage3) introPage3.classList.add('active');
            currentIntroPage = 3;
        }
    });
}

// ===================================
// COPY BUTTON FUNCTIONALITY
// ===================================

const copyButtons = document.querySelectorAll('.copy-btn');

copyButtons.forEach(button => {
    button.addEventListener('click', function () {
        const promptText = this.getAttribute('data-prompt');

        navigator.clipboard.writeText(promptText).then(() => {
            const originalText = this.textContent;
            this.textContent = 'Copied!';
            this.classList.add('copied');

            setTimeout(() => {
                this.textContent = originalText;
                this.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            this.textContent = 'Failed';

            setTimeout(() => {
                this.textContent = 'Copy';
            }, 2000);
        });
    });
});

// ===================================
// PART 1 PAGE NAVIGATION
// ===================================

const part1Pages = document.querySelectorAll('#part1 .part-page');
const prevBtn1 = document.getElementById('prev-page-1');
const nextBtn1 = document.getElementById('next-page-1');

let currentPage1 = 1;
const totalPages1 = 6;

function showPage1(pageNumber) {
    if (pageNumber < 1 || pageNumber > totalPages1) return;
    
    part1Pages.forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(`page-1-${pageNumber}`);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage1 = pageNumber;
        
        if (prevBtn1) prevBtn1.disabled = currentPage1 === 1;
        
        if (nextBtn1) {
            if (currentPage1 === totalPages1) {
                nextBtn1.textContent = 'Next: Part 2 →';
            } else {
                nextBtn1.textContent = 'Next →';
            }
        }
    }
}

if (prevBtn1) {
    prevBtn1.addEventListener('click', () => {
        showPage1(currentPage1 - 1);
    });
}

if (nextBtn1) {
    nextBtn1.addEventListener('click', () => {
        if (currentPage1 === totalPages1) {
            document.getElementById('part1').style.display = 'none';
            const part2 = document.getElementById('part2');
            if (part2) {
                part2.style.display = 'block';
                window.scrollTo({ top: 0 });
                showPage2(1);
            }
        } else {
            showPage1(currentPage1 + 1);
        }
    });
}

// Initialize Part 1
showPage1(1);

// ===================================
// PART 2 PAGE NAVIGATION
// ===================================

const part2Pages = document.querySelectorAll('#part2 .part-page');
const prevBtn2 = document.getElementById('prev-page-2');
const nextBtn2 = document.getElementById('next-page-2');

let currentPage2 = 1;
const totalPages2 = 5;

function showPage2(pageNumber) {
    if (pageNumber < 1 || pageNumber > totalPages2) return;
    
    part2Pages.forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(`page-2-${pageNumber}`);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage2 = pageNumber;
        
        if (prevBtn2) prevBtn2.disabled = currentPage2 === 1;
        
        if (nextBtn2) {
            if (currentPage2 === totalPages2) {
                nextBtn2.textContent = 'Next: Part 3 →';
            } else {
                nextBtn2.textContent = 'Next →';
            }
        }
    }
}

if (prevBtn2) {
    prevBtn2.addEventListener('click', () => {
        showPage2(currentPage2 - 1);
    });
}

if (nextBtn2) {
    nextBtn2.addEventListener('click', () => {
        if (currentPage2 === totalPages2) {
            alert('Part 3 will be implemented next');
        } else {
            showPage2(currentPage2 + 1);
        }
    });
}

// ===================================
// PART 2 MODALS (Commandments & Frameworks)
// ===================================

let detailModal = document.getElementById('detail-modal');
if (!detailModal) {
    detailModal = document.createElement('div');
    detailModal.id = 'detail-modal';
    detailModal.className = 'detail-modal';
    detailModal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close">×</button>
            <h3 class="modal-title"></h3>
            <div class="modal-body"></div>
        </div>
    `;
    document.body.appendChild(detailModal);
}

const modalContent = detailModal.querySelector('.modal-content');
const modalTitle = detailModal.querySelector('.modal-title');
const modalBody = detailModal.querySelector('.modal-body');
const modalClose = detailModal.querySelector('.modal-close');

const commandmentData = {
    verify: {
        title: '1. Never Trust, Always Verify',
        content: `
            <h4>Category: Accuracy & Verification</h4>
            <p>This is the most critical principle. AI models generate responses based on pattern prediction, not factual databases. They can sound confident while being completely wrong.</p>
            
            <h4>Why This Matters</h4>
            <p>Hallucinations occur when AI fills gaps in knowledge with plausible-sounding but incorrect information. The model doesn't know when it's wrong. It will generate responses with equal confidence whether the information is accurate or fabricated.</p>
            
            <h4>How to Apply</h4>
            <ul class="bias-list">
                <li><strong>Cross-reference important facts:</strong> Check AI outputs against reliable sources, especially for critical information.</li>
                <li><strong>Ask for sources:</strong> Request the AI to cite where information comes from, then verify those sources exist and are accurate.</li>
                <li><strong>Challenge inconsistencies:</strong> If something seems off, question it. Don't accept outputs at face value.</li>
                <li><strong>Use multiple AI tools:</strong> Compare responses across different models to identify discrepancies.</li>
                <li><strong>Verify calculations:</strong> Always double-check mathematical operations and data analysis.</li>
            </ul>
        `
    },
    specific: {
        title: '2. Be Specific, Be Clear',
        content: `
            <h4>Category: Instruction Precision</h4>
            <p>Vague prompts produce vague results. AI models perform significantly better when given clear, specific instructions with well-defined parameters.</p>
            
            <h4>Why This Matters</h4>
            <p>Language models interpret ambiguity in unpredictable ways. What seems obvious to you may not be obvious to the AI. Specificity reduces the space for misinterpretation and guides the model toward the exact output you need.</p>
            
            <h4>How to Apply</h4>
            <ul class="bias-list">
                <li><strong>Define the task precisely:</strong> Instead of "write something about marketing," specify "write a 500-word blog post about email marketing best practices for small businesses."</li>
                <li><strong>Set clear constraints:</strong> Word count, format, tone, structure, audience. The more parameters you define, the better.</li>
                <li><strong>Provide context:</strong> Background information helps AI understand what you actually need.</li>
                <li><strong>Specify the format:</strong> Do you want bullet points, paragraphs, a table, JSON output? State it clearly.</li>
                <li><strong>Include examples when helpful:</strong> Show what success looks like, but avoid over-reliance on examples.</li>
            </ul>
        `
    },
    fingerprints: {
        title: '3. Erase AI Fingerprints',
        content: `
            <h4>Category: Output Quality</h4>
            <p>AI-generated content often has telltale patterns that make it immediately recognizable. These patterns reduce credibility and effectiveness.</p>
            
            <h4>Common AI Fingerprints</h4>
            <ul class="bias-list">
                <li><strong>Overused transitions:</strong> "Moreover," "Furthermore," "Additionally," "In conclusion"</li>
                <li><strong>Hedging language:</strong> "It's important to note that," "It's worth mentioning"</li>
                <li><strong>Excessive formality:</strong> Unnaturally structured sentences that lack conversational flow</li>
                <li><strong>Repetitive structure:</strong> Every paragraph following the same pattern</li>
                <li><strong>Generic examples:</strong> Using the same types of examples repeatedly</li>
            </ul>
            
            <h4>How to Apply</h4>
            <ul class="bias-list">
                <li><strong>Request natural language:</strong> Ask for conversational, human-like writing.</li>
                <li><strong>Vary sentence structure:</strong> Mix short and long sentences, different patterns.</li>
                <li><strong>Ban specific phrases:</strong> Explicitly tell AI to avoid common crutches.</li>
                <li><strong>Review and edit:</strong> Always refine AI outputs to add your own voice and style.</li>
            </ul>
        `
    },
    questions: {
        title: '4. Make AI Ask Questions',
        content: `
            <h4>Category: Interactive Refinement</h4>
            <p>AI shouldn't make assumptions when instructions are unclear. Encouraging it to ask clarifying questions leads to better, more targeted outputs.</p>
            
            <h4>Why This Matters</h4>
            <p>When faced with ambiguity, AI models typically make their best guess and proceed. This often leads to outputs that miss the mark because the model guessed wrong. By instructing AI to ask questions instead, you create an opportunity to provide the exact guidance needed.</p>
            
            <h4>How to Apply</h4>
            <ul class="bias-list">
                <li><strong>Set the expectation upfront:</strong> Tell AI to ask questions when anything is unclear.</li>
                <li><strong>Encourage specificity:</strong> Better to answer a few questions than receive an irrelevant output.</li>
                <li><strong>Reward question-asking:</strong> When AI asks good clarifying questions, acknowledge it positively.</li>
                <li><strong>Provide thorough answers:</strong> When AI asks questions, give detailed responses to guide better outputs.</li>
            </ul>
        `
    },
    breakdown: {
        title: '5. Break It Down',
        content: `
            <h4>Category: Task Management</h4>
            <p>Large, complex tasks overwhelm AI models just like they overwhelm humans. Breaking problems into smaller steps dramatically improves output quality.</p>
            
            <h4>Why This Matters</h4>
            <p>AI models have context windows and processing limitations. When you ask for too much at once, quality degrades. Step-by-step approaches allow the model to focus fully on each component, producing better results at each stage.</p>
            
            <h4>How to Apply</h4>
            <ul class="bias-list">
                <li><strong>Identify sub-tasks:</strong> Break your big goal into logical, sequential steps.</li>
                <li><strong>Address one step at a time:</strong> Complete and verify each step before moving to the next.</li>
                <li><strong>Use outputs as inputs:</strong> Feed the result of one step into the prompt for the next step.</li>
                <li><strong>Request step-by-step reasoning:</strong> Ask AI to show its thinking process, not just the final answer.</li>
                <li><strong>Iterate and refine:</strong> Treat each step as an opportunity to course-correct if needed.</li>
            </ul>
        `
    }
};

const frameworkData = {
    rte: {
        title: 'RTE Framework',
        content: `
            <h4>Role, Task, Expectation</h4>
            <p>RTE is a simple but effective framework that assigns a role to the AI, defines the specific task, and sets clear expectations for the output.</p>
            
            <h4>How It Works</h4>
            <ul class="bias-list">
                <li><strong>Role:</strong> "You are an expert marketing consultant."</li>
                <li><strong>Task:</strong> "Create a social media strategy for a new coffee shop."</li>
                <li><strong>Expectation:</strong> "Provide 5 platform-specific tactics with expected reach metrics."</li>
            </ul>
            
            <h4>Best For</h4>
            <p>Quick, straightforward tasks where you need professional-level output without extensive context.</p>
        `
    },
    crispe: {
        title: 'CRISPE Framework',
        content: `
            <h4>Capacity and Role, Insight, Statement, Personality, Experiment</h4>
            <p>CRISPE provides a more structured approach with background context and tone specifications.</p>
            
            <h4>Components</h4>
            <ul class="bias-list">
                <li><strong>Capacity and Role:</strong> Define who the AI is acting as</li>
                <li><strong>Insight:</strong> Provide relevant background context</li>
                <li><strong>Statement:</strong> Clearly state what you want done</li>
                <li><strong>Personality:</strong> Specify the tone and style</li>
                <li><strong>Experiment:</strong> Request variations or alternatives</li>
            </ul>
            
            <h4>Best For</h4>
            <p>Content creation where tone, style, and context significantly impact quality.</p>
        `
    },
    costar: {
        title: 'CO-STAR Framework',
        content: `
            <h4>Context, Objective, Style, Tone, Audience, Response</h4>
            <p>CO-STAR is comprehensive and works well for professional, audience-focused content.</p>
            
            <h4>Components</h4>
            <ul class="bias-list">
                <li><strong>Context:</strong> Background information and situation</li>
                <li><strong>Objective:</strong> What you want to achieve</li>
                <li><strong>Style:</strong> How the content should be structured</li>
                <li><strong>Tone:</strong> The emotional quality (formal, casual, persuasive)</li>
                <li><strong>Audience:</strong> Who will read/use this</li>
                <li><strong>Response:</strong> Format of the desired output</li>
            </ul>
            
            <h4>Best For</h4>
            <p>Professional communications, marketing materials, and audience-specific content where multiple factors affect success.</p>
        `
    },
    fewshot: {
        title: 'Few-Shot Dilemma',
        content: `
            <h4>Why Multiple Examples Don't Always Help</h4>
            <p>Recent research shows that providing multiple examples in prompts does not always improve performance and can sometimes reduce accuracy.</p>
            
            <h4>Key Insights</h4>
            <ul class="bias-list">
                <li><strong>Example Overfit:</strong> Models may focus too much on specific example patterns rather than general principles</li>
                <li><strong>Quality Over Quantity:</strong> One well-chosen example often outperforms multiple mediocre ones</li>
                <li><strong>Instruction Clarity:</strong> Clear instructions can eliminate the need for examples entirely</li>
                <li><strong>Context Window Cost:</strong> Examples consume valuable context space that could be used for instructions</li>
            </ul>
            
            <h4>What This Means</h4>
            <p>Don't default to providing 3-5 examples. Instead, focus on clear instructions and use examples only when they genuinely clarify your intent.</p>
        `
    },
    overprompt: {
        title: 'Over-Prompting Dangers',
        content: `
            <h4>Finding the Balance</h4>
            <p>Adding excessive detail or too many constraints can confuse AI models and lead to worse results. Over-prompting often introduces conflicting instructions or unnecessary complexity.</p>
            
            <h4>Signs of Over-Prompting</h4>
            <ul class="bias-list">
                <li><strong>Contradictory Instructions:</strong> Multiple requirements that conflict with each other</li>
                <li><strong>Excessive Constraints:</strong> So many rules that the AI struggles to satisfy all of them</li>
                <li><strong>Redundant Information:</strong> Repeating the same instruction in different ways</li>
                <li><strong>Micromanagement:</strong> Specifying every minor detail instead of focusing on key requirements</li>
            </ul>
            
            <h4>The Solution</h4>
            <p>Start simple, then add constraints only when needed. Effective prompting provides clear direction without restricting the model's ability to apply its training effectively.</p>
        `
    },
    json: {
        title: 'JSON Prompting Techniques',
        content: `
            <h4>Structuring for Consistency</h4>
            <p>Structuring prompts in JSON format or requesting JSON outputs can significantly improve consistency and parseability, especially for structured data extraction and API integration.</p>
            
            <h4>When to Use JSON Prompting</h4>
            <ul class="bias-list">
                <li><strong>Structured Data Extraction:</strong> Pulling specific fields from unstructured text</li>
                <li><strong>API Integration:</strong> When output needs to be consumed by code</li>
                <li><strong>Consistent Formatting:</strong> Ensuring outputs always follow the same structure</li>
                <li><strong>Complex Data Types:</strong> Nested objects, arrays, or multiple related entities</li>
            </ul>
            
            <h4>Best Practices</h4>
            <ul class="bias-list">
                <li>Provide a clear JSON schema or example structure</li>
                <li>Specify required vs optional fields</li>
                <li>Define data types explicitly</li>
                <li>Handle edge cases and validation in your instructions</li>
            </ul>
        `
    }
};

function openModal(title, content) {
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    detailModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    detailModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

const commandmentCards = document.querySelectorAll('.commandment-card');
commandmentCards.forEach(card => {
    card.addEventListener('click', () => {
        const commandmentKey = card.getAttribute('data-commandment');
        const data = commandmentData[commandmentKey];
        if (data) {
            openModal(data.title, data.content);
        }
    });
});

const frameworkItems = document.querySelectorAll('.framework-item');
frameworkItems.forEach(item => {
    item.addEventListener('click', () => {
        const frameworkKey = item.getAttribute('data-framework');
        const data = frameworkData[frameworkKey];
        if (data) {
            openModal(data.title, data.content);
        }
    });
});

modalClose.addEventListener('click', closeModal);
detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) {
        closeModal();
    }
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && detailModal.classList.contains('active')) {
        closeModal();
    }
});

modalContent.addEventListener('click', (e) => {
    e.stopPropagation();
});

console.log('Workshop website loaded successfully!');