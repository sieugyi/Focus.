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
            this.startBtn.innerText = "Start Timer";
        } else if (mode === 'stopwatch') {
            this.modeStopwatchBtn.classList.add('active');
            this.stopwatchPreview.classList.remove('hidden');
            this.startBtn.innerText = "Start Stopwatch";
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

        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${day}</td>
            <td>${time}</td>
            <td>${subject}</td>
            <td style="text-align: right;">
                <button class="plan-delete-btn">&times;</button>
            </td>
        `;

        tr.querySelector('.plan-delete-btn').addEventListener('click', () => {
            tr.remove();
        });

        this.plannerList.appendChild(tr);

        // Clear inputs
        this.planSubject.value = '';
        this.planTime.value = '';
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
        // Let's emulate a real clock face showing remaining time?
        // If 5 mins remaining, minute hand at 5?
        const minDeg = (m / 60) * 360;
        const sDeg = (s / 60) * 360;

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
