// Typing effect configuration
const titles = [
    "Information and Computer Science Student",
    "Software Developer",
    "UI/UX Enthusiast",
    "Research Assistant"
];

let titleIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingSpeed = 100;
const deleteSpeed = 50;
const pauseTime = 1500;

// Typing effect function
function typeText() {
    const currentTitle = titles[titleIndex];
    const typedTextElement = document.getElementById('typed-text');

    if (isDeleting) {
        charIndex--;
        typedTextElement.textContent = currentTitle.substring(0, charIndex);
    } else {
        charIndex++;
        typedTextElement.textContent = currentTitle.substring(0, charIndex);
    }

    let delay = isDeleting ? deleteSpeed : typingSpeed;

    if (!isDeleting && charIndex === currentTitle.length) {
        delay = pauseTime;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        titleIndex = (titleIndex + 1) % titles.length;
    }

    setTimeout(typeText, delay);
}

// Particles.js configuration
const particlesConfig = {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: '#64ffda' },
        shape: { type: 'circle' },
        opacity: {
            value: 0.5,
            random: false,
            animation: { enable: true, speed: 1, minimumValue: 0.1, sync: false }
        },
        size: {
            value: 3,
            random: true,
            animation: { enable: true, speed: 2, minimumValue: 0.1, sync: false }
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: '#64ffda',
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 2,
            direction: 'none',
            random: false,
            straight: false,
            outModes: { default: 'out' },
            attract: { enable: false, rotateX: 600, rotateY: 1200 }
        }
    },
    interactivity: {
        detectOn: 'canvas',
        events: {
            onHover: { enable: true, mode: 'repulse' },
            onClick: { enable: true, mode: 'push' },
            resize: true
        },
        modes: {
            repulse: { distance: 100, duration: 0.4 },
            push: { particles_nb: 4 }
        }
    },
    retina_detect: true
};

// Initialize everything when the window loads
window.onload = function() {
    // Initialize particles
    particlesJS('particles-js', particlesConfig);
    
    // Start typing effect
    typeText();
};