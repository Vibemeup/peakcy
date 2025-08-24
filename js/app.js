// Enhanced Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            if (entry.target.classList.contains('identity-card') || 
                entry.target.classList.contains('pillar-card')) {
                const index = Array.from(entry.target.parentNode.children).indexOf(entry.target);
                entry.target.style.transitionDelay = `${index * 0.1}s`;
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navHeight - 20;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
let lastScrollY = window.scrollY;

function updateNavbar() {
    const scrollY = window.scrollY;
    if (scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    if (scrollY > lastScrollY && scrollY > 200) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }
    lastScrollY = scrollY;
}

window.addEventListener('scroll', () => {
    requestAnimationFrame(updateNavbar);
}, { passive: true });

// Form validation
const form = document.getElementById('applicationForm');
const formMessage = document.getElementById('formMessage');
const inputs = form.querySelectorAll('input[required]');

inputs.forEach(input => {
    input.addEventListener('blur', validateField);
    input.addEventListener('input', clearFieldError);
});

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    field.style.borderColor = '';
    if (!value) {
        field.style.borderColor = 'var(--red)';
        return false;
    }
    if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            field.style.borderColor = 'var(--red)';
            return false;
        }
    }
    if (field.type === 'tel') {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,}$/;
        if (!phoneRegex.test(value)) {
            field.style.borderColor = 'var(--red)';
            return false;
        }
    }
    field.style.borderColor = 'var(--accent)';
    return true;
}

function clearFieldError(e) {
    const field = e.target;
    if (field.value.trim()) {
        field.style.borderColor = '';
    }
}

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    let isValid = true;
    inputs.forEach(input => {
        if (!validateField({target: input})) {
            isValid = false;
        }
    });
    if (!isValid) {
        showFormMessage('Please check the highlighted fields and try again.', 'error');
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
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (type === 'success') {
        setTimeout(() => {
            formMessage.style.opacity = '0';
            setTimeout(() => {
                formMessage.style.display = 'none';
                formMessage.style.opacity = '1';
            }, 300);
        }, 8000);
    }
}

// Initial load
document.addEventListener('DOMContentLoaded', function() {
    document.body.style.opacity = '1';
});