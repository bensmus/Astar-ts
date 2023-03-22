import foolaloola from './foo'
import {thing, min, max, partitionPivotFirst} from './bar'
import spacerock from './assets/spacerock.jpg'

const spacerockImg = document.getElementById('spacerock')
spacerockImg.src = spacerock;

console.log(foolaloola())
console.log(min(1, 2))
console.log(max(1, 2))
console.log(partitionPivotFirst([5, 9, 2, -1, 2, 2, 2]))
console.log(thing);