class UserManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('focus_users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('focus_current_user')) || null;
    }

    register(username, password) {
        if (this.users.find(u => u.username === username)) {
            return { success: false, message: 'Username already exists' };
        }
        const newUser = { id: Date.now(), username, password };
        this.users.push(newUser);
        localStorage.setItem('focus_users', JSON.stringify(this.users));
        this.currentUser = newUser;
        localStorage.setItem('focus_current_user', JSON.stringify(newUser));
        return { success: true, user: newUser };
    }

    login(username, password) {
        const user = this.users.find(u => u.username === username && u.password === password);
        if (user) {
            this.currentUser = user;
            localStorage.setItem('focus_current_user', JSON.stringify(user));
            return { success: true, user };
        }
        return { success: false, message: 'Invalid credentials' };
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('focus_current_user');
    }
}

class Timer {
    constructor() {
        this.userManager = new UserManager();
        this.currentUser = this.userManager.currentUser;

        this.duration = 0; // in seconds
        this.remaining = 0;
        this.elapsed = 0; // For stopwatch
        this.mode = 'timer'; // 'timer' or 'stopwatch' or 'pomodoro'
        this.isRunning = false;
        this.interval = null;
        this.currentLang = 'ko'; // Default language

        // Session & History
        this.currentSessionName = '';
        this.currentSessionRating = 0;
        this.history = []; // Will load on init if logged in

        // Pomodoro properties
        this.pomodoroRound = 1;
        this.pomodoroMaxRounds = 4;
        this.pomodoroPhase = 'focus'; // 'focus', 'short-break', 'long-break'
        this.pomodoroSettings = {
            focus: 25,
            shortBreak: 5,
            longBreak: 15,
            rounds: 4
        };

        // DOM Elements
        this.setupScreen = document.getElementById('setup-screen');
        this.timerScreen = document.getElementById('timer-screen');
        this.logo = document.querySelector('.logo');

        this.inputHours = document.getElementById('input-hours');
        this.inputMinutes = document.getElementById('input-minutes');
        this.inputSeconds = document.getElementById('input-seconds');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');

        this.digitalDisplay = document.getElementById('time-remaining');

        this.minHand = document.querySelector('.minute-hand');
        this.secHand = document.querySelector('.second-hand');
        this.progressRing = document.querySelector('.progress-ring__circle');

        // Ring setup
        const radius = this.progressRing.r.baseVal.value;
        this.circumference = radius * 2 * Math.PI;
        this.progressRing.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        this.progressRing.style.strokeDashoffset = this.circumference;

        // View Toggles
        this.toggleAnalog = document.getElementById('toggle-analog');
        this.toggleDigital = document.getElementById('toggle-digital');
        this.digitalView = document.getElementById('digital-display');
        this.analogView = document.getElementById('analog-display');

        // Mode Switcher Elements
        this.modeTimerBtn = document.getElementById('mode-timer');
        this.modePomodoroBtn = document.getElementById('mode-pomodoro');
        this.modeStopwatchBtn = document.getElementById('mode-stopwatch');
        this.modeTodoBtn = document.getElementById('mode-todo');
        this.modePlannerBtn = document.getElementById('mode-planner');

        this.timerInputs = document.getElementById('timer-inputs');
        this.stopwatchPreview = document.getElementById('stopwatch-preview');

        // Pomodoro elements
        this.pomodoroContainer = document.getElementById('pomodoro-container');
        this.pomodoroFocusInput = document.getElementById('pomodoro-focus');
        this.pomodoroShortInput = document.getElementById('pomodoro-short');
        this.pomodoroLongInput = document.getElementById('pomodoro-long');
        this.pomodoroRoundsInput = document.getElementById('pomodoro-rounds');
        this.pomodoroStatus = document.querySelector('.pomodoro-status');
        this.pomodoroCount = document.querySelector('.cycle-count');

        this.todoContainer = document.getElementById('todo-container');
        this.todoInput = document.getElementById('todo-input');
        this.todoList = document.getElementById('todo-list');

        this.plannerContainer = document.getElementById('planner-container');
        this.planSubject = document.getElementById('plan-subject');
        this.planDay = document.getElementById('plan-day');
        this.planTime = document.getElementById('plan-time');
        this.addPlanBtn = document.getElementById('add-plan-btn');
        this.plannerList = document.getElementById('planner-list'); // tbody

        // Auth Elements
        this.authScreen = document.getElementById('auth-screen');
        this.appContainer = document.getElementById('app-container');
        this.logoutBtn = document.getElementById('logout-btn');

        this.loginForm = document.getElementById('login-form');
        this.signupForm = document.getElementById('signup-form');
        this.showSignupBtn = document.getElementById('show-signup');
        this.showLoginBtn = document.getElementById('show-login');

        this.loginBtn = document.getElementById('login-btn');
        this.signupBtn = document.getElementById('signup-btn');

        this.loginUsername = document.getElementById('login-username');
        this.loginPassword = document.getElementById('login-password');
        this.signupUsername = document.getElementById('signup-username');
        this.signupPassword = document.getElementById('signup-password');
        this.signupConfirm = document.getElementById('signup-confirm');

        // Session & History Elements
        this.sessionNameInput = document.getElementById('session-name');
        this.ratingModal = document.getElementById('rating-modal');
        this.ratingStars = document.querySelectorAll('.star');
        this.ratingSaveBtn = document.getElementById('rating-save-btn');
        this.historyView = document.getElementById('history-view');
        this.toggleHistoryBtn = document.getElementById('toggle-history');
        this.closeHistoryBtn = document.getElementById('close-history');
        this.exportExcelBtn = document.getElementById('export-excel-btn');
        this.historyList = document.getElementById('history-list');

        // Theme Elements
        this.themeBtn = document.getElementById('theme-toggle');
        this.sunIcon = document.querySelector('.sun-icon');
        this.moonIcon = document.querySelector('.moon-icon');
        this.isDark = false;

        // Language Toggle
        this.langBtn = document.getElementById('lang-toggle');

        this.plans = []; // Store plans for sorting

        // Language translations
        this.translations = {
            en: {
                logoTimer: 'Focus.',
                logoStopwatch: 'Track.',
                logoTodo: 'Flow.',
                logoPlanner: 'Plan.',
                logoPlanner: 'Plan.',
                logoPomodoro: 'Pace.',
                startTimer: 'Start Timer',
                startStopwatch: 'Start Stopwatch',
                startPomodoro: 'Start Pomodoro',
                hours: 'Hours',
                minutes: 'Minutes',
                seconds: 'Seconds',
                todoPlaceholder: 'What needs to be done?',
                planSubject: 'Subject',
                timeUp: 'Time is up!',
                focusTime: 'Focus Time',
                shortBreak: 'Short Break',
                longBreak: 'Long Break',
                focusTimeLabel: 'Focus Time',
                shortBreakLabel: 'Short Break',
                longBreakLabel: 'Long Break',
                roundsLabel: 'Rounds Until Long Break',
                roundLabel: 'Round',
                roundsUnit: 'rounds',
                breakTimeUp: 'Break is over!',
                focusComplete: 'Focus session complete!',
                history: 'History',
                save: 'Save',
                sessionComplete: 'Session Complete!',
                howWasFocus: 'How was your focus?',
                sessionNamePlaceholder: 'Session Name (Optional)',
                exportExcel: 'Export Excel'
            },
            ko: {
                logoTimer: '집중.',
                logoStopwatch: '기록.',
                logoTodo: '흐름.',
                logoPlanner: '계획.',
                logoPlanner: '계획.',
                logoPomodoro: '페이스.',
                startTimer: '타이머 시작',
                startStopwatch: '스톱워치 시작',
                startPomodoro: '뽀모도로 시작',
                hours: '시간',
                minutes: '분',
                seconds: '초',
                todoPlaceholder: '할 일을 입력하세요',
                planSubject: '과목',
                timeUp: '시간이 다 됐어요!',
                focusTime: '집중 시간',
                shortBreak: '짧은 휴식',
                longBreak: '긴 휴식',
                focusTimeLabel: '집중 시간',
                shortBreakLabel: '짧은 휴식',
                longBreakLabel: '긴 휴식',
                roundsLabel: '긴 휴식까지 라운드',
                roundLabel: '라운드',
                roundsUnit: '라운드',
                breakTimeUp: '휴식 끝!',
                focusComplete: '집중 완료!',
                history: '집중 기록',
                save: '저장',
                sessionComplete: '세션 종료!',
                howWasFocus: '집중도는 어땠나요?',
                sessionNamePlaceholder: '세션 이름 (선택사항)',
                exportExcel: 'Excel 내보내기'
            }
        };

        this.init();
        this.checkAuth();
    }

