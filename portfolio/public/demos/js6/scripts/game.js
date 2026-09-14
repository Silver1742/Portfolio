// Reemplazo de alert() por una notificación no bloqueante
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Clase principal del juego
class AhorcadoGame {
    constructor() {
        this.words = [];
        this.currentWord = '';
        this.guessedLetters = new Set();
        this.wrongLetters = new Set();
        this.maxLives = 6;
        this.lives = this.maxLives;
        this.points = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.playerName = '';
        this.gameActive = false;
        
        this.initializeElements();
        this.fetchWords();
        this.setupEventListeners();
    }
    
    initializeElements() {
        // Pantallas
        this.startScreen = document.getElementById('startScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.endScreen = document.getElementById('endScreen');
        this.scoresScreen = document.getElementById('scoresScreen');
        
        // Elementos de inicio
        this.playerNameInput = document.getElementById('playerName');
        this.startBtn = document.getElementById('startBtn');
        
        // Elementos del juego
        this.wordDisplay = document.getElementById('wordDisplay');
        this.keyboard = document.getElementById('keyboard');
        this.timerDisplay = document.getElementById('timer');
        this.pointsDisplay = document.getElementById('points');
        this.livesDisplay = document.getElementById('lives');
        this.displayName = document.getElementById('displayName');
        this.canvas = document.getElementById('hangmanCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Elementos de fin
        this.endTitle = document.getElementById('endTitle');
        this.finalWord = document.getElementById('finalWord');
        this.finalPoints = document.getElementById('finalPoints');
        this.finalTime = document.getElementById('finalTime');
        
        // Botones
        this.saveScoreBtn = document.getElementById('saveScoreBtn');
        this.showScoresBtn = document.getElementById('showScoresBtn');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.downloadPdfBtn = document.getElementById('downloadPdfBtn');
        this.backToGameBtn = document.getElementById('backToGameBtn');
    }
    
    async fetchWords() {
        try {
            // API de palabras en español
            const response = await fetch('https://api.datamuse.com/words?sp=?????&max=100&v=es');
            const data = await response.json();
            this.words = data.map(item => item.word).filter(word => word.length >= 4 && word.length <= 8);
            
            if (this.words.length === 0) {
                // Palabras de respaldo
                this.words = ['javascript', 'programacion', 'desarrollo', 'computadora', 'tecnologia', 
                            'algoritmo', 'variable', 'funcion', 'objeto', 'aplicacion', 'internet',
                            'base', 'datos', 'servidor', 'cliente'];
            }
        } catch (error) {
            console.error('Error fetching words:', error);
            // Palabras de respaldo si falla la API
            this.words = ['javascript', 'programacion', 'desarrollo', 'computadora', 'tecnologia', 
                         'algoritmo', 'variable', 'funcion', 'objeto', 'aplicacion'];
        }
    }
    
    setupEventListeners() {
        this.playerNameInput.addEventListener('input', () => {
            this.startBtn.disabled = !this.playerNameInput.value.trim();
        });
        
        this.startBtn.addEventListener('click', () => this.startGame());
        this.playAgainBtn.addEventListener('click', () => this.resetGame());
        this.showScoresBtn.addEventListener('click', () => this.showScores());
        this.backToGameBtn.addEventListener('click', () => this.backToGame());
        this.saveScoreBtn.addEventListener('click', () => this.saveScore());
        this.downloadPdfBtn.addEventListener('click', () => this.downloadPDF());
    }
    
    startGame() {
        this.playerName = this.playerNameInput.value.trim();
        if (!this.playerName) return;
        
        if (this.words.length === 0) {
            showToast('Cargando palabras... Por favor espera un momento.', 'info');
            return;
        }
        
        // Seleccionar palabra aleatoria
        this.currentWord = this.words[Math.floor(Math.random() * this.words.length)].toLowerCase();
        this.guessedLetters.clear();
        this.wrongLetters.clear();
        this.lives = this.maxLives;
        this.points = 0;
        this.timer = 0;
        this.gameActive = true;
        
        // Actualizar UI
        this.displayName.textContent = this.playerName;
        this.updateDisplay();
        this.createKeyboard();
        this.drawHangman();
        
        // Cambiar pantalla
        this.startScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        this.endScreen.classList.add('hidden');
        this.scoresScreen.classList.add('hidden');
        
        // Iniciar timer
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.timerDisplay.textContent = this.timer;
        }, 1000);
    }
    
