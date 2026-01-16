import { useState, useEffect, useRef } from 'react';
import Timer from './components/Timer';
import Announcements from './components/Announcements';
import Header from './components/Header';

function App() {
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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: `${timerHeight}%`, overflow: 'auto', borderBottom: '1px solid #ddd' }}>
          <Timer />
        </div>

        <div 
          className="resizer" 
          onMouseDown={startResize}
          style={{ cursor: 'row-resize', height: '8px', backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div className="resizer-handle" style={{ width: '30px', height: '3px', backgroundColor: '#999', borderRadius: '2px' }}></div>
        </div>

        <div style={{ height: `${100 - timerHeight}%`, overflow: 'auto' }}>
          <Announcements />
        </div>
      </div>
    </div>
  );
}

export default App;
