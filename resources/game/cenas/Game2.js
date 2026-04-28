import { BaseCena } from '../../js/library/base/BaseCena.js';
import { Button } from '../../js/library/components/Button.js';
import { ButtonIcon } from '../../js/library/components/ButtonIcon.js';
import { EditableDragDropComponent } from '../../js/library/components/EditableDragComponent.js';
import { ColorManager } from '../../js/library/managers/ColorManager.js';
import SoundManager from '../../js/library/managers/SoundManager.js';

const EDIT_IMAGE_X = 172;
const EDIT_IMAGE_BOTTOM_OFFSET = 220;
const ACTION_BUTTON_START_X = 416;
const ACTION_BUTTON_BOTTOM_OFFSET = 40;
const ACTION_BUTTON_GAP = 20;
const MODAL_BUTTON_BOTTOM_GAP = 160;
const MODAL_DEPTH = 20000;
const STAGE_PANEL_X = 1400;
const STAGE_PANEL_Y = 0;
const STAGE_PANEL_WIDTH = 520;
const STAGE_TITLE_Y = 78;
const STAGE_OPTIONS_CENTER_Y = 540;
const STAGE_OPTIONS_CENTER_OFFSET_Y = 30;
const STAGE_NAV_BOTTOM_OFFSET = 40;
const STAGE_NAV_GAP = 30;
const STAGE_OPTION_VERTICAL_GAP = 30;
const STAGE_ELEMENT_HORIZONTAL_GAP = 100;
const STAGE_ELEMENT_VERTICAL_GAP = 50;
const FILTER_LABELS = {
    default: 'Default',
    sepia: 'Sepia',
    pb: 'Pb',
    vibrante: 'Vibrante',
    negativo: 'Negativo'
};

const LIGHT_LABELS = {
    none: '',
    luz: 'Luz',
    sombra: 'Sombra'
};

const SUBJECT_LABELS = {
    casa: 'Casa',
    criancas: 'Criancas',
    gato: 'Gato'
};

const STAGE_DEFINITIONS = [
    {
        key: 'filters',
        titleTexture: 'buttonsTitleFiltros'
    },
    {
        key: 'lights',
        titleTexture: 'buttonsTitleEfeitos'
    },
    {
        key: 'elements',
        titleTexture: 'buttonsTitleElementos'
    }
];

const FILTER_OPTIONS = [
    {
        key: 'sepia',
        defaultTexture: 'buttonsSepia',
        activeTexture: 'buttonsSepiaActive'
    },
    {
        key: 'pb',
        defaultTexture: 'buttonsPb',
        activeTexture: 'buttonsPbActive'
    },
    {
        key: 'vibrante',
        defaultTexture: 'buttonsVibrante',
        activeTexture: 'buttonsVibranteActive'
    },
    {
        key: 'negativo',
        defaultTexture: 'buttonsNegativo',
        activeTexture: 'buttonsNegativoActive'
    }
];

const LIGHT_OPTIONS = [
    {
        key: 'nenhum',
        value: 'none',
        defaultTexture: 'buttonsNenhum',
        activeTexture: 'buttonsNenhumActive'
    },
    {
        key: 'luz',
        value: 'luz',
        defaultTexture: 'buttonsLuz',
        activeTexture: 'buttonsLuzActive'
    },
    {
        key: 'sombra',
        value: 'sombra',
        defaultTexture: 'buttonsSombra',
        activeTexture: 'buttonsSombraActive'
    }
];

const ELEMENT_OPTIONS = [
    { key: 'atomo', texture: 'edicaoAtomo' },
    { key: 'balao', texture: 'edicaoBalao' },
    { key: 'coracao', texture: 'edicaoCoracao' },
    { key: 'estrela', texture: 'edicaoEstrela' },
    { key: 'nuvem', texture: 'edicaoNuvem' }
];

const ELEMENT_EDIT_BUTTONS = [
    { id: 'zoomIn', texture: 'edicaoButtonZoomIn' },
    { id: 'zoomOut', texture: 'edicaoButtonZoomOut' },
    { id: 'rotate', texture: 'edicaoButtonRotate' },
    { id: 'backward', texture: 'edicaoButtonBackward' },
    { id: 'forward', texture: 'edicaoButtonForward' },
    { id: 'delete', texture: 'edicaoButtonDelete' }
];

const ELEMENT_GROUP_KEY = 'elements';

export class Game2 extends BaseCena {
    constructor(controladorDeCenas) {
        super('Game2');
        this.controladorDeCenas = controladorDeCenas;
        this.loaded = false;
    }

    create() {
        this.resetSceneState();

        this.add.image(0, 0, 'jogosFase2').setOrigin(0, 0);

        this.createEditableImage();
        this.createStagePanel();
        this.createStageViews();
        this.createStageNavigation();
        this.createActionButtons();
        this.showStage(this.currentStageIndex);
        this.updateEditableImage();

        super.create();
    }

    resetSceneState() {
        if (this.elementDragComponent && this.elementDragComponent.destroy) {
            this.elementDragComponent.destroy();
        }

        this.selectedSubjectKey = this.resolveSelectedSubject();
        this.selectedFilterKey = 'default';
        this.selectedLightKey = 'none';
        this.currentStageIndex = 0;
        this.editableImage = null;
        this.stagePanel = null;
        this.stageTitle = null;
        this.stageViews = [];
        this.filterButtons = [];
        this.lightButtons = [];
        this.elementDragComponent = null;
        this.leftStageButton = null;
        this.rightStageButton = null;
        this.finishButton = null;
        this.hintButton = null;
        this.hintButtonColors = null;
        this.modals = {};
    }

    resolveSelectedSubject() {
        const selectedMenuItem = this.game.registry.get('selectedMenuItem');
        return SUBJECT_LABELS[selectedMenuItem] ? selectedMenuItem : 'casa';
    }

    createEditableImage() {
        this.editableImage = this.add.image(EDIT_IMAGE_X, 0, this.getEditableImageTextureKey())
            .setOrigin(0, 0);
        this.editableImage.y = this.scale.height - EDIT_IMAGE_BOTTOM_OFFSET - this.editableImage.height;
    }

    getEditableImageTextureKey() {
        const subjectLabel = SUBJECT_LABELS[this.selectedSubjectKey];
        const filterLabel = FILTER_LABELS[this.selectedFilterKey];
        const lightLabel = LIGHT_LABELS[this.selectedLightKey];

        return `fotos${subjectLabel}${filterLabel}${lightLabel}`;
    }

    updateEditableImage() {
        this.editableImage.setTexture(this.getEditableImageTextureKey());
        this.editableImage.y = this.scale.height - EDIT_IMAGE_BOTTOM_OFFSET - this.editableImage.height;

        if (this.elementDragComponent) {
            this.elementDragComponent.refreshMask();
        }
    }

    createStagePanel() {
        this.stagePanel = this.add.image(STAGE_PANEL_X, STAGE_PANEL_Y, 'buttonsContainer')
            .setOrigin(0, 0);
        this.stageTitle = this.add.image(
            STAGE_PANEL_X + (STAGE_PANEL_WIDTH / 2),
            STAGE_TITLE_Y,
            STAGE_DEFINITIONS[this.currentStageIndex].titleTexture
        ).setOrigin(0.5);
    }

    createStageViews() {
        this.stageViews = [
            this.createFilterStageView(),
            this.createLightStageView(),
            this.createElementsStageView()
        ];
    }

    createFilterStageView() {
        const view = this.add.container(0, 0);
        const options = FILTER_OPTIONS.map((option) => this.createStageOptionButton(option, this.handleFilterSelection.bind(this)));

        this.layoutVerticalButtons(options);
        view.add(options.map((option) => option.image));
        this.filterButtons = options;
        this.updateFilterButtons();

        return view;
    }

    createLightStageView() {
        const view = this.add.container(0, 0);
        const options = LIGHT_OPTIONS.map((option) => this.createStageOptionButton(option, this.handleLightSelection.bind(this)));

        this.layoutVerticalButtons(options);
        view.add(options.map((option) => option.image));
        this.lightButtons = options;
        this.updateLightButtons();

        return view;
    }

    createElementsStageView() {
        const view = this.add.container(0, 0);
        const positions = this.getElementMenuPositions();

        this.elementDragComponent = new EditableDragDropComponent(this, {
            groups: [ELEMENT_GROUP_KEY],
            itemsByGroup: {
                [ELEMENT_GROUP_KEY]: ELEMENT_OPTIONS.map((option, index) => ({
                    key: option.texture,
                    x: positions[index].x,
                    y: positions[index].y,
                    elementKey: option.key
                }))
            },
            initialGroup: ELEMENT_GROUP_KEY,
            visibleBounds: () => this.getEditableImageBounds(),
            dropZone: {
                contains: ({ gameObject }) => this.isInsideEditableImage(gameObject)
            },
            scaleMenu: 1,
            scaleDropped: 1,
            dropRadius: 0,
            depths: {
                plate: 5,
                itemBase: 10,
                ui: 500,
                editMenu: 15000
            },
            editButtons: ELEMENT_EDIT_BUTTONS,
            stageActive: false
        });

        return view;
    }

    createStageOptionButton(option, onSelect) {
        const image = this.add.image(0, 0, option.defaultTexture)
            .setOrigin(0.5)
            .setInteractive({ cursor: 'pointer' });

        image.on('pointerdown', () => {
            onSelect(option);
        });

        return {
            ...option,
            image
        };
    }

    layoutVerticalButtons(options) {
        const totalHeight = options.reduce((sum, option) => sum + option.image.height, 0)
            + (STAGE_OPTION_VERTICAL_GAP * Math.max(0, options.length - 1));
        const centerX = STAGE_PANEL_X + (STAGE_PANEL_WIDTH / 2);
        let currentY = (STAGE_OPTIONS_CENTER_Y + STAGE_OPTIONS_CENTER_OFFSET_Y) - (totalHeight / 2);

        options.forEach((option) => {
            currentY += option.image.height / 2;
            option.image.setPosition(centerX, currentY);
            currentY += (option.image.height / 2) + STAGE_OPTION_VERTICAL_GAP;
        });
    }

    getElementMenuPositions() {
        const rowTextures = [
            ELEMENT_OPTIONS.slice(0, 2),
            ELEMENT_OPTIONS.slice(2, 4),
            ELEMENT_OPTIONS.slice(4, 5)
        ];
        const rowHeights = rowTextures.map((row) => Math.max(...row.map((option) => this.getTextureSize(option.texture).height)));
        const totalHeight = rowHeights.reduce((sum, height) => sum + height, 0)
            + (STAGE_ELEMENT_VERTICAL_GAP * Math.max(0, rowTextures.length - 1));
        let currentTop = (STAGE_OPTIONS_CENTER_Y + STAGE_OPTIONS_CENTER_OFFSET_Y) - (totalHeight / 2);
        const positions = [];

        rowTextures.forEach((row, rowIndex) => {
            const rowWidth = row.reduce((sum, option) => sum + this.getTextureSize(option.texture).width, 0)
                + (STAGE_ELEMENT_HORIZONTAL_GAP * Math.max(0, row.length - 1));
            let currentX = (STAGE_PANEL_X + (STAGE_PANEL_WIDTH / 2)) - (rowWidth / 2);
            const rowHeight = rowHeights[rowIndex];
            const rowCenterY = currentTop + (rowHeight / 2);

            row.forEach((option) => {
                const { width } = this.getTextureSize(option.texture);

                currentX += width / 2;
                positions.push({
                    key: option.key,
                    x: currentX,
                    y: rowCenterY
                });
                currentX += (width / 2) + STAGE_ELEMENT_HORIZONTAL_GAP;
            });

            currentTop += rowHeight + STAGE_ELEMENT_VERTICAL_GAP;
        });

        return ELEMENT_OPTIONS.map((option) => positions.find((position) => position.key === option.key));
    }

    getTextureSize(textureKey) {
        const source = this.textures.get(textureKey).getSourceImage();

        return {
            width: source.width,
            height: source.height
        };
    }

    getEditableImageBounds() {
        return this.editableImage.getBounds();
    }

    isInsideEditableImage(gameObject) {
        const bounds = this.getEditableImageBounds();
        const objectBounds = gameObject.getBounds();
        const editableRect = new Phaser.Geom.Rectangle(
            bounds.left,
            bounds.top,
            bounds.right - bounds.left,
            bounds.bottom - bounds.top
        );
        const objectRect = new Phaser.Geom.Rectangle(
            objectBounds.x,
            objectBounds.y,
            objectBounds.width,
            objectBounds.height
        );

        return Phaser.Geom.Rectangle.Overlaps(editableRect, objectRect);
    }

    handleFilterSelection(option) {
        this.selectedFilterKey = option.key;
        this.updateFilterButtons();
        this.updateEditableImage();
        SoundManager.play('click');
    }

    handleLightSelection(option) {
        this.selectedLightKey = option.value;
        this.updateLightButtons();
        this.updateEditableImage();
        SoundManager.play('click');
    }

    updateFilterButtons() {
        this.filterButtons.forEach((option) => {
            option.image.setTexture(
                option.key === this.selectedFilterKey ? option.activeTexture : option.defaultTexture
            );
        });
    }

    updateLightButtons() {
        this.lightButtons.forEach((option) => {
            option.image.setTexture(
                option.value === this.selectedLightKey ? option.activeTexture : option.defaultTexture
            );
        });
    }

    createActionButtons() {
        const marca = ColorManager.getCurrentMarca(this);
        this.hintButtonColors = ColorManager.getColors(marca, ColorManager.YELLOW);

        this.finishButton = new Button(this, {
            text: 'FINALIZAR',
            height: 90,
            margin: 40,
            fontSize: '36px'
        });

        this.hintButton = new Button(this, {
            text: 'VER DICA',
            colors: this.hintButtonColors,
            height: 90,
            margin: 40,
            fontSize: '36px'
        });

        const buttonY = this.scale.height - ACTION_BUTTON_BOTTOM_OFFSET - this.finishButton.height;
        const hintButtonX = ACTION_BUTTON_START_X + this.finishButton.width + ACTION_BUTTON_GAP;

        this.finishButton.setPosition(ACTION_BUTTON_START_X, buttonY);
        this.hintButton.setPosition(hintButtonX, buttonY);

        this.finishButton.on('buttonClick', () => {
            this.handleFinishButtonClick();
        });
        this.hintButton.on('buttonClick', () => {
            this.showModal('hint');
        });

        this.createFeedbackModals();
    }

    createFeedbackModals() {
        this.modals.hint = this.createModal({
            texture: 'feedbackDicaFase2',
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
            texture: 'feedbackAcertoFase2',
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

    handleFinishButtonClick() {
        this.saveEditedPhotoState();
        this.showModal('success');
    }

    saveEditedPhotoState() {
        const editedPhotosState = {
            ...(this.game.registry.get('editedPhotosState') || {})
        };
        const editedPhotosOrder = [...(this.game.registry.get('editedPhotosOrder') || [])];
        const currentPhotoState = this.buildEditedPhotoState();

        editedPhotosState[this.selectedSubjectKey] = currentPhotoState;

        if (!editedPhotosOrder.includes(this.selectedSubjectKey)) {
            editedPhotosOrder.push(this.selectedSubjectKey);
        }

        this.game.registry.set('editedPhotosState', editedPhotosState);
        this.game.registry.set('editedPhotosOrder', editedPhotosOrder);
        this.game.registry.set(
            'menuCompletionState',
            Object.fromEntries(
                Object.entries(editedPhotosState).map(([key, state]) => [key, Boolean(state && state.completed)])
            )
        );
        this.game.registry.set('lastEditedPhotoKey', this.selectedSubjectKey);
        this.game.registry.set('lastEditedPhotoState', currentPhotoState);
    }

    buildEditedPhotoState() {
        const photoBounds = this.getEditableImageBounds();

        return {
            key: this.selectedSubjectKey,
            completed: true,
            textureKey: this.getEditableImageTextureKey(),
            filterKey: this.selectedFilterKey,
            lightKey: this.selectedLightKey,
            photoWidth: photoBounds.width,
            photoHeight: photoBounds.height,
            elements: this.getEditedElementState(photoBounds)
        };
    }

    getEditedElementState(photoBounds) {
        if (!this.elementDragComponent) {
            return [];
        }

        const servedItems = this.elementDragComponent.servedItems[ELEMENT_GROUP_KEY] || [];

        return [...servedItems]
            .filter((sprite) => sprite && sprite.active)
            .sort((left, right) => (left.elementDepth ?? 0) - (right.elementDepth ?? 0))
            .map((sprite) => ({
                elementKey: sprite.menuData.elementKey,
                textureKey: sprite.assetKey,
                x: sprite.x - photoBounds.left,
                y: sprite.y - photoBounds.top,
                normalizedX: (sprite.x - photoBounds.left) / photoBounds.width,
                normalizedY: (sprite.y - photoBounds.top) / photoBounds.height,
                scaleX: sprite.scaleX,
                scaleY: sprite.scaleY,
                angle: sprite.angle,
                depth: sprite.elementDepth ?? 0
            }));
    }

    handleSuccessContinue() {
        this.hideModal('success');
        this.goToNextSceneAfterEdit();
    }

    goToNextSceneAfterEdit() {
        const editedPhotosOrder = this.game.registry.get('editedPhotosOrder') || [];
        const totalPhotos = Object.keys(SUBJECT_LABELS).length;

        if (editedPhotosOrder.length >= totalPhotos) {
            this.goToSceneByKey('Game3');
            return;
        }

        this.goToSceneByKey('Menu');
    }

    goToSceneByKey(sceneKey) {
        if (this.controladorDeCenas) {
            const sceneIndex = this.controladorDeCenas.cenas.findIndex((sceneData) => sceneData.key === sceneKey);

            if (sceneIndex >= 0) {
                this.controladorDeCenas.mudarCena(sceneIndex);
                return;
            }
        }

        this.scene.start(sceneKey);
    }

    showModal(key) {
        this.hideAllModals();

        if (this.elementDragComponent) {
            this.elementDragComponent.setActiveServedItem(null);
        }

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

    createStageNavigation() {
        const totalWidth = (112 * 2) + STAGE_NAV_GAP;
        const startX = (STAGE_PANEL_X + (STAGE_PANEL_WIDTH / 2)) - (totalWidth / 2);
        const buttonY = this.scale.height - STAGE_NAV_BOTTOM_OFFSET - 122;

        this.leftStageButton = new ButtonIcon(this, {
            iconKey: ButtonIcon.ICON_LEFT
        });
        this.leftStageButton.setPosition(startX, buttonY);
        this.leftStageButton.on('buttonClick', () => {
            this.navigateStage(-1);
        });

        this.rightStageButton = new ButtonIcon(this, {
            iconKey: ButtonIcon.ICON_RIGHT
        });
        this.rightStageButton.setPosition(startX + 112 + STAGE_NAV_GAP, buttonY);
        this.rightStageButton.on('buttonClick', () => {
            this.navigateStage(1);
        });
    }

    navigateStage(direction) {
        this.currentStageIndex = (this.currentStageIndex + direction + STAGE_DEFINITIONS.length) % STAGE_DEFINITIONS.length;
        this.showStage(this.currentStageIndex);
    }

    showStage(index) {
        this.stageViews.forEach((view, viewIndex) => {
            view.setVisible(viewIndex === index);
        });

        if (this.elementDragComponent) {
            this.elementDragComponent.setStageActive(index === 2);
        }

        this.stageTitle.setTexture(STAGE_DEFINITIONS[index].titleTexture);
    }
}

export default Game2;
