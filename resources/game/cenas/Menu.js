import { BaseCena } from '../../js/library/base/BaseCena.js';
import { Button } from '../../js/library/components/Button.js';
import { ColorManager } from '../../js/library/managers/ColorManager.js';
import SoundManager from '../../js/library/managers/SoundManager.js';

const STAGE_CARD_WIDTH = 560;
const STAGE_CARD_HEIGHT = 560;
const STAGE_CARD_GAP = 40;
const STAGE_CARD_BOTTOM_OFFSET = 220;
const EDIT_BUTTON_BOTTOM_OFFSET = 40;
const DISABLED_BUTTON_COLORS = {
    main: 0xC7C7C7,
    shadow: 0x7E878C,
    shadow2: 0x1F292D,
    text: '#FFFFFF',
    stroke: '#1F292D'
};
const STAGE_DEFINITIONS = [
    {
        key: 'casa',
        photoTexture: 'menuFotoCasa'
    },
    {
        key: 'criancas',
        photoTexture: 'menuFotoCriancas'
    },
    {
        key: 'gato',
        photoTexture: 'menuFotoGato'
    }
];

export class Menu extends BaseCena {
    constructor(controladorDeCenas) {
        super('Menu');
        this.controladorDeCenas = controladorDeCenas;
        this.loaded = false;
    }

    create() {
        this.resetSceneState();

        this.add.image(0, 0, 'menuBg').setOrigin(0, 0);

        this.createStageCards();
        this.createEditButton();

        super.create();
    }

    resetSceneState() {
        this.selectedStageKey = null;
        this.stageCards = [];
        this.editButton = null;
        this.editButtonBlocker = null;
        this.editButtonColors = null;
        this.editedPhotosState = this.game.registry.get('editedPhotosState') || {};
        this.completedStages = this.game.registry.get('menuCompletionState')
            || Object.fromEntries(
                Object.entries(this.editedPhotosState).map(([key, state]) => [key, Boolean(state && state.completed)])
            );
    }

    createStageCards() {
        const totalWidth = (STAGE_DEFINITIONS.length * STAGE_CARD_WIDTH)
            + ((STAGE_DEFINITIONS.length - 1) * STAGE_CARD_GAP);
        const startX = (this.scale.width - totalWidth) / 2;
        const startY = this.scale.height - STAGE_CARD_BOTTOM_OFFSET - STAGE_CARD_HEIGHT;

        STAGE_DEFINITIONS.forEach((definition, index) => {
            const x = startX + (index * (STAGE_CARD_WIDTH + STAGE_CARD_GAP));
            this.createStageCard(x, startY, definition);
        });
    }

    createStageCard(x, y, definition) {
        const container = this.add.container(x, y);
        const background = this.add.image(0, 0, 'menuContainer')
            .setOrigin(0, 0)
            .setInteractive({ cursor: 'pointer' });
        const photo = this.add.image(background.width / 2, background.height / 2, definition.photoTexture)
            .setOrigin(0.5);
        const feedback = this.add.image(background.width / 2, background.height / 2, 'menuFeedbackAcerto')
            .setOrigin(0.5)
            .setVisible(false);

        background.on('pointerdown', () => {
            this.selectStage(definition.key);
        });

        container.add([background, photo, feedback]);

        const stageCard = {
            ...definition,
            container,
            background,
            photo,
            feedback
        };

        this.stageCards.push(stageCard);
        this.applyStageCardState(stageCard);
    }

    applyStageCardState(stageCard) {
        const isCompleted = Boolean(this.completedStages[stageCard.key]);
        const isSelected = this.selectedStageKey === stageCard.key;

        let texture = 'menuContainer';

        if (isCompleted) {
            texture = 'menuContainerAcerto';
        } else if (isSelected) {
            texture = 'menuContainerActive';
        }

        stageCard.background.setTexture(texture);
        stageCard.feedback.setVisible(isCompleted);

        if (isCompleted) {
            stageCard.background.disableInteractive();
            return;
        }

        if (!stageCard.background.input) {
            stageCard.background.setInteractive({ cursor: 'pointer' });
        }
    }

    selectStage(selectedKey) {
        if (this.completedStages[selectedKey]) {
            return;
        }

        this.selectedStageKey = selectedKey;
        this.stageCards.forEach((stageCard) => {
            this.applyStageCardState(stageCard);
        });

        this.enableEditButton();
        SoundManager.play('click');
    }

    createEditButton() {
        const marca = ColorManager.getCurrentMarca(this);
        this.editButtonColors = ColorManager.getColors(marca, ColorManager.YELLOW);

        this.editButton = new Button(this, {
            text: 'EDITAR',
            colors: this.editButtonColors
        });

        const buttonX = (this.scale.width - this.editButton.width) / 2;
        const buttonY = this.scale.height - EDIT_BUTTON_BOTTOM_OFFSET - this.editButton.height;

        this.editButton.setPosition(buttonX, buttonY);
        this.editButton.on('buttonClick', () => {
            this.handleEditButtonClick();
        });

        this.disableEditButton();
    }

    handleEditButtonClick() {
        if (!this.selectedStageKey) {
            return;
        }

        this.game.registry.set('selectedMenuItem', this.selectedStageKey);
        this.controladorDeCenas.proximaCena();
    }

    disableEditButton() {
        if (!this.editButton) {
            return;
        }

        this.editButton.setColors(DISABLED_BUTTON_COLORS);

        if (!this.editButtonBlocker) {
            this.editButtonBlocker = this.add.zone(
                this.editButton.x,
                this.editButton.y,
                this.editButton.width,
                this.editButton.height
            )
                .setOrigin(0, 0)
                .setInteractive({ cursor: 'default' });
            this.editButtonBlocker.on('pointerdown', () => {});
        } else {
            this.editButtonBlocker
                .setPosition(this.editButton.x, this.editButton.y)
                .setSize(this.editButton.width, this.editButton.height)
                .setActive(true)
                .setVisible(true)
                .setInteractive({ cursor: 'default' });
        }
    }

    enableEditButton() {
        if (!this.editButton) {
            return;
        }

        this.editButton.setColors(this.editButtonColors);

        if (this.editButtonBlocker) {
            this.editButtonBlocker.removeInteractive();
            this.editButtonBlocker.setActive(false);
            this.editButtonBlocker.setVisible(false);
        }
    }
}

export default Menu;
