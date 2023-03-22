import { linearInterpol, Point } from "./interpolate";

const samples: Point[] = [
    {x: 0, y: 0}, 
    {x: 1, y: 2}, 
    {x: 2, y: 1}
]

const interpolated: Point[] = [
    {x: 0, y: 0}, 
    {x: 0.5, y: 1}, 
    {x: 1, y: 2}, 
    {x: 1.5, y: 1.5}, 
    {x: 2, y: 1}
]

describe('testing linear interpolation', () => {
    test('interpolates one point', () => {
        expect(linearInterpol(samples, 1)).toStrictEqual(interpolated);
    });
});