    checkAuth() {
        if (this.currentUser) {
            this.showApp();
        } else {
            this.showAuth();
        }
    }

    showApp() {
        this.authScreen.classList.add('hidden');
        this.appContainer.classList.remove('hidden');
        this.loadUserData();
    }

    showAuth() {
        this.authScreen.classList.remove('hidden');
        this.appContainer.classList.add('hidden');
        this.loginUsername.value = '';
        this.loginPassword.value = '';
    }

    loadUserData() {
        if (!this.currentUser) return;
        this.history = JSON.parse(localStorage.getItem(`focus_history_${this.currentUser.id}`)) || [];
        // Could populate planner here too if personalized
    }

    init() {
        // Auth Listeners
        this.showSignupBtn.addEventListener('click', () => {
            this.loginForm.classList.add('hidden');
            this.loginForm.classList.remove('active');
            this.signupForm.classList.remove('hidden');
            this.signupForm.classList.add('active');
        });

        this.showLoginBtn.addEventListener('click', () => {
            this.signupForm.classList.add('hidden');
            this.signupForm.classList.remove('active');
            this.loginForm.classList.remove('hidden');
            this.loginForm.classList.add('active');
        });

        this.loginBtn.addEventListener('click', () => {
            const username = this.loginUsername.value.trim();
            const password = this.loginPassword.value;
            if (!username || !password) return alert('Please enter username and password');

            const result = this.userManager.login(username, password);
            if (result.success) {
                this.currentUser = result.user;
                this.showApp();
            } else {
                alert(result.message);
            }
        });

        this.signupBtn.addEventListener('click', () => {
            const username = this.signupUsername.value.trim();
            const password = this.signupPassword.value;
            const confirm = this.signupConfirm.value;

            if (!username || !password) return alert('Please input all fields');
            if (password !== confirm) return alert('Passwords do not match');

            const result = this.userManager.register(username, password);
            if (result.success) {
                this.currentUser = result.user;
                this.showApp();
            } else {
                alert(result.message);
            }
        });

        this.logoutBtn.addEventListener('click', () => {
            this.userManager.logout();
            this.currentUser = null;
            this.showAuth();
        });

        this.startBtn.addEventListener('click', () => this.startSession());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.resetTimer());

