import { useState } from 'react';

export default function Announcements() {
    const [text, setText] = useState('');

    return (
        <div className="split-section announcement-section">
            <textarea
                className="announcement-area"
                placeholder="Write announcements here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
            ></textarea>
        </div>
    );
}
