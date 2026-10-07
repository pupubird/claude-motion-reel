// The cue sheet as JSON for the mixer: node projects/almostfriends-special/tools/cues.mjs > projects/almostfriends-special/audio/cues.json
import { cues } from '../src/cues.js';
console.log(JSON.stringify(cues(), null, 1));