        this.toggleAnalog.addEventListener('click', () => this.switchView('analog'));
        this.toggleDigital.addEventListener('click', () => this.switchView('digital'));

        this.modeTimerBtn.addEventListener('click', () => this.setMode('timer'));
        this.modePomodoroBtn.addEventListener('click', () => this.setMode('pomodoro'));
        this.modeStopwatchBtn.addEventListener('click', () => this.setMode('stopwatch'));
        this.modeTodoBtn.addEventListener('click', () => this.setMode('todo'));
        this.modePlannerBtn.addEventListener('click', () => this.setMode('planner'));

        this.themeBtn.addEventListener('click', () => this.toggleTheme());

        // Language toggle
        if (this.langBtn) {
            this.langBtn.addEventListener('click', () => this.toggleLanguage());
        }

        // Planner
        this.addPlanBtn.addEventListener('click', () => this.addPlan());

        // History
        if (this.toggleHistoryBtn) this.toggleHistoryBtn.addEventListener('click', () => this.toggleHistory());
        if (this.closeHistoryBtn) this.closeHistoryBtn.addEventListener('click', () => this.toggleHistory());
        if (this.exportExcelBtn) this.exportExcelBtn.addEventListener('click', () => this.exportToExcel());

        // Session Name
        if (this.sessionNameInput) {
            this.sessionNameInput.addEventListener('input', (e) => {
                this.currentSessionName = e.target.value;
            });
        }

        // Rating
        if (this.ratingStars) {
            this.ratingStars.forEach(star => {
                star.addEventListener('click', (e) => {
                    const rating = parseInt(e.target.dataset.rating);
                    this.setRating(rating);
                });
            });
        }

        if (this.ratingSaveBtn) {
            this.ratingSaveBtn.addEventListener('click', () => this.saveSession());
        }

        // Pomodoro inputs - update settings
        [this.pomodoroFocusInput, this.pomodoroShortInput, this.pomodoroLongInput, this.pomodoroRoundsInput].forEach(input => {
            if (input) {
                input.addEventListener('change', () => this.updatePomodoroSettings());
            }
        });

