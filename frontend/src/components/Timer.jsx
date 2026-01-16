import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import FileManager from './FileManager';
import FileViewer from './FileViewer';

export default function Timer() {
    const { user, logout } = useAuth();
    // State with initializer to load from localStorage
    const [timeLeft, setTimeLeft] = useState(() => {
        const saved = localStorage.getItem('exam_timer_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            // If we have a saved target end time and it was running
            if (parsed.isRunning && !parsed.isPaused && parsed.targetEndTime) {
                const now = Date.now();
                const diff = Math.ceil((parsed.targetEndTime - now) / 1000);
                return diff > 0 ? diff : 0;
            }
            // Fallback for paused state or legacy format
            return parsed.timeLeft;
        }
        return 0;
    });

    const [totalTime, setTotalTime] = useState(() => {
        const saved = localStorage.getItem('exam_timer_state');
        return saved ? JSON.parse(saved).totalTime : 0;
    });

    const [isRunning, setIsRunning] = useState(() => {
        const saved = localStorage.getItem('exam_timer_state');
        // If it was running and time expired while closed, don't start as running
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.isRunning && !parsed.isPaused) {
                const elapsedSeconds = Math.floor((Date.now() - parsed.lastUpdated) / 1000);
                if (parsed.timeLeft - elapsedSeconds <= 0) return false;
            }
            return parsed.isRunning;
        }
        return false;
    });

    const [isPaused, setIsPaused] = useState(() => {
        const saved = localStorage.getItem('exam_timer_state');
        return saved ? JSON.parse(saved).isPaused : false;
    });

    const [endTime, setEndTime] = useState(() => {
        const saved = localStorage.getItem('exam_timer_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.isRunning && !parsed.isPaused && parsed.targetEndTime) {
                return parsed.targetEndTime;
            }
        }
        return null;
    });

    // Resume timer on load if needed - No longer needed as we init state correctly above
    // keeping empty effect for safety or potential future use if needed, or remove entirely.
    // effective removed by commenting out
    /*
    useEffect(() => {
        if (isRunning && !isPaused && !endTime && timeLeft > 0) {
            setEndTime(Date.now() + timeLeft * 1000);
        }
    }, [isRunning, isPaused, endTime, timeLeft]);
    */

    // Save State Function
    useEffect(() => {
        const state = {
            timeLeft,
            totalTime,
            isRunning,
            isPaused,
            targetEndTime: endTime, // Save the absolute target time
            lastUpdated: Date.now()
        };
        localStorage.setItem('exam_timer_state', JSON.stringify(state));
    }, [timeLeft, totalTime, isRunning, isPaused, endTime]);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [inputMinutes, setInputMinutes] = useState('');

    // Real-World Clock State
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    useEffect(() => {
        const clockInterval = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 1000);
        return () => clearInterval(clockInterval);
    }, []);

    // Fullscreen Logic
    const toggleFullscreen = () => {
        const doc = window.document;
        const docEl = doc.documentElement;

        const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        const isFullScreen = doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;

        if (!isFullScreen) {
            if (requestFullScreen) requestFullScreen.call(docEl);
        } else {
            if (cancelFullScreen) cancelFullScreen.call(doc);
        }
    };

    useEffect(() => {
        let interval = null;
        if (isRunning && endTime) {
            interval = setInterval(() => {
                const now = Date.now();
                const left = Math.ceil((endTime - now) / 1000);
                if (left <= 0) {
                    setTimeLeft(0);
                    setIsRunning(false);
                    setEndTime(null);
                    // Optional: alert('Time is up!');
                } else {
                    setTimeLeft(left);
                }
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isRunning, endTime]);

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
            setEndTime(Date.now() + timeLeft * 1000);
            setIsRunning(true);
            setIsPaused(false);
        }
    };

    const pauseTimer = () => {
        setIsRunning(false);
        setIsPaused(true);
        setEndTime(null);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setIsPaused(false);
        setTimeLeft(totalTime);
        setEndTime(null);
    };

    const addTime = (minutes) => {
        const additionalSeconds = minutes * 60;
        setTimeLeft(prev => prev + additionalSeconds);
        // Also update totalTime so 'Reset' respects the extension
        setTotalTime(prev => prev + additionalSeconds);
        if (isRunning && endTime) {
            setEndTime(prev => prev + additionalSeconds * 1000);
        }
    };

    // Preferences State
    const [showSeconds, setShowSeconds] = useState(() => {
        const saved = localStorage.getItem('exam_timer_prefs');
        if (saved) {
            return JSON.parse(saved).showSeconds;
        }
        return true;
    });

    useEffect(() => {
        const prefs = { showSeconds };
        localStorage.setItem('exam_timer_prefs', JSON.stringify(prefs));
    }, [showSeconds]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [viewMode, setViewMode] = useState('timer'); // 'timer' or 'file'
    const [files, setFiles] = useState([]);

    // Fetch files when user is logged in
    useEffect(() => {
        if (user) {
            const fetchFiles = async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/files`, {
                        credentials: 'include' // Include httpOnly cookies
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setFiles(data.files || []);
                    }
                } catch (err) {
                    console.error('Error fetching files:', err);
                }
            };
            fetchFiles();
        }
    }, [user]);

    return (
        <div className="split-section timer-section">
            <div className="top-bar">
                <div className="top-left-group">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="btn-icon-only menu-toggle"
                        title="Toggle Controls"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                </div>

                <div className="top-right-group">
                    <button onClick={toggleFullscreen} className="btn-icon-only" title="Toggle Fullscreen">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                    </button>
                    <div className="real-time-clock">{currentTime}</div>
                </div>
            </div>

            {/* Sidebar Overlay */}
            <div className={`controls-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h3>Controls</h3>
                    <button onClick={() => setIsSidebarOpen(false)} className="btn-icon-only">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="timer-controls-group">
                    <div className="timer-controls">
                        <button
                            onClick={() => { setShowModal(true); setIsSidebarOpen(false); }}
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

                        <button
                            onClick={() => setShowSeconds(!showSeconds)}
                            title={showSeconds ? "Hide Seconds" : "Show Seconds"}
                            style={{ opacity: showSeconds ? 1 : 0.6 }}
                        >
                            <span style={{ fontWeight: 700, fontSize: '13px' }}>:SS</span>
                        </button>
                    </div>

                    <div className="quick-add-controls">
                        <span className="sidebar-label">Quick Add</span>
                        <div className="quick-add-row">
                            <button onClick={() => addTime(5)} className="btn-small">+5m</button>
                            <button onClick={() => addTime(10)} className="btn-small">+10m</button>
                            <button onClick={() => addTime(15)} className="btn-small">+15m</button>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '12px', marginTop: '12px' }}>
                        <span className="sidebar-label">Account</span>
                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                                <img src={user?.profilePicture} alt={user?.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '12px', fontWeight: '500' }}>{user?.name}</div>
                                </div>
                                <button onClick={logout} className="btn-small" style={{ padding: '4px 8px', fontSize: '11px' }}>
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => { window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`; setIsSidebarOpen(false); }}
                                style={{ width: '100%', padding: '8px', marginTop: '8px', borderRadius: '6px', border: '1px solid #007bff', backgroundColor: '#007bff', color: 'white', fontSize: '12px', cursor: 'pointer' }}
                            >
                                Sign in with Google
                            </button>
                        )}
                    </div>

                    {user && <FileManager onFileSelect={(fileId) => { setSelectedFileId(fileId); if (fileId) setViewMode('file'); }} selectedFileId={selectedFileId} onFilesUpdate={setFiles} />}
                </div>
            </div>

            {/* Click backdrop to close */}
            {isSidebarOpen && <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {selectedFileId && viewMode === 'file' ? (
                    <FileViewer
                        fileId={selectedFileId}
                        files={files}
                        onNavigate={setSelectedFileId}
                        onClose={() => { setViewMode('timer'); setSelectedFileId(null); }}
                    />
                ) : (
                    <div className="timer-display">
                        <span>{time.h}</span>:<span>{time.m}</span>{showSeconds && (<span>:<span>{time.s}</span></span>)}
                    </div>
                )}
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
