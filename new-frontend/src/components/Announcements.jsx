import { useState, useEffect } from 'react';

export default function Announcements() {
    const [text, setText] = useState(() => {
        return localStorage.getItem('exam_announcement') || '';
    });

    useEffect(() => {
        localStorage.setItem('exam_announcement', text);
    }, [text]);

    const handleChange = (e) => {
        setText(e.target.value);
    };

    return (
        <div className="split-section announcement-section">
            <textarea
                className="announcement-area"
                placeholder="Write announcements here..."
                value={text}
                onChange={handleChange}
            ></textarea>
        </div>
    );
}
