# ExamTimer

**ExamTimer** is a modern, full-screen web application designed for proctoring examinations. It features a split-screen layout that displays a large, clear countdown timer on the top half and a dedicated announcements area on the bottom.

Built with **React** and **Vite**.

## ✨ Features

-   **Split-Screen Design**: Optimal use of screen real estate.
-   **Distraction-Free**: Clean "Light Mode" interface with white background.
-   **Smart Controls**: Intuitive icon-based buttons for managing time.
-   **Quick Extensions**: Add time on the fly (`+5m`, `+10m`, `+15m`) without interrupting the flow.
-   **Live Announcements**: A large, readable text area to update students during the exam.

---

## 🚀 How to Use

### ⏱️ Timer Controls
The control bar features 4 primary icon buttons:

1.  **Set Time (Clock Icon)**: 
    -   Click to open a simple modal.
    -   Enter the duration in minutes (e.g., `60` for 1 hour) and click **Set**.
    -   *Note: This overwrites any current timer.*

2.  **Start / Resume (Play Icon)**:
    -   Starts the countdown.
    -   If paused, it resumes from where it left off.

3.  **Pause (Pause Icon)**:
    -   Freezes the timer immediately. Useful for interruptions.

4.  **Reset (Cycle Icon)**:
    -   Stops the timer and resets it to the **total duration** (including any added extra time).

### ⚡ Quick Add Buttons
Located directly below the time display. Use these to quickly extend an exam:
-   `+5m`: Adds 5 minutes.
-   `+10m`: Adds 10 minutes.
-   `+15m`: Adds 15 minutes.
*These work instantly, even while the timer is running.*

### 📢 Announcements
The bottom half of the screen is a dedicated text area.
-   **Flexible**: Just click and type.
-   **Readable**: Text is left-aligned and sized for visibility from the back of a classroom.
-   **Use Cases**: Write exam codes, WiFi credentials, "5 minutes remaining" warnings, or corrections to questions.

---

## 🛠️ Installation & Running

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/atharvawadekar/ExamTimer.git
    cd ExamTimer
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the app**:
    ```bash
    npm run dev
    ```
    Open your browser to `http://localhost:5173`.
