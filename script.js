document.addEventListener('DOMContentLoaded', () => {

    // 1. Scroll Reveal Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Special handling for skill bars
                if (entry.target.classList.contains('stack-box')) {
                    const skillBars = entry.target.querySelectorAll('.bar-fill');
                    skillBars.forEach(bar => {
                        const width = bar.style.width;
                        bar.style.width = '0';
                        setTimeout(() => {
                            bar.style.width = width;
                        }, 100);
                    });
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => revealObserver.observe(el));

    // 2. Smooth Scroll for Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 3. Header Scroll Effect
    const header = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(10, 10, 10, 0.95)';
            header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.5)';
        } else {
            header.style.background = 'rgba(10, 10, 10, 0.8)';
            header.style.boxShadow = 'none';
        }
    });

    // 4. Parallax effect for hero image (subtle)
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        window.addEventListener('scroll', () => {
            const speed = 0.15;
            const yPos = -(window.scrollY * speed);
            heroVisual.style.transform = `translateY(${yPos}px)`;
        });
    }

    // 5. Free Board Logic
    const boardForm = document.getElementById('board-form');
    const boardContainer = document.getElementById('board-items-container');
    const BOARD_STORAGE_KEY = 'ag_free_board_items';
    const MY_POSTS_KEY = 'ag_my_post_ids';

    let myPostIds = JSON.parse(localStorage.getItem(MY_POSTS_KEY) || '[]');
    let currentEditId = null;

    const btnToggleWrite = document.getElementById('btn-toggle-write');
    const formWrapper = document.getElementById('board-form-wrapper');
    const btnCancelWrite = document.getElementById('btn-cancel-write');
    const formTitle = document.getElementById('board-form-title');

    function getBoardItems() {
        return JSON.parse(localStorage.getItem(BOARD_STORAGE_KEY) || '[]');
    }

    function saveBoardItems(items) {
        localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(items));
    }

    if (btnToggleWrite && formWrapper) {
        btnToggleWrite.addEventListener('click', () => {
            currentEditId = null;
            if(formTitle) formTitle.innerText = '문의 및 요청사항 등록';
            if(boardForm) boardForm.reset();
            formWrapper.classList.add('active');
            btnToggleWrite.style.display = 'none';
        });

        if (btnCancelWrite) {
            btnCancelWrite.addEventListener('click', () => {
                formWrapper.classList.remove('active');
                btnToggleWrite.style.display = 'inline-block';
                currentEditId = null;
                if(boardForm) boardForm.reset();
            });
        }
    }

    function renderBoardItems() {
        if (!boardContainer) return;
        const items = getBoardItems();
        boardContainer.innerHTML = '';
        
        if (items.length === 0) {
            boardContainer.innerHTML = '<p class="board-empty">등록된 게시물이 없습니다.</p>';
            return;
        }

        // Sort descending
        items.sort((a, b) => b.id - a.id).forEach(item => {
            const el = document.createElement('div');
            el.className = 'board-card';
            
            let repliesHtml = '';
            if (item.replies && item.replies.length > 0) {
                const replies = item.replies.map(r => {
                    const safeText = r.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    return `<div class="board-reply"><span class="reply-icon">↳</span> <span class="reply-text">${safeText}</span> <span class="reply-date">${r.date}</span></div>`;
                }).join('');
                repliesHtml = '<div class="board-replies">' + replies + '</div>';
            }

            const safeContent = item.content.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, '<br>');
            const safeName = item.name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const safeEmail = item.email.replace(/</g, "&lt;").replace(/>/g, "&gt;");

            const isMine = myPostIds.includes(item.id);
            const editBtnHtml = isMine ? `<button type="button" class="btn btn-small secondary btn-edit" data-id="${item.id}">수정</button>` : '';
            const deleteBtnHtml = isMine ? `<button type="button" class="btn btn-small danger btn-delete" data-id="${item.id}">삭제</button>` : '';

            el.innerHTML = `
                <div class="board-card-header">
                    <span class="board-author">${safeName} <small>(${safeEmail})</small></span>
                    <span class="board-date">${item.date}</span>
                </div>
                <div class="board-card-body">
                    ${safeContent}
                </div>
                ${repliesHtml}
                <div class="board-card-actions">
                    <div class="reply-input-group" style="display:none;">
                        <input type="text" class="reply-input" placeholder="답변을 입력하세요...">
                        <button type="button" class="btn btn-small primary btn-reply-submit" data-id="${item.id}">등록</button>
                    </div>
                    <button type="button" class="btn btn-small secondary btn-reply-toggle">답변 달기</button>
                    ${editBtnHtml}
                    ${deleteBtnHtml}
                </div>
            `;
            boardContainer.appendChild(el);
        });

        // Delete handlers
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if(confirm('게시물을 삭제하시겠습니까?')) {
                    const id = parseInt(e.target.dataset.id);
                    let items = getBoardItems();
                    items = items.filter(i => i.id !== id);
                    saveBoardItems(items);
                    
                    // remove from myPostIds
                    myPostIds = myPostIds.filter(pid => pid !== id);
                    localStorage.setItem(MY_POSTS_KEY, JSON.stringify(myPostIds));
                    
                    renderBoardItems();
                }
            });
        });

        // Edit handlers
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                const items = getBoardItems();
                const item = items.find(i => i.id === id);
                if (item && formWrapper) {
                    currentEditId = id;
                    document.getElementById('b-name').value = item.name;
                    document.getElementById('b-email').value = item.email;
                    document.getElementById('b-content').value = item.content;
                    
                    if(formTitle) formTitle.innerText = '게시물 수정';
                    formWrapper.classList.add('active');
                    if(btnToggleWrite) btnToggleWrite.style.display = 'none';
                    formWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        });

        // Reply Toggle
        document.querySelectorAll('.btn-reply-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const group = e.target.previousElementSibling;
                const isHidden = group.style.display === 'none';
                document.querySelectorAll('.reply-input-group').forEach(g => g.style.display = 'none');
                if (isHidden) {
                    group.style.display = 'flex';
                    group.querySelector('input').focus();
                }
            });
        });

        // Reply Submit
        document.querySelectorAll('.btn-reply-submit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                const input = e.target.previousElementSibling;
                const replyText = input.value.trim();
                
                if (replyText) {
                    let items = getBoardItems();
                    const item = items.find(i => i.id === id);
                    if (item) {
                        if (!item.replies) item.replies = [];
                        const now = new Date();
                        const dateString = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
                        item.replies.push({ text: replyText, date: dateString });
                        saveBoardItems(items);
                        renderBoardItems();
                    }
                }
            });
        });
        
        document.querySelectorAll('.reply-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.target.nextElementSibling.click();
                }
            });
        });
    }

    if (boardForm) {
        boardForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('b-name').value;
            const email = document.getElementById('b-email').value;
            const content = document.getElementById('b-content').value;
            
            const now = new Date();
            const dateString = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
            
            const items = getBoardItems();

            if (currentEditId) {
                // Edit existing post
                const index = items.findIndex(i => i.id === currentEditId);
                if (index > -1) {
                    items[index].name = name;
                    items[index].email = email;
                    items[index].content = content;
                    saveBoardItems(items);
                    alert('수정되었습니다.');
                }
            } else {
                // Create new post
                const newItem = {
                    id: Date.now(),
                    name,
                    email,
                    content,
                    date: dateString,
                    replies: []
                };
                items.push(newItem);
                saveBoardItems(items);
                
                myPostIds.push(newItem.id);
                localStorage.setItem(MY_POSTS_KEY, JSON.stringify(myPostIds));
                alert('등록되었습니다.');
            }
            
            boardForm.reset();
            currentEditId = null;
            if(formWrapper) formWrapper.classList.remove('active');
            if(btnToggleWrite) btnToggleWrite.style.display = 'inline-block';
            
            renderBoardItems();
        });

        // Initial render
        renderBoardItems();
    }

    // 6. Background Particle Animation
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        
        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.radius = Math.random() * 1.5 + 0.5;
                this.color = `rgba(255, 80, 0, ${Math.random() * 0.5 + 0.2})`;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        // Adjust particle count based on screen width for performance and density
        const particleCount = window.innerWidth < 768 ? 40 : 80;
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx*dx + dy*dy);
                    
                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(225, 30, 0, ${0.1 - (distance / 1500)})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }

            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        }
        animate();
    }

    // 7. Dynamic Typewriter Effect
    const typeTarget = document.getElementById('hero-typewriter');
    if (typeTarget) {
        typeTarget.innerHTML = '<span class="typed-text"></span><span class="cursor" style="color:var(--brand-orange); font-weight:bold; animation: blinkCursor 0.75s step-end infinite;">|</span>';
        const textSpan = typeTarget.querySelector('.typed-text');
        
        const rawText = "초정밀 정비로 반도체 수율의 한계를 넘는\n신뢰성 중심 엔지니어, 강지우입니다.";
        let htmlStr = "";
        let i = 0;
        
        function typeWriter() {
            if (i < rawText.length) {
                let char = rawText.charAt(i);
                if (char === '\n') {
                    htmlStr += "<br>";
                } else if (rawText.substring(i, i+3) === "강지우") {
                    htmlStr += "<b style='color:#fff'>강지우</b>";
                    i += 2; // skip the next 2 characters since we wrote them
                } else {
                    htmlStr += char;
                }
                textSpan.innerHTML = htmlStr;
                i++;
                setTimeout(typeWriter, 60);
            }
        }
        setTimeout(typeWriter, 1200);
    }
});
