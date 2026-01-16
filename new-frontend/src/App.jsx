import { useState, useEffect, useRef } from 'react';
import Timer from './Timer';
import Announcements from './Announcements';
import Header from './Header';

function MainLayout() {
  const [timerHeight, setTimerHeight] = useState(50);
  const isDragging = useRef(false);

  const startResize = () => {
    isDragging.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  const stopResize = () => {
    isDragging.current = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  };

  const resize = (e) => {
    if (!isDragging.current) return;
    const newHeight = (e.clientY / window.innerHeight) * 100;
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
      <Header />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
    </div>
  );
}

export default MainLayout;
