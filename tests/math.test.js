const { calculateTip, celsiusToFahrenheit, fahrenheitToCelsius, add } = require('../src/math'); // Destructure the function we want because we exported a function.

// First argument is a string that's the name of the test.
test('Should calculate total with tip', () => {
    const total = calculateTip(10, .30);
    
    expect(total).toBe(13);
});

test('Should calculate total with default tip', () => {
    const total = calculateTip(10);

    expect(total).toBe(12.5);
});

test('Should convert 32F to 0C', () => {
    const tempInCelsius = fahrenheitToCelsius(32);

    expect(tempInCelsius).toBe(0);
});

test('Should convert 0C to 32F', () => {
    const tempInFaren = celsiusToFahrenheit(0);

    expect(tempInFaren).toBe(32);
})

// test('Async test demo', (done) => {
//     setTimeout(() => {
//         expect(1).toBe(2);
//         done();
//     }, 2000);
// });

test('Should add two numbers', (done) => {
    add(2, 3).then((sum) => {
        expect(sum).toBe(5);
        done();
    });
});

test('Should add two numbers async/await', async () => {
    const sum = await add(10, 22);
    expect(sum).toBe(32);
});