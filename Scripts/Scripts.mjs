
// Imports
import {
    Web_Workers_Queue
} from "./Web_Workers_Queue.mjs"

// Variables
let MILLER_RABIN_REPETITIONS = 6;
let WORKERS_WORK_SIZE        = 150;
let NUMBER_OF_CORES_IN_USE   = Math.max(1, navigator.hardwareConcurrency - 1);
let CANVAS_SIDE_LENGTH_X     = Math.floor(window.innerWidth);
let CANVAS_SIDE_LENGTH_Y     = Math.floor(window.innerHeight);
let MOUSE_CURRENT_X          = 0;
let MOUSE_CURRENT_Y          = 0;
let MOUSE_DOWN_START_X       = 0;
let MOUSE_DOWN_START_Y       = 0;
let TRANSLATION_X            = 0n;
let TRANSLATION_Y            = 0n;
let MOVING_CANVAS_IMAGE_DATA = null;

// Constants
const COMPOSITE_COLOR  = "rgb(25, 25, 25)"
const ERROR_CONTOUR    = "2px solid rgb(255, 70, 70)"
const WEB_WORKER_QUEUE = new Web_Workers_Queue('Scripts/Section_Generator.mjs', NUMBER_OF_CORES_IN_USE, function(_event) {
    const ctx = document.getElementById('Ulam_Canvas').getContext('2d', { willReadFrequently: true });

    let imageData = ctx.createImageData(_event.data.grid[0].length, _event.data.grid.length);

    for (let y = 0; y != _event.data.grid.length; ++y) {

        for (let x = 0; x != _event.data.grid[0].length; ++x) {
            const pos = (y * _event.data.grid[0].length + x) * 4;

            imageData.data[pos]     = _event.data.grid[y][x][2] ? 255 : 25;
            imageData.data[pos + 1] = _event.data.grid[y][x][2] ? 255 : 25;
            imageData.data[pos + 2] = _event.data.grid[y][x][2] ? 255 : 25;
            imageData.data[pos + 3] = 255;
        }

    }

    ctx.putImageData(imageData, _event.data.grid[0][0][0], _event.data.grid[0][0][1]);

    if (WEB_WORKER_QUEUE.jobs_left() === 1) {
        document.body.style.cursor = 'default';
        document.getElementById('Download_Button').style.cursor = 'pointer';
    }

    if (MOVING_CANVAS_IMAGE_DATA !== null) {
        
        for (let y = 0; y < _event.data.grid.length; y++) {

            for (let x = 0; x < _event.data.grid[0].length; x++) {
                const smallIndex = (y * _event.data.grid[0].length + x) * 4;
                const largeIndex = ((y + _event.data.grid[0][0][1]) * CANVAS_SIDE_LENGTH_X + (x + _event.data.grid[0][0][0])) * 4;

                MOVING_CANVAS_IMAGE_DATA.data[largeIndex + 0] = imageData.data[smallIndex + 0];
                MOVING_CANVAS_IMAGE_DATA.data[largeIndex + 1] = imageData.data[smallIndex + 1];
                MOVING_CANVAS_IMAGE_DATA.data[largeIndex + 2] = imageData.data[smallIndex + 2];
                MOVING_CANVAS_IMAGE_DATA.data[largeIndex + 3] = imageData.data[smallIndex + 3];
            }

        }
    
    }

});

