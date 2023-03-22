export type Point = {x: number, y: number}

/**
 * The output will include all the samples plus interploated points
 * @param samples Interpolate between these points
 * @param n How many interpolated points
 */
export function linearInterpol(samples: Point[], n: number): Point[] {
    if (n < 1) {
        return samples;
    }
    const out: Point[] = [];
    // For every sample except the last one:
    for (let sampleIndex = 0; sampleIndex < samples.length - 1; sampleIndex++) {
        const sample0 = samples[sampleIndex]
        const sample1 = samples[sampleIndex + 1]
        // Determine the sample's line function:
        const lineFunction = (x: number) => {
            const slope = (sample1.y - sample0.y) / (sample1.x - sample0.x)
            return slope * (x - sample0.x) + sample0.y
        }
        // Add all the interpolated points for that line segment:
        for (let interpolIndex = 0; interpolIndex < n + 1; interpolIndex++) {
            const x = sample0.x + interpolIndex * (sample1.x - sample0.x) / (n + 1)
            const y = lineFunction(x);
            out.push({x, y});
        }
    }
    // Add the last sample:
    out.push(samples[samples.length - 1]);
    return out;
}

const samples: Point[] = [
    {x: 0, y: 0}, 
    {x: 1, y: 2}, 
    {x: 2, y: 1}
]

console.log(linearInterpol(samples, 1));