    createKeyboard() {
        this.keyboard.innerHTML = '';
        const letters = 'abcdefghijklmnñopqrstuvwxyz';
        
        for (let letter of letters) {
            const key = document.createElement('button');
            key.className = 'key';
            key.textContent = letter.toUpperCase();
            key.addEventListener('click', () => this.handleGuess(letter));
            this.keyboard.appendChild(key);
        }
    }
    
    handleGuess(letter) {
        if (!this.gameActive || this.guessedLetters.has(letter) || this.wrongLetters.has(letter)) {
            return;
        }
        
        if (this.currentWord.includes(letter)) {
            this.guessedLetters.add(letter);
            this.points += 10;
            
            // Marcar tecla como correcta
            const keys = this.keyboard.children;
            for (let key of keys) {
                if (key.textContent.toLowerCase() === letter) {
                    key.classList.add('correct');
                    key.disabled = true;
                }
            }
            
            // Verificar si ganó
            if (this.checkWin()) {
                this.endGame(true);
            }
        } else {
            this.wrongLetters.add(letter);
            this.lives--;
            
            // Marcar tecla como incorrecta
            const keys = this.keyboard.children;
            for (let key of keys) {
                if (key.textContent.toLowerCase() === letter) {
                    key.classList.add('wrong');
                    key.disabled = true;
                }
            }
            
            this.drawHangman();
            
            // Verificar si perdió
            if (this.lives <= 0) {
                this.endGame(false);
            }
        }
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        // Actualizar palabra
        this.wordDisplay.innerHTML = '';
        for (let letter of this.currentWord) {
            const letterBox = document.createElement('div');
            letterBox.className = 'letter-box';
            letterBox.textContent = this.guessedLetters.has(letter) ? letter.toUpperCase() : '';
            this.wordDisplay.appendChild(letterBox);
        }
        
        // Actualizar stats
        this.pointsDisplay.textContent = this.points;
        this.livesDisplay.textContent = this.lives;
    }
    
    drawHangman() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 3;
        
        // Base
        if (this.lives <= 5) {
            // Poste vertical
            this.ctx.beginPath();
            this.ctx.moveTo(40, 220);
            this.ctx.lineTo(40, 30);
            this.ctx.stroke();
        }
        
        if (this.lives <= 4) {
            // Poste horizontal
            this.ctx.beginPath();
            this.ctx.moveTo(40, 30);
            this.ctx.lineTo(120, 30);
            this.ctx.stroke();
        }
        
        if (this.lives <= 3) {
            // Cuerda
            this.ctx.beginPath();
            this.ctx.moveTo(120, 30);
            this.ctx.lineTo(120, 60);
            this.ctx.stroke();
        }
        
        if (this.lives <= 2) {
            // Cabeza
            this.ctx.beginPath();
            this.ctx.arc(120, 80, 20, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        if (this.lives <= 1) {
            // Cuerpo
            this.ctx.beginPath();
            this.ctx.moveTo(120, 100);
            this.ctx.lineTo(120, 170);
            this.ctx.stroke();
            
            // Brazos
            this.ctx.beginPath();
            this.ctx.moveTo(120, 130);
            this.ctx.lineTo(90, 150);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(120, 130);
            this.ctx.lineTo(150, 150);
            this.ctx.stroke();
        }
        
        if (this.lives <= 0) {
            // Piernas
            this.ctx.beginPath();
            this.ctx.moveTo(120, 170);
            this.ctx.lineTo(100, 210);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(120, 170);
            this.ctx.lineTo(140, 210);
            this.ctx.stroke();
            
            // Ojos X
            this.ctx.strokeStyle = 'red';
            this.ctx.beginPath();
            this.ctx.moveTo(112, 75);
            this.ctx.lineTo(122, 85);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(122, 75);
            this.ctx.lineTo(112, 85);
            this.ctx.stroke();
        }
    }
    
    checkWin() {
        return [...this.currentWord].every(letter => this.guessedLetters.has(letter));
    }
    
    endGame(won) {
        this.gameActive = false;
        clearInterval(this.timerInterval);
        
        // Bonus por tiempo
        if (won) {
            const timeBonus = Math.max(0, 100 - this.timer);
            this.points += timeBonus;
        }
        
        // Mostrar pantalla final
        this.gameScreen.classList.add('hidden');
        this.endScreen.classList.remove('hidden');
        
        this.endTitle.textContent = won ? '¡GANASTE! 🎉' : '¡PERDISTE! 💀';
        this.endTitle.style.color = won ? '#4caf50' : '#f44336';
        this.finalWord.textContent = this.currentWord.toUpperCase();
        this.finalPoints.textContent = this.points;
        this.finalTime.textContent = this.timer;
    }
    
    resetGame() {
        this.startGame();
    }
    
    async saveScore() {
        const scoreData = {
            nombre: this.playerName,
            puntos: this.points,
            tiempo: this.timer,
            fecha: new Date().toISOString()
        };

        try {
            const scores = JSON.parse(localStorage.getItem('ahorcado_scores') || '[]');
            scores.push(scoreData);
            localStorage.setItem('ahorcado_scores', JSON.stringify(scores));
            showToast('¡Score guardado exitosamente!', 'success');
        } catch (error) {
            console.error('Error:', error);
            showToast('Error al guardar el score', 'error');
        }
    }
    
    async showScores() {
        try {
            const scores = JSON.parse(localStorage.getItem('ahorcado_scores') || '[]');
            scores.sort((a, b) => b.puntos - a.puntos);

            const scoresBody = document.getElementById('scoresBody');
            scoresBody.innerHTML = '';
            
            scores.forEach((score, index) => {
                const row = scoresBody.insertRow();
                const values = [
                    index + 1,
                    score.nombre,
                    score.puntos,
                    `${score.tiempo}s`,
                    new Date(score.fecha).toLocaleDateString(),
                ];
                values.forEach((value) => {
                    const cell = row.insertCell();
                    cell.textContent = value;
                });
            });
            
            this.endScreen.classList.add('hidden');
            this.scoresScreen.classList.remove('hidden');
        } catch (error) {
            console.error('Error:', error);
            showToast('Error al cargar la tabla de posiciones', 'error');
        }
    }
    
    backToGame() {
        this.scoresScreen.classList.add('hidden');
        this.startScreen.classList.remove('hidden');
    }
    
    downloadPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text('Tabla de Posiciones - Ahorcado', 20, 20);
        
        doc.setFontSize(14);
        doc.text(`Jugador: ${this.playerName}`, 20, 40);
        doc.text(`Puntos: ${this.points}`, 20, 50);
        doc.text(`Tiempo: ${this.timer}s`, 20, 60);
        
        doc.setFontSize(12);
        const table = document.getElementById('scoresTable');
        
        if (table) {
            const rows = table.getElementsByTagName('tr');
            let y = 80;
            
            // Headers
            if (rows.length > 0) {
                const headers = rows[0].getElementsByTagName('th');
                let x = 20;
                doc.setFont(undefined, 'bold');
                for (let header of headers) {
                    doc.text(header.textContent, x, y);
                    x += 40;
                }
                y += 10;
            }
            
            // Data rows
            doc.setFont(undefined, 'normal');
            for (let i = 1; i < rows.length; i++) {
                const cells = rows[i].getElementsByTagName('td');
                let x = 20;
                for (let cell of cells) {
                    doc.text(cell.textContent, x, y);
                    x += 40;
                }
                y += 10;
            }
        }
        
        doc.save('tabla_posiciones_ahorcado.pdf');
    }
}

// Inicializar el juego cuando se cargue la página
window.addEventListener('DOMContentLoaded', () => {
    new AhorcadoGame();
});