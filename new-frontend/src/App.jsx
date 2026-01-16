import { useState, useEffect, useRef } from 'react';
import Timer from './components/Timer';
import Announcements from './components/Announcements';

function App() {
  const [timerHeight, setTimerHeight] = useState(50); // Percentage
  const isDragging = useRef(false);

  const startResize = () => {
    isDragging.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none'; // Prevent text selection while dragging
  };

  const stopResize = () => {
    isDragging.current = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  };

  const resize = (e) => {
    if (!isDragging.current) return;

    // Calculate new height percentage
    const newHeight = (e.clientY / window.innerHeight) * 100;

    // Limit range (e.g., 20% to 80%)
    if (newHeight > 20 && newHeight < 80) {
      setTimerHeight(newHeight);
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResize);

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResize);
    };
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: `${timerHeight}%`, overflow: 'hidden' }}>
        <Timer />
      </div>

      <div className="resizer" onMouseDown={startResize}>
        <div className="resizer-handle"></div>
      </div>

      <div style={{ height: `${100 - timerHeight}%`, overflow: 'hidden' }}>
        <Announcements />
      </div>
    </div>
  );
}

export default App;
