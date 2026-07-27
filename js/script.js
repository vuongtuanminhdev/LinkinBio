/**
 * MV.Novix Store - Captcha Module (tối ưu)
 * Sử dụng IIFE để tránh ô nhiễm global scope
 */
(function () {
    'use strict';

    // Cache DOM elements
    const overlay = document.getElementById('captchaOverlay');
    const questionEl = document.getElementById('captchaQuestion');
    const inputEl = document.getElementById('captchaInput');
    const btnEl = document.getElementById('captchaBtn');
    const errorEl = document.getElementById('captchaError');
    const refreshBtn = document.getElementById('captchaRefresh');

    // State
    let num1 = 0;
    let num2 = 0;
    let correctAnswer = 0;
    let isTransitioning = false;
    const STORAGE_KEY = 'captcha_passed_v2';

    /**
     * Sinh câu hỏi toán học ngẫu nhiên
     */
    function generateQuestion() {
        num1 = Math.floor(Math.random() * 9) + 1; // 1-9
        num2 = Math.floor(Math.random() * 9) + 1; // 1-9
        correctAnswer = num1 + num2;
        questionEl.textContent = `${num1} + ${num2} = ?`;
        errorEl.textContent = '';
        inputEl.value = '';
        inputEl.focus({ preventScroll: true });
        isTransitioning = false;
    }

    /**
     * Hiển thị lỗi với animation fade
     */
    function showError(message) {
        errorEl.textContent = message;
        errorEl.style.opacity = '0';
        requestAnimationFrame(() => {
            errorEl.style.transition = 'opacity 0.25s ease';
            errorEl.style.opacity = '1';
        });
    }

    /**
     * Khóa/Mở khóa cuộn trang
     */
    function lockScroll(lock) {
        document.body.style.overflow = lock ? 'hidden' : '';
    }

    /**
     * Xác minh câu trả lời
     */
    function verify() {
        if (isTransitioning) return;

        const userAnswer = parseInt(inputEl.value.trim(), 10);

        if (isNaN(userAnswer)) {
            showError('⚠️ Vui lòng nhập một số.');
            inputEl.focus({ preventScroll: true });
            return;
        }

        if (userAnswer === correctAnswer) {
            // Thành công
            isTransitioning = true;
            sessionStorage.setItem(STORAGE_KEY, 'true');
            overlay.style.transition = 'opacity 0.4s ease, visibility 0.4s ease';
            overlay.classList.add('hidden');
            inputEl.blur();
            lockScroll(false);
        } else {
            // Thất bại -> tạo câu hỏi mới
            showError('❌ Sai rồi, thử lại nhé!');
            inputEl.value = '';
            generateQuestion();
        }
    }

    /**
     * Kiểm tra session đã xác minh chưa
     */
    function checkSession() {
        if (sessionStorage.getItem(STORAGE_KEY) === 'true') {
            overlay.classList.add('hidden');
            lockScroll(false);
        } else {
            overlay.classList.remove('hidden');
            lockScroll(true);
            generateQuestion();
        }
    }

    // ===== EVENT LISTENERS =====
    btnEl.addEventListener('click', verify, { passive: true });

    inputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            verify();
        }
    }, { passive: false });

    refreshBtn.addEventListener('click', generateQuestion, { passive: true });

    // Ngăn thoát captcha bằng ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
            e.preventDefault();
            inputEl.focus({ preventScroll: true });
        }
    }, { passive: false });

    // Ngăn context menu trên overlay
    overlay.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    }, { passive: false });

    // Xử lý khi tab được focus lại
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) return;
        if (sessionStorage.getItem(STORAGE_KEY) !== 'true') {
            overlay.classList.remove('hidden');
            lockScroll(true);
            generateQuestion();
        }
    }, { passive: true });

    // MutationObserver để focus input khi overlay xuất hiện
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.target === overlay && !overlay.classList.contains('hidden')) {
                setTimeout(function () {
                    inputEl.focus({ preventScroll: true });
                }, 350);
            }
        });
    });
    observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });

    // Khởi tạo
    checkSession();

})();