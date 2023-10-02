export class CountdownTimer {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.element.classList = 'goldColor';
        this.seconds = 0;
        this.intervalId = null;
        this.isRunning = false;
        this.updateDisplay();
    }
  
    setTimer(seconds) {
        if (!this.isRunning) {
            this.seconds = seconds;
            this.updateDisplay();
        }
    }
  
    pauseTimer() {
        if (this.isRunning) {
            clearInterval(this.intervalId);
            this.isRunning = false;
        }
    }
  
    beginTimer() {
        if (!this.isRunning && this.seconds > 0) {
            this.intervalId = setInterval(() => {
            this.seconds--;
            this.updateDisplay();
            if (this.seconds === 0) {
                clearInterval(this.intervalId);
                this.isRunning = false;
            }
            }, 1000); // Update every 1 second (1000 milliseconds)
            this.isRunning = true;
        }
    }
  
    updateDisplay() {
        const minutes = Math.floor(this.seconds / 60);
        const remainingSeconds = this.seconds % 60;
        const formattedTime = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
        this.element.textContent = formattedTime;
    }
}
  