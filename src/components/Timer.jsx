import { useState, useEffect, useRef } from 'react';

export default function Timer() {
    const [timeLeft, setTimeLeft] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false); // To distinguish between 'not started' and 'paused' if needed

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [inputMinutes, setInputMinutes] = useState('');

    useEffect(() => {
        let interval = null;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            setIsRunning(false);
            // Optional: alert('Time is up!');
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return {
            h: h.toString().padStart(2, '0'),
            m: m.toString().padStart(2, '0'),
            s: s.toString().padStart(2, '0')
        };
    };

    const time = formatTime(timeLeft);

    const handleSetTime = () => {
        const mins = parseInt(inputMinutes);
        if (!isNaN(mins) && mins > 0) {
            const secs = mins * 60;
            setTotalTime(secs);
            setTimeLeft(secs);
            setIsRunning(false);
            setIsPaused(false);
            setShowModal(false);
            setInputMinutes('');
        }
    };

    const handleKeyEnter = (e) => {
        if (e.key === 'Enter') handleSetTime();
    }

    const startTimer = () => {
        if (timeLeft > 0) {
            setIsRunning(true);
            setIsPaused(false);
        }
    };

    const pauseTimer = () => {
        setIsRunning(false);
        setIsPaused(true);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setIsPaused(false);
        setTimeLeft(totalTime);
    };

    return (
        <div className="split-section timer-section">
            <div className="timer-display">
                <span>{time.h}</span>:<span>{time.m}</span>:<span>{time.s}</span>
            </div>
            <div className="timer-controls">
                <button
                    onClick={() => setShowModal(true)}
                    disabled={isRunning && !isPaused}
                    title="Set Time"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </button>

                <button
                    onClick={startTimer}
                    disabled={isRunning || timeLeft <= 0}
                    title="Start/Resume"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </button>

                <button
                    onClick={pauseTimer}
                    disabled={!isRunning}
                    title="Pause"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                </button>

                <button
                    onClick={resetTimer}
                    title="Reset"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                </button>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="time-input-modal">
                        <input
                            type="number"
                            id="input-minutes"
                            placeholder="Minutes"
                            min="1"
                            value={inputMinutes}
                            onChange={(e) => setInputMinutes(e.target.value)}
                            onKeyDown={handleKeyEnter}
                            autoFocus
                        />
                        <button onClick={handleSetTime} style={{ borderRadius: '8px', width: 'auto' }}>Set</button>
                        <button onClick={() => setShowModal(false)} style={{ borderRadius: '8px', width: 'auto' }}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}
