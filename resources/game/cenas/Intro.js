import { BaseCena } from '../../js/library/base/BaseCena.js';
import { Button } from '../../js/library/components/Button.js';
import { ColorManager } from '../../js/library/managers/ColorManager.js';

export class Intro extends BaseCena {
    constructor(controladorDeCenas) {
        super('Intro');
        this.controladorDeCenas = controladorDeCenas;
        this.loaded = false;
    }

    create() {
        const background = this.add.image(0, 0, 'bgIntro1').setOrigin(0, 0);
        const marca = ColorManager.getCurrentMarca(this);
        const colors = ColorManager.getColors(marca, ColorManager.BLUE);

        const btIniciar = new Button(this, {
            text: 'COMEÇAR',
            colors: colors
        });

        btIniciar.x =  830;
        btIniciar.y = 882;

        btIniciar.on('buttonClick', () => {
            this.controladorDeCenas.proximaCena();
        });
        super.create();
    }
}

export default Intro;

