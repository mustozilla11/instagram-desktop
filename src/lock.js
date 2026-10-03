(function() {
    console.log("[Instagram Desktop] Kilit modülü başlatılıyor...");

    async function sha256(str) {
        const buffer = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    function createOverlay() {
        if (document.getElementById('ig-desktop-lock-root')) return;

        const style = document.createElement('style');
        style.id = 'ig-desktop-lock-style';
        style.textContent = `
            #ig-desktop-lock-root {
                position: fixed;
                inset: 0;
                width: 100vw;
                height: 100vh;
                background-color: #000000;
                color: #f5f5f5;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                z-index: 2147483647;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                user-select: none;
            }
            .ig-lock-card {
                background: #1a1a1a;
                border: 1px solid #2d2d2d;
                padding: 40px 32px;
                border-radius: 20px;
                box-shadow: 0 15px 40px rgba(0,0,0,0.85);
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 340px;
                max-width: 90vw;
                text-align: center;
                position: relative;
            }
            .ig-logo-badge {
                width: 64px;
                height: 64px;
                border-radius: 18px;
                background: linear-gradient(45deg, #ffd600, #ff7a00, #ff0069, #d300c5, #7638fa);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                margin-bottom: 20px;
                box-shadow: 0 4px 15px rgba(211, 0, 197, 0.4);
            }
            .ig-lock-title {
                font-size: 22px;
                font-weight: 700;
                margin-bottom: 8px;
                color: #ffffff;
            }
            .ig-lock-desc {
                font-size: 13px;
                color: #a8a8a8;
                margin-bottom: 24px;
                line-height: 1.4;
            }
            .ig-lock-input {
                width: 100%;
                background: #262626;
                border: 1px solid #363636;
                border-radius: 10px;
                padding: 12px 16px;
                font-size: 18px;
                color: #ffffff;
                text-align: center;
                letter-spacing: 4px;
                outline: none;
                margin-bottom: 12px;
                box-sizing: border-box;
                transition: border-color 0.2s, box-shadow 0.2s;
            }
            .ig-lock-input:focus {
                border-color: #d300c5;
                box-shadow: 0 0 0 2px rgba(211, 0, 197, 0.25);
            }
            .ig-lock-btn {
                width: 100%;
                background: linear-gradient(45deg, #ff7a00, #ff0069, #d300c5);
                color: #ffffff;
                font-weight: 600;
                font-size: 15px;
                padding: 12px;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                transition: opacity 0.2s, transform 0.1s;
                margin-top: 6px;
            }
            .ig-lock-btn:hover {
                opacity: 0.92;
            }
            .ig-lock-btn:active {
                transform: scale(0.98);
            }
            .ig-lock-error {
                color: #ed4956;
                font-size: 12px;
                margin-top: 10px;
                min-height: 16px;
                font-weight: 500;
            }
            .ig-lock-sublink {
                color: #0095f6;
                font-size: 13px;
                margin-top: 18px;
                cursor: pointer;
                text-decoration: none;
                transition: color 0.2s;
            }
            .ig-lock-sublink:hover {
                text-decoration: underline;
                color: #38bdf8;
            }
            @keyframes ig-shake {
                0%, 100% { transform: translateX(0); }
                20%, 60% { transform: translateX(-8px); }
                40%, 80% { transform: translateX(8px); }
            }
            .ig-shake-anim {
                animation: ig-shake 0.3s ease-in-out;
            }
        `;
        document.documentElement.appendChild(style);

        const root = document.createElement('div');
        root.id = 'ig-desktop-lock-root';
        root.innerHTML = `
            <div class="ig-lock-card" id="ig-lock-card">
                <div class="ig-logo-badge">🔒</div>
                <div class="ig-lock-title" id="ig-lock-title">Instagram Kilitli</div>
                <div class="ig-lock-desc" id="ig-lock-desc">Devam etmek için güvenlik PIN kodunuzu girin.</div>
                <input type="password" id="ig-lock-input" class="ig-lock-input" maxlength="20" placeholder="••••" autocomplete="off" />
                <button type="button" id="ig-lock-btn" class="ig-lock-btn">Kilidi Aç</button>
                <div id="ig-lock-error" class="ig-lock-error"></div>
                <div id="ig-lock-sublink" class="ig-lock-sublink">PIN Değiştir / Kaldır</div>
            </div>
        `;
        document.documentElement.appendChild(root);

        const input = root.querySelector('#ig-lock-input');
        const btn = root.querySelector('#ig-lock-btn');
        const err = root.querySelector('#ig-lock-error');
        const title = root.querySelector('#ig-lock-title');
        const desc = root.querySelector('#ig-lock-desc');
        const card = root.querySelector('#ig-lock-card');
        const sublink = root.querySelector('#ig-lock-sublink');

        let mode = 'unlock'; // 'unlock', 'set_new', 'confirm_new', 'change_old', 'change_choice'
        let tempNewPin = '';

        function updateUI() {
            err.textContent = '';
            input.value = '';
            const savedHash = localStorage.getItem('ig_lock_pin_hash');

            if (!savedHash) {
                mode = 'set_new';
                title.textContent = 'PIN Belirleyin';
                desc.textContent = 'Instagram güvenliğiniz için 4-8 haneli bir PIN kodu girin.';
                btn.textContent = 'İleri';
                sublink.style.display = 'none';
                input.style.display = 'block';
            } else if (mode === 'unlock') {
                title.textContent = 'Instagram Kilitli';
                desc.textContent = 'Devam etmek için güvenlik PIN kodunuzu girin.';
                btn.textContent = 'Kilidi Aç';
                sublink.style.display = 'block';
                sublink.textContent = 'PIN Değiştir / Kaldır';
                input.style.display = 'block';
            }
            setTimeout(() => input.focus(), 60);
        }

        async function handleSubmit() {
            err.textContent = '';
            const val = input.value.trim();

            if (mode !== 'change_choice' && !val) {
                shake('Lütfen PIN kodunuzu girin.');
                return;
            }

            const savedHash = localStorage.getItem('ig_lock_pin_hash');

            if (mode === 'unlock') {
                const hash = await sha256(val);
                if (hash === savedHash) {
                    sessionStorage.setItem('ig_is_locked', 'false');
                    root.style.display = 'none';
                    input.value = '';
                } else {
                    shake('Hatalı PIN kodu! Lütfen tekrar deneyin.');
                }
            } else if (mode === 'set_new') {
                if (val.length < 4) {
                    shake('PIN en az 4 karakter olmalıdır.');
                    return;
                }
                tempNewPin = val;
                mode = 'confirm_new';
                title.textContent = 'PIN Tekrarı';
                desc.textContent = 'Belirlediğiniz PIN kodunu onaylamak için tekrar girin.';
                btn.textContent = 'Kaydet ve Kilidi Aç';
                input.value = '';
                input.focus();
            } else if (mode === 'confirm_new') {
                if (val !== tempNewPin) {
                    shake('PIN kodları eşleşmedi! Tekrar deneyin.');
                    mode = 'set_new';
                    updateUI();
                    return;
                }
                const hash = await sha256(val);
                localStorage.setItem('ig_lock_pin_hash', hash);
                sessionStorage.setItem('ig_is_locked', 'false');
                root.style.display = 'none';
                input.value = '';
                tempNewPin = '';
            } else if (mode === 'change_old') {
                const hash = await sha256(val);
                if (hash === savedHash) {
                    mode = 'change_choice';
                    title.textContent = 'PIN Yönetimi';
                    desc.textContent = 'PIN kodunu değiştirmek mi yoksa kilidi tamamen kaldırmak mı istiyorsunuz?';
                    btn.textContent = 'Yeni PIN Belirle';
                    sublink.style.display = 'block';
                    sublink.textContent = 'Kilidi Tamamen Kaldır';
                    input.style.display = 'none';
                } else {
                    shake('Mevcut PIN hatalı!');
                }
            }
        }

        function shake(msg) {
            err.textContent = msg;
            card.classList.remove('ig-shake-anim');
            void card.offsetWidth;
            card.classList.add('ig-shake-anim');
            input.focus();
        }

        btn.addEventListener('click', () => {
            if (mode === 'change_choice') {
                input.style.display = 'block';
                mode = 'set_new';
                updateUI();
                return;
            }
            handleSubmit();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleSubmit();
            }
        });

        sublink.addEventListener('click', () => {
            if (mode === 'change_choice') {
                localStorage.removeItem('ig_lock_pin_hash');
                sessionStorage.setItem('ig_is_locked', 'false');
                root.style.display = 'none';
                return;
            }
            mode = 'change_old';
            input.style.display = 'block';
            title.textContent = 'Mevcut PIN';
            desc.textContent = 'Değiştirmek veya kaldırmak için lütfen mevcut PIN kodunuzu girin.';
            btn.textContent = 'Doğrula';
            sublink.style.display = 'none';
            input.value = '';
            input.focus();
        });

        window.__igLock = function() {
            sessionStorage.setItem('ig_is_locked', 'true');
            mode = 'unlock';
            updateUI();
            root.style.display = 'flex';
        };

        window.__igChangePin = function() {
            root.style.display = 'flex';
            const savedHash = localStorage.getItem('ig_lock_pin_hash');
            if (savedHash) {
                mode = 'change_old';
                input.style.display = 'block';
                title.textContent = 'Mevcut PIN';
                desc.textContent = 'PIN değiştirmek için mevcut PIN kodunuzu girin.';
                btn.textContent = 'Doğrula';
                sublink.style.display = 'none';
                input.value = '';
                input.focus();
            } else {
                mode = 'set_new';
                updateUI();
            }
        };

        const isLocked = sessionStorage.getItem('ig_is_locked');
        const hasHash = localStorage.getItem('ig_lock_pin_hash');
        if (hasHash && isLocked !== 'false') {
            root.style.display = 'flex';
            updateUI();
        } else if (!hasHash) {
            // First run, prompt to set PIN
            root.style.display = 'flex';
            updateUI();
        } else {
            root.style.display = 'none';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createOverlay);
    } else {
        createOverlay();
    }
})();
