import { BaseCena } from '../../js/library/base/BaseCena.js';
import { Button } from '../../js/library/components/Button.js';
import { ColorManager } from '../../js/library/managers/ColorManager.js';
import SoundManager from '../../js/library/managers/SoundManager.js';

const ALTERNATIVE_START_X = 40;
const ALTERNATIVE_START_Y = 260;
const ALTERNATIVE_GAP = 20;
const ACTION_BUTTON_GAP = 20;
const MODAL_BUTTON_BOTTOM_GAP = 160;
const CORRECT_ALTERNATIVE_KEY = 'A';
const MODAL_DEPTH = 20000;
const DISABLED_BUTTON_COLORS = {
    main: 0xC7C7C7,
    shadow: 0x7E878C,
    shadow2: 0x1F292D,
    text: '#FFFFFF',
    stroke: '#1F292D'
};

export class Game extends BaseCena {
    constructor(controladorDeCenas) {
        super('Game');
        this.controladorDeCenas = controladorDeCenas;
        this.loaded = false;
    }

    create() {
        this.resetSceneState();

        this.add.image(0, 0, 'jogosFase1').setOrigin(0, 0);

        const alternativeLayout = this.createAlternativeColumn();
        this.createActionButtons(alternativeLayout);

        super.create();
    }

    resetSceneState() {
        this.selectedAlternativeKey = null;
        this.alternativeButtons = [];
        this.confirmButton = null;
        this.confirmButtonBlocker = null;
        this.hintButton = null;
        this.actionButtonColors = null;
        this.modals = {};
    }

    createAlternativeColumn() {
        const definitions = [
            {
                key: 'A',
                defaultTexture: 'alternativasAContainer',
                activeTexture: 'alternativasAContainerActive',
                labelTexture: 'alternativasAText'
            },
            {
                key: 'B',
                defaultTexture: 'alternativasContainer',
                activeTexture: 'alternativasContainerActive',
                labelTexture: 'alternativasBText'
            },
            {
                key: 'C',
                defaultTexture: 'alternativasContainer',
                activeTexture: 'alternativasContainerActive',
                labelTexture: 'alternativasCText'
            },
            {
                key: 'D',
                defaultTexture: 'alternativasContainer',
                activeTexture: 'alternativasContainerActive',
                labelTexture: 'alternativasDText'
            }
        ];

        let currentY = ALTERNATIVE_START_Y;
        let columnWidth = 0;

        definitions.forEach((definition) => {
            const option = this.createAlternativeButton(ALTERNATIVE_START_X, currentY, definition);

            columnWidth = Math.max(columnWidth, option.width);
            currentY += option.height + ALTERNATIVE_GAP;
        });

        return {
            x: ALTERNATIVE_START_X,
            width: columnWidth,
            bottom: currentY - ALTERNATIVE_GAP
        };
    }

    createAlternativeButton(x, y, definition) {
        const container = this.add.container(x, y);
        const background = this.add.image(0, 0, definition.defaultTexture)
            .setOrigin(0, 0)
            .setInteractive({ cursor: 'pointer' });
        const label = this.add.image(background.width / 2, background.height / 2, definition.labelTexture)
            .setOrigin(0.5);

        background.on('pointerdown', () => {
            this.selectAlternative(definition.key);
        });

        container.add([background, label]);

        const option = {
            ...definition,
            container,
            background,
            label,
            width: background.width,
            height: background.height
        };

        this.alternativeButtons.push(option);

        return option;
    }

    selectAlternative(selectedKey) {
        this.selectedAlternativeKey = selectedKey;

        this.alternativeButtons.forEach((option) => {
            option.background.setTexture(
                option.key === selectedKey ? option.activeTexture : option.defaultTexture
            );
        });

        this.enableConfirmButton();
        SoundManager.play('click');
    }

    resetAlternativeSelection() {
        this.selectedAlternativeKey = null;

        this.alternativeButtons.forEach((option) => {
            option.background.setTexture(option.defaultTexture);
        });

        this.disableConfirmButton();
    }

    createActionButtons(layout) {
        const marca = ColorManager.getCurrentMarca(this);
        this.actionButtonColors = ColorManager.getColors(marca, ColorManager.YELLOW);

        this.confirmButton = new Button(this, {
            text: 'CONFIRMAR',
            colors: this.actionButtonColors,
            height: 90,
            margin: 40,
            fontSize: '36px'
        });

        this.hintButton = new Button(this, {
            text: 'VER DICA',
            colors: this.actionButtonColors,
            height: 90,
            margin: 40,
            fontSize: '36px'
        });

        const buttonsY = layout.bottom + ALTERNATIVE_GAP;
        const totalWidth = this.confirmButton.width + ACTION_BUTTON_GAP + this.hintButton.width;
        const startX = layout.x + ((layout.width - totalWidth) / 2);

        this.confirmButton.setPosition(startX, buttonsY);
        this.hintButton.setPosition(startX + this.confirmButton.width + ACTION_BUTTON_GAP, buttonsY);

        this.confirmButton.on('buttonClick', () => {
            this.handleConfirmButtonClick();
        });
        this.hintButton.on('buttonClick', () => {
            this.showModal('hint');
        });

        this.disableConfirmButton();
        this.createFeedbackModals();
    }

    disableConfirmButton() {
        if (!this.confirmButton) {
            return;
        }

        this.confirmButton.setColors(DISABLED_BUTTON_COLORS);

        if (!this.confirmButtonBlocker) {
            this.confirmButtonBlocker = this.add.zone(
                this.confirmButton.x,
                this.confirmButton.y,
                this.confirmButton.width,
                this.confirmButton.height
            )
                .setOrigin(0, 0)
                .setInteractive({ cursor: 'default' });
            this.confirmButtonBlocker.on('pointerdown', () => {});
        } else {
            this.confirmButtonBlocker
                .setPosition(this.confirmButton.x, this.confirmButton.y)
                .setSize(this.confirmButton.width, this.confirmButton.height)
                .setActive(true)
                .setVisible(true)
                .setInteractive({ cursor: 'default' });
        }
    }

    enableConfirmButton() {
        if (!this.confirmButton) {
            return;
        }

        this.confirmButton.setColors(this.actionButtonColors);

        if (this.confirmButtonBlocker) {
            this.confirmButtonBlocker.removeInteractive();
            this.confirmButtonBlocker.setActive(false);
            this.confirmButtonBlocker.setVisible(false);
        }
    }

    createFeedbackModals() {
        this.modals.hint = this.createModal({
            texture: 'feedbackDicaFase1',
            buttons: [
                {
                    text: 'VOLTAR',
                    onClick: () => {
                        this.hideModal('hint');
                    }
                }
            ]
        });

        this.modals.success = this.createModal({
            texture: 'feedbackAcertoFase1',
            buttons: [
                {
                    text: 'CONTINUAR',
                    onClick: () => {
                        this.handleSuccessContinue();
                    }
                }
            ]
        });

        this.modals.error = this.createModal({
            texture: 'feedbackErroFase1',
            buttons: [
                {
                    text: 'TENTAR NOVAMENTE',
                    onClick: () => {
                        this.resetAlternativeSelection();
                        this.hideModal('error');
                    }
                },
                {
                    text: 'VER DICA',
                    colors: this.actionButtonColors,
                    onClick: () => {
                        this.resetAlternativeSelection();
                        this.showModal('hint');
                    }
                }
            ]
        });
    }

    createModal({ texture, buttons }) {
        const overlay = this.add.container(0, 0);
        const backdrop = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.65)
            .setOrigin(0, 0)
            .setInteractive();
        const modalImage = this.add.image(this.scale.width / 2, this.scale.height / 2, texture)
            .setOrigin(0.5);
        const modalButtons = buttons.map((buttonConfig) => {
            const button = new Button(this, {
                text: buttonConfig.text,
                height: 90,
                margin: 40,
                fontSize: '36px',
                ...(buttonConfig.colors ? { colors: buttonConfig.colors } : {})
            });

            button.on('buttonClick', buttonConfig.onClick);

            return button;
        });
        const totalButtonsWidth = modalButtons.reduce((sum, button) => sum + button.width, 0)
            + (ACTION_BUTTON_GAP * Math.max(0, modalButtons.length - 1));
        const buttonY = (modalImage.y + (modalImage.height / 2)) - MODAL_BUTTON_BOTTOM_GAP - modalButtons[0].height;
        let currentX = modalImage.x - (totalButtonsWidth / 2);

        modalButtons.forEach((button, index) => {
            button.setPosition(currentX, buttonY);
            currentX += button.width;

            if (index < modalButtons.length - 1) {
                currentX += ACTION_BUTTON_GAP;
            }
        });

        overlay.add([backdrop, modalImage, ...modalButtons]);
        overlay.setDepth(MODAL_DEPTH);
        overlay.setVisible(false);

        return {
            overlay,
            buttons: modalButtons
        };
    }

    handleConfirmButtonClick() {
        if (this.selectedAlternativeKey === CORRECT_ALTERNATIVE_KEY) {
            this.showModal('success');
            return;
        }

        this.showModal('error');
    }

    handleSuccessContinue() {
        this.hideModal('success');

        if (this.controladorDeCenas && this.controladorDeCenas.cenaAtualIndex < this.controladorDeCenas.cenas.length - 1) {
            this.controladorDeCenas.proximaCena();
        }
    }

    showModal(key) {
        this.hideAllModals();

        const modal = this.modals[key];
        if (!modal) {
            return;
        }

        if (key === 'success') {
            SoundManager.play('acerto');
        } else if (key === 'error') {
            SoundManager.play('erro');
        }

        modal.overlay.setVisible(true);
        modal.overlay.setActive(true);
    }

    hideModal(key) {
        const modal = this.modals[key];
        if (!modal) {
            return;
        }

        modal.overlay.setVisible(false);
        modal.overlay.setActive(false);
    }

    hideAllModals() {
        Object.values(this.modals).forEach((modal) => {
            modal.overlay.setVisible(false);
            modal.overlay.setActive(false);
        });
    }
}

export default Game;
