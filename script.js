
class Timer {
    constructor() {
        this.duration = 0; // in seconds
        this.remaining = 0;
        this.elapsed = 0; // For stopwatch
        this.mode = 'timer'; // 'timer' or 'stopwatch'
        this.isRunning = false;
        this.interval = null;

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
        this.modeStopwatchBtn = document.getElementById('mode-stopwatch');
        this.modeTodoBtn = document.getElementById('mode-todo');
        this.modePlannerBtn = document.getElementById('mode-planner');

        this.timerInputs = document.getElementById('timer-inputs');
        this.stopwatchPreview = document.getElementById('stopwatch-preview');

        this.todoContainer = document.getElementById('todo-container');
        this.todoInput = document.getElementById('todo-input');
        this.todoList = document.getElementById('todo-list');

        this.plannerContainer = document.getElementById('planner-container');
        this.planSubject = document.getElementById('plan-subject');
        this.planDay = document.getElementById('plan-day');
        this.planTime = document.getElementById('plan-time');
        this.addPlanBtn = document.getElementById('add-plan-btn');
        this.plannerList = document.getElementById('planner-list'); // tbody

        // Theme Elements
        this.themeBtn = document.getElementById('theme-toggle');
        this.sunIcon = document.querySelector('.sun-icon');
        this.moonIcon = document.querySelector('.moon-icon');
        this.isDark = false;

        this.plans = []; // Store plans for sorting

        // Language Setup
        this.langBtn = document.getElementById('lang-toggle');
        this.langText = this.langBtn.querySelector('.lang-text');
        this.lang = 'en'; // Default

        this.translations = {
            en: {
                timer: "Timer",
                stopwatch: "Stopwatch",
                todo: "Todo",
                plan: "Plan",
                hr: "hr",
                min: "min",
                sec: "sec",
                startTimer: "Start Timer",
                startStopwatch: "Start Stopwatch",
                startSession: "Start Session",
                todoPlaceholder: "Add a task...",
                planSubjectPlaceholder: "Math, English...",
                days: { "Mon": "Mon", "Tue": "Tue", "Wed": "Wed", "Thu": "Thu", "Fri": "Fri", "Sat": "Sat", "Sun": "Sun" }
            },
            ko: {
                timer: "타이머",
                stopwatch: "스톱워치",
                todo: "할 일",
                plan: "계획",
                hr: "시간",
                min: "분",
                sec: "초",
                startTimer: "타이머 시작",
                startStopwatch: "스톱워치 시작",
                startSession: "세션 시작",
                todoPlaceholder: "할 일을 추가하세요...",
                planSubjectPlaceholder: "수학, 영어...",
                days: { "Mon": "월", "Tue": "화", "Wed": "수", "Thu": "목", "Fri": "금", "Sat": "토", "Sun": "일" }
            }
        };

        this.init();
    }

    init() {
        this.startBtn.addEventListener('click', () => this.startSession());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.resetTimer());

        this.toggleAnalog.addEventListener('click', () => this.switchView('analog'));
        this.toggleDigital.addEventListener('click', () => this.switchView('digital'));

        this.modeTimerBtn.addEventListener('click', () => this.setMode('timer'));
        this.modeStopwatchBtn.addEventListener('click', () => this.setMode('stopwatch'));
        this.modeTodoBtn.addEventListener('click', () => this.setMode('todo'));
        this.modePlannerBtn.addEventListener('click', () => this.setMode('planner'));

        this.themeBtn.addEventListener('click', () => this.toggleTheme());
        this.langBtn.addEventListener('click', () => this.toggleLanguage());

        // Planner
        this.addPlanBtn.addEventListener('click', () => this.addPlan());

