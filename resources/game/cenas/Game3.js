import { BaseCena } from '../../js/library/base/BaseCena.js';
import { Button } from '../../js/library/components/Button.js';
import { ButtonIcon } from '../../js/library/components/ButtonIcon.js';
import { Keyboard } from '../../js/library/components/Keyboard.js';
import { ColorManager } from '../../js/library/managers/ColorManager.js';
import SoundManager from '../../js/library/managers/SoundManager.js';

const PHOTO_X = 80;
const PHOTO_BOTTOM_OFFSET = 101;
const CONTAINER_RIGHT_OFFSET = 40;
const CONTAINER_BOTTOM_OFFSET = 61;
const CONTAINER_VERTICAL_GAP = 40;
const CONTAINER_BUTTON_BOTTOM_OFFSET = 50;
const CHOICE_ELEMENT_GAP = 20;
const CHOICE_LABEL_LEFT_OFFSET = 40;
const CHOICE_LABEL_VERTICAL_PADDING = 20;
const CHOICE_CONTAINER_SCALE = 564 / 743;
const ACTION_BUTTON_GAP = 20;
const WRITE_UI_DEPTH = 15000;
const WRITE_UI_MARGIN = 40;
const WRITE_KEYBOARD_MAX_LENGTH = 30;
const REVIEW_PREVIEW_DEPTH = 12000;
const REVIEW_SUCCESS_DELAY = 2000;
const MODAL_BUTTON_BOTTOM_GAP = 160;
const MODAL_DEPTH = 20000;
const PHOTO_BASE_DEPTH = 10;
const PHOTO_ELEMENT_DEPTH_BASE = 11;
const CAPTION_TEXT_BOTTOM_OFFSET = 20;
const CAPTION_TEXT_HORIZONTAL_PADDING = 60;
const CAPTION_TEXT_BASE_FONT_SIZE = 52;
const CAPTION_TEXT_MIN_FONT_SIZE = 30;
const CAPTION_TEXT_STROKE_COLOR = '#1F292D';
const CAPTION_TEXT_FILL_COLOR = '#FFFFFF';
const FINAL_PREVIEW_BOUNDS = {
    x: 430,
    y: 300,
    width: 1000,
    height: 500
};
const FINAL_COUNTER_Y = 845;
const FINAL_BUTTON_Y = 885;
const FINAL_ENTRY_BUTTON_Y = FINAL_BUTTON_Y - 90;
const FINAL_BUTTON_GAP = 24;
const FINAL_BUTTON_HEIGHT = 82;
const FINAL_BUTTON_FONT_SIZE = '34px';
const FINAL_GALLERY_SIDE_OFFSET = 60;
const FINAL_GALLERY_DOWNLOAD_GAP = 60;
const FINAL_GALLERY_PLAY_AGAIN_GAP = 60;
const FINAL_GALLERY_MARGIN = 40;
const DOWNLOAD_FILE_PREFIX = 'narrativa-visual';
const DISABLED_BUTTON_COLORS = {
    main: 0xC7C7C7,
    shadow: 0x7E878C,
    shadow2: 0x1F292D,
    text: '#FFFFFF',
    stroke: '#1F292D'
};
const CHOICE_OPTIONS = [
    {
        key: 'segredo',
        textureKey: 'alternativasSegredoText',
        caption: 'Eles descobriram um segredo...'
    },
    {
        key: 'relatividade',
        textureKey: 'alternativasRelatividadeText',
        caption: 'A teoria da relatividade é fascinante.'
    },
    {
        key: 'era-uma-vez',
        textureKey: 'alternativasEraUmaVezText',
        caption: 'Era uma vez...'
    }
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

        this.backgroundImage = this.add.image(
            0,
            0,
            this.isFinalMode ? 'jogosTelaFinal' : 'jogosFase3'
        ).setOrigin(0, 0);

        if (this.isFinalMode) {
            this.createFinalScreen();
            super.create();
            return;
        }

        this.createEditedPhotoPreview();
        this.createActionContainers();
        this.createFeedbackModals();

        super.create();
    }

    resetSceneState() {
        this.editedPhotosState = this.game.registry.get('editedPhotosState') || {};
        this.editedPhotosOrder = this.resolveEditedPhotosOrder();
        this.captionedPhotosState = this.game.registry.get('captionedPhotosState') || {};
        this.writtenCaptionsState = this.game.registry.get('writtenCaptionsState') || {};
        this.currentPhotoIndex = this.resolveCurrentPhotoIndex();
        this.isFinalMode = this.currentPhotoIndex >= this.editedPhotosOrder.length;
        this.currentPhotoKey = this.isFinalMode ? null : this.editedPhotosOrder[this.currentPhotoIndex];
        this.currentEditedPhotoState = this.isFinalMode
            ? null
            : this.resolveEditedPhotoStateByKey(this.currentPhotoKey);
        this.currentWrittenCaption = this.isFinalMode
            ? ''
            : (this.writtenCaptionsState[this.currentPhotoKey]
                || this.captionedPhotosState[this.currentPhotoKey]?.caption
                || '');

        this.previewObjects = [];
        this.previewMaskGraphics = null;
        this.previewMask = null;
        this.phrasesContainerImage = null;
        this.writeContainerImage = null;
        this.chooseButton = null;
        this.writeButton = null;
        this.choiceAreaBounds = null;
        this.choiceOptionButtons = [];
        this.choiceHintButton = null;
        this.choiceConfirmButton = null;
        this.choiceHintButtonColors = null;
        this.selectedChoiceOption = null;
        this.choiceUiCreated = false;
        this.writeUiCreated = false;
        this.writeKeyboardOverlay = null;
        this.writeKeyboard = null;
        this.reviewPreviewImage = null;
        this.reviewTimer = null;
        this.isResolvingCaption = false;
        this.modals = {};

        this.finalPhotoKeys = [];
        this.finalPreviewIndex = 0;
        this.finalPreviewImage = null;
        this.finalCounterText = null;
        this.finalPlayAgainButton = null;
        this.finalOpenGalleryButton = null;
        this.finalBackButton = null;
        this.finalPreviousButton = null;
        this.finalDownloadButton = null;
        this.finalNextButton = null;
        this.finalButtonColors = null;
        this.finalGalleryRevealTimer = null;
        this.isFinalGalleryMode = false;
    }

    resolveEditedPhotosOrder() {
        const storedOrder = this.game.registry.get('editedPhotosOrder') || [];
        const filteredOrder = storedOrder.filter((key) => this.editedPhotosState[key]);

        if (filteredOrder.length > 0) {
            return filteredOrder;
        }

        const fallbackKeys = Object.keys(this.editedPhotosState);
        if (fallbackKeys.length > 0) {
            return fallbackKeys;
        }

        const selectedKey = this.game.registry.get('selectedMenuItem') || 'casa';
        return [selectedKey];
    }

    resolveCurrentPhotoIndex() {
        const storedIndex = this.game.registry.get('game3CaptionProgressIndex');
        const firstPendingIndex = this.editedPhotosOrder.findIndex(
            (key) => !this.captionedPhotosState[key]
        );

        if (Number.isInteger(storedIndex) && storedIndex >= 0) {
            const clampedIndex = Math.min(storedIndex, this.editedPhotosOrder.length);

            if (
                clampedIndex < this.editedPhotosOrder.length
                && this.captionedPhotosState[this.editedPhotosOrder[clampedIndex]]
                && firstPendingIndex >= 0
            ) {
                return firstPendingIndex;
            }

            if (
                clampedIndex < this.editedPhotosOrder.length
                && this.captionedPhotosState[this.editedPhotosOrder[clampedIndex]]
                && firstPendingIndex === -1
            ) {
                return this.editedPhotosOrder.length;
            }

            return clampedIndex;
        }

        return firstPendingIndex >= 0 ? firstPendingIndex : this.editedPhotosOrder.length;
    }

    resolveEditedPhotoStateByKey(photoKey) {
        if (photoKey && this.editedPhotosState[photoKey]) {
            return this.editedPhotosState[photoKey];
        }

        const fallbackKey = photoKey || this.game.registry.get('selectedMenuItem') || 'casa';

        return {
            key: fallbackKey,
            textureKey: this.getFallbackTextureKey(fallbackKey),
            completed: true,
            elements: []
        };
    }

    getFallbackTextureKey(subjectKey) {
        const subjectLabel = SUBJECT_LABELS[subjectKey] || SUBJECT_LABELS.casa;
        return `fotos${subjectLabel}Default`;
    }

    saveWrittenCaption(value) {
        if (!this.currentPhotoKey) {
            return;
        }

        const sanitizedValue = String(value ?? '');

        this.writtenCaptionsState = {
            ...(this.game.registry.get('writtenCaptionsState') || {}),
            [this.currentPhotoKey]: sanitizedValue
        };
        this.currentWrittenCaption = sanitizedValue;

        this.game.registry.set('writtenCaptionsState', this.writtenCaptionsState);
    }

    createEditedPhotoPreview() {
        const photoTextureKey = this.currentEditedPhotoState.textureKey
            || this.getFallbackTextureKey(this.currentEditedPhotoState.key);
        const baseImage = this.add.image(PHOTO_X, 0, photoTextureKey)
            .setOrigin(0, 0)
            .setDepth(PHOTO_BASE_DEPTH);
        const photoY = this.scale.height - PHOTO_BOTTOM_OFFSET - baseImage.height;

        baseImage.setY(photoY);
        this.previewObjects.push(baseImage);

        this.createPreviewMask(baseImage);
        this.createPreviewElements(baseImage, this.currentEditedPhotoState.elements || []);
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

        this.writeButton.on('buttonClick', () => {
            this.showWriteUi();
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
        if (this.isResolvingCaption) {
            return;
        }

        this.hideInitialActionContainers();
        this.setWriteUiVisible(false);

        if (this.choiceUiCreated) {
            this.setChoiceUiVisible(true);
            return;
        }

        this.createChoiceUi();
        this.choiceUiCreated = true;
    }

    hideInitialActionContainers() {
        if (this.phrasesContainerImage) {
            this.phrasesContainerImage.setVisible(false);
        }

        if (this.writeContainerImage) {
            this.writeContainerImage.setVisible(false);
        }

        if (this.chooseButton) {
            this.chooseButton.setVisible(false);
            this.chooseButton.setActive(false);
        }

        if (this.writeButton) {
            this.writeButton.setVisible(false);
            this.writeButton.setActive(false);
        }
    }

    showInitialActionContainers() {
        if (this.phrasesContainerImage) {
            this.phrasesContainerImage.setVisible(true);
        }

        if (this.writeContainerImage) {
            this.writeContainerImage.setVisible(true);
        }

        if (this.chooseButton) {
            this.chooseButton.setVisible(true);
            this.chooseButton.setActive(true);
        }

        if (this.writeButton) {
            this.writeButton.setVisible(true);
            this.writeButton.setActive(true);
        }
    }

    createChoiceUi() {
        const marca = ColorManager.getCurrentMarca(this);
        this.choiceHintButtonColors = ColorManager.getColors(marca, ColorManager.YELLOW);

        const optionDefinitions = CHOICE_OPTIONS.map(
            (option) => this.createChoiceOptionButton(option)
        );

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

        this.choiceConfirmButton = new Button(this, {
            text: 'CONFIRMAR',
            height: 90,
            margin: 40,
            fontSize: '36px'
        });
        this.choiceConfirmButton.setDisabled(true);

        this.choiceConfirmButton.on('buttonClick', () => {
            this.confirmSelectedChoiceOption();
        });

        const displayOptionHeight = optionDefinitions[0].height;
        const totalHeight = (displayOptionHeight * optionDefinitions.length)
            + this.choiceConfirmButton.height
            + this.choiceHintButton.height
            + (CHOICE_ELEMENT_GAP * 4);
        let currentY = this.choiceAreaBounds.y + ((this.choiceAreaBounds.height - totalHeight) / 2);

        optionDefinitions.forEach((option) => {
            option.background.setPosition(this.choiceAreaBounds.x, currentY);
            option.labelImage.setPosition(
                this.choiceAreaBounds.x + CHOICE_LABEL_LEFT_OFFSET,
                currentY + (option.height / 2)
            );
            currentY += option.height + CHOICE_ELEMENT_GAP;
        });

        this.choiceHintButton.setPosition(
            this.choiceAreaBounds.x + ((this.choiceAreaBounds.width - this.choiceHintButton.width) / 2),
            currentY
        );
        currentY += this.choiceHintButton.height + CHOICE_ELEMENT_GAP;

        this.choiceConfirmButton.setPosition(
            this.choiceAreaBounds.x + ((this.choiceAreaBounds.width - this.choiceConfirmButton.width) / 2),
            currentY
        );

        this.choiceOptionButtons = optionDefinitions;
        this.refreshChoiceSelectionState();
    }

    createChoiceOptionButton(optionDefinition) {
        const background = this.add.image(0, 0, 'alternativasAContainer')
            .setOrigin(0, 0)
            .setScale(CHOICE_CONTAINER_SCALE)
            .setInteractive({ cursor: 'pointer' });
        const labelImage = this.add.image(0, 0, optionDefinition.textureKey)
            .setOrigin(0, 0.5);
        const availableLabelWidth = background.displayWidth - (CHOICE_LABEL_LEFT_OFFSET * 2);
        const availableLabelHeight = background.displayHeight - (CHOICE_LABEL_VERTICAL_PADDING * 2);
        const labelScale = Math.min(
            1,
            availableLabelWidth / labelImage.width,
            availableLabelHeight / labelImage.height
        );

        labelImage.setScale(labelScale);

        background.on('pointerdown', (pointer, localX, localY, event) => {
            event?.stopPropagation?.();
            this.selectChoiceOption(optionDefinition.key);
        });

        return {
            ...optionDefinition,
            background,
            labelImage,
            width: background.displayWidth,
            height: background.displayHeight
        };
    }

    selectChoiceOption(selectedKey) {
        if (this.isResolvingCaption) {
            return;
        }

        if (!this.choiceOptionButtons.find((option) => option.key === selectedKey)) {
            return;
        }

        this.selectedChoiceOption = selectedKey;
        this.refreshChoiceSelectionState();
        SoundManager.play('click');
    }

    confirmSelectedChoiceOption() {
        if (this.isResolvingCaption || !this.selectedChoiceOption) {
            return;
        }

        const selectedOption = this.choiceOptionButtons.find(
            (option) => option.key === this.selectedChoiceOption
        );
        if (!selectedOption) {
            return;
        }

        this.isResolvingCaption = true;
        this.refreshChoiceSelectionState();
        this.time.delayedCall(120, () => {
            this.finalizeCaptionForCurrentPhoto(selectedOption.caption);
        });
    }

    refreshChoiceSelectionState() {
        this.choiceOptionButtons.forEach((option) => {
            option.background.setTexture(
                option.key === this.selectedChoiceOption
                    ? 'alternativasAContainerActive'
                    : 'alternativasAContainer'
            );
        });

        if (this.choiceConfirmButton) {
            this.choiceConfirmButton.setDisabled(
                this.isResolvingCaption || !this.selectedChoiceOption
            );
        }
    }

    setChoiceUiVisible(isVisible) {
        this.choiceOptionButtons.forEach((option) => {
            option.background.setVisible(isVisible);
            option.labelImage.setVisible(isVisible);
        });

        if (this.choiceHintButton) {
            this.choiceHintButton.setVisible(isVisible);
        }

        if (this.choiceConfirmButton) {
            this.choiceConfirmButton.setVisible(isVisible);
        }

        if (isVisible) {
            this.refreshChoiceSelectionState();
        }
    }

    showWriteUi() {
        if (this.isResolvingCaption) {
            return;
        }

        this.hideInitialActionContainers();
        this.setChoiceUiVisible(false);

        if (!this.writeUiCreated) {
            this.createWriteUi();
            this.writeUiCreated = true;
        }

        if (this.writeKeyboard) {
            this.writeKeyboard.setDisabled(false);
            this.writeKeyboard.setValue(this.currentWrittenCaption, { silent: true });
        }

        this.setWriteUiVisible(true);
    }

    createWriteUi() {
        const backdrop = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.3)
            .setOrigin(0, 0)
            .setInteractive({ cursor: 'pointer' });
        const keyboard = new Keyboard(this, {
            value: this.currentWrittenCaption,
            placeholder: 'Digite sua legenda',
            maxLength: WRITE_KEYBOARD_MAX_LENGTH,
            onChange: ({ value }) => {
                this.saveWrittenCaption(value);
            },
            onConfirm: ({ value }) => {
                this.handleWrittenCaptionConfirm(value);
            }
        });
        const keyboardSource = this.textures.get('tecladoBg').getSourceImage();
        const keyboardScale = Math.min(
            1,
            (this.scale.width - (WRITE_UI_MARGIN * 2)) / keyboardSource.width,
            (this.scale.height - (WRITE_UI_MARGIN * 2)) / keyboardSource.height
        );

        keyboard.setScale(keyboardScale);
        keyboard.setPosition(
            (this.scale.width - (keyboard.width * keyboardScale)) / 2,
            (this.scale.height - (keyboard.height * keyboardScale)) / 2
        );

        const keyboardBlocker = this.add.rectangle(
            keyboard.x,
            keyboard.y,
            keyboard.width * keyboardScale,
            keyboard.height * keyboardScale,
            0xffffff,
            0
        )
            .setOrigin(0, 0)
            .setInteractive();

        backdrop.on('pointerdown', () => {
            this.hideWriteUi(true);
        });
        keyboardBlocker.on('pointerdown', (pointer, localX, localY, event) => {
            if (event && typeof event.stopPropagation === 'function') {
                event.stopPropagation();
            }
        });

        this.writeKeyboardOverlay = this.add.container(0, 0, [backdrop, keyboardBlocker, keyboard]);
        this.writeKeyboardOverlay.setDepth(WRITE_UI_DEPTH);
        this.writeKeyboardOverlay.setVisible(false);
        this.writeKeyboardOverlay.setActive(false);
        this.writeKeyboard = keyboard;
    }

    handleWrittenCaptionConfirm(value) {
        if (this.isResolvingCaption) {
            return;
        }

        const normalizedValue = String(value ?? '').trim();
        if (!normalizedValue) {
            return;
        }

        this.saveWrittenCaption(normalizedValue);
        if (this.writeKeyboard) {
            this.writeKeyboard.setDisabled(true);
        }
        this.setWriteUiVisible(false);
        this.isResolvingCaption = true;
        this.finalizeCaptionForCurrentPhoto(normalizedValue);
    }

    setWriteUiVisible(isVisible) {
        if (!this.writeKeyboardOverlay) {
            return;
        }

        this.writeKeyboardOverlay.setVisible(isVisible);
        this.writeKeyboardOverlay.setActive(isVisible);
    }

    hideWriteUi(restoreInitialActionContainers = false) {
        this.setWriteUiVisible(false);

        if (restoreInitialActionContainers) {
            this.showInitialActionContainers();
        }
    }

    createFeedbackModals() {
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

        this.modals.success = this.createModal({
            texture: 'feedbackAcertoFase3',
            buttons: [
                {
                    text: 'CONTINUAR',
                    onClick: () => {
                        this.handleSuccessContinue();
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
        const buttonY = (modalImage.y + (modalImage.height / 2))
            - MODAL_BUTTON_BOTTOM_GAP
            - modalButtons[0].height;
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

    finalizeCaptionForCurrentPhoto(caption) {
        if (!this.currentPhotoKey) {
            return;
        }

        const sanitizedCaption = String(caption ?? '').trim();
        if (!sanitizedCaption) {
            this.isResolvingCaption = false;
            return;
        }

        this.saveWrittenCaption(sanitizedCaption);

        const assetState = this.buildCaptionedPhotoAssetState(this.currentPhotoKey, sanitizedCaption);
        this.persistCaptionedPhotoState(assetState);
        this.showResolvedPhotoPreview(assetState);
    }

    buildCaptionedPhotoAssetState(photoKey, caption) {
        const textureKey = this.getCaptionedPhotoTextureKey(photoKey);
        const fileName = this.getCaptionedPhotoFileName(photoKey);
        const canvas = this.createCaptionedPhotoCanvas(photoKey, caption);

        if (this.textures.exists(textureKey)) {
            this.textures.remove(textureKey);
        }

        this.textures.addCanvas(textureKey, canvas);

        return {
            key: photoKey,
            caption,
            textureKey,
            fileName,
            dataUrl: canvas.toDataURL('image/png'),
            width: canvas.width,
            height: canvas.height
        };
    }

    createCaptionedPhotoCanvas(photoKey, caption) {
        const photoState = this.resolveEditedPhotoStateByKey(photoKey);
        const sourceImage = this.textures.get(photoState.textureKey).getSourceImage();
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = sourceImage.width;
        canvas.height = sourceImage.height;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(sourceImage, 0, 0);

        this.drawCaptionedElements(context, canvas.width, canvas.height, photoState.elements || []);
        this.drawCaptionText(context, caption, canvas.width, canvas.height);

        return canvas;
    }

    drawCaptionedElements(context, photoWidth, photoHeight, elements) {
        [...elements]
            .sort((left, right) => (left.depth ?? 0) - (right.depth ?? 0))
            .forEach((elementState) => {
                const elementImage = this.textures.get(elementState.textureKey).getSourceImage();
                const x = this.resolveElementX(elementState, photoWidth);
                const y = this.resolveElementY(elementState, photoHeight);

                context.save();
                context.translate(x, y);
                context.rotate(Phaser.Math.DegToRad(elementState.angle ?? 0));
                context.scale(elementState.scaleX ?? 1, elementState.scaleY ?? 1);
                context.drawImage(
                    elementImage,
                    -(elementImage.width / 2),
                    -(elementImage.height / 2)
                );
                context.restore();
            });
    }

    drawCaptionText(context, caption, photoWidth, photoHeight) {
        const maxTextWidth = photoWidth - (CAPTION_TEXT_HORIZONTAL_PADDING * 2);
        let fontSize = Math.min(
            CAPTION_TEXT_BASE_FONT_SIZE,
            Math.round(photoWidth * 0.055)
        );
        let lines = [];

        while (fontSize >= CAPTION_TEXT_MIN_FONT_SIZE) {
            context.font = `900 ${fontSize}px Nunito-Black`;
            lines = this.wrapCaptionLines(context, caption, maxTextWidth);

            if (lines.length <= 3) {
                break;
            }

            fontSize -= 4;
        }

        const lineHeight = Math.round(fontSize * 1.15);
        const bottomY = photoHeight - CAPTION_TEXT_BOTTOM_OFFSET;

        context.textAlign = 'center';
        context.textBaseline = 'bottom';
        context.fillStyle = CAPTION_TEXT_FILL_COLOR;
        context.strokeStyle = CAPTION_TEXT_STROKE_COLOR;
        context.lineWidth = Math.max(6, Math.round(fontSize * 0.16));
        context.lineJoin = 'round';
        context.paintOrder = 'stroke fill';

        lines.forEach((line, index) => {
            const y = bottomY - ((lines.length - 1 - index) * lineHeight);
            context.strokeText(line, photoWidth / 2, y);
            context.fillText(line, photoWidth / 2, y);
        });
    }

    wrapCaptionLines(context, text, maxWidth) {
        const words = String(text ?? '').trim().split(/\s+/).filter(Boolean);

        if (words.length === 0) {
            return [''];
        }

        const lines = [];
        let currentLine = words[0];

        words.slice(1).forEach((word) => {
            const nextLine = `${currentLine} ${word}`;

            if (context.measureText(nextLine).width <= maxWidth) {
                currentLine = nextLine;
                return;
            }

            lines.push(currentLine);
            currentLine = word;
        });

        lines.push(currentLine);

        return lines;
    }

    persistCaptionedPhotoState(assetState) {
        this.captionedPhotosState = {
            ...(this.game.registry.get('captionedPhotosState') || {}),
            [assetState.key]: assetState
        };

        this.game.registry.set('captionedPhotosState', this.captionedPhotosState);
        this.game.registry.set('game3CaptionProgressIndex', this.currentPhotoIndex);
    }

    showResolvedPhotoPreview(assetState) {
        this.hideInitialActionContainers();
        this.setChoiceUiVisible(false);
        this.setWriteUiVisible(false);
        this.setPreviewObjectsVisible(false);
        this.backgroundImage.setTexture('jogosFase3Pt2');

        if (this.reviewPreviewImage) {
            this.reviewPreviewImage.destroy();
        }

        this.reviewPreviewImage = this.createBottomAlignedPreviewImage(
            assetState.textureKey,
            REVIEW_PREVIEW_DEPTH
        );

        if (this.reviewTimer) {
            this.reviewTimer.remove(false);
        }

        this.reviewTimer = this.time.delayedCall(REVIEW_SUCCESS_DELAY, () => {
            this.showModal('success');
        });
    }

    createBottomAlignedPreviewImage(textureKey, depth) {
        const image = this.add.image(this.scale.width / 2, 0, textureKey)
            .setOrigin(0.5, 0)
            .setDepth(depth);

        image.y = this.scale.height - PHOTO_BOTTOM_OFFSET - image.height;

        return image;
    }

    setPreviewObjectsVisible(isVisible) {
        this.previewObjects.forEach((object) => {
            object.setVisible(isVisible);
        });
    }

    handleSuccessContinue() {
        this.hideModal('success');

        const nextIndex = this.currentPhotoIndex + 1;
        this.game.registry.set('game3CaptionProgressIndex', nextIndex);
        this.scene.restart();
    }

    createFinalScreen() {
        this.game.registry.set('game3CaptionProgressIndex', this.editedPhotosOrder.length);
        this.finalPhotoKeys = this.editedPhotosOrder.filter(
            (photoKey) => Boolean(this.captionedPhotosState[photoKey])
        );

        if (this.finalPhotoKeys.length === 0) {
            return;
        }

        const marca = ColorManager.getCurrentMarca(this);
        this.finalButtonColors = ColorManager.getColors(marca, ColorManager.YELLOW);

        this.createFinalEntryButtons();
        this.playFeedbackSound('acerto');
    }

    createFinalEntryButtons() {
        this.finalPlayAgainButton = new Button(this, {
            text: 'JOGAR NOVAMENTE',
            height: FINAL_BUTTON_HEIGHT,
            margin: 34,
            fontSize: FINAL_BUTTON_FONT_SIZE
        });
        this.finalOpenGalleryButton = new Button(this, {
            text: 'BAIXAR',
            colors: this.finalButtonColors,
            height: FINAL_BUTTON_HEIGHT,
            margin: 34,
            fontSize: FINAL_BUTTON_FONT_SIZE
        });

        const totalButtonsWidth = this.finalPlayAgainButton.width
            + this.finalOpenGalleryButton.width
            + FINAL_BUTTON_GAP;
        let currentX = (this.scale.width - totalButtonsWidth) / 2;

        this.finalPlayAgainButton.setPosition(currentX, FINAL_ENTRY_BUTTON_Y);
        this.finalPlayAgainButton.setDepth(20);
        currentX += this.finalPlayAgainButton.width + FINAL_BUTTON_GAP;
        this.finalOpenGalleryButton.setPosition(currentX, FINAL_ENTRY_BUTTON_Y);
        this.finalOpenGalleryButton.setDepth(20);

        this.finalPlayAgainButton.on('buttonClick', () => {
            this.restartCaptionFlow();
        });
        this.finalOpenGalleryButton.on('buttonClick', () => {
            this.enterFinalDownloadGallery();
        });
    }

    restartCaptionFlow() {
        this.game.registry.set('captionedPhotosState', {});
        this.game.registry.set('writtenCaptionsState', {});
        this.game.registry.set('game3CaptionProgressIndex', 0);
        this.scene.restart();
    }

    enterFinalDownloadGallery() {
        if (this.isFinalGalleryMode) {
            return;
        }

        this.isFinalGalleryMode = true;
        this.backgroundImage.setTexture('jogosFase3Pt2');
        this.finalPreviewIndex = 0;

        if (this.finalPlayAgainButton) {
            this.finalPlayAgainButton.destroy();
            this.finalPlayAgainButton = null;
        }

        if (this.finalOpenGalleryButton) {
            this.finalOpenGalleryButton.destroy();
            this.finalOpenGalleryButton = null;
        }

        this.refreshFinalPreview();
    }

    goToGameStart() {
        this.game.registry.set('editedPhotosState', {});
        this.game.registry.set('editedPhotosOrder', []);
        this.game.registry.set('captionedPhotosState', {});
        this.game.registry.set('writtenCaptionsState', {});
        this.game.registry.set('menuCompletionState', {});
        this.game.registry.set('lastEditedPhotoKey', null);
        this.game.registry.set('lastEditedPhotoState', null);
        this.game.registry.set('selectedMenuItem', null);
        this.game.registry.set('game3CaptionProgressIndex', 0);

        if (this.controladorDeCenas) {
            this.controladorDeCenas.mudarCena(0);
            return;
        }

        this.scene.start('Capa');
    }

    changeFinalPreview(direction) {
        const nextIndex = this.finalPreviewIndex + direction;

        if (nextIndex < 0 || nextIndex >= this.finalPhotoKeys.length) {
            return;
        }

        this.finalPreviewIndex = nextIndex;
        this.refreshFinalPreview();
    }

    refreshFinalPreview({ revealButtonsAfterDelay = false } = {}) {
        const currentPhotoKey = this.finalPhotoKeys[this.finalPreviewIndex];
        const assetState = this.ensureCaptionedPhotoState(currentPhotoKey);

        if (!assetState) {
            return;
        }

        if (this.finalPreviewImage) {
            this.finalPreviewImage.destroy();
        }

        this.finalPreviewImage = this.createBottomAlignedPreviewImage(
            assetState.textureKey,
            REVIEW_PREVIEW_DEPTH
        );

        if (revealButtonsAfterDelay) {
            this.setFinalGalleryButtonsVisible(false);

            if (this.finalGalleryRevealTimer) {
                this.finalGalleryRevealTimer.remove(false);
            }

            this.finalGalleryRevealTimer = this.time.delayedCall(REVIEW_SUCCESS_DELAY, () => {
                this.positionAndShowFinalGalleryButtons();
            });

            return;
        }

        this.positionAndShowFinalGalleryButtons();
    }

    createFinalGalleryButtons() {
        if (
            this.finalPreviousButton
            && this.finalDownloadButton
            && this.finalNextButton
            && this.finalBackButton
        ) {
            return;
        }

        this.finalPreviousButton = new ButtonIcon(this, {
            iconKey: ButtonIcon.ICON_LEFT
        });
        this.finalDownloadButton = new Button(this, {
            text: 'BAIXAR',
            colors: this.finalButtonColors,
            height: FINAL_BUTTON_HEIGHT,
            margin: 34,
            fontSize: FINAL_BUTTON_FONT_SIZE
        });
        this.finalBackButton = new Button(this, {
            text: 'INÍCIO',
            height: FINAL_BUTTON_HEIGHT,
            margin: 34,
            fontSize: FINAL_BUTTON_FONT_SIZE
        });
        this.finalNextButton = new ButtonIcon(this, {
            iconKey: ButtonIcon.ICON_RIGHT
        });

        this.finalPreviousButton.setDepth(20);
        this.finalDownloadButton.setDepth(20);
        this.finalBackButton.setDepth(20);
        this.finalNextButton.setDepth(20);

        this.finalPreviousButton.on('buttonClick', () => {
            this.changeFinalPreview(-1);
        });
        this.finalDownloadButton.on('buttonClick', () => {
            this.downloadCurrentCaptionedPhoto();
        });
        this.finalBackButton.on('buttonClick', () => {
            this.goToGameStart();
        });
        this.finalNextButton.on('buttonClick', () => {
            this.changeFinalPreview(1);
        });
    }

    positionAndShowFinalGalleryButtons() {
        if (!this.finalPreviewImage) {
            return;
        }

        this.createFinalGalleryButtons();

        const arrowRowWidth = this.finalPreviousButton.width
            + this.finalNextButton.width
            + FINAL_BUTTON_GAP;
        const arrowRowHeight = Math.max(this.finalPreviousButton.height, this.finalNextButton.height);
        const columnWidth = Math.max(
            arrowRowWidth,
            this.finalDownloadButton.width,
            this.finalBackButton.width
        );
        const photoRight = this.finalPreviewImage.x + (this.finalPreviewImage.displayWidth / 2);
        const preferredColumnX = photoRight + FINAL_GALLERY_SIDE_OFFSET;
        const maxColumnX = this.scale.width - columnWidth - FINAL_GALLERY_MARGIN;
        const columnX = Math.min(preferredColumnX, maxColumnX);
        const groupHeight = arrowRowHeight
            + FINAL_GALLERY_DOWNLOAD_GAP
            + this.finalDownloadButton.height
            + FINAL_GALLERY_PLAY_AGAIN_GAP
            + this.finalBackButton.height;
        const preferredGroupY = this.finalPreviewImage.y
            + ((this.finalPreviewImage.displayHeight - groupHeight) / 2);
        const groupY = Phaser.Math.Clamp(
            preferredGroupY,
            FINAL_GALLERY_MARGIN,
            this.scale.height - groupHeight - FINAL_GALLERY_MARGIN
        );
        const arrowRowX = columnX + ((columnWidth - arrowRowWidth) / 2);
        const downloadX = columnX + ((columnWidth - this.finalDownloadButton.width) / 2);
        const backX = columnX + ((columnWidth - this.finalBackButton.width) / 2);
        const downloadY = groupY + arrowRowHeight + FINAL_GALLERY_DOWNLOAD_GAP;

        this.finalPreviousButton.setPosition(arrowRowX, groupY);
        this.finalNextButton.setPosition(
            arrowRowX + this.finalPreviousButton.width + FINAL_BUTTON_GAP,
            groupY
        );
        this.finalDownloadButton.setPosition(
            downloadX,
            downloadY
        );
        this.finalBackButton.setPosition(
            backX,
            downloadY + this.finalDownloadButton.height + FINAL_GALLERY_PLAY_AGAIN_GAP
        );

        this.finalPreviousButton.setVisible(true);
        this.finalDownloadButton.setVisible(true);
        this.finalBackButton.setVisible(true);
        this.finalNextButton.setVisible(true);

        this.finalPreviousButton.setDisabled(this.finalPreviewIndex === 0);
        this.finalNextButton.setDisabled(
            this.finalPreviewIndex >= this.finalPhotoKeys.length - 1
        );
    }

    setFinalGalleryButtonsVisible(isVisible) {
        if (this.finalPreviousButton) {
            this.finalPreviousButton.setVisible(isVisible);
        }

        if (this.finalDownloadButton) {
            this.finalDownloadButton.setVisible(isVisible);
        }

        if (this.finalBackButton) {
            this.finalBackButton.setVisible(isVisible);
        }

        if (this.finalNextButton) {
            this.finalNextButton.setVisible(isVisible);
        }
    }

    ensureCaptionedPhotoState(photoKey) {
        let assetState = this.captionedPhotosState[photoKey];

        if (!assetState) {
            return null;
        }

        const textureKey = assetState.textureKey || this.getCaptionedPhotoTextureKey(photoKey);

        if (!this.textures.exists(textureKey)) {
            assetState = this.buildCaptionedPhotoAssetState(photoKey, assetState.caption);
            this.persistCaptionedPhotoState(assetState);
        }

        return assetState;
    }

    downloadCurrentCaptionedPhoto() {
        const currentPhotoKey = this.finalPhotoKeys[this.finalPreviewIndex];
        const assetState = this.ensureCaptionedPhotoState(currentPhotoKey);

        if (!assetState || !assetState.dataUrl) {
            return;
        }

        const anchor = document.createElement('a');
        anchor.href = assetState.dataUrl;
        anchor.download = assetState.fileName || this.getCaptionedPhotoFileName(currentPhotoKey);
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }

    getCaptionedPhotoTextureKey(photoKey) {
        const subjectLabel = SUBJECT_LABELS[photoKey] || photoKey || 'Foto';
        return `storyAsset${subjectLabel}`;
    }

    getCaptionedPhotoFileName(photoKey) {
        return `${DOWNLOAD_FILE_PREFIX}-${photoKey}.png`;
    }

    ensureSceneAudioReady() {
        if (!this.sound) {
            return;
        }

        try {
            if (
                this.sound.context
                && this.sound.context.state === 'suspended'
                && typeof this.sound.context.resume === 'function'
            ) {
                const resumeResult = this.sound.context.resume();

                if (resumeResult && typeof resumeResult.catch === 'function') {
                    resumeResult.catch(() => {});
                }
            }

            if (typeof this.sound.unlock === 'function') {
                this.sound.unlock();
            }
        } catch (error) {
            console.error('Erro ao preparar áudio da cena:', error);
        }
    }

    playFeedbackSound(key, volume = 1.15) {
        if (SoundManager.isMuted) {
            return;
        }

        this.ensureSceneAudioReady();

        let played = false;

        try {
            const result = this.sound?.play(key, { volume });
            played = result !== false;
        } catch (error) {
            played = false;
        }

        if (!played) {
            played = Boolean(SoundManager.play(key, volume));
        }

        if (!played && typeof window !== 'undefined') {
            window.setTimeout(() => {
                try {
                    this.ensureSceneAudioReady();
                    this.sound?.play(key, { volume });
                } catch (retryError) {
                    SoundManager.play(key, volume);
                }
            }, 80);
        }
    }

    showModal(key) {
        this.hideAllModals();

        const modal = this.modals[key];
        if (!modal) {
            return;
        }

        if (key === 'success') {
            this.playFeedbackSound('acerto');
        } else if (key === 'error') {
            this.playFeedbackSound('erro');
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