        // Todo Input
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo(this.todoInput.value);
            }
        });

        // Input validation with mobile optimization
        const inputs = [this.inputHours, this.inputMinutes, this.inputSeconds];
        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value.length > 2) {
                    e.target.value = e.target.value.slice(0, 2);
                }
            });

            // Auto-focus next input on mobile
            input.addEventListener('keyup', (e) => {
                if (e.target.value.length === 2 && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            });

            // Prevent scroll on focus for mobile
            input.addEventListener('focus', (e) => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });

        // Set initial state
        this.switchView('digital'); // Default
        this.setMode('timer'); // Default

        // Check system preference for theme
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.toggleTheme(true);
        }

        // Detect mobile and adjust viewport
        this.handleMobileViewport();

        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleMobileViewport(), 100);
        });

        // Ensure language is set correctly on init
        this.updateLanguage();
    }

    handleMobileViewport() {
        // Prevent zoom on mobile input focus
        if (window.innerWidth < 480) {
            const viewport = document.querySelector('meta[name=viewport]');
            if (viewport) {
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            }
        }
    }

    toggleLanguage() {
        this.currentLang = this.currentLang === 'en' ? 'ko' : 'en';

        // Animate language change
        const textElements = document.querySelectorAll('.text-element');
        textElements.forEach(el => {
            el.classList.add('lang-fade');
        });

        setTimeout(() => {
            this.updateLanguage();
            textElements.forEach(el => {
                el.classList.remove('lang-fade');
                el.classList.add('lang-entering');
            });

            setTimeout(() => {
                textElements.forEach(el => {
                    el.classList.remove('lang-entering');
                });
            }, 300);
        }, 150);

        // Update button text
        if (this.langBtn) {
            this.langBtn.textContent = this.currentLang === 'en' ? 'KO' : 'EN';
        }
    }

    updateLanguage() {
        const t = this.translations[this.currentLang];

        // Update logo based on current mode
        if (this.mode === 'timer') this.logo.textContent = t.logoTimer;
        else if (this.mode === 'pomodoro') this.logo.textContent = t.logoPomodoro;
        else if (this.mode === 'stopwatch') this.logo.textContent = t.logoStopwatch;
        else if (this.mode === 'todo') this.logo.textContent = t.logoTodo;
        else if (this.mode === 'planner') this.logo.textContent = t.logoPlanner;

        // Update button text
        if (this.mode === 'timer') {
            this.startBtn.textContent = t.startTimer;
        } else if (this.mode === 'pomodoro') {
            this.startBtn.textContent = t.startPomodoro;
        } else if (this.mode === 'stopwatch') {
            this.startBtn.textContent = t.startStopwatch;
        }

        // Update input labels
        const labels = document.querySelectorAll('.label');
        if (labels[0]) labels[0].textContent = t.hours;
        if (labels[1]) labels[1].textContent = t.minutes;
        if (labels[2]) labels[2].textContent = t.seconds;

        // Update pomodoro labels
        const pomodoroLabels = document.querySelectorAll('.pomodoro-label');
        if (pomodoroLabels[0]) pomodoroLabels[0].textContent = t.focusTimeLabel;
        if (pomodoroLabels[1]) pomodoroLabels[1].textContent = t.shortBreakLabel;
        if (pomodoroLabels[2]) pomodoroLabels[2].textContent = t.longBreakLabel;
        if (pomodoroLabels[3]) pomodoroLabels[3].textContent = t.roundsLabel;

        const pomodoroUnits = document.querySelectorAll('.pomodoro-unit');
        if (pomodoroUnits[0]) pomodoroUnits[0].textContent = t.minutes;
        if (pomodoroUnits[1]) pomodoroUnits[1].textContent = t.minutes;
        if (pomodoroUnits[2]) pomodoroUnits[2].textContent = t.minutes;
        if (pomodoroUnits[3]) pomodoroUnits[3].textContent = t.roundsUnit;

        const cycleLabel = document.querySelector('.cycle-label');
        if (cycleLabel) cycleLabel.textContent = t.roundLabel;

        // Update pomodoro status
        if (this.pomodoroStatus) {
            if (this.pomodoroPhase === 'focus') this.pomodoroStatus.textContent = t.focusTime;
            else if (this.pomodoroPhase === 'short-break') this.pomodoroStatus.textContent = t.shortBreak;
            else if (this.pomodoroPhase === 'long-break') this.pomodoroStatus.textContent = t.longBreak;
        }

        // Update todo placeholder
        if (this.todoInput) {
            this.todoInput.placeholder = t.todoPlaceholder;
        }

        // Update planner subject placeholder
        if (this.planSubject) {
            this.planSubject.placeholder = t.planSubject;
        }

        // Update Session & History text
        if (this.sessionNameInput) this.sessionNameInput.placeholder = t.sessionNamePlaceholder;
        if (this.ratingModal) {
            const title = this.ratingModal.querySelector('.modal-title');
            const subtitle = this.ratingModal.querySelector('.modal-subtitle');
            if (title) title.textContent = t.sessionComplete;
            if (subtitle) subtitle.textContent = t.howWasFocus;
            if (this.ratingSaveBtn) this.ratingSaveBtn.textContent = t.save;
        }
        if (this.historyView) {
            const title = this.historyView.querySelector('.history-title');
            if (title) title.textContent = t.history;
            if (this.exportExcelBtn) this.exportExcelBtn.textContent = t.exportExcel;
            this.renderHistory();
        }
    }

    toggleTheme(forceDark) {
        if (forceDark || !this.isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            this.sunIcon.classList.add('hidden');
            this.moonIcon.classList.remove('hidden');
            this.isDark = true;
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            this.sunIcon.classList.remove('hidden');
            this.moonIcon.classList.add('hidden');
            this.isDark = false;
        }
    }

    setMode(mode) {
        if (this.mode === mode) return;
        this.mode = mode;

        // Logo Animation & Text Change with language support
        const t = this.translations[this.currentLang];
        let logoText = t.logoTimer;
        if (mode === 'pomodoro') logoText = t.logoPomodoro;
        if (mode === 'stopwatch') logoText = t.logoStopwatch;
        if (mode === 'todo') logoText = t.logoTodo;
        if (mode === 'planner') logoText = t.logoPlanner;

        if (this.logo) {
            this.logo.classList.add('fade-out');
            setTimeout(() => {
                this.logo.textContent = logoText;
                this.logo.classList.remove('fade-out');
            }, 300);
        }

        // Reset actives
        this.modeTimerBtn.classList.remove('active');
        this.modePomodoroBtn.classList.remove('active');
        this.modeStopwatchBtn.classList.remove('active');
        this.modeTodoBtn.classList.remove('active');
        this.modePlannerBtn.classList.remove('active');

        // Reset views
        this.timerInputs.classList.add('hidden');
        if (this.sessionNameInput) this.sessionNameInput.parentElement.classList.add('hidden'); // Hide session name in other modes
        this.stopwatchPreview.classList.add('hidden');
        this.pomodoroContainer.classList.add('hidden');
        this.todoContainer.classList.add('hidden');
        this.plannerContainer.classList.add('hidden');

        this.startBtn.classList.remove('hidden');
        this.startBtn.style.display = 'block';

        if (mode === 'timer') {
            this.modeTimerBtn.classList.add('active');
            this.timerInputs.classList.remove('hidden');
            if (this.sessionNameInput) this.sessionNameInput.parentElement.classList.remove('hidden');
            this.startBtn.textContent = t.startTimer;
        } else if (mode === 'pomodoro') {
            this.modePomodoroBtn.classList.add('active');
            this.pomodoroContainer.classList.remove('hidden');
            this.startBtn.textContent = t.startPomodoro;
            this.updatePomodoroPreview();
        } else if (mode === 'stopwatch') {
            this.modeStopwatchBtn.classList.add('active');
            this.stopwatchPreview.classList.remove('hidden');
            this.startBtn.textContent = t.startStopwatch;
        } else if (mode === 'todo') {
            this.modeTodoBtn.classList.add('active');
            this.todoContainer.classList.remove('hidden');
            this.startBtn.style.display = 'none';
        } else {
            this.modePlannerBtn.classList.add('active');
            this.plannerContainer.classList.remove('hidden');
            this.startBtn.style.display = 'none';
        }
    }

    addPlan() {
        const subject = this.planSubject.value.trim();
        const day = this.planDay.value;
        const time = this.planTime.value;

        if (!subject || !time) return;

        this.plans.push({ subject, day, time, id: Date.now() });
        this.renderPlans();

        this.planSubject.value = '';
        this.planTime.value = '';
    }

    renderPlans() {
        document.querySelectorAll('.day-content').forEach(col => col.innerHTML = '');
        this.plans.sort((a, b) => a.time.localeCompare(b.time));

        this.plans.forEach(plan => {
            const column = document.querySelector(`.day-column[data-day="${plan.day}"] .day-content`);
            if (column) {
                const block = document.createElement('div');
                block.className = 'plan-block';
                block.innerHTML = `
                    <div class="plan-time">${plan.time}</div>
                    <div class="plan-subject">${plan.subject}</div>
                    <button class="plan-block-delete" data-id="${plan.id}">&times;</button>
                `;

                block.querySelector('.plan-block-delete').addEventListener('click', (e) => {
                    const id = Number(e.target.getAttribute('data-id'));
                    this.plans = this.plans.filter(p => p.id !== id);
                    this.renderPlans();
                });

                column.appendChild(block);
            }
        });
    }

    addTodo(text) {
        if (!text.trim()) return;

        const li = document.createElement('li');
        li.className = 'todo-item';

        const checkbox = document.createElement('div');
        checkbox.className = 'todo-checkbox';

        const span = document.createElement('span');
        span.className = 'todo-text';
        span.textContent = text;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);

        li.addEventListener('click', () => {
            li.classList.toggle('completed');
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            li.style.transform = 'translateX(20px)';
            li.style.opacity = '0';
            setTimeout(() => {
                li.remove();
            }, 300);
        });

        this.todoList.prepend(li);
        this.todoInput.value = '';
    }

    updatePomodoroSettings() {
        this.pomodoroSettings.focus = parseInt(this.pomodoroFocusInput.value) || 25;
        this.pomodoroSettings.shortBreak = parseInt(this.pomodoroShortInput.value) || 5;
        this.pomodoroSettings.longBreak = parseInt(this.pomodoroLongInput.value) || 15;
        this.pomodoroSettings.rounds = parseInt(this.pomodoroRoundsInput.value) || 4;
        this.pomodoroMaxRounds = this.pomodoroSettings.rounds;
        this.updatePomodoroPreview();
    }

    updatePomodoroPreview() {
        const t = this.translations[this.currentLang];
        if (this.pomodoroCount) {
            this.pomodoroCount.textContent = `${this.pomodoroRound}/${this.pomodoroMaxRounds}`;
        }
        if (this.pomodoroStatus) {
            if (this.pomodoroPhase === 'focus') {
                this.pomodoroStatus.textContent = t.focusTime;
                this.pomodoroStatus.className = 'pomodoro-status focus text-element';
            } else if (this.pomodoroPhase === 'short-break') {
                this.pomodoroStatus.textContent = t.shortBreak;
                this.pomodoroStatus.className = 'pomodoro-status break text-element';
            } else {
                this.pomodoroStatus.textContent = t.longBreak;
                this.pomodoroStatus.className = 'pomodoro-status long-break text-element';
            }
        }
    }

    startPomodoroPhase() {
        // Determine what phase we're in
        let minutes = 0;
        if (this.pomodoroPhase === 'focus') {
            minutes = this.pomodoroSettings.focus;
        } else if (this.pomodoroPhase === 'short-break') {
            minutes = this.pomodoroSettings.shortBreak;
        } else {
            minutes = this.pomodoroSettings.longBreak;
        }

        this.duration = minutes * 60;
        this.remaining = this.duration;
        this.updatePomodoroPreview();
    }

    nextPomodoroPhase() {
        const t = this.translations[this.currentLang];

        if (this.pomodoroPhase === 'focus') {
            // Focus complete, time for break
            if (this.pomodoroRound >= this.pomodoroMaxRounds) {
                // Long break
                this.pomodoroPhase = 'long-break';
                alert(t.focusComplete + ' ' + t.longBreak + '!');
            } else {
                // Short break
                this.pomodoroPhase = 'short-break';
                alert(t.focusComplete + ' ' + t.shortBreak + '!');
            }
        } else {
            // Break complete, back to focus
            alert(t.breakTimeUp);

            if (this.pomodoroPhase === 'long-break') {
                // Reset rounds after long break
                this.pomodoroRound = 1;
            } else {
                // Increment round
                this.pomodoroRound++;
            }

            this.pomodoroPhase = 'focus';
        }

        // Start next phase automatically
        this.startPomodoroPhase();
        this.updateUI();
        this.startTimer();
    }

    switchView(view) {
        if (view === 'analog') {
            this.toggleAnalog.classList.add('active');
            this.toggleDigital.classList.remove('active');
            this.analogView.classList.remove('hidden');
            this.analogView.classList.add('active');
            this.digitalView.classList.add('hidden');
            this.digitalView.classList.remove('active');
        } else {
            this.toggleDigital.classList.add('active');
            this.toggleAnalog.classList.remove('active');
            this.digitalView.classList.remove('hidden');
            this.digitalView.classList.add('active');
            this.analogView.classList.add('hidden');
            this.analogView.classList.remove('active');
        }
    }

    startSession() {
        if (this.mode === 'timer') {
            const h = parseInt(this.inputHours.value) || 0;
            const m = parseInt(this.inputMinutes.value) || 0;
            const s = parseInt(this.inputSeconds.value) || 0;

            const totalSeconds = (h * 3600) + (m * 60) + s;

            if (totalSeconds <= 0) return;

            this.duration = totalSeconds;
            this.remaining = this.duration;

            // Allow empty name, defaults will be handled on save
        } else if (this.mode === 'pomodoro') {
            // Initialize pomodoro
            this.pomodoroRound = 1;
            this.pomodoroPhase = 'focus';
            this.updatePomodoroSettings();
            this.startPomodoroPhase();
        } else {
            this.elapsed = 0;
            this.duration = 0;
        }

        this.setupScreen.classList.remove('active');
        this.setupScreen.classList.add('hidden');
        setTimeout(() => {
            this.setupScreen.style.display = 'none';
            this.timerScreen.style.display = 'flex';
            void this.timerScreen.offsetWidth;
            this.timerScreen.classList.remove('hidden');
            this.timerScreen.classList.add('active');
        }, 600);

        // Blur inputs to dismiss mobile keyboard
        this.inputHours.blur();
        this.inputMinutes.blur();
        this.inputSeconds.blur();
        if (this.pomodoroFocusInput) this.pomodoroFocusInput.blur();

        this.updateUI();
        this.startTimer();
    }

    startTimer() {
        if (this.isRunning) return;
        this.isRunning = true;

        this.updateUI();

        this.interval = setInterval(() => {
            if (this.mode === 'timer' || this.mode === 'pomodoro') {
                this.remaining--;
                this.updateUI();

                if (this.remaining <= 0) {
                    clearInterval(this.interval);
                    this.isRunning = false;

                    setTimeout(() => {
                        if (this.mode === 'pomodoro') {
                            this.nextPomodoroPhase();
                        } else {
                            this.completeTimer();
                        }
                    }, 50);
                    return;
                }
            } else {
                this.elapsed++;
                this.updateUI();
            }
        }, 1000);

        this.updateControlsIcon(true);
    }

    togglePause() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    pauseTimer() {
        this.isRunning = false;
        clearInterval(this.interval);
        this.updateControlsIcon(false);
    }

    resetTimer() {
        this.pauseTimer();
        this.timerScreen.classList.remove('active');
        setTimeout(() => {
            this.timerScreen.style.display = 'none';
            this.setupScreen.style.display = 'flex';
            void this.setupScreen.offsetWidth;
            this.setupScreen.classList.remove('hidden');
            this.setupScreen.classList.add('active');
        }, 600);
        this.inputHours.value = '';
        this.inputMinutes.value = '';
        this.inputSeconds.value = '';
        this.elapsed = 0;
        this.remaining = 0;
        this.duration = 0;

        // Reset pomodoro
        if (this.mode === 'pomodoro') {
            this.pomodoroRound = 1;
            this.pomodoroPhase = 'focus';
            this.updatePomodoroPreview();
        }

        // Reset Session
        this.currentSessionName = '';
        if (this.sessionNameInput) this.sessionNameInput.value = '';
        this.setRating(0); // Reset stars

        this.updateUI();
    }

    completeTimer() {
        this.pauseTimer();
        const t = this.translations[this.currentLang];

        if (this.mode === 'timer') {
            // Show Rating Modal
            if (this.ratingModal) {
                this.ratingModal.classList.add('active');
            } else {
                alert(t.timeUp);
                this.resetTimer();
            }
        } else {
            alert(t.timeUp);
            this.resetTimer();
        }
    }

    setRating(rating) {
        this.currentSessionRating = rating;
        this.ratingStars.forEach(star => {
            const starRating = parseInt(star.dataset.rating);
            if (starRating <= rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    saveSession() {
        if (this.currentSessionRating === 0) {
            // Optional: require rating? User didn't specify, but good UX.
            // Let's assume 1 star if none selected or just allow 0? 
            // User asked "make them rate 1-5", implying mandatory.
            // But let's just default to not saving if 0? Or alert?
            // "select 1 to 5" -> alert if 0.
            const t = this.translations[this.currentLang];
            // Simple alert for now as I didn't add a translation key for this warning.
            // Or just do nothing.
            if (this.currentSessionRating === 0) return;
        }

        const session = {
            id: Date.now(),
            date: new Date().toLocaleDateString(this.currentLang === 'ko' ? 'ko-KR' : 'en-US'),
            name: this.currentSessionName || (this.currentLang === 'ko' ? '집중 세션' : 'Focus Session'),
            duration: this.duration,
            rating: this.currentSessionRating
        };

        this.history.unshift(session);
        if (this.currentUser) {
            localStorage.setItem(`focus_history_${this.currentUser.id}`, JSON.stringify(this.history));
        } else {
            // Fallback for guest mode if enabled later
            localStorage.setItem('focus_history', JSON.stringify(this.history));
        }

        this.ratingModal.classList.remove('active');
        this.resetTimer();
        this.renderHistory();
    }

    toggleHistory() {
        this.historyView.classList.toggle('active');
        if (this.historyView.classList.contains('active')) {
            this.renderHistory();
        }
    }

    renderHistory() {
        if (!this.historyList) return;
        this.historyList.innerHTML = '';

        if (this.history.length === 0) {
            const emptyText = this.currentLang === 'ko' ? '기록이 없습니다.' : 'No sessions yet.';
            this.historyList.innerHTML = `<div class="empty-history text-element">${emptyText}</div>`;
            return;
        }

        this.history.forEach(item => {
            const stars = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
            const div = document.createElement('div');
            div.className = 'history-item';

            // Format duration
            const h = Math.floor(item.duration / 3600);
            const m = Math.floor((item.duration % 3600) / 60);
            const s = item.duration % 60;
            const durationStr = h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;

            div.innerHTML = `
                <div class="history-item-header">
                    <span class="history-name">${item.name}</span>
                    <span class="history-date">${item.date}</span>
                </div>
                <div class="history-details">
                    <span class="history-duration">${durationStr}</span>
                    <div class="history-actions">
                        <span class="history-stars">${stars}</span>
                        <button class="history-delete-btn" title="${this.currentLang === 'ko' ? '삭제' : 'Delete'}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>
            `;

            const deleteBtn = div.querySelector('.history-delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteHistoryItem(item.id);
            });

            this.historyList.appendChild(div);
        });
    }

    deleteHistoryItem(id) {
        if (!confirm(this.currentLang === 'ko' ? '기록을 삭제하시겠습니까?' : 'Delete this record?')) return;
        this.history = this.history.filter(item => item.id !== id);
        if (this.currentUser) {
            localStorage.setItem(`focus_history_${this.currentUser.id}`, JSON.stringify(this.history));
        } else {
            localStorage.setItem('focus_history', JSON.stringify(this.history));
        }
        this.renderHistory();
    }

    exportToExcel() {
        if (!this.history || this.history.length === 0) {
            alert(this.currentLang === 'ko' ? '내보낼 기록이 없습니다.' : 'No history to export.');
            return;
        }

        // Prepare data for Excel
        const data = this.history.map(session => ({
            [this.currentLang === 'ko' ? '날짜' : 'Date']: session.date,
            [this.currentLang === 'ko' ? '세션 이름' : 'Session Name']: session.name,
            [this.currentLang === 'ko' ? '시간(초)' : 'Duration (s)']: session.duration,
            [this.currentLang === 'ko' ? '시간(포맷)' : 'Duration (Formatted)']: this.formatDuration(session.duration),
            [this.currentLang === 'ko' ? '평점' : 'Rating']: session.rating
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(data);
        const splitDate = new Date().toISOString().split('T')[0];
        const filename = `Focus_History_${this.currentUser ? this.currentUser.username : 'Guest'}_${splitDate}.xlsx`;

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "History");

        // Download
        XLSX.writeFile(wb, filename);
    }

    formatDuration(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
    }

    updateUI() {
        let displaySeconds = 0;

        if (this.mode === 'timer' || this.mode === 'pomodoro') {
            displaySeconds = this.remaining;
        } else {
            displaySeconds = this.elapsed;
        }

        const h = Math.floor(displaySeconds / 3600);
        const m = Math.floor((displaySeconds % 3600) / 60);
        const s = displaySeconds % 60;

        if (h > 0) {
            this.digitalDisplay.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        } else {
            this.digitalDisplay.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }

        const minDeg = (m / 60) * 360;
        const sDeg = (s / 60) * 360;

        this.minHand.style.transform = `rotate(${minDeg}deg)`;
        this.secHand.style.transform = `rotate(${sDeg}deg)`;

        if (this.mode === 'timer' || this.mode === 'pomodoro') {
            const progress = this.duration > 0 ? this.remaining / this.duration : 0;
            const offset = this.circumference - (progress * this.circumference);
            this.progressRing.style.strokeDashoffset = offset;
            this.progressRing.classList.add('active-ring');
        } else {
            const progress = (displaySeconds % 60) / 60;
            const offset = this.circumference - (progress * this.circumference);
            this.progressRing.style.strokeDashoffset = offset;
            this.progressRing.classList.add('active-ring');
        }
    }

    updateControlsIcon(isPlaying) {
        if (isPlaying) {
            this.pauseBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
        } else {
            this.pauseBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new Timer();
});