        // Todo Input
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo(this.todoInput.value);
            }
        });

        // Input validation
        const inputs = [this.inputHours, this.inputMinutes, this.inputSeconds];
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                if (e.target.value.length > 2) e.target.value = e.target.value.slice(0, 2);
            });
            // Auto-focus next input functionality could be added here for UX
        });

        // Set initial state
        this.switchView('digital'); // Default
        this.setMode('timer'); // Default

        // Check system preference for theme
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.toggleTheme(true);
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



    toggleLanguage() {
        const elementsToAnimate = [
            this.modeTimerBtn,
            this.modeStopwatchBtn,
            this.modeTodoBtn,
            this.modePlannerBtn,
            this.startBtn,
            this.langText,
            ...document.querySelectorAll('.label'),
            ...document.querySelectorAll('.day-header')
        ];

        // Add transition class to enable animation
        elementsToAnimate.forEach(el => el.classList.add('text-element'));

        // Trigger Fade Out
        elementsToAnimate.forEach(el => el.classList.add('lang-fade'));

        // Wait for fade out, then change text and fade in
        setTimeout(() => {
            this.lang = this.lang === 'en' ? 'ko' : 'en';
            this.langText.innerText = this.lang === 'en' ? 'KO' : 'EN';
            this.applyLanguage();

            // Trigger Fade In
            elementsToAnimate.forEach(el => el.classList.remove('lang-fade'));
        }, 300);
    }

    applyLanguage() {
        const t = this.translations[this.lang];

        // Mode Buttons
        this.modeTimerBtn.innerText = t.timer;
        this.modeStopwatchBtn.innerText = t.stopwatch;
        this.modeTodoBtn.innerText = t.todo;
        this.modePlannerBtn.innerText = t.plan;

        // Labels
        document.querySelectorAll('.label').forEach(label => {
            if (label.innerText === 'hr' || label.innerText === '시간') label.innerText = t.hr;
            if (label.innerText === 'min' || label.innerText === '분') label.innerText = t.min;
            if (label.innerText === 'sec' || label.innerText === '초') label.innerText = t.sec;
        });

        // Placeholders
        this.todoInput.placeholder = t.todoPlaceholder;
        this.planSubject.placeholder = t.planSubjectPlaceholder;

        // Update Start Button Text based on current mode
        if (this.mode === 'timer') {
            this.startBtn.innerText = t.startTimer;
        } else if (this.mode === 'stopwatch') {
            this.startBtn.innerText = t.startStopwatch;
        } else {
            this.startBtn.innerText = t.startSession; // Default/Hidden
        }

        // Planner Days (Headers)
        document.querySelectorAll('.day-header').forEach(header => {
            // Check mapping
            // This is tricky because innerText might be already translated.
            // We can trust data-day attribute if we added it? We did: data-day="Mon"
            const col = header.parentElement;
            const dayKey = col.getAttribute('data-day');
            if (dayKey && t.days[dayKey]) {
                header.innerText = t.days[dayKey];
            }
        });

        // Planner Select Options
        Array.from(this.planDay.options).forEach(option => {
            if (t.days[option.value]) {
                option.innerText = t.days[option.value];
            }
        });
    }

    setMode(mode) {
        if (this.mode === mode) return; // Don't animate if clicking same mode
        this.mode = mode;

        // Logo Animation & Text Change
        let logoText = "Focus.";
        if (mode === 'stopwatch') logoText = "Track.";
        if (mode === 'todo') logoText = "Flow.";
        if (mode === 'planner') logoText = "Plan.";

        if (this.logo) {
            this.logo.classList.add('fade-out');
            setTimeout(() => {
                this.logo.innerText = logoText;
                this.logo.classList.remove('fade-out');
            }, 300);
        }

        // Reset actives
        this.modeTimerBtn.classList.remove('active');
        this.modeStopwatchBtn.classList.remove('active');
        this.modeTodoBtn.classList.remove('active');
        this.modePlannerBtn.classList.remove('active');

        // Reset views
        this.timerInputs.classList.add('hidden');
        this.stopwatchPreview.classList.add('hidden');
        this.todoContainer.classList.add('hidden');
        this.plannerContainer.classList.add('hidden');

        this.startBtn.classList.remove('hidden'); // Default show
        this.startBtn.style.display = 'block';

        if (mode === 'timer') {
            this.modeTimerBtn.classList.add('active');
            this.timerInputs.classList.remove('hidden');
            this.startBtn.innerText = this.translations[this.lang].startTimer;
        } else if (mode === 'stopwatch') {
            this.modeStopwatchBtn.classList.add('active');
            this.stopwatchPreview.classList.remove('hidden');
            this.startBtn.innerText = this.translations[this.lang].startStopwatch;
        } else if (mode === 'todo') {
            this.modeTodoBtn.classList.add('active');
            this.todoContainer.classList.remove('hidden');
            this.startBtn.style.display = 'none';
        } else {
            // Planner
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

        // Add to array
        this.plans.push({ subject, day, time, id: Date.now() });
        this.renderPlans();

        // Clear inputs
        this.planSubject.value = '';
        this.planTime.value = '';
    }

    renderPlans() {
        // Clear all columns
        document.querySelectorAll('.day-content').forEach(col => col.innerHTML = '');

        // Sort plans: Time only (since they are separated by columns)
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

                // Delete handler
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
        span.innerText = text;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);

        // Toggle complete
        li.addEventListener('click', () => {
            li.classList.toggle('completed');
        });

        // Delete action
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent toggling when deleting
            li.style.transform = 'translateX(20px)';
            li.style.opacity = '0';
            setTimeout(() => {
                li.remove();
            }, 300); // Matches CSS transition if we added one, or just cleaner removal
        });

        this.todoList.prepend(li);
        this.todoInput.value = '';
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
        } else {
            // Stopwatch mode
            this.elapsed = 0;
            this.duration = 0; // Infinite duration for stopwatch
        }

        this.setupScreen.classList.remove('active');
        this.setupScreen.classList.add('hidden'); // Helper
        setTimeout(() => {
            this.setupScreen.style.display = 'none';
            this.timerScreen.style.display = 'flex';
            // Force reflow
            void this.timerScreen.offsetWidth;
            this.timerScreen.classList.remove('hidden');
            this.timerScreen.classList.add('active');
        }, 600); // Wait for transition

        this.inputMinutes.blur(); // Remove keyboard on mobile

        this.updateUI();
        this.startTimer();
    }

    startTimer() {
        if (this.isRunning) return;
        this.isRunning = true;

        // Immediate UI update
        this.updateUI();

        this.interval = setInterval(() => {
            if (this.mode === 'timer') {
                this.remaining--;
                this.updateUI(); // Update UI to show new time (including 00:00)

                if (this.remaining <= 0) {
                    // Stop interval immediately
                    clearInterval(this.interval);
                    this.isRunning = false;

                    // Small delay to ensure 00:00 is rendered before alert
                    setTimeout(() => {
                        this.completeTimer();
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
        this.elapsed = 0; // Reset elapsed for stopwatch
        this.remaining = 0; // Reset remaining for timer
        this.duration = 0; // Reset duration
        this.updateUI(); // Update UI to show 00:00
    }

    completeTimer() {
        this.pauseTimer();
        // Maybe play a sound or show a notification
        alert("Time is up!");
        this.resetTimer(); // Or stay at 00:00? Let's reset for now for cleanliness
    }

    updateUI() {
        let displaySeconds = 0;

        if (this.mode === 'timer') {
            displaySeconds = this.remaining;
        } else {
            displaySeconds = this.elapsed;
        }

        // Digital
        const h = Math.floor(displaySeconds / 3600);
        const m = Math.floor((displaySeconds % 3600) / 60);
        const s = displaySeconds % 60;

        if (h > 0) {
            this.digitalDisplay.innerText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        } else {
            this.digitalDisplay.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }

        // Analog Logic
        // Use continuous rotation to avoid 360->0 jumps
        // For Timer: remaining decreases, so rotation decreases (CCW).
        // For Stopwatch: elapsed increases, so rotation increases (CW). 
        // We add an offset to align 0 with top (default behavior of rotate).

        let totalMin, totalSec;

        if (this.mode === 'timer') {
            // To make it feel 'right', maybe we want CW movement? 
            // unique aesthetics: Countdown spins CCW is confusing? 
            // Let's just map to total seconds.
            totalSec = this.remaining;
            totalMin = this.remaining / 60;
        } else {
            totalSec = this.elapsed;
            totalMin = this.elapsed / 60;
        }

        const minDeg = totalMin * 6; // 6 deg per minute (360/60)
        const sDeg = totalSec * 6;   // 6 deg per second

        this.minHand.style.transform = `rotate(${minDeg}deg)`;
        this.secHand.style.transform = `rotate(${sDeg}deg)`;

        // Ring Progress
        if (this.mode === 'timer') {
            const progress = this.duration > 0 ? this.remaining / this.duration : 0;
            const offset = this.circumference - (progress * this.circumference);
            this.progressRing.style.strokeDashoffset = offset;
            this.progressRing.classList.add('active-ring');
        } else {
            // For stopwatch, make the ring complete a cycle every minute
            const progress = (displaySeconds % 60) / 60;
            const offset = this.circumference - (progress * this.circumference);
            this.progressRing.style.strokeDashoffset = offset;
            this.progressRing.classList.add('active-ring');
        }
    }

    updateControlsIcon(isPlaying) {
        // Update SVG inside pauseBtn
        if (isPlaying) {
            // Show Pause Icon
            this.pauseBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
        } else {
            // Show Play Icon
            this.pauseBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new Timer();
});

