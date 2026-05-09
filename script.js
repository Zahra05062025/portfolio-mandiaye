document.addEventListener("DOMContentLoaded", () => {
    // --- Smooth Scrolling (Lenis) ---
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    gsap.registerPlugin(ScrollTrigger);

    // Synchronize GSAP ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time)=>{
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    let ctx = gsap.context(() => {
        // --- Preloader ---
        const tlPreloader = gsap.timeline();
        tlPreloader.to('.preloader-line', {
            width: '100px', duration: 1.2, ease: 'power2.inOut'
        }).to('.preloader', {
            y: '-100%', duration: 1, ease: 'power3.inOut',
            onComplete: () => {
                document.body.classList.remove('loading');
                initHeroAnimations();
            }
        });

        // --- Hero Stagger Fade Up ---
        function initHeroAnimations() {
            gsap.fromTo('.fade-up-hero', 
                { y: 40, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 1.2, stagger: 0.12, ease: 'power3.out' }
            );
            
            gsap.fromTo('.navbar-pill',
                { y: -50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.5 }
            );
        }


        // --- Scroll Reveal Config ---
        const revealConfig = { duration: 1, ease: 'power3.out' };

        // General Fade Up Elements
        gsap.utils.toArray('.fade-up-scroll').forEach(el => {
            gsap.fromTo(el, 
                { y: 40, opacity: 0 },
                { scrollTrigger: { trigger: el, start: 'top 85%' }, y: 0, opacity: 1, ...revealConfig }
            );
        });

        // --- D. Timeline Cards Slide In ---
        gsap.utils.toArray('.timeline-item.left').forEach(el => {
            gsap.fromTo(el, 
                { x: -50, opacity: 0 },
                { scrollTrigger: { trigger: el, start: 'top 80%' }, x: 0, opacity: 1, ...revealConfig }
            );
        });
        
        gsap.utils.toArray('.timeline-item.right').forEach(el => {
            gsap.fromTo(el, 
                { x: 50, opacity: 0 },
                { scrollTrigger: { trigger: el, start: 'top 80%' }, x: 0, opacity: 1, ...revealConfig }
            );
        });

        // --- E. Skills / Tags Elastic Stagger ---
        gsap.fromTo('.skill-tag-weighted',
            { scale: 0.8, opacity: 0, y: 30 },
            { 
                scrollTrigger: { trigger: '.weighted-tags-container', start: 'top 80%' },
                scale: 1, opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'back.out(1.7)'
            }
        );

        // --- G. Contact Social Links Stagger ---
        gsap.fromTo('.social-link',
            { y: 20, opacity: 0 },
            { 
                scrollTrigger: { trigger: '.social-links-grid', start: 'top 90%' },
                y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out'
            }
        );

        // --- Parallax Effect on Images ---
        gsap.utils.toArray('.project-image img').forEach(img => {
            gsap.set(img, { scale: 1.15 }); // Prevent edge clipping during parallax
            gsap.fromTo(img, 
                { yPercent: -10 },
                { 
                    yPercent: 10,
                    ease: "none",
                    scrollTrigger: {
                        trigger: img.parentElement,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                }
            );
        });

    }); // End GSAP context

    // --- Custom Cursor & Magnetic Interactions ---
    const cursorDot = document.getElementById("cursor-dot");
    const cursorOutline = document.getElementById("cursor-outline");

    if (window.matchMedia("(pointer: fine)").matches) {
        window.addEventListener("mousemove", (e) => {
            const posX = e.clientX;
            const posY = e.clientY;
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
            cursorOutline.animate({ left: `${posX}px`, top: `${posY}px` }, { duration: 500, fill: "forwards" });
        });

        document.querySelectorAll("a, button, .timeline-card, .edu-card, .skill-tag-weighted").forEach(el => {
            el.addEventListener("mouseenter", () => cursorOutline.classList.add("hover"));
            el.addEventListener("mouseleave", () => cursorOutline.classList.remove("hover"));
        });

        // Magnetic Buttons implementation (scale 1.03 handled in CSS, translation handled here)
        document.querySelectorAll(".magnetic-btn-small, .magnetic-btn-large, .btn-outline").forEach(btn => {
            btn.addEventListener("mousemove", (e) => {
                const pos = btn.getBoundingClientRect();
                const x = e.clientX - pos.left - pos.width / 2;
                const y = e.clientY - pos.top - pos.height / 2;
                // Move button slightly towards cursor
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.03)`;
            });
            btn.addEventListener("mouseout", () => {
                btn.style.transform = "translate(0px, 0px) scale(1)";
            });
        });
    }

    // --- Hover Word Image Follower ---
    const follower = document.getElementById('hover-img-follower');
    const followerImg = document.getElementById('hover-img-src');
    
    if (follower && followerImg) {
        document.querySelectorAll('.hover-word').forEach(word => {
            word.addEventListener('mouseenter', () => {
                followerImg.src = word.dataset.img;
                follower.classList.add('active');
            });
            word.addEventListener('mouseleave', () => {
                follower.classList.remove('active');
            });
        });

        window.addEventListener('mousemove', (e) => {
            follower.style.left = e.clientX + 'px';
            follower.style.top = e.clientY + 'px';
        });
    }

    // --- Navbar Smart Hide/Show Logic ---
    let lastScrollY = window.scrollY;
    const navbar = document.querySelector('.navbar-pill');
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // 1. Hide if scrolling down
        if (currentScrollY > lastScrollY && currentScrollY > 150) {
            navbar.classList.add('hidden-nav');
        } 
        // 2. Show if scrolling up or at the very top
        else {
            navbar.classList.remove('hidden-nav');
        }
        
        lastScrollY = currentScrollY;
    }, { passive: true });

    // --- WhatsApp Form Handler ---
    const waForm = document.getElementById('whatsapp-form');
    if (waForm) {
        waForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('wa-name').value.trim();
            const project = document.getElementById('wa-project').value;
            const message = document.getElementById('wa-message').value.trim();
            
            const waNumber = "221781926969";
            const waMessage = `Bonjour Mandiaye,\n\nJe suis ${name}. J'aimerais te parler d'un projet de type : *${project}*.\n\n*Détails :*\n${message}\n\nJ'ai hâte d'échanger avec toi !`;
            const encodedMessage = encodeURIComponent(waMessage);
            
            window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, '_blank');
        });
    }

    // --- Read More Toggle: About ---
    const aboutBtn = document.getElementById('about-toggle-btn');
    const aboutExtra = document.getElementById('about-extra');
    if (aboutBtn && aboutExtra) {
        aboutBtn.addEventListener('click', () => {
            const isHidden = aboutExtra.style.display === 'none' || aboutExtra.style.display === '';
            aboutExtra.style.display = isHidden ? 'block' : 'none';
            aboutBtn.innerHTML = isHidden
                ? 'Voir moins <i data-lucide="chevron-up"></i>'
                : 'Voir plus <i data-lucide="chevron-down"></i>';
            lucide.createIcons();
        });
    }

    // --- Read More Toggle: Projects ---
    document.querySelectorAll('.project-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const extraContent = btn.previousElementSibling.querySelector('.project-extra');
            if (extraContent) {
                const isHidden = extraContent.style.display === 'none' || extraContent.style.display === '';
                extraContent.style.display = isHidden ? 'inline' : 'none';
                btn.innerHTML = isHidden
                    ? 'Voir moins <i data-lucide="chevron-up"></i>'
                    : 'Voir plus <i data-lucide="chevron-down"></i>';
                lucide.createIcons();
            }
        });
    });

    // --- Init Lucide Icons ---
    lucide.createIcons();

});
