import { BaseCena } from '../../js/library/base/BaseCena.js';
import { Button } from '../../js/library/components/Button.js';
import { ColorManager } from '../../js/library/managers/ColorManager.js';
import SoundManager from '../../js/library/managers/SoundManager.js';

const PHOTO_X = 80;
const PHOTO_BOTTOM_OFFSET = 101;
const CONTAINER_RIGHT_OFFSET = 40;
const CONTAINER_BOTTOM_OFFSET = 61;
const CONTAINER_VERTICAL_GAP = 40;
const CONTAINER_BUTTON_BOTTOM_OFFSET = 50;
const CHOICE_ELEMENT_GAP = 20;
const CHOICE_TEXT_LEFT_OFFSET = 40;
const CHOICE_CONTAINER_SCALE = 564 / 743;
const MODAL_BUTTON_BOTTOM_GAP = 160;
const MODAL_DEPTH = 20000;
const PHOTO_BASE_DEPTH = 10;
const PHOTO_ELEMENT_DEPTH_BASE = 11;
const CHOICE_OPTIONS = [
    'eles descobriram um segredo',
    'relatividade',
    'era-uma-vez'
];

const SUBJECT_LABELS = {
    casa: 'Casa',
    criancas: 'Criancas',
    gato: 'Gato'
};

export class Game3 extends BaseCena {
    constructor(controladorDeCenas) {
        super('Game3');
        this.controladorDeCenas = controladorDeCenas;
        this.loaded = false;
    }

    create() {
        this.resetSceneState();

        this.add.image(0, 0, 'jogosFase3').setOrigin(0, 0);

        this.createEditedPhotoPreview();
        this.createActionContainers();

        super.create();
    }

    resetSceneState() {
        this.firstEditedPhotoState = this.resolveFirstEditedPhotoState();
        this.previewObjects = [];
        this.previewMaskGraphics = null;
        this.previewMask = null;
        this.phrasesContainerImage = null;
        this.writeContainerImage = null;
        this.chooseButton = null;
        this.writeButton = null;
        this.choiceAreaBounds = null;
        this.choiceOptionButtons = [];
        this.selectedChoiceOption = null;
        this.choiceConfirmButton = null;
        this.choiceHintButton = null;
        this.choiceHintButtonColors = null;
        this.choiceUiCreated = false;
        this.modals = {};
    }

    resolveFirstEditedPhotoState() {
        const editedPhotosState = this.game.registry.get('editedPhotosState') || {};
        const editedPhotosOrder = this.game.registry.get('editedPhotosOrder') || [];
        const firstEditedKey = editedPhotosOrder.find((key) => editedPhotosState[key])
            || Object.keys(editedPhotosState)[0];

        if (firstEditedKey && editedPhotosState[firstEditedKey]) {
            return editedPhotosState[firstEditedKey];
        }

        const fallbackKey = this.game.registry.get('selectedMenuItem') || 'casa';

        return {
            key: fallbackKey,
            textureKey: this.getFallbackTextureKey(fallbackKey),
            elements: []
        };
    }

    getFallbackTextureKey(subjectKey) {
        const subjectLabel = SUBJECT_LABELS[subjectKey] || SUBJECT_LABELS.casa;
        return `fotos${subjectLabel}Default`;
    }

    createEditedPhotoPreview() {
        const photoTextureKey = this.firstEditedPhotoState.textureKey
            || this.getFallbackTextureKey(this.firstEditedPhotoState.key);
        const baseImage = this.add.image(PHOTO_X, 0, photoTextureKey)
            .setOrigin(0, 0)
            .setDepth(PHOTO_BASE_DEPTH);
        const photoY = this.scale.height - PHOTO_BOTTOM_OFFSET - baseImage.height;

        baseImage.setY(photoY);
        this.previewObjects.push(baseImage);

        this.createPreviewMask(baseImage);
        this.createPreviewElements(baseImage, this.firstEditedPhotoState.elements || []);
    }

    createPreviewMask(baseImage) {
        this.previewMaskGraphics = this.make.graphics({ add: false });
        this.previewMaskGraphics.fillStyle(0xffffff, 1);
        this.previewMaskGraphics.fillRect(baseImage.x, baseImage.y, baseImage.width, baseImage.height);
        this.previewMask = this.previewMaskGraphics.createGeometryMask();
    }

    createPreviewElements(baseImage, elements) {
        [...elements]
            .sort((left, right) => (left.depth ?? 0) - (right.depth ?? 0))
            .forEach((elementState, index) => {
                const element = this.add.image(
                    baseImage.x + this.resolveElementX(elementState, baseImage.width),
                    baseImage.y + this.resolveElementY(elementState, baseImage.height),
                    elementState.textureKey
                )
                    .setOrigin(0.5)
                    .setScale(elementState.scaleX ?? 1, elementState.scaleY ?? 1)
                    .setAngle(elementState.angle ?? 0)
                    .setDepth(PHOTO_ELEMENT_DEPTH_BASE + index);

                if (this.previewMask) {
                    element.setMask(this.previewMask);
                }

                this.previewObjects.push(element);
            });
    }

    resolveElementX(elementState, photoWidth) {
        if (typeof elementState.x === 'number') {
            return elementState.x;
        }

        return (elementState.normalizedX ?? 0.5) * photoWidth;
    }

    resolveElementY(elementState, photoHeight) {
        if (typeof elementState.y === 'number') {
            return elementState.y;
        }

        return (elementState.normalizedY ?? 0.5) * photoHeight;
    }

    createActionContainers() {
        const containerTextures = ['jogosFase3Frases', 'jogosFase3Escreva'];
        const containerWidth = this.textures.get(containerTextures[0]).getSourceImage().width;
        const containerHeight = this.textures.get(containerTextures[0]).getSourceImage().height;
        const containerX = this.scale.width - CONTAINER_RIGHT_OFFSET - containerWidth;
        const writeContainerY = this.scale.height - CONTAINER_BOTTOM_OFFSET - containerHeight;
        const phrasesContainerY = writeContainerY - CONTAINER_VERTICAL_GAP - containerHeight;

        this.phrasesContainerImage = this.add.image(containerX, phrasesContainerY, 'jogosFase3Frases')
            .setOrigin(0, 0);
        this.writeContainerImage = this.add.image(
            containerX,
            writeContainerY,
            'jogosFase3Escreva'
        ).setOrigin(0, 0);
        this.choiceAreaBounds = {
            x: containerX,
            y: phrasesContainerY,
            width: containerWidth,
            height: (containerHeight * 2) + CONTAINER_VERTICAL_GAP
        };

        this.chooseButton = this.createContainerButton(this.phrasesContainerImage, 'ESCOLHER');
        this.writeButton = this.createContainerButton(this.writeContainerImage, 'ESCREVER');

        this.chooseButton.on('buttonClick', () => {
            this.showChoiceOptions();
        });
    }

    createContainerButton(containerImage, text) {
        const button = new Button(this, {
            text,
            height: 90,
            margin: 40,
            fontSize: '36px'
        });
        const buttonX = containerImage.x + ((containerImage.width - button.width) / 2);
        const buttonY = containerImage.y + containerImage.height - CONTAINER_BUTTON_BOTTOM_OFFSET - button.height;

        button.setPosition(buttonX, buttonY);

        return button;
    }

    showChoiceOptions() {
        this.hideInitialActionContainers();

        if (this.choiceUiCreated) {
            this.setChoiceUiVisible(true);
            return;
        }

        this.createChoiceUi();
        this.choiceUiCreated = true;
    }

    hideInitialActionContainers() {
        this.phrasesContainerImage.setVisible(false);
        this.phrasesContainerImage.disableInteractive();
        this.writeContainerImage.setVisible(false);
        this.writeContainerImage.disableInteractive();
        this.chooseButton.setVisible(false);
        this.writeButton.setVisible(false);
    }

    createChoiceUi() {
        const marca = ColorManager.getCurrentMarca(this);
        this.choiceHintButtonColors = ColorManager.getColors(marca, ColorManager.YELLOW);

        const optionDefinitions = CHOICE_OPTIONS.map((label) => this.createChoiceOptionButton(label));

        this.choiceConfirmButton = new Button(this, {
            text: 'CONFIRMAR',
            height: 90,
            margin: 40,
            fontSize: '36px'
        });
        this.choiceHintButton = new Button(this, {
            text: 'VER DICA',
            colors: this.choiceHintButtonColors,
            height: 90,
            margin: 40,
            fontSize: '36px'
        });

        this.choiceHintButton.on('buttonClick', () => {
            this.showModal('hint');
        });

        const displayOptionHeight = optionDefinitions[0].height;
        const totalHeight = (displayOptionHeight * optionDefinitions.length)
            + this.choiceConfirmButton.height
            + this.choiceHintButton.height
            + (CHOICE_ELEMENT_GAP * 4);
        let currentY = this.choiceAreaBounds.y + ((this.choiceAreaBounds.height - totalHeight) / 2);

        optionDefinitions.forEach((option) => {
            option.background.setPosition(this.choiceAreaBounds.x, currentY);
            option.text.setPosition(
                this.choiceAreaBounds.x + CHOICE_TEXT_LEFT_OFFSET,
                currentY + (option.height / 2)
            );
            currentY += option.height + CHOICE_ELEMENT_GAP;
        });

        this.choiceConfirmButton.setPosition(
            this.choiceAreaBounds.x + ((this.choiceAreaBounds.width - this.choiceConfirmButton.width) / 2),
            currentY
        );
        currentY += this.choiceConfirmButton.height + CHOICE_ELEMENT_GAP;
        this.choiceHintButton.setPosition(
            this.choiceAreaBounds.x + ((this.choiceAreaBounds.width - this.choiceHintButton.width) / 2),
            currentY
        );

        this.choiceOptionButtons = optionDefinitions;
        this.createHintModal();
    }

    createChoiceOptionButton(label) {
        const sourceImage = this.textures.get('alternativasAContainer').getSourceImage();
        const background = this.add.image(0, 0, 'alternativasAContainer')
            .setOrigin(0, 0)
            .setScale(CHOICE_CONTAINER_SCALE)
            .setInteractive({ cursor: 'pointer' });
        const text = this.add.text(0, 0, label, {
            fontFamily: 'Nunito-ExtraBold',
            fontSize: '30px',
            color: '#1F292D',
            wordWrap: {
                width: this.choiceAreaBounds.width - (CHOICE_TEXT_LEFT_OFFSET * 2)
            },
            lineSpacing: 6
        }).setOrigin(0, 0.5);

        background.on('pointerdown', () => {
            this.selectChoiceOption(label);
        });

        return {
            label,
            background,
            text,
            width: this.choiceAreaBounds.width,
            height: sourceImage.height * CHOICE_CONTAINER_SCALE
        };
    }

    selectChoiceOption(selectedLabel) {
        this.selectedChoiceOption = selectedLabel;

        this.choiceOptionButtons.forEach((option) => {
            option.background.setTexture(
                option.label === selectedLabel ? 'alternativasAContainerActive' : 'alternativasAContainer'
            );
        });

        SoundManager.play('click');
    }

    setChoiceUiVisible(isVisible) {
        this.choiceOptionButtons.forEach((option) => {
            option.background.setVisible(isVisible);
            option.text.setVisible(isVisible);
        });

        if (this.choiceConfirmButton) {
            this.choiceConfirmButton.setVisible(isVisible);
        }

        if (this.choiceHintButton) {
            this.choiceHintButton.setVisible(isVisible);
        }
    }

    createHintModal() {
        this.modals.hint = this.createModal({
            texture: 'feedbackDicaFase3',
            buttons: [
                {
                    text: 'VOLTAR',
                    onClick: () => {
                        this.hideModal('hint');
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
                fontSize: '36px'
            });

            button.on('buttonClick', buttonConfig.onClick);

            return button;
        });
        const totalButtonsWidth = modalButtons.reduce((sum, button) => sum + button.width, 0);
        const buttonY = (modalImage.y + (modalImage.height / 2)) - MODAL_BUTTON_BOTTOM_GAP - modalButtons[0].height;
        let currentX = modalImage.x - (totalButtonsWidth / 2);

        modalButtons.forEach((button) => {
            button.setPosition(currentX, buttonY);
            currentX += button.width;
        });

        overlay.add([backdrop, modalImage, ...modalButtons]);
        overlay.setDepth(MODAL_DEPTH);
        overlay.setVisible(false);

        return {
            overlay,
            buttons: modalButtons
        };
    }

    showModal(key) {
        this.hideAllModals();

        const modal = this.modals[key];
        if (!modal) {
            return;
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

export default Game3;
