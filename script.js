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

// ===================================
// SWIPE/DRAG FUNCTIONALITY
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
        // Swipe left - next page
        transitionToPage(pageNumber + 1);
    } else if (deltaX > threshold && pageNumber > 1) {
        // Swipe right - previous page
        transitionToPage(pageNumber - 1);
    } else {
        // Reset
        page.style.transform = 'translateX(0)';
        page.style.opacity = '1';
    }
}

// Setup swipe for all intro pages
setupSwipe(introPage1, 1);
setupSwipe(introPage2, 2);
setupSwipe(introPage3, 3);

// ===================================
// PAGE TRANSITIONS
// ===================================

function transitionToPage(targetPage) {
    const pages = [null, introPage1, introPage2, introPage3];

    if (targetPage < 1 || targetPage > 3) return;

    // Hide current page
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

    // Show target page
    setTimeout(() => {
        pages[targetPage].classList.add('active');
        currentIntroPage = targetPage;
    }, 500);
}

// ===================================
// PART MENU NAVIGATION
// ===================================

const partMenuItems = document.querySelectorAll('.part-menu-item');

partMenuItems.forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        const partNumber = this.getAttribute('data-part');

        // Show only selected part
        showSinglePart(partNumber);

        // Show main content
        showMainContent();

        // Scroll to the part
        setTimeout(() => {
            scrollToSection(targetId);
        }, 100);
    });
});

function showMainContent() {
    introSection.style.display = 'none';
    mainNav.classList.remove('hidden');
    mainContent.classList.remove('hidden');
    mainFooter.classList.remove('hidden');
    window.scrollTo(0, 0);
}

function showSinglePart(partNumber) {
    // Hide all parts first
    const allParts = document.querySelectorAll('.content-section');
    allParts.forEach(part => {
        part.style.display = 'none';
    });

    // Show only selected part
    const selectedPart = document.getElementById('part' + partNumber);
    if (selectedPart) {
        selectedPart.style.display = 'block';
    }
}

function showAllParts() {
    const allParts = document.querySelectorAll('.content-section');
    allParts.forEach(part => {
        part.style.display = 'block';
    });
}

// ===================================
// MENU FUNCTIONALITY
// ===================================

const menuToggle = document.getElementById('menu-toggle');
const menuDropdown = document.getElementById('menu-dropdown');
const menuPartToggles = document.querySelectorAll('.menu-part-toggle');
const menuHome = document.querySelector('.menu-home');

// Toggle menu dropdown
menuToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    menuDropdown.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', function (e) {
    if (!menuDropdown.contains(e.target) && e.target !== menuToggle) {
        menuDropdown.classList.remove('active');
    }
});

// Toggle part subsections
menuPartToggles.forEach(toggle => {
    toggle.addEventListener('click', function (e) {
        e.stopPropagation();

        const partNum = this.getAttribute('data-part');
        const subsections = document.querySelector(`.menu-subsections[data-part="${partNum}"]`);

        // Toggle active state
        this.classList.toggle('active');
        subsections.classList.toggle('active');

        // Close other parts (optional)
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

// Menu subsection navigation
const menuSubsections = document.querySelectorAll('.menu-subsection');

menuSubsections.forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            // Show all parts first (fixes navigation from single-part view)
            showAllParts();

            // Close menu
            menuDropdown.classList.remove('active');

            // Update current indicator
            updateCurrentSection(targetId);

            // Scroll to section
            const navHeight = 100; // Approximate offset
            const targetPosition = targetSection.offsetTop - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Menu Home navigation
menuHome.addEventListener('click', function (e) {
    e.preventDefault();

    // Show all parts again
    showAllParts();

    // Hide main content
    menuDropdown.classList.remove('active');
    mainNav.classList.add('hidden');
    mainContent.classList.add('hidden');
    mainFooter.classList.add('hidden');

    // Show intro section at part menu
    introSection.style.display = 'flex';
    introPage1.classList.remove('active');
    introPage2.classList.remove('active');
    introPage3.classList.add('active');
    currentIntroPage = 3;
});

// Update current section indicator
function updateCurrentSection(sectionId) {
    menuSubsections.forEach(link => {
        link.classList.remove('current');
        if (link.getAttribute('href') === sectionId) {
            link.classList.add('current');
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

        // Copy to clipboard
        navigator.clipboard.writeText(promptText).then(() => {
            // Visual feedback
            const originalText = this.textContent;
            this.textContent = 'Copied!';
            this.classList.add('copied');

            // Reset after 2 seconds
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
// NEXT PART NAVIGATION
// ===================================

const nextPartLinks = document.querySelectorAll('.next-part-link');

nextPartLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        const nextPartNum = this.getAttribute('data-next-part');

        // Show only next part
        if (nextPartNum) {
            showSinglePart(nextPartNum);
        }

        // Scroll to part
        setTimeout(() => {
            scrollToSection(targetId);
        }, 100);
    });
});

function scrollToSection(targetId) {
    const targetSection = document.querySelector(targetId);

    if (targetSection) {
        const navHeight = 80;
        const targetPosition = targetSection.offsetTop - navHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// ===================================
// SCROLL POSITION TRACKING
// ===================================

let lastScrollPosition = 0;

window.addEventListener('scroll', function () {
    const currentScrollPosition = window.scrollY;

    // Update menu current section based on visible section
    const sections = document.querySelectorAll('.subsection');

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        const viewportMiddle = currentScrollPosition + window.innerHeight / 2;

        if (viewportMiddle >= sectionTop && viewportMiddle < sectionBottom) {
            const sectionId = '#' + section.id;
            updateCurrentSection(sectionId);
        }
    });

    lastScrollPosition = currentScrollPosition;
});

// ===================================
// INITIALIZE
// ===================================

// Open Part 1 by default in menu
const part1Toggle = document.querySelector('.menu-part-toggle[data-part="1"]');
if (part1Toggle) {
    setTimeout(() => {
        part1Toggle.click();
    }, 100);
}

console.log('Workshop website loaded successfully!');
console.log('Created by Chang Hyun Kim');
console.log('Swipe left/right to navigate');

// ===================================
// VERTICAL SECTION SWIPE
// ===================================

let touchStartY = 0;
let touchEndY = 0;

function handleVerticalSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchStartY - touchEndY;

    if (Math.abs(swipeDistance) > swipeThreshold) {
        const sections = document.querySelectorAll('.subsection');
        const currentScrollPosition = window.scrollY;

        let targetSection = null;

        if (swipeDistance > 0) {
            // Swipe up - next section
            sections.forEach(section => {
                if (section.offsetTop > currentScrollPosition + 100 && !targetSection) {
                    targetSection = section;
                }
            });
        } else {
            // Swipe down - previous section
            const reverseSections = Array.from(sections).reverse();
            reverseSections.forEach(section => {
                if (section.offsetTop < currentScrollPosition - 100 && !targetSection) {
                    targetSection = section;
                }
            });
        }

        if (targetSection) {
            window.scrollTo({
                top: targetSection.offsetTop,
                behavior: 'smooth'
            });
        }
    }
}

if (mainContent) {
    mainContent.addEventListener('touchstart', e => {
        touchStartY = e.changedTouches[0].screenY;
    });

    mainContent.addEventListener('touchend', e => {
        touchEndY = e.changedTouches[0].screenY;
        handleVerticalSwipe();
    });
}

// Mouse wheel support for section navigation
let isScrolling = false;

mainContent.addEventListener('wheel', (e) => {
    if (isScrolling) return;

    isScrolling = true;
    setTimeout(() => {
        isScrolling = false;
    }, 1000);

    const sections = document.querySelectorAll('.subsection');
    const currentScrollPosition = window.scrollY;

    let targetSection = null;

    if (e.deltaY > 0) {
        // Scroll down - next section
        sections.forEach(section => {
            if (section.offsetTop > currentScrollPosition + 100 && !targetSection) {
                targetSection = section;
            }
        });
    } else {
        // Scroll up - previous section
        const reverseSections = Array.from(sections).reverse();
        reverseSections.forEach(section => {
            if (section.offsetTop < currentScrollPosition - 100 && !targetSection) {
                targetSection = section;
            }
        });
    }

    if (targetSection) {
        e.preventDefault();
        window.scrollTo({
            top: targetSection.offsetTop,
            behavior: 'smooth'
        });
    }
}, { passive: false });

// ===================================
// MOUSE DRAG SWIPE (like intro pages)
// ===================================

let dragStartY = 0;
let dragCurrentY = 0;
let isDraggingVertical = false;

if (mainContent) {
    mainContent.addEventListener('mousedown', (e) => {
        // Don't interfere with buttons, links, inputs
        if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) {
            return;
        }

        isDraggingVertical = true;
        dragStartY = e.clientY;
        mainContent.style.cursor = 'grabbing';
        mainContent.style.userSelect = 'none';
    });

    mainContent.addEventListener('mousemove', (e) => {
        if (!isDraggingVertical) return;

        dragCurrentY = e.clientY;
    });

    mainContent.addEventListener('mouseup', (e) => {
        if (!isDraggingVertical) return;

        isDraggingVertical = false;
        mainContent.style.cursor = 'default';
        mainContent.style.userSelect = 'auto';

        const deltaY = dragCurrentY - dragStartY;
        const threshold = 80;

        if (Math.abs(deltaY) > threshold) {
            const sections = document.querySelectorAll('.subsection');
            const currentScrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;

            let targetSection = null;

            if (deltaY < 0) {
                // Dragged down - next section
                sections.forEach(section => {
                    if (section.offsetTop > currentScrollPosition + windowHeight / 3 && !targetSection) {
                        targetSection = section;
                    }
                });
            } else {
                // Dragged up - previous section
                const reverseSections = Array.from(sections).reverse();
                reverseSections.forEach(section => {
                    if (section.offsetTop < currentScrollPosition - windowHeight / 3 && !targetSection) {
                        targetSection = section;
                    }
                });
            }

            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        }

        dragStartY = 0;
        dragCurrentY = 0;
    });

    mainContent.addEventListener('mouseleave', () => {
        if (isDraggingVertical) {
            isDraggingVertical = false;
            mainContent.style.cursor = 'default';
            mainContent.style.userSelect = 'auto';
        }
    });
}