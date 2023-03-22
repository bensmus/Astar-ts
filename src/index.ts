import foolaloola from './foo';
import {thing, min, max, partitionPivotFirst} from './bar';
import { linearInterpol } from './interpolate';
import spacerock from './assets/spacerock.jpg';

const spacerockImg = document.getElementById('spacerock');
(spacerockImg as HTMLImageElement).src = spacerock;

console.log(foolaloola());
console.log(min(1, 2));
console.log(max(1, 2));
console.log(partitionPivotFirst([5, 9, 2, -1, 2, 2, 2]));
console.log(thing);
console.log(linearInterpol([{x: 0, y: 0}, {x: 1, y: 1}], 1));