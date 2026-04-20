/* ============================================================
   PORTFOLIO – CUTTING-EDGE JAVASCRIPT
   Three.js particle background, GSAP animations, cursor effects
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // 1. LOADER
    // ============================================================
    const loader = document.getElementById('loader');
    let loaderDismissed = false;

    function dismissLoader() {
        if (loaderDismissed) return;
        loaderDismissed = true;
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        loader.classList.add('hidden');
        document.body.style.overflow = 'auto';
        try { initHeroAnimations(); } catch(e) { console.log('Hero animations skipped:', e); }
    }

    // Force dismiss after 3 seconds no matter what
    setTimeout(dismissLoader, 3000);

    // ============================================================
    // 2. (Cursor removed for performance — using native cursor)
    // ============================================================

    // ============================================================
    // 3. THREE.JS PARTICLE NETWORK (ORIGINAL LOOK, OPTIMIZED)
    // ============================================================
    function initParticleBackground() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas || typeof THREE === 'undefined') return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const count = 200;
        const positions = new Float32Array(count * 3);
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
            velocities.push(
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.005
            );
        }

        const pointGeo = new THREE.BufferGeometry();
        pointGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const pointMat = new THREE.PointsMaterial({
            size: 0.05, color: 0x00f0ff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending
        });
        const points = new THREE.Points(pointGeo, pointMat);
        scene.add(points);

        // Pre-allocate line geometry — no object creation per frame
        const maxLines = 1200;
        const linePositions = new Float32Array(maxLines * 6);
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
        lineGeo.setDrawRange(0, 0);
        const lineMat = new THREE.LineBasicMaterial({
            color: 0x00f0ff, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending
        });
        const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
        scene.add(lineSegments);

        camera.position.z = 8;
        let targetCamX = 0, targetCamY = 0;

        document.addEventListener('mousemove', (e) => {
            targetCamX = (e.clientX / window.innerWidth - 0.5) * 1;
            targetCamY = -(e.clientY / window.innerHeight - 0.5) * 1;
        });

        function animate() {
            requestAnimationFrame(animate);
            const pos = pointGeo.attributes.position.array;

            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                pos[i3]     += velocities[i3];
                pos[i3 + 1] += velocities[i3 + 1];
                pos[i3 + 2] += velocities[i3 + 2];
                if (Math.abs(pos[i3])     > 10) velocities[i3]     *= -1;
                if (Math.abs(pos[i3 + 1]) > 10) velocities[i3 + 1] *= -1;
                if (Math.abs(pos[i3 + 2]) > 5)  velocities[i3 + 2] *= -1;
            }
            pointGeo.attributes.position.needsUpdate = true;

            // Update connection lines (no allocation)
            let lineIdx = 0;
            const lp = lineGeo.attributes.position.array;
            for (let i = 0; i < count && lineIdx < maxLines; i++) {
                for (let j = i + 1; j < count && lineIdx < maxLines; j++) {
                    const dx = pos[i*3]-pos[j*3], dy = pos[i*3+1]-pos[j*3+1], dz = pos[i*3+2]-pos[j*3+2];
                    if (dx*dx + dy*dy + dz*dz < 6.25) {
                        const o = lineIdx * 6;
                        lp[o]=pos[i*3]; lp[o+1]=pos[i*3+1]; lp[o+2]=pos[i*3+2];
                        lp[o+3]=pos[j*3]; lp[o+4]=pos[j*3+1]; lp[o+5]=pos[j*3+2];
                        lineIdx++;
                    }
                }
            }
            lineGeo.setDrawRange(0, lineIdx * 2);
            lineGeo.attributes.position.needsUpdate = true;

            // Mouse parallax on camera
            camera.position.x += (targetCamX * 0.5 - camera.position.x) * 0.05;
            camera.position.y += (targetCamY * 0.5 - camera.position.y) * 0.05;
            camera.lookAt(scene.position);

            points.rotation.y += 0.0005;

            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    initParticleBackground();

    // ============================================================
    // 4. NAVIGATION
    // ============================================================
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const scrollProgress = document.getElementById('scroll-progress');
    const backToTop = document.getElementById('back-to-top');

    // Scroll effects
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollY / docHeight) * 100;

        // Nav background
        nav.classList.toggle('scrolled', scrollY > 50);

        // Progress bar
        scrollProgress.style.width = scrollPercent + '%';

        // Back to top
        backToTop.classList.toggle('visible', scrollY > 500);
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.offsetTop - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // Back to top
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ============================================================
    // 5. GSAP HERO ANIMATIONS
    // ============================================================
    function initHeroAnimations() {
        if (typeof gsap === 'undefined') return;

        gsap.registerPlugin(ScrollTrigger);

        // Hero entrance — two-column layout
        const heroTl = gsap.timeline({ defaults: { ease: 'expo.out' } });
        heroTl
            .from('.hero-badge',            { y: 30, opacity: 0, duration: 0.8 })
            .from('.title-line',            { y: 60, opacity: 0, duration: 0.8, stagger: 0.15 }, '-=0.3')
            .from('.hero-description',      { y: 30, opacity: 0, duration: 0.8 }, '-=0.4')
            .from('.hero-cta .btn',         { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.4')
            .from('.hero-stats .stat',      { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.3')
            .from('.hero-socials',          { y: 20, opacity: 0, duration: 0.6 }, '-=0.3')
            .from('.hero-visual',           { x: 40, opacity: 0, duration: 1.0 }, '-=0.8')
            .from('.hero-scroll-indicator', { opacity: 0, duration: 1 }, '-=0.3');

        // Counter animation
        document.querySelectorAll('.stat-number').forEach(counter => {
            const target = parseInt(counter.dataset.count);
            gsap.to(counter, {
                innerText: target,
                duration: 2,
                snap: { innerText: 1 },
                ease: 'power2.out',
                delay: 1.5
            });
        });

        // Scroll-triggered reveals
        const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
        revealElements.forEach(el => {
            ScrollTrigger.create({
                trigger: el,
                start: 'top 85%',
                onEnter: () => el.classList.add('revealed'),
                once: true
            });
        });

        // Parallax hero elements
        gsap.to('.hero-floating-elements', {
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            },
            y: -100,
            opacity: 0
        });

        // Skill bar animations
        document.querySelectorAll('.skill-fill').forEach(fill => {
            const width = fill.dataset.width;
            fill.style.setProperty('--target-width', width + '%');
            ScrollTrigger.create({
                trigger: fill,
                start: 'top 90%',
                onEnter: () => fill.classList.add('animated'),
                once: true
            });
        });
    }

    // ============================================================
    // 6. TYPING EFFECT — About section
    // ============================================================
    const typedElement = document.getElementById('typed-about');
    if (typedElement) {
        const phrases = [
            'One Robot at a Time.',
            'With Code & Circuits.',
            'Through Automation.',
            'Using Machine Learning.',
            'By Design & Innovation.'
        ];
        let phraseIndex = 0, charIndex = 0, isDeleting = false;

        function typeEffect() {
            const current = phrases[phraseIndex];
            if (isDeleting) {
                typedElement.textContent = current.substring(0, charIndex--);
            } else {
                typedElement.textContent = current.substring(0, charIndex++);
            }

            let delay = isDeleting ? 40 : 80;

            if (!isDeleting && charIndex > current.length) {
                delay = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex < 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                delay = 500;
            }

            setTimeout(typeEffect, delay);
        }
        setTimeout(typeEffect, 3000);
    }

    // ============================================================
    // 6b. HERO ROLE TYPEWRITER (from Site A)
    // ============================================================
    const heroTyper = document.getElementById('hero-typer');
    if (heroTyper) {
        const roles = [
            'Robotics & Automation Engineer',
            'PLC & HMI Programmer',
            'ML & Data Analyst',
            'Industrial Automation Intern',
            'IoT Developer'
        ];
        let rIdx = 0, rChar = 0, rDeleting = false;

        function heroTypeEffect() {
            const role = roles[rIdx];
            heroTyper.textContent = rDeleting
                ? role.substring(0, rChar--)
                : role.substring(0, rChar++);

            let delay = rDeleting ? 45 : 90;

            if (!rDeleting && rChar > role.length) {
                delay = 1800;
                rDeleting = true;
            } else if (rDeleting && rChar < 0) {
                rDeleting = false;
                rIdx = (rIdx + 1) % roles.length;
                delay = 400;
            }
            setTimeout(heroTypeEffect, delay);
        }
        // Start after loader clears
        setTimeout(heroTypeEffect, 3200);
    }

    // ============================================================
    // 6c. EMAIL COPY BUTTON (from Site A)
    // ============================================================
    const emailCopyBtn = document.getElementById('emailCopyBtn');
    if (emailCopyBtn) {
        emailCopyBtn.addEventListener('click', () => {
            const email = emailCopyBtn.dataset.email;
            const label = document.getElementById('emailCopyLabel');
            navigator.clipboard.writeText(email).then(() => {
                label.innerHTML = '<i class="fas fa-check"></i> Copied!';
                label.style.color = 'var(--accent)';
                emailCopyBtn.style.borderColor = 'var(--accent)';
                setTimeout(() => {
                    label.innerHTML = '<i class="fas fa-copy"></i> Copy';
                    label.style.color = '';
                    emailCopyBtn.style.borderColor = '';
                }, 2500);
            }).catch(() => {
                // Fallback for browsers without clipboard API
                const el = document.createElement('textarea');
                el.value = email;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                label.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => { label.innerHTML = '<i class="fas fa-copy"></i> Copy'; }, 2500);
            });
        });
    }

    // ============================================================
    // 7. SKILL TABS
    // ============================================================
    const skillTabs = document.querySelectorAll('.skill-tab');
    const skillPanels = document.querySelectorAll('.skills-panel');

    skillTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetPanel = tab.dataset.tab;

            skillTabs.forEach(t => t.classList.remove('active'));
            skillPanels.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById('panel-' + targetPanel).classList.add('active');

            // Re-trigger skill bar animations
            document.querySelectorAll('#panel-' + targetPanel + ' .skill-fill').forEach(fill => {
                fill.classList.remove('animated');
                setTimeout(() => fill.classList.add('animated'), 100);
            });
        });
    });

    // ============================================================
    // 8. PROJECT FILTERS
    // ============================================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            projectCards.forEach(card => {
                const category = card.dataset.category;
                if (filter === 'all' || category.includes(filter)) {
                    card.classList.remove('hidden');
                    card.style.display = '';
                } else {
                    card.classList.add('hidden');
                    setTimeout(() => {
                        if (card.classList.contains('hidden')) {
                            card.style.display = 'none';
                        }
                    }, 500);
                }
            });
        });
    });

    // ============================================================
    // 9. SKILL CARD GLOW ON MOUSE MOVE
    // ============================================================
    document.querySelectorAll('.skill-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', x + '%');
            card.style.setProperty('--mouse-y', y + '%');
        });
    });

    // ============================================================
    // 10. MAGNETIC BUTTON EFFECT
    // ============================================================
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = 'translate(' + (x * 0.15) + 'px,' + (y * 0.15) + 'px)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });

    // ============================================================
    // 11. CONTACT FORM (CLIENT-SIDE ONLY)
    // ============================================================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.querySelector('.btn-text').textContent;

            btn.querySelector('.btn-text').textContent = 'Message Sent!';
            btn.querySelector('.btn-icon').innerHTML = '<i class="fas fa-check"></i>';
            btn.style.pointerEvents = 'none';

            setTimeout(() => {
                btn.querySelector('.btn-text').textContent = originalText;
                btn.querySelector('.btn-icon').innerHTML = '<i class="fas fa-paper-plane"></i>';
                btn.style.pointerEvents = 'auto';
                contactForm.reset();
            }, 3000);
        });
    }

    // ============================================================
    // 12. 3D TILT ON SKILL & PROJECT CARDS
    // ============================================================
    document.querySelectorAll('[data-tilt], .project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            const tiltX = (y - 0.5) * 8;
            const tiltY = (x - 0.5) * -8;
            card.style.transform = 'perspective(1000px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) translateY(-4px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // ============================================================
    // 13. ACTIVE NAV LINK HIGHLIGHT ON SCROLL
    // ============================================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 150;
            if (window.scrollY >= top) {
                current = section.id;
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

});
