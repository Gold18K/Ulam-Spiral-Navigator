
// Functions
function isPrimeMillerRabin(n, k) {
    if (n <= 1n) return false;
    if (n <= 3n) return true;
  
    // Write n as d * 2^r + 1
    let r = 0n;
    let d = n - 1n;
    while (d % 2n === 0n) {
      d /= 2n;
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
    const range = b - a + 1n; // Range = b - a + 1
    const bits  = range.toString(2).length; // Number of bits needed

    let randBigInt;
    do {
        randBigInt = 0n;
        for (let i = 0; i < bits; i++) {
            randBigInt <<= 1n;
            randBigInt |= BigInt(Math.random() > 0.5 ? 1 : 0);
        }
    } while (randBigInt >= range); // Repeat if randBigInt is outside the range

    return randBigInt + a; // Shift to the desired range
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

// Worker's onmessage
onmessage = function(_event) {
    const result = [];

    for (let y = _event.data.work.y_start; y != _event.data.work.y_end; ++y) {
        const row = [];

        for (let x = _event.data.work.x_start; x != _event.data.work.x_end; ++x) {
            const test = coordinates_to_number(BigInt(x - Math.floor(_event.data.work.canvas_x / 2)) + _event.data.work.translation_x,
                                               BigInt(Math.floor(_event.data.work.canvas_y / 2) - y) - _event.data.work.translation_y);

            row.push([x, y, isPrimeMillerRabin(test, _event.data.work.primality_repetitions) ? true : false]);
        }

        result.push(row);
    }

    postMessage({
        id:   _event.data.id,
        grid: result
    });

}
