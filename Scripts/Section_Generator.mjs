
const SMALL_PRIMES = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n];

// Functions
function isPrimeMillerRabin(n, k) {
    if (n <= 1n) return false;
    if (n <= 3n) return true;
  
    for (const p of SMALL_PRIMES)
        if (n % p == 0)
            return n == p;

    // Write n as d * 2^r + 1
    let r = 0n;
    let d = n - 1n;
    while ((d & 1n) === 0n) {
        d >>= 1n;
        r++;
    }
  
    // Witness loop
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
    let result = 1n;
    base %= modulus;

    while (exponent > 0n) {
        if ((exponent & 1n) === 1n)
            result = (result * base) % modulus;
        
        base = (base * base) % modulus;
        exponent >>= 1n;
    }

    return result;
}
function randomBigIntInRange(min, max) {
    const range = max - min + 1n;
    const bitLength = range.toString(2).length;

    let rand;
    do {
        rand = randomBits(bitLength);
    } while (rand >= range);

    return rand + min;
}
function randomBits(bits) {
    let rand = 0n;
    const steps = Math.ceil(bits / 32);
    for (let i = 0; i < steps; i++) {
        const part = BigInt(Math.floor(Math.random() * (2 ** 32)));
        rand = (rand << 32n) | part;
    }
    return rand >> BigInt((steps * 32) - bits);
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

// Worker's onmessage
onmessage = function(_event) {
    const result = [];

    for (let y = _event.data.work.y_start; y != _event.data.work.y_end; ++y) {
        const row = [];

        for (let x = _event.data.work.x_start; x != _event.data.work.x_end; ++x) {
            const test = coordinates_to_number(BigInt(x - Math.floor(_event.data.work.canvas_x / 2)) + _event.data.work.translation_x,
                                               BigInt(Math.floor(_event.data.work.canvas_y / 2) - y) - _event.data.work.translation_y);

            row.push([x, y, isPrimeMillerRabin(test, _event.data.work.primality_repetitions)]);
        }

        result.push(row);
    }

    postMessage({
        id:   _event.data.id,
        grid: result
    });

}