// Functions
function generate_Ulam_Canvas() {
    const ulam_canvas = document.createElement('canvas');

    ulam_canvas.setAttribute("id", "Ulam_Canvas");

    ulam_canvas.style.imageRendering = 'pixelated';
    
    ulam_canvas.width  = CANVAS_SIDE_LENGTH_X;
    ulam_canvas.height = CANVAS_SIDE_LENGTH_Y;

    const ctx = ulam_canvas.getContext('2d', { willReadFrequently: true });

    ctx.fillStyle = COMPOSITE_COLOR;
    ctx.fillRect(0, 0, CANVAS_SIDE_LENGTH_X, CANVAS_SIDE_LENGTH_Y);

    ulam_canvas.addEventListener('mousedown', function(_event) {
        MOUSE_CURRENT_X    = _event.clientX;
        MOUSE_CURRENT_Y    = _event.clientY;
        MOUSE_DOWN_START_X = _event.clientX;
        MOUSE_DOWN_START_Y = _event.clientY;

        if (_event.button !== 0)
            return;

        const ctx = ulam_canvas.getContext('2d', { willReadFrequently: true });

        MOVING_CANVAS_IMAGE_DATA = ctx.getImageData(0, 0, CANVAS_SIDE_LENGTH_X, CANVAS_SIDE_LENGTH_Y);
    }, false);
    ulam_canvas.addEventListener('touchstart', function(event) {
        event.preventDefault();
        
        MOUSE_CURRENT_X = Math.floor(Number(event.touches[0].clientX));
        MOUSE_CURRENT_Y = Math.floor(Number(event.touches[0].clientY));

        const rect   = ulam_canvas.getBoundingClientRect();
        const scaleX = ulam_canvas.width / rect.width;
        const scaleY = ulam_canvas.height / rect.height;
        
        const x = Math.floor((Math.floor(Number(event.touches[0].clientX)) - rect.left) * scaleX);
        const y = Math.floor((Math.floor(Number(event.touches[0].clientY)) - rect.top) * scaleY) + 1;
    
        const number = coordinates_to_number(BigInt(x - Math.floor(CANVAS_SIDE_LENGTH_X / 2)) + TRANSLATION_X, BigInt(Math.floor(CANVAS_SIDE_LENGTH_Y / 2) - y) - TRANSLATION_Y);
        const info   = document.getElementById('Number_Info');
    
        info.innerText = `Coordinates: (${BigInt(x - Math.floor(CANVAS_SIDE_LENGTH_X / 2)) + TRANSLATION_X},${BigInt(Math.floor(CANVAS_SIDE_LENGTH_Y / 2) - y) - TRANSLATION_Y})\n` +
                         `${number} is ${isPrimeMillerRabin(number, MILLER_RABIN_REPETITIONS) ? '' : 'not '}a prime number!`;

        MOUSE_DOWN_START_X = Math.floor(Number(event.touches[0].clientX));
        MOUSE_DOWN_START_Y = Math.floor(Number(event.touches[0].clientY));
    
        const ctx = ulam_canvas.getContext('2d', { willReadFrequently: true });
    
        MOVING_CANVAS_IMAGE_DATA = ctx.getImageData(0, 0, CANVAS_SIDE_LENGTH_X, CANVAS_SIDE_LENGTH_Y);
    }, { passive: false });
    ulam_canvas.addEventListener('mouseup', function(_event) {

        if (MOVING_CANVAS_IMAGE_DATA === null)
            return;

        const OLD_TRANSLATION_X = TRANSLATION_X;
        const OLD_TRANSLATION_Y = TRANSLATION_Y;

        TRANSLATION_X += BigInt(MOUSE_DOWN_START_X - MOUSE_CURRENT_X);
        TRANSLATION_Y += BigInt(MOUSE_DOWN_START_Y - MOUSE_CURRENT_Y);

        MOVING_CANVAS_IMAGE_DATA = null;

        if (OLD_TRANSLATION_X !== TRANSLATION_X || OLD_TRANSLATION_Y !== TRANSLATION_Y)
            update_Canvas();

        else {
            navigator.clipboard.writeText(document.getElementById("Number_Info").innerText);
           
            const copied_to_clipboard = document.getElementById("Copied_To_Clipboard");

            copied_to_clipboard.style.transition      = 'none';
            copied_to_clipboard.style.backgroundColor = 'rgba(106, 177, 106, 1)';
            copied_to_clipboard.style.color           = 'rgba(50, 50, 50, 1)';

            window.getComputedStyle(copied_to_clipboard).backgroundColor;

            copied_to_clipboard.style.transition = 'background-color 1.5s ease-in, color 1.5s ease-in';

            copied_to_clipboard.style.backgroundColor = 'rgba(106, 177, 106, 0)';
            copied_to_clipboard.style.color           = 'rgba(50, 50, 50, 0)';
        }

    }, false);
    ulam_canvas.addEventListener('touchend', function(_event) {
        _event.preventDefault();

        if (MOVING_CANVAS_IMAGE_DATA === null)
            return;
    
        const OLD_TRANSLATION_X = TRANSLATION_X;
        const OLD_TRANSLATION_Y = TRANSLATION_Y;
    
        TRANSLATION_X += BigInt(MOUSE_DOWN_START_X - MOUSE_CURRENT_X);
        TRANSLATION_Y += BigInt(MOUSE_DOWN_START_Y - MOUSE_CURRENT_Y);
    
        MOVING_CANVAS_IMAGE_DATA = null;
    
        if (OLD_TRANSLATION_X !== TRANSLATION_X || OLD_TRANSLATION_Y !== TRANSLATION_Y)
            update_Canvas();
    
    }, { passive: false });
    ulam_canvas.addEventListener('mousemove', function(event) {

        if (MOVING_CANVAS_IMAGE_DATA === null) {
            const rect   = ulam_canvas.getBoundingClientRect();
            const scaleX = ulam_canvas.width / rect.width;
            const scaleY = ulam_canvas.height / rect.height;
            const x      = Math.floor((event.clientX - rect.left) * scaleX);
            const y      = Math.floor((event.clientY - rect.top) * scaleY) + 1;
            const number = coordinates_to_number(BigInt(x - Math.floor(CANVAS_SIDE_LENGTH_X / 2)) + TRANSLATION_X, BigInt(Math.floor(CANVAS_SIDE_LENGTH_Y / 2) - y) - TRANSLATION_Y);
    
            const info = document.getElementById('Number_Info');
    
            info.innerText = `Coordinates: (${BigInt(x - Math.floor(CANVAS_SIDE_LENGTH_X / 2)) + TRANSLATION_X}, ${BigInt(Math.floor(CANVAS_SIDE_LENGTH_Y / 2) - y) - TRANSLATION_Y})\n` +
                             `${number} is ${isPrimeMillerRabin(number, MILLER_RABIN_REPETITIONS) ? '' : 'not '}a prime number!`;
        }
        
    }, false);
    
    document.getElementById("Canvas_Slot").appendChild(ulam_canvas);
}
function enable_Download() {
    document.getElementById('Download_Button').addEventListener('click', downloadCanvas, false);
}
function generate_Placeholders_Advanced() {
    document.getElementById('Change_Section_Side_length').placeholder      = `Section side length: [1-${Math.max(CANVAS_SIDE_LENGTH_X, CANVAS_SIDE_LENGTH_Y)}]`;
    document.getElementById('Change_Cores').placeholder                    = `Number of cores: [1-${Math.max(1, navigator.hardwareConcurrency)}]`;
    document.getElementById('Change_Miller_Rabin_Repetitions').placeholder = `Miller Rabin repetitions: [1-100]`;
}
function resize_Canvas() {
    WEB_WORKER_QUEUE.terminate_workers();

    MOVING_CANVAS_IMAGE_DATA = null;

    CANVAS_SIDE_LENGTH_X = Math.floor(window.innerWidth / 0.95);
    CANVAS_SIDE_LENGTH_Y = Math.floor(window.innerHeight / 0.95);

    document.getElementById('Change_Section_Side_length').placeholder = `Section side length: [1-${Math.max(CANVAS_SIDE_LENGTH_X, CANVAS_SIDE_LENGTH_Y)}]`;

    const ulam_canvas = document.getElementById('Ulam_Canvas');

    ulam_canvas.width  = CANVAS_SIDE_LENGTH_X;
    ulam_canvas.height = CANVAS_SIDE_LENGTH_Y;

    const ctx = ulam_canvas.getContext('2d', { willReadFrequently: true });

    ctx.fillStyle = COMPOSITE_COLOR;
    ctx.fillRect(0, 0, CANVAS_SIDE_LENGTH_X, CANVAS_SIDE_LENGTH_Y);

    update_Canvas();
}
function update_Canvas() {
    WEB_WORKER_QUEUE.terminate_workers();

    document.body.style.cursor = 'wait';

    let jobs = [];

    for (let y = 0; y != Math.floor(CANVAS_SIDE_LENGTH_Y / WORKERS_WORK_SIZE) + (CANVAS_SIDE_LENGTH_Y % WORKERS_WORK_SIZE === 0 ? 0 : 1); ++y) {

        for (let x = 0; x != Math.floor(CANVAS_SIDE_LENGTH_X / WORKERS_WORK_SIZE) + (CANVAS_SIDE_LENGTH_X % WORKERS_WORK_SIZE === 0 ? 0 : 1); ++x) {
            jobs.push({
                x_start:               x * WORKERS_WORK_SIZE,
                x_end:                 Math.min((x + 1) * WORKERS_WORK_SIZE, CANVAS_SIDE_LENGTH_X),
                y_start:               y * WORKERS_WORK_SIZE,
                y_end:                 Math.min((y + 1) * WORKERS_WORK_SIZE, CANVAS_SIDE_LENGTH_Y),
                canvas_x:              CANVAS_SIDE_LENGTH_X,
                canvas_y:              CANVAS_SIDE_LENGTH_Y,
                translation_x:         TRANSLATION_X,
                translation_y:         TRANSLATION_Y,
                primality_repetitions: MILLER_RABIN_REPETITIONS
            });
        }

    }
    
    jobs = shuffle_Array(jobs);

    for (let i = 0; i != jobs.length; ++i)
        WEB_WORKER_QUEUE.send_job(jobs[i]);

}
function isPrimeMillerRabin(n, k) {
    if (n <= 1n) return false;
    if (n <= 3n) return true;
  
    let r = 0n;
    let d = n - 1n;
    while (d % 2n === 0n) {
      d /= 2n;
      r++;
    }
  
    for (let i = 0; i < k; i++) {
        const a = randomBigIntInRange(2n, n - 1n);
        let x = modPow(a, d, n);
    
        if (x === 1n || x === n - 1n) continue;
    
        for (let j = 0n; j < r - 1n; j++) {
            x = modPow(x, 2n, n);
            if (x === n - 1n) break;
        }
    
        if (x !== n - 1n) return false;
    }
  
    return true;
} 
function modPow(base, exponent, modulus) {
    if (exponent === 0n) return 1n;
    let result = 1n;
    base = base % modulus;
  
    while (exponent > 0n) {
      if (exponent % 2n === 1n) {
        result = (result * base) % modulus;
      }
      exponent /= 2n;
      base = (base * base) % modulus;
    }
  
    return result;
}
function randomBigIntInRange(a, b) {
    const range = b - a + 1n;
    const bits  = range.toString(2).length;

    let randBigInt;
    do {
        randBigInt = 0n;
        for (let i = 0; i < bits; i++) {
            randBigInt <<= 1n;
            randBigInt |= BigInt(Math.random() > 0.5 ? 1 : 0);
        }
    } while (randBigInt >= range);

    return randBigInt + a;
}
function number_to_coordinates(n) {
    let k = Math.ceil((Math.sqrt(n) - 1) / 2);
    let t = (2 * k + 1);
    let m = Math.pow(t--, 2);

    if (n >= m - t) {
        return [k - (m - n), -k];
    } else {
        m = m - t;
    }
    if (n >= m - t) {
       return [-k, -k + (m - n)];
    } else {
        m = m - t;
    }
    if (n >= m - t) {
        return [-k + (m - n), k];
    } else {
        return [k, k - (m - n - t)];
    }

}
function coordinates_to_number(x, y) {
    let pos;

    if (y<x  && -x<y)   pos =       x      + y - 1n;
    if (x<=y && -x<y)   pos =     - x + 3n * y - 1n;
    if (x<=y && y<=-x)  pos = -5n * x      - y - 1n;
    if (y<x  && y<=-x)  pos =       x - 7n * y - 1n;

    const lap = max_BigInt(abs_BigInt(x), abs_BigInt(y));

    return 4n * lap * lap - 4n * lap + pos + 2n;
}
function abs_BigInt(_n) {

    if (_n < 0n)
        return -_n;
    
    return _n;
}
function max_BigInt(_a, _b) {

    if (_a > _b)
        return _a;
    
    return _b;
}
function collatz_Steps(_n) {
    let counter = 0n;

    while (_n != 1n) {
        _n = _n % 2n === 0n ? _n / 2n : 3n * _n + 1n;
        ++counter;
    }

    return counter;
}
function shuffle_Array(_array) {
    for (let i = _array.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [_array[i], _array[j]] = [_array[j], _array[i]];
    }
    return _array;
}
function is_Legal_BigInt(_string) {
    const input_Element = document.getElementById(_string);

    if (input_Element.value === '')
        return false;

    try {
        BigInt(input_Element.value);
        return true;
    } catch (e) {
        return false;
    }

}
function downloadCanvas() {

    if (document.getElementById('Download_Button').style.cursor === 'not-allowed')
        return;

    const downloadLink = document.createElement('a');

    downloadLink.href     = document.getElementById('Ulam_Canvas').toDataURL('image/png');
    downloadLink.download = 'Ulam_Spiral.png';

    downloadLink.click();
}

// Events
window.addEventListener('resize', resize_Canvas, false);
window.addEventListener('mousemove', function(event) {
    MOUSE_CURRENT_X = event.clientX;
    MOUSE_CURRENT_Y = event.clientY;

    if (MOVING_CANVAS_IMAGE_DATA === null)
        return;
    
    if (WEB_WORKER_QUEUE.jobs_left() != 0 && (MOUSE_DOWN_START_X !== MOUSE_CURRENT_X || MOUSE_DOWN_START_Y !== MOUSE_CURRENT_Y))
        WEB_WORKER_QUEUE.terminate_workers();

    document.body.style.cursor = 'default';
    document.getElementById('Download_Button').style.cursor = 'pointer';

    const ctx = document.getElementById('Ulam_Canvas').getContext('2d', { willReadFrequently: true });

    ctx.fillStyle = COMPOSITE_COLOR;
    ctx.fillRect(0, 0, CANVAS_SIDE_LENGTH_X, CANVAS_SIDE_LENGTH_Y);

    ctx.putImageData(MOVING_CANVAS_IMAGE_DATA, MOUSE_CURRENT_X - MOUSE_DOWN_START_X, MOUSE_CURRENT_Y - MOUSE_DOWN_START_Y);
});
window.addEventListener('touchmove', function(event) {
    event.preventDefault();

    MOUSE_CURRENT_X = Math.floor(Number(event.touches[0].clientX));
    MOUSE_CURRENT_Y = Math.floor(Number(event.touches[0].clientY));

    if (MOVING_CANVAS_IMAGE_DATA === null)
        return;
    
    if (WEB_WORKER_QUEUE.jobs_left() != 0) 
        WEB_WORKER_QUEUE.terminate_workers();

    document.body.style.cursor = 'default';
    document.getElementById('Download_Button').style.cursor = 'pointer';

    const ctx = document.getElementById('Ulam_Canvas').getContext('2d', { willReadFrequently: true });

    ctx.fillStyle = COMPOSITE_COLOR;
    ctx.fillRect(0, 0, CANVAS_SIDE_LENGTH_X, CANVAS_SIDE_LENGTH_Y);

    ctx.putImageData(MOVING_CANVAS_IMAGE_DATA, Math.floor(Number(event.touches[0].clientX)) - MOUSE_DOWN_START_X, Math.floor(Number(event.touches[0].clientY)) - MOUSE_DOWN_START_Y);
}, { passive: false });
window.addEventListener('mouseup', function(_event) {

    if (MOVING_CANVAS_IMAGE_DATA === null)
        return;

    document.getElementById('Ulam_Canvas').dispatchEvent(new Event('mouseup'));
}, false);
window.addEventListener('touchend', function() {

    if (MOVING_CANVAS_IMAGE_DATA === null)
        return;

    document.getElementById('Ulam_Canvas').dispatchEvent(new Event('touchend'));
}, false);
document.getElementById('Download_Button').addEventListener('mouseenter', function(event) {

    if (document.body.style.cursor === 'wait')
        document.getElementById('Download_Button').style.cursor = 'not-allowed';

    else
        document.getElementById('Download_Button').style.cursor = 'pointer';

}, false);
document.getElementById('Change_X').addEventListener('keydown', function(event) {

    if (event.key === 'Enter') {
        const is_X_Legal = is_Legal_BigInt("Change_X");
        const is_Y_Legal = is_Legal_BigInt("Change_Y");
        
        if (!is_X_Legal)
            document.getElementById("Change_X").style.outline = ERROR_CONTOUR;

        if (!is_Y_Legal)
            document.getElementById("Change_Y").style.outline = ERROR_CONTOUR; 


        if (is_X_Legal && is_Y_Legal) {
            document.getElementById("Change_X").style.outline = 'none';
            document.getElementById("Change_Y").style.outline = 'none';

            const new_Translation_X = BigInt(document.getElementById("Change_X").value);
            const new_Translation_Y = BigInt(document.getElementById("Change_Y").value);

            if (new_Translation_X === TRANSLATION_X && new_Translation_Y === TRANSLATION_Y)
                return;


            TRANSLATION_X = BigInt(document.getElementById("Change_X").value);
            TRANSLATION_Y = -BigInt(document.getElementById("Change_Y").value);

            const ctx = document.getElementById('Ulam_Canvas').getContext('2d', { willReadFrequently: true });

            ctx.fillStyle = COMPOSITE_COLOR;
            ctx.fillRect(0, 0, CANVAS_SIDE_LENGTH_X, CANVAS_SIDE_LENGTH_Y);

            document.body.style.cursor = 'default';
            document.getElementById('Download_Button').style.cursor = 'pointer';
            
            update_Canvas();
        }

        this.blur();
        event.preventDefault();
    }

}, { passive: false });
document.getElementById('Change_Y').addEventListener('keydown', function(event) {

    if (event.key === 'Enter') {
        const is_X_Legal = is_Legal_BigInt("Change_X");
        const is_Y_Legal = is_Legal_BigInt("Change_Y");

        if (!is_X_Legal)
            document.getElementById("Change_X").style.outline = ERROR_CONTOUR;

        if (!is_Y_Legal)
            document.getElementById("Change_Y").style.outline = ERROR_CONTOUR; 

        if (is_X_Legal && is_Y_Legal) {
            document.getElementById("Change_X").style.outline = 'none';
            document.getElementById("Change_Y").style.outline = 'none';

            const new_Translation_X = BigInt(document.getElementById("Change_X").value);
            const new_Translation_Y = BigInt(document.getElementById("Change_Y").value);

            if (new_Translation_X === TRANSLATION_X && new_Translation_Y === TRANSLATION_Y)
                return;
            
            TRANSLATION_X = BigInt(document.getElementById("Change_X").value);
            TRANSLATION_Y = -BigInt(document.getElementById("Change_Y").value);

            const ctx = document.getElementById('Ulam_Canvas').getContext('2d', { willReadFrequently: true });

            ctx.fillStyle = COMPOSITE_COLOR;
            ctx.fillRect(0, 0, CANVAS_SIDE_LENGTH_X, CANVAS_SIDE_LENGTH_Y);

            document.body.style.cursor = 'default';
            document.getElementById('Download_Button').style.cursor = 'pointer';

            update_Canvas();
        }

        this.blur();
        event.preventDefault();
    }

}, { passive: false });
document.getElementById('Change_Section_Side_length').addEventListener('keydown', function(event) {

    if (event.key === 'Enter') {

        if (!is_Legal_BigInt("Change_Section_Side_length")) {
            document.getElementById("Change_Section_Side_length").style.outline = ERROR_CONTOUR;
            return;
        }

        const value = Number(document.getElementById("Change_Section_Side_length").value);

        if (value < 1 || value > Math.max(CANVAS_SIDE_LENGTH_X, CANVAS_SIDE_LENGTH_Y)) {
            document.getElementById("Change_Section_Side_length").style.outline = ERROR_CONTOUR;
            return;
        }

        document.getElementById("Change_Section_Side_length").style.outline = 'none';

        if (value === WORKERS_WORK_SIZE)
            return;

        WORKERS_WORK_SIZE = Number(value);
        update_Canvas();

        this.blur();
        event.preventDefault();
    }

}, { passive: false });
document.getElementById('Change_Cores').addEventListener('keydown', function(event) {

    if (event.key === 'Enter') {

        if (!is_Legal_BigInt("Change_Cores")) {
            document.getElementById("Change_Cores").style.outline = ERROR_CONTOUR;
            return;
        }

        const value = Number(document.getElementById("Change_Cores").value);

        if (value < 1 || value > navigator.hardwareConcurrency) {
            document.getElementById("Change_Cores").style.outline = ERROR_CONTOUR;
            return;
        }
       
        document.getElementById("Change_Cores").style.outline = 'none';

        if (value === NUMBER_OF_CORES_IN_USE)
            return;

        NUMBER_OF_CORES_IN_USE = Number(value);

        WEB_WORKER_QUEUE.change_number_of_workers(NUMBER_OF_CORES_IN_USE);

        this.blur();
        event.preventDefault();
    }

}, { passive: false });
document.getElementById('Change_Miller_Rabin_Repetitions').addEventListener('keydown', function(event) {

    if (event.key === 'Enter') {

        if (!is_Legal_BigInt("Change_Miller_Rabin_Repetitions")) {
            document.getElementById("Change_Miller_Rabin_Repetitions").style.outline = ERROR_CONTOUR;
            return;
        }

        const value = Number(document.getElementById("Change_Miller_Rabin_Repetitions").value);

        if (value < 1 || value > 100) {
            document.getElementById("Change_Miller_Rabin_Repetitions").style.outline = ERROR_CONTOUR;
            return;
        }
       
        document.getElementById("Change_Miller_Rabin_Repetitions").style.outline = 'none';

        MILLER_RABIN_REPETITIONS = Number(value);
        update_Canvas();

        this.blur();
        event.preventDefault();
    }

}, { passive: false });

window.onload = function() {
    generate_Ulam_Canvas();
    enable_Download();
    generate_Placeholders_Advanced();
    
    update_Canvas();
};
