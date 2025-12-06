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
        title: '1. Strict Accuracy',
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
        title: '2. Source Restriction',
        content: `
            <h4>Category: Information Control</h4>
            <p>When working with specific documents or datasets, you want AI to use only that information and not mix in outside knowledge that may be irrelevant or inconsistent.</p>
            
            <h4>Why This Matters</h4>
            <p>AI models have vast training data. Without explicit instruction to limit responses to provided materials, they may incorporate external information that doesn't match your specific context, requirements, or the accuracy of your source materials.</p>
            
            <h4>How to Apply</h4>
            <ul class="bias-list">
                <li><strong>Be explicit:</strong> "Answer using ONLY the information in the uploaded files."</li>
                <li><strong>Upload all relevant materials:</strong> Provide complete documentation so AI has everything it needs.</li>
                <li><strong>Verify adherence:</strong> Check if responses reference only your materials or include outside knowledge.</li>
                <li><strong>Re-prompt if needed:</strong> If AI uses external knowledge, remind it to stick to provided sources only.</li>
            </ul>
        `
    },
    fingerprints: {
        title: '3. Natural Writing Style',
        content: `
            <h4>Category: Output Quality</h4>
            <p>AI-generated content often has telltale patterns that make it immediately recognizable. These patterns reduce credibility and effectiveness.</p>
            
            <h4>Common AI Fingerprints</h4>
            <ul class="bias-list">
                <li><strong>Overused transitions:</strong> "Moreover," "Furthermore," "Additionally," "In conclusion"</li>
                <li><strong>Hedging language:</strong> "It's important to note that," "It's worth mentioning"</li>
                <li><strong>Excessive formality:</strong> Unnaturally structured sentences that lack conversational flow</li>
                <li><strong>Repetitive structure:</strong> Every paragraph following the same pattern</li>
                <li><strong>Em-dash overuse:</strong> AI often uses em-dashes (—) excessively instead of proper punctuation</li>
                <li><strong>Emoji usage:</strong> Some models insert emojis inappropriately in professional contexts</li>
            </ul>
            
            <h4>How to Apply</h4>
            <ul class="bias-list">
                <li><strong>Request natural language:</strong> Ask for conversational, human-like writing.</li>
                <li><strong>Ban specific elements:</strong> Explicitly prohibit emojis and excessive em-dashes.</li>
                <li><strong>Specify punctuation rules:</strong> Replace em-dashes with periods, commas, or colons as appropriate.</li>
                <li><strong>Review and edit:</strong> Always refine AI outputs to add your own voice and style.</li>
            </ul>
        `
    },
    questions: {
        title: '4. Clarification',
        content: `
            <h4>Category: Interactive Refinement</h4>
            <p>AI shouldn't make assumptions when instructions are unclear. Encouraging it to ask clarifying questions leads to better, more targeted outputs.</p>
            
            <h4>Why This Matters</h4>
            <p>When faced with ambiguity, AI models typically make their best guess and proceed. This often leads to outputs that miss the mark because the model guessed wrong. By instructing AI to ask questions instead, you create an opportunity to provide the exact guidance needed.</p>
            
            <h4>How to Apply</h4>
            <ul class="bias-list">
                <li><strong>Set the expectation upfront:</strong> "Ask clarifying questions immediately if anything is unclear."</li>
                <li><strong>Encourage specificity:</strong> Better to answer a few questions than receive an irrelevant output.</li>
                <li><strong>Reward question-asking:</strong> When AI asks good clarifying questions, acknowledge it positively.</li>
                <li><strong>Provide thorough answers:</strong> When AI asks questions, give detailed responses to guide better outputs.</li>
                <li><strong>Don't penalize uncertainty:</strong> Make it safe for AI to admit confusion rather than guessing.</li>
            </ul>
        `
    },
    breakdown: {
        title: '5. Step-by-Step Reasoning',
        content: `
            <h4>Category: Task Management & Transparency</h4>
            <p>Large, complex tasks overwhelm AI models just like they overwhelm humans. Breaking problems into smaller steps and showing reasoning dramatically improves output quality and allows you to verify the thinking process.</p>
            
            <h4>Why This Matters</h4>
            <p>AI models have context windows and processing limitations. When you ask for too much at once, quality degrades. Step-by-step approaches allow the model to focus fully on each component, producing better results at each stage. Additionally, seeing the reasoning helps you catch errors in logic.</p>
            
            <h4>How to Apply</h4>
            <ul class="bias-list">
                <li><strong>Request explicit reasoning:</strong> "Show your step-by-step thinking process."</li>
                <li><strong>Identify sub-tasks:</strong> Break your big goal into logical, sequential steps.</li>
                <li><strong>Address one step at a time:</strong> Complete and verify each step before moving to the next.</li>
                <li><strong>Use outputs as inputs:</strong> Feed the result of one step into the prompt for the next step.</li>
                <li><strong>Include specific examples:</strong> Ask AI to demonstrate concepts with concrete examples.</li>
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

const toolModalData = {
    'student-tools': {
        title: 'Student Free Tools (with .edu email)',
        content: `
            <h4>Free Access for Students</h4>
            <p>Many powerful AI tools offer free access to students with .edu email addresses. Take advantage of these while you're in school.</p>
            
            <ul class="bias-list">
                <li><strong>Perplexity Pro:</strong> <a href="https://www.perplexity.ai" target="_blank">perplexity.ai</a> - Advanced AI search with real-time data and citations</li>
                <li><strong>Gemini Advanced:</strong> <a href="https://gemini.google.com" target="_blank">gemini.google.com</a> - Google's most capable AI model with extended limits</li>
                <li><strong>Cursor:</strong> <a href="https://cursor.sh" target="_blank">cursor.sh</a> - AI-powered code editor built on VS Code</li>
                <li><strong>Notion Education Plus:</strong> <a href="https://www.notion.so/product/notion-for-education" target="_blank">notion.so</a> - Workspace with AI features for note-taking and organization</li>
                <li><strong>GitHub Copilot:</strong> <a href="https://github.com/features/copilot" target="_blank">github.com/copilot</a> - AI pair programmer for coding assistance</li>
                <li><strong>Figma:</strong> <a href="https://www.figma.com/education/" target="_blank">figma.com</a> - Design tool with free access for students and educators</li>
                <li><strong>Canva for Education:</strong> <a href="https://www.canva.com/education/" target="_blank">canva.com/education</a> - Design platform with premium features free for students</li>
                <li><strong>Google AI Studio:</strong> <a href="https://aistudio.google.com" target="_blank">aistudio.google.com</a> - Experiment with Google's AI models</li>
                <li><strong>NotebookLM:</strong> <a href="https://notebooklm.google.com" target="_blank">notebooklm.google.com</a> - AI-powered research and note-taking assistant</li>
                <li><strong>Suno AI:</strong> <a href="https://suno.ai" target="_blank">suno.ai</a> - AI music generation tool</li>
            </ul>
            
            <p class="choice-note">Check each platform's education page for specific eligibility requirements and sign-up instructions.</p>
        `
    },
    'other-tools': {
        title: 'Other AI Tools',
        content: `
            <h4>Diverse AI Applications</h4>
            <p>Various specialized AI tools for different use cases including image generation, video creation, local AI deployment, and more.</p>
            
            <ul class="bias-list">
                <li><strong>ComfyUI:</strong> <a href="https://github.com/comfyanonymous/ComfyUI" target="_blank">github.com/comfyanonymous/ComfyUI</a> - Node-based interface for advanced image generation workflows</li>
                <li><strong>Pinokio:</strong> <a href="https://pinokio.computer" target="_blank">pinokio.computer</a> - Install and run AI applications locally with one click</li>
                <li><strong>Ollama:</strong> <a href="https://ollama.ai" target="_blank">ollama.ai</a> - Run large language models locally on your computer</li>
                <li><strong>AlphaXiv:</strong> <a href="https://alphaxiv.org" target="_blank">alphaxiv.org</a> - AI-powered research paper recommendations and summaries</li>
                <li><strong>Runway:</strong> <a href="https://runwayml.com" target="_blank">runwayml.com</a> - AI-powered video editing and generation (20% education discount)</li>
                <li><strong>Luma Labs:</strong> <a href="https://lumalabs.ai" target="_blank">lumalabs.ai</a> - 3D capture and AI-generated scenes</li>
                <li><strong>DeepL:</strong> <a href="https://www.deepl.com" target="_blank">deepl.com</a> - Advanced AI translation service</li>
                <li><strong>Make (Integromat):</strong> <a href="https://www.make.com" target="_blank">make.com</a> - Automation platform for connecting AI tools</li>
                <li><strong>Zapier:</strong> <a href="https://zapier.com" target="_blank">zapier.com</a> - Workflow automation connecting thousands of apps</li>
            </ul>
            
            <p class="choice-note">These tools range from beginner-friendly to advanced. Start with the ones that match your current skill level and specific needs.</p>
        `
    }
};

const featureModalData = {
    'projects': {
        title: 'Projects (Claude & ChatGPT)',
        content: `
            <h4>Dedicated Workspaces for Specific Tasks</h4>
            <p>Projects allow you to create separate workspaces with their own context, files, and conversation history. This prevents the AI from getting confused between different tasks (e.g., separating "Coding" from "Essay Writing").</p>
            
            <h4>Key Benefits</h4>
            <ul class="bias-list">
                <li><strong>Context Isolation:</strong> Each project maintains its own history and uploaded files.</li>
                <li><strong>No Repetition:</strong> Upload your brand guidelines or code documentation once, and the AI remembers it for every chat in that project.</li>
                <li><strong>Custom Instructions:</strong> Set a specific persona (e.g., "Python Tutor") that applies automatically.</li>
            </ul>
        `
    },
    'artifacts': {
        title: 'Artifacts (Claude)',
        content: `
            <h4>Interactive Content Creation</h4>
            <p>Artifacts enable Claude to generate code, documents, and diagrams in a dedicated side panel. This transforms AI from a simple chatbot into a collaborative workspace.</p>
            
            <h4>What You Can Create</h4>
            <ul class="bias-list">
                <li><strong>Real-time Code:</strong> Preview HTML, CSS, and React apps instantly.</li>
                <li><strong>Documents:</strong> Edit reports or emails in a clean document view side-by-side.</li>
                <li><strong>Visualizations:</strong> Generate flowcharts and diagrams using Mermaid syntax.</li>
            </ul>
        `
    },
    'token-saving': {
        title: 'Token Efficiency & Chat Management',
        content: `
            <h4>How to Keep AI Smarter for Longer</h4>
            <p>AI models have a limited "Context Window". As a chat gets too long, the AI starts "forgetting" earlier instructions or becomes "lazy" (giving shorter answers).</p>
            
            <h4>Essential Efficiency Tips</h4>
            <ul class="bias-list">
                <li><strong>Start Fresh Often:</strong> Do not use one long chat for everything. Start a <strong>New Chat</strong> for every new topic or major section of your work.</li>
                <li><strong>Edit, Don't Re-ask:</strong> If you made a typo or want to change a prompt, <strong>edit your previous message</strong> instead of sending a correction. This saves token usage by half.</li>
                <li><strong>The First Prompt Matters:</strong> The system pays the most attention to the start of the conversation. Set clear rules immediately.</li>
                <li><strong>Summarize Files:</strong> If uploading large documents, ask the AI to summarize key points first, then use that summary for the actual task.</li>
            </ul>
        `
    },
    'mem0': {
        title: 'mem0 Extension',
        content: `
            <h4>Free Long-Term Memory Tool</h4>
            <p>mem0 is a browser extension that adds a "memory layer" to AI tools. It helps the AI remember your preferences across different sessions without needing paid subscriptions.</p>
            
            <h4>Key Features</h4>
            <ul class="bias-list">
                <li><strong>Cross-Session Memory:</strong> It remembers your coding style, tone preferences, or project details across new chats.</li>
                <li><strong>User Control:</strong> You can manage exactly what the AI remembers or forgets about you.</li>
                <li><strong>Efficiency:</strong> Reduces the need to copy-paste the same context prompts repeatedly.</li>
            </ul>
        `
    }
};

// Feature modal event listeners
document.querySelectorAll('[data-feature]').forEach(card => {
    card.addEventListener('click', () => {
        const featureKey = card.getAttribute('data-feature');
        const data = featureModalData[featureKey];
        if (data) {
            openModal(data.title, data.content);
        }
    });
});

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

// Tool modal buttons
document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
        const modalKey = btn.getAttribute('data-modal');
        const data = toolModalData[modalKey];
        if (data) {
            openModal(data.title, data.content);
        }
    });
});

// Token limits expandable
document.querySelectorAll('[data-expand="token-limits"]').forEach(item => {
    item.addEventListener('click', function() {
        const table = this.querySelector('.token-comparison-table');
        const icon = this.querySelector('.framework-expand-icon');
        
        if (table && icon) {
            if (table.style.display === 'none' || !table.style.display) {
                table.style.display = 'block';
                icon.textContent = '↓';
            } else {
                table.style.display = 'none';
                icon.textContent = '→';
            }
        }
    });
});

// Cross-Verification Methods accordion functionality
document.querySelectorAll('[data-verification]').forEach(item => {
    item.addEventListener('click', function() {
        const detail = this.querySelector('.verification-detail');
        const icon = this.querySelector('.framework-expand-icon');
        
        if (detail.style.display === 'none' || !detail.style.display) {
            detail.style.display = 'block';
            icon.textContent = '↓';
        } else {
            detail.style.display = 'none';
            icon.textContent = '→';
        }
    });
});

console.log('Full content workshop loaded.');