// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        if (!isExpanded) {
            mobileMenu.removeAttribute('hidden');
        } else {
            mobileMenu.setAttribute('hidden', '');
        }
    });

    // Close menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.setAttribute('hidden', '');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mobileMenu.hasAttribute('hidden')) {
            mobileMenu.setAttribute('hidden', '');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// Fade-in on scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            window.scrollTo({
                top: target.offsetTop - navHeight - 20,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}, { passive: true });

// Form handling
const form = document.getElementById('applicationForm');
const formMessage = document.getElementById('formMessage');
const inputs = form.querySelectorAll('input[required]');

inputs.forEach(input => {
    input.addEventListener('blur', e => {
        const field = e.target;
        field.style.borderColor = field.value.trim() ? 'var(--accent)' : 'var(--red)';
    });
});

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    let isValid = true;
    inputs.forEach(input => {
        const value = input.value.trim();
        if (!value) {
            input.style.borderColor = 'var(--red)';
            isValid = false;
        } else {
            input.style.borderColor = 'var(--accent)';
        }
    });
    if (!isValid) {
        showFormMessage('Please fill all required fields.', 'error');
        return;
    }

    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        showFormMessage('🎉 Application received! We\'ll review and contact you within 48 hours.', 'success');
        form.reset();
        inputs.forEach(input => input.style.borderColor = '');
    } catch (error) {
        showFormMessage('Something went wrong. Please try again.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}-message`;
    formMessage.style.display = 'block';
    formMessage.scrollIntoView({ behavior: 'smooth' });
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '1';
});