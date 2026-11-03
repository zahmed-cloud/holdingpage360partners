document.addEventListener('DOMContentLoaded', () => {
    const confettiContainer = document.getElementById('confetti-container');
    const colors = ['#0B1C2E', '#2FB7A6', '#5ECFB1', '#86C5B5', '#C9D6E3'];
    const shapes = ['square', 'rectangle', 'circle', 'triangle', 'line', 'cross'];

    function createConfetti() {
        const confetti = document.createElement('div');
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        confetti.classList.add('confetti', shape);

        // Random properties
        const bg = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const animDuration = Math.random() * 3 + 3; // 3-6s
        const animDelay = Math.random() * 5;
        const scale = Math.random() * 0.5 + 0.5;

        // Styles
        confetti.style.left = `${left}vw`;
        confetti.style.animationDuration = `${animDuration}s`;
        confetti.style.animationDelay = `${animDelay}s`;
        confetti.style.opacity = Math.random() + 0.2;
        confetti.style.transform = `scale(${scale})`;

        if (shape !== 'triangle' && shape !== 'line' && shape !== 'cross') {
            confetti.style.backgroundColor = bg;
        } else if (shape === 'triangle') {
            confetti.style.borderBottomColor = bg;
        } else if (shape === 'line') {
            confetti.style.backgroundColor = bg;
        } else if (shape === 'cross') {
            // For cross, we need to set the background of pseudo-elements. 
            // CSS variables are easiest here.
            confetti.style.setProperty('--confetti-color', bg);
        }

        // Specific shape adjustments handled in CSS (width/height etc)

        confettiContainer.appendChild(confetti);

        // Remove after animation to prevent memory leaks if we were spawning continuously (we are not yet)
        // confetti.addEventListener('animationend', () => { ... });
    }

    // Create a lot of confetti
    for (let i = 0; i < 60; i++) {
        // createConfetti(); // Confetti disabled per user request
    }
    // Premium Popup Logic
    // Premium Popup Logic
    const popup = document.getElementById('success-popup');
    const popupCard = document.querySelector('.popup-card-content');
    const contactForm = document.querySelector('.clean-form');

    // Make closePopup available globally
    window.closePopup = function () {
        if (popup) {
            popup.classList.add('opacity-0', 'pointer-events-none');
            // Reset card animation
            if (popupCard) {
                popupCard.classList.add('translate-y-10', 'scale-95');
            }
        }
    }

    // Google Sheet URL (User to provide)
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwwMLe3ldpdJfgXHYIolAVp0Jd5m2FtNy0ovF1U7qEsTa9OdkZ56J2rhny01psExHlTBA/exec';

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Stop actual submission

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            // Gather Data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value
            };

            // Basic Validation
            if (!formData.name || !formData.email || !formData.message) {
                alert('Please fill in all fields.');
                return;
            }

            // Show Loading State
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending...';

            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(formData),
                mode: 'no-cors', // Important for Google Apps Script Web App
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(() => {
                    // Success (no-cors mode always returns opaque response, so we assume success if no network error)
                    // Show Popup
                    if (popup) {
                        popup.classList.remove('opacity-0', 'pointer-events-none');
                        // Trigger card animation
                        if (popupCard) {
                            popupCard.classList.remove('translate-y-10', 'scale-95');
                        }
                    }
                    // Reset Form
                    contactForm.reset();
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Something went wrong. Please try again later.');
                })
                .finally(() => {
                    // Reset Button
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                });
        });
    }

    // Close on outside click
    if (popup) {
        popup.addEventListener('click', function (e) {
            if (e.target === popup) {
                closePopup();
            }
        });
    }
    // ==========================================
    // GSAP ANIMATIONS (High Level Joss Mode)
    // ==========================================

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Initial Hide to prevent flash
    gsap.set('.hero-title, .hero-subtitle, .hero-text, .hero-btn', { y: 100, opacity: 0 });
        gsap.set('#trusted-by', { opacity: 0, y: 30 });
    gsap.set('#contact > div', { opacity: 0, y: 40 });

    // 1. HERO ENTRANCE (Staggered & Elastic)
    const heroTl = gsap.timeline({ defaults: { ease: "power4.out" } });

    heroTl
        .to('.hero-title', { y: 0, opacity: 1, duration: 1.8, delay: 0.2 })
        .to('.hero-subtitle', { y: 0, opacity: 1, duration: 1.5 }, "-=1.4")
        .to('.hero-text', { y: 0, opacity: 1, duration: 1.5 }, "-=1.3")
        .to('.hero-btn', { y: 0, opacity: 1, duration: 1.2 }, "-=1.0");

    // 2. 3D TILT EFFECT (Mouse Parallax)
    const heroCard = document.querySelector('.glass-card');
    if (heroCard) {
        heroCard.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = heroCard.getBoundingClientRect();
            const x = (e.clientX - left) / width - 0.5;
            const y = (e.clientY - top) / height - 0.5;

            gsap.to(heroCard, {
                rotationY: x * 10, // Rotate Y axis based on X mouse
                rotationX: -y * 10, // Rotate X axis based on Y mouse (inverted)
                transformPerspective: 1000,
                duration: 0.5,
                ease: "power2.out"
            });
        });

        heroCard.addEventListener('mouseleave', () => {
            gsap.to(heroCard, {
                rotationY: 0,
                rotationX: 0,
                duration: 1,
                ease: "elastic.out(1, 0.5)"
            });
        });
    }

    // 4. TRUSTED BY (Explosive Pop)
    gsap.to('#trusted-by', {
        scrollTrigger: {
            trigger: '#trusted-by',
            start: "top 85%",
        },
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out"
    });

    // 5. CONTACT SECTION (Smooth Glide)
    gsap.to('#contact > div', {
        scrollTrigger: {
            trigger: '#contact',
            start: "top 75%",
        },
        y: 0,
        opacity: 1,
        duration: 1.5,
        ease: "power3.out"
    });

});
