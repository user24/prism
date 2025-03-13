import {xkcdColours} from "@/data/rawColours";
import {hex2Rgb} from "@/components/Scatter3d/Scatter3dColours";

const unsanitisedColours = xkcdColours.split('\n').map(line => {
    const [name, hex] = line.split('\t');
    const {r, g, b} = hex2Rgb(hex);
    // if (name === 'ugly purple') {
    //     console.log(r,g,b);
    // }
    return {name, r, g, b, hex};
});

const colours = unsanitisedColours.filter(col => {
    // Removes colours with offensive or unhelpful names
    return !['blue blue', // will seem like an error
        'puke green',
        'terracota', // terracotta with two Ts (well 3...) already exists
        'bruise',
        'ocre', // ochre already exists
        'ocher', // ochre already exists
        'robin egg blue', // robin's egg blue already exists
        'purplish', // purpleish already exists
        'golden rod', // goldenrod already exists
        'snot green',
        'dodger blue', // USA cultural reference
        'light light blue',
        'macaroni and cheese',
        'bile',
        'shit green',
        'icky green',
        'baby shit brown',
        'booger',
        'bland',
        'gross green',
        'weird green',
        'poop',
        'puke yellow',
        'sickly green',
        'puke',
        'vomit',
        'vomit green',
        'booger green',
        'ugly blue',
        'ugly brown',
        'dark',
        'steel', // steel blue and grey already exist in the data
        'shit brown',
        'shit',
        'barney',
        'barney purple', // sorry Barney.
        'adobe', // is a colour but overtaken by the brand imo
        'poop brown',
        'poo brown',
        'baby poop',
        'ugly pink',
        'snot',
        'poo',
        'ugly green',
        'baby puke green',
        'green again',
        'carolina blue', // seems culture specific
        'ugly yellow',
        'sick green',
        'baby poop green',
        'vomit yellow',
        'baby poo',
        'puke brown',
        'ugly purple',
        'diarrhea',
        'baby shit green',
        'nice blue',
        'boring green',
        'nasty green',
        'kelley green', // kelly green already exists
        'barf green',
        'baby green',
        'dried blood',
        'piss yellow',
        'poop green'].includes(col.name);
});

export default colours;

export {
    unsanitisedColours,
    colours
}
