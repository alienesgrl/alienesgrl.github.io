const colors = ['blue', 'green', 'red', 'orange'];
const gameContainer = document.getElementById('gameContainer');
const arrow = document.getElementById('arrow');
const bubbles = [];
const moveLeftButton = document.getElementById('moveLeft');
const moveRightButton = document.getElementById('moveRight');
let canClick = true; 
let currentAngle = 270;
let array = []
let timeLeft = parseInt(prompt("Oyun oynamak istediğiniz süreyi saniye cinsinden girin: "));
const oyunSuresi = timeLeft;
let point = 0; // Başlangıç puanı
let timerInterval

while (timeLeft < 10 || isNaN(timeLeft)) {
    alert("Oyun süresi minimum 10 saniye olabilir ve bir sayı girmelisiniz!");
    timeLeft = parseInt(prompt("Oyun oynamak istediğiniz süreyi saniye cinsinden girin: "));
    oyunSuresi = timeLeft;
}

function startGame() {
    updateScoreboard(); // Skor tablosunu ilk kez güncelle
    startTimer(); // Zamanlayıcıyı başlat
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        updateScoreboard();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

function updateScoreboard() {
    const scoreboard = document.getElementById("scoreboard");
    scoreboard.textContent = `Süre: ${timeLeft} | Puan: ${point}`;
}

function endGame() {
    alert(`Oyun bitti! ${oyunSuresi} saniyede Toplam puanınız: ${point}`);
    window.location.reload();
}

function shootBubble() {
    if (!canClick || timeLeft <= 0) return; // Süre bittiyse işlem yapma
    canClick = false;
    const bubble = getBubbleAtPosition(10, 3);

    // Oku yönlendiren açıyı al
    const transform = window.getComputedStyle(arrow).transform;
    const values = transform.split('(')[1].split(')')[0].split(',');
    const cosTheta = parseFloat(values[0]);
    const sinTheta = parseFloat(values[1]);

    // Hareket hızı
    const speed = 10;
    let dx = cosTheta * speed;
    let dy = sinTheta * speed;

    const moveInterval = setInterval(() => {
        bubble.style.left = `${bubble.offsetLeft + dx}px`;
        bubble.style.top = `${bubble.offsetTop + dy}px`;

        // Çarpışma algılama
        for (const otherBubble of bubbles) {
            if (otherBubble !== bubble && isColliding(bubble, otherBubble)) {
                clearInterval(moveInterval);

                if (bubble.style.backgroundColor === otherBubble.style.backgroundColor) {
                    const position = getBubblePositionInArray(otherBubble);
                    kontrol(position.row, position.col);
                    kontrol2();
                    updateScoreboard();
                    console.clear();
                    clearAllBubbles();
                    displayMatrixAsBubbles(array);
                    array.forEach((row) => console.log(row));
                } else {
                    array = placeBubbleInArray(bubble);
                    console.clear();
                    clearAllBubbles();
                    displayMatrixAsBubbles(array);
                    array.forEach((row) => console.log(row));
                }
                return;
            }
        }

        // Üst sınıra çarpma
        if (bubble.offsetTop <= 0) {
            clearInterval(moveInterval);
            array = placeBubbleInArray(bubble);
            clearAllBubbles();
            displayMatrixAsBubbles(array);
        }
        if (bubble.offsetLeft <= 0 || bubble.offsetLeft + bubble.clientWidth >= gameContainer.clientWidth) {
            dx = -dx;
        }
        
    }, 5);

    setTimeout(() => {
        canClick = true;
        createBottomBubble();
        bitisKontrol();
    }, 500);
}

function gameArray() {
  for (let i = 0; i < 12; i++) {
      array[i] = [];
      let columnCount = (i % 2 === 0) ? 7 : 6;
  
      for (let j = 0; j < columnCount; j++) {
          if (i < 4) {
              let rastgeleRenk = colors[Math.floor(Math.random() * colors.length)];
              array[i][j] = rastgeleRenk.charAt(0);
          } else {
              array[i][j] = null;
          }
      }
  }
  let rastgeleRenk = colors[Math.floor(Math.random() * colors.length)];
  array[10][3] = rastgeleRenk.charAt(0);
  array.forEach((row) => { console.log(row); });
  return array;
}
    
function displayMatrixAsBubbles(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const gridSize = 50; // Her balonun boyutunu tanımlar
    // Her bir hücreyi döngü ile kontrol et
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
              const colorLetter = matrix[y][x];
              // Eğer bu hücrede bir renk varsa (null değilse)
              if (colorLetter) {
                  // Rengi, ilk harfe göre belirle
                  let color;
                  switch (colorLetter) {
                      case 'r':
                          color = 'red';
                          break;
                      case 'g':
                          color = 'green';
                          break;
                      case 'b':
                          color = 'blue';
                          break;
                      case 'o':
                          color = 'orange';
                          break;
                      default:
                          color = null; // Tanımlanmamış harf için varsayılan renk
                          break;
                }
                  // Tek satırlarda x pozisyonunu kaydır
                  const offsetX = (y % 2 === 1) ? gridSize / 2 : 0;
                  // createBubble fonksiyonunu kullanarak balonu oluştur
                  if (!document.querySelector(`[data-row="${y}"][data-col="${x}"]`)) {
                    createBubble(color, x * gridSize + offsetX, y * gridSize);
                }
            }
        }
    }
}

function createBubble(color, x, y) {
    const bubble = document.createElement('div');
    bubble.classList.add('top');
    bubble.style.backgroundColor = color;
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;
    gameContainer.appendChild(bubble);
    bubbles.push(bubble);
    return bubble;
}

function getBubbleAtPosition(row, col) {
    const colorLetter = array[row][col];
    if (colorLetter) {
        let color;
        switch (colorLetter) {
            case 'r': color = 'red'; break;
            case 'g': color = 'green'; break;
            case 'b': color = 'blue'; break;
            case 'o': color = 'orange'; break;
            default: color = null;
        }
        for (let i = 0; i < bubbles.length; i++) {
            const bubble = bubbles[i];
            const bubbleLeft = bubble.offsetLeft;
            const bubbleTop = bubble.offsetTop;
            if (bubbleLeft === col * 50 && bubbleTop === row * 50) {
              
                return bubble;
            }
        }
    }
    return null;
}

function isColliding(bubble1, bubble2) {
    const rect1 = bubble1.getBoundingClientRect();
    const rect2 = bubble2.getBoundingClientRect();
    const dx = (rect1.left + rect1.width / 2) - (rect2.left + rect2.width / 2);
    const dy = (rect1.top + rect1.height / 2) - (rect2.top + rect2.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < rect1.width) {
        setTimeout(() => {
            bubble1.remove(); // Balonu kaldır
            bubble2.remove();
        }, 500);
        return true;
    }
    return false;
}


// Altıgen yapıya uygun bir şekilde balonu matrise yerleştir
function placeBubbleInArray(bubble) {
    const { row, col } = calculateHexagonalPosition(bubble.offsetLeft, bubble.offsetTop);
    array[row][col] = bubble.style.backgroundColor;
    return array;
}

function calculateHexagonalPosition(x, y) {
    const gridWidth = 50; // Balon genişliği
    const gridHeight = 43; // Altıgen sırasındaki yükseklik
    const row = Math.round(y / gridHeight);
    const col = Math.round((x - (row % 2 === 1 ? gridWidth / 2 : 0)) / gridWidth);
    return { row, col };
}

function placeBubbleInArray(bubble) {
    let x = parseInt(bubble.style.left);
    let y = parseInt(bubble.style.top)
    let gridX =  Math.abs(Math.round(x / 50)); 
    let gridY = Math.abs(Math.round(y / 50));
    console.log(gridX, gridY)
    if (array[gridY][gridX] === null) {
        array[gridY][gridX] = bubble.style.backgroundColor[0]; // bubble yerleştirildi
    }
    return array;
}

function clearAllBubbles() {
    const bubbles = document.querySelectorAll('.top');
    bubbles.forEach(bubble => bubble.remove()); // Tüm balonları direkt temizle
}

function createBottomBubble() {
  array[10][3]=null;
  let renk = colors[Math.floor(Math.random() * colors.length)];
  const bubble = createBubble(renk, 230, 650);
  array[10][3] = bubble.style.backgroundColor[0];
}

function kontrol(row, col) {
    const targetChar = array[row][col]; // Başlangıç hücresinin harfi
    if (!targetChar) return; // Eğer hücre zaten null ise işlem yapma
    // DFS işlemini başlat
    dfsKontrol(row, col, targetChar);
}

// DFS ile komşuları null yap
function dfsKontrol(row, col, targetChar) {
    // Matris sınırlarının dışındaysa ya da harf eşleşmiyorsa çıkış yap
    if (
        row < 0 ||
        col < 0 ||
        row >= array.length ||
        col >= array[row].length ||
        array[row][col] !== targetChar
    ) {
        return;
    }
    // Şu anki hücreyi null yap
    array[row][col] = null;
    point++;

    // Altıgen komşuluk yönleri
    const directions = row % 2 != 0
        ? [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]]
        : [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]];

    // Komşuları sırayla kontrol et
    for (let [dx, dy] of directions) {
        dfsKontrol(row + dx, col + dy, targetChar);
    }
}

function kontrol2() {
    // Komşu yönlerini belirliyoruz:
    const komsular6ElemanliSatir = [
        [-1, 0], [-1, 1],    // Yukarı, Yukarı Sağ
        [0, -1], [0, 1],     // Sol, Sağ
        [1, 0], [1, 1],      // Aşağı, Aşağı Sağ
    ];

    const komsular7ElemanliSatir = [
        [-1, -1], [-1, 0],    // Yukarı Sol, Yukarı
        [0, -1], [0, 1],      // Sol, Sağ
        [1, -1], [1, 0],      // Aşağı Sol, Aşağı
    ];

    // DFS fonksiyonu
    function dfs(x, y, visited) {
        let stack = [[x, y]];
        visited[x][y] = true;
        // Satır uzunluğuna göre komşuları seçiyoruz
        const komsular = (array[x]?.length === 6) ? komsular6ElemanliSatir : komsular7ElemanliSatir;
        while (stack.length > 0) {
            let [i, j] = stack.pop();
            // Komşuları kontrol et
            komsular.forEach(([dx, dy]) => {
                let ni = i + dx;
                let nj = j + dy;
                // Eğer sınır dışına çıkmıyorsa ve henüz ziyaret edilmediyse
                if (
                    ni >= 0 && ni < array.length &&
                    nj >= 0 && nj < (ni % 2 === 0 ? 7 : 6) && 
                    !visited[ni][nj] && array[ni][nj] !== null
                ) {
                    visited[ni][nj] = true;
                    stack.push([ni, nj]);
                }
            });
        }
    }

    let visited = Array.from({ length: 9 }, () => Array(7).fill(false));
    // 0. satırdaki tüm topları kontrol et ve DFS başlat
    for (let j = 0; j < 7; j++) {
        if (array[0][j] !== null && !visited[0][j]) {
            dfs(0, j, visited);  // 0. satırdaki tüm bağlı elemanları bul
        }
    }
    // Bağlantısı olmayan topları patlat
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < (i % 2 === 0 ? 7 : 6); j++) {
            // Eğer bu top henüz ziyaret edilmediyse, patlat
            if (array[i][j] !== null && !visited[i][j]) {
                array[i][j] = null;  // Bu topu sil
                point++;
            }
        }
    }
    return array;
}

function bitisKontrol(){
    for (let i = 0; i < 6; i++) {
        if (array[9][i] != null) {
            alert(`Oyun bitti! Toplam puanınız: ${point}`);
            window.location.reload();
        }
    }
    const isFirst10RowsNull = array.slice(0, 10).every(row => row.every(cell => cell === null));
    const is2RowsLeft = array.slice(2, 10).every(row => row.every(cell => cell === null));
    const nullDisindaVarMi = array[0].some(cell => cell !== null)|| array[1].some(cell => cell !== null);
    if (isFirst10RowsNull) {
      alert("YOU WON!");
      window.location.reload();
    }
    if (is2RowsLeft && nullDisindaVarMi) {
        array[2] = [...array[0]];
        array[3] = [...array[1]];
        const colors = ['o', 'r', 'g', 'b'];
        for (let i = 0; i < 2; i++) {
            array[i] = Array(array[i].length)
                .fill(null)
                .map(() => colors[Math.floor(Math.random() * colors.length)]);
        }
        for (let row = 0; row <= 1; row++) { // Sadece 0. ve 1. satırları kontrol et
            for (let col = 0; col < array[row].length; col++) {
                if (array[row][col] === null) {
                    array[row][col] = colors[Math.floor(Math.random() * colors.length)];
                }
            }
        }
    }
}

function getBubblePositionInArray(bubble) {
    const bubbleLeft = bubble.offsetLeft;
    const bubbleTop = bubble.offsetTop;
    const bubbleWidth = bubble.offsetWidth;
    const bubbleHeight = bubble.offsetHeight;
    const cellSize = 50; // Her hücre 50px
    // Array'deki konumu bulmak için X ve Y koordinatlarını hücre boyutuna bölüyoruz
    const col = Math.floor(bubbleLeft / cellSize);
    const row = Math.floor(bubbleTop / cellSize);
    return { row, col };
}

document.addEventListener('mousemove', (event) => {
    const rect = gameContainer.getBoundingClientRect();
    if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
    ) {
        const arrowRect = arrow.getBoundingClientRect();
        const arrowX = arrowRect.left + arrowRect.width / 2;
        const arrowY = arrowRect.top + arrowRect.height / 2;
        const angle = Math.atan2(event.clientY - arrowY, event.clientX - arrowX);
        let degrees = (angle * 180) / Math.PI;
        if (degrees < -160 || degrees > 145) {
            degrees = -160;
        } 
        else if (degrees > -20 && degrees < 145) {
            degrees = -20;
        }
        arrow.style.transform = `rotate(${degrees}deg)`;
    }
});

let moveInterval;
moveLeftButton.addEventListener('mousedown', () => {
    moveInterval = setInterval(() => {
        if (currentAngle > 200) { 
            currentAngle -= 10;
            arrow.style.transform = `translateX(0%) rotate(${currentAngle}deg)`; 
        }
    }, 50);
});

moveLeftButton.addEventListener('mouseup', () => {
    clearInterval(moveInterval);
});

moveRightButton.addEventListener('mousedown', () => {
    moveInterval = setInterval(() => {
        if (currentAngle < 340) { 
            currentAngle += 10;
            arrow.style.transform = `translateX(0%) rotate(${currentAngle}deg)`; 
        }
    }, 50);
});

moveRightButton.addEventListener('mouseup', () => {
    clearInterval(moveInterval);
});

moveLeftButton.addEventListener('touchstart', () => {
    moveInterval = setInterval(() => {
        if (currentAngle > 200) { 
            currentAngle -= 10;
            arrow.style.transform = `translateX(0%) rotate(${currentAngle}deg)`; 
        }
    }, 50);
});

moveLeftButton.addEventListener('touchend', () => {
    clearInterval(moveInterval);
});

moveRightButton.addEventListener('touchstart', () => {
    moveInterval = setInterval(() => {
        if (currentAngle < 340) { 
            currentAngle += 10;
            arrow.style.transform = `translateX(0%) rotate(${currentAngle}deg)`; 
        }
    }, 50);
});

moveRightButton.addEventListener('touchend', () => {
    clearInterval(moveInterval);
});

startGame();
displayMatrixAsBubbles(gameArray());
document.getElementById('fireButton').addEventListener('click', shootBubble);
document.getElementById('gameContainer').addEventListener('click', shootBubble);