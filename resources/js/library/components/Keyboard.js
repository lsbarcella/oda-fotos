import SoundManager from '../managers/SoundManager.js';

const ACTION_KEYS = {
    BACKSPACE: 'backspace',
    CONFIRM: 'confirm',
    SPACE: 'space'
};

const DEFAULT_LAYOUT = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', { action: ACTION_KEYS.BACKSPACE }],
    ['\'', '~', '^', '`', { action: ACTION_KEYS.SPACE }, { action: ACTION_KEYS.CONFIRM }]
];

const ACCENT_MAP = {
    '\'': {
        A: 'Á',
        E: 'É',
        I: 'Í',
        O: 'Ó',
        U: 'Ú',
        a: 'á',
        e: 'é',
        i: 'í',
        o: 'ó',
        u: 'ú'
    },
    '~': {
        A: 'Ã',
        N: 'Ñ',
        O: 'Õ',
        a: 'ã',
        n: 'ñ',
        o: 'õ'
    },
    '^': {
        A: 'Â',
        E: 'Ê',
        I: 'Î',
        O: 'Ô',
        U: 'Û',
        a: 'â',
        e: 'ê',
        i: 'î',
        o: 'ô',
        u: 'û'
    },
    '`': {
        A: 'À',
        E: 'È',
        I: 'Ì',
        O: 'Ò',
        U: 'Ù',
        a: 'à',
        e: 'è',
        i: 'ì',
        o: 'ò',
        u: 'ù'
    }
};

const DEFAULT_CONFIG = {
    value: '',
    placeholder: 'Digite aqui',
    maxLength: 32,
    fieldTop: 60,
    fieldGap: 42,
    rowGap: 16,
    textPaddingLeft: 54,
    textPaddingRight: 54,
    textStyle: {
        fontFamily: 'Nunito-Black',
        fontSize: '72px',
        color: '#1F292D'
    },
    placeholderStyle: {
        color: '#8D96A0'
    },
    accentStyle: {
        fontFamily: 'Nunito-Black',
        fontSize: '64px',
        color: '#1F292D',
        alpha: 0.45
    },
    keyLabelStyle: {
        fontFamily: 'Nunito-Black',
        fontSize: '62px',
        color: '#232D33'
    },
    keyLabelOffsetY: 4,
    pressedOffsetY: 7,
    minTextFontSize: 40,
    layout: DEFAULT_LAYOUT,
    disabled: false,
    onChange: null,
    onConfirm: null,
    onKeyPress: null,
    onBackspace: null,
    onMaxLength: null
};

const BUTTON_TEXTURES = {
    character: {
        defaultTexture: 'tecladoTecla',
        activeTexture: 'tecladoTeclaActive'
    },
    [ACTION_KEYS.BACKSPACE]: {
        defaultTexture: 'tecladoBtApagar',
        activeTexture: 'tecladoBtApagarActive'
    },
    [ACTION_KEYS.SPACE]: {
        defaultTexture: 'tecladoBtEspaco',
        activeTexture: 'tecladoBtEspacoActive'
    },
    [ACTION_KEYS.CONFIRM]: {
        defaultTexture: 'tecladoBtConfirmar',
        activeTexture: 'tecladoBtConfirmarActive'
    }
};

function getFontSizeValue(fontSize, fallback) {
    if (typeof fontSize === 'number') {
        return fontSize;
    }

    const parsed = parseInt(fontSize, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

class KeyboardButton extends Phaser.GameObjects.Container {
    constructor(scene, config) {
        super(scene, config.x, config.y);

        this.scene = scene;
        this.config = config;
        this.disabled = false;
        this.releaseTimer = null;

        this.defaultTexture = config.defaultTexture;
        this.activeTexture = config.activeTexture || config.defaultTexture;
        this.normalSpriteY = 0;
        this.pressedSpriteY = config.pressedOffsetY ?? 7;
        this.normalLabelY = config.labelOffsetY ?? 0;
        this.pressedLabelY = this.normalLabelY + (config.pressedOffsetY ?? 7);

        this.sprite = this.scene.add.image(0, this.normalSpriteY, this.defaultTexture).setOrigin(0.5);
        this.add(this.sprite);

        this.label = null;

        if (config.label) {
            this.label = this.scene.add.text(0, this.normalLabelY, config.label, {
                ...config.labelStyle
            }).setOrigin(0.5);
            this.add(this.label);
        }

        this.enableInteraction();
    }

    enableInteraction() {
        this.sprite.setInteractive({ useHandCursor: true });
        this.sprite.off('pointerdown', this.handlePointerDown, this);
        this.sprite.on('pointerdown', this.handlePointerDown, this);
    }

    handlePointerDown() {
        if (this.disabled) {
            return;
        }

        SoundManager.play('click');
        this.setPressed(true);
        this.emit('buttonClick', this.config);

        if (this.releaseTimer) {
            this.releaseTimer.remove(false);
        }

        this.releaseTimer = this.scene.time.delayedCall(120, () => {
            this.setPressed(false);
            this.releaseTimer = null;
        });
    }

    setPressed(isPressed) {
        this.sprite.setTexture(isPressed ? this.activeTexture : this.defaultTexture);
        this.sprite.y = isPressed ? this.pressedSpriteY : this.normalSpriteY;

        if (this.label) {
            this.label.y = isPressed ? this.pressedLabelY : this.normalLabelY;
        }

        return this;
    }

    setDisabled(disabled) {
        this.disabled = !!disabled;
        this.alpha = this.disabled ? 0.65 : 1;
        this.setPressed(false);

        if (this.disabled) {
            this.sprite.disableInteractive();
        } else if (!this.sprite.input) {
            this.enableInteraction();
        }

        return this;
    }

    destroy(fromScene) {
        if (this.releaseTimer) {
            this.releaseTimer.remove(false);
            this.releaseTimer = null;
        }

        super.destroy(fromScene);
    }
}

export class Keyboard extends Phaser.GameObjects.Container {
    constructor(scene, config = {}) {
        super(scene, config.x ?? 0, config.y ?? 0);

        this.scene = scene;
        this.config = {
            ...DEFAULT_CONFIG,
            ...config,
            textStyle: {
                ...DEFAULT_CONFIG.textStyle,
                ...(config.textStyle || {})
            },
            placeholderStyle: {
                ...DEFAULT_CONFIG.placeholderStyle,
                ...(config.placeholderStyle || {})
            },
            accentStyle: {
                ...DEFAULT_CONFIG.accentStyle,
                ...(config.accentStyle || {})
            },
            keyLabelStyle: {
                ...DEFAULT_CONFIG.keyLabelStyle,
                ...(config.keyLabelStyle || {})
            }
        };

        this.callbacks = {
            onChange: this.config.onChange,
            onConfirm: this.config.onConfirm,
            onKeyPress: this.config.onKeyPress,
            onBackspace: this.config.onBackspace,
            onMaxLength: this.config.onMaxLength
        };

        this.layout = this.config.layout || DEFAULT_LAYOUT;
        this.value = '';
        this.pendingAccent = null;
        this.keyButtons = [];

        this.create();
        this.setValue(this.config.value, { silent: true });
        this.setDisabled(this.config.disabled);

        this.scene.add.existing(this);
    }

    create() {
        this.background = this.scene.add.image(0, 0, 'tecladoBg').setOrigin(0, 0);
        this.textArea = this.scene.add.image(0, this.config.fieldTop, 'tecladoCampoDeEscrita').setOrigin(0, 0);

        this.contentLeft = (this.background.width - this.textArea.width) / 2;
        this.contentWidth = this.textArea.width;
        this.textArea.x = this.contentLeft;

        this.valueText = this.scene.add.text(
            this.textArea.x + this.config.textPaddingLeft,
            this.textArea.y + (this.textArea.height / 2),
            '',
            {
                ...this.config.textStyle
            }
        ).setOrigin(0, 0.5);

        this.pendingAccentText = this.scene.add.text(
            this.textArea.x + this.textArea.width - this.config.textPaddingRight,
            this.textArea.y + (this.textArea.height / 2),
            '',
            {
                ...this.config.accentStyle
            }
        ).setOrigin(1, 0.5);
        this.pendingAccentText.setAlpha(this.config.accentStyle.alpha);
        this.pendingAccentText.setVisible(false);

        this.add([this.background, this.textArea, this.valueText, this.pendingAccentText]);

        this.createButtons();
        this.setSize(this.background.width, this.background.height);
        this.refreshDisplay();
    }

    createButtons() {
        const firstRowY = this.textArea.y
            + this.textArea.height
            + this.config.fieldGap
            + (this.getButtonBaseHeight(ACTION_KEYS.BACKSPACE) / 2);
        const rowHeight = this.getButtonBaseHeight(ACTION_KEYS.BACKSPACE);

        this.layout.forEach((row, rowIndex) => {
            const buttonConfigs = row.map((keyDefinition) => this.createButtonConfig(keyDefinition));
            const buttonsWidth = buttonConfigs.reduce((sum, buttonConfig) => sum + buttonConfig.baseWidth, 0);
            const rowGap = buttonConfigs.length > 1
                ? Math.max(0, (this.contentWidth - buttonsWidth) / (buttonConfigs.length - 1))
                : 0;
            const rowY = firstRowY + (rowIndex * (rowHeight + this.config.rowGap));

            let currentCenterX = this.contentLeft + (buttonConfigs[0].baseWidth / 2);

            buttonConfigs.forEach((buttonConfig, buttonIndex) => {
                const button = new KeyboardButton(this.scene, {
                    ...buttonConfig,
                    x: currentCenterX,
                    y: rowY,
                    labelStyle: this.config.keyLabelStyle,
                    labelOffsetY: this.config.keyLabelOffsetY,
                    pressedOffsetY: this.config.pressedOffsetY,
                    hitWidth: buttonConfig.baseWidth,
                    hitHeight: buttonConfig.baseHeight
                });

                button.on('buttonClick', () => {
                    this.handleButtonPress(buttonConfig);
                });

                this.keyButtons.push(button);
                this.add(button);

                const nextButton = buttonConfigs[buttonIndex + 1];
                if (nextButton) {
                    currentCenterX += (buttonConfig.baseWidth / 2) + rowGap + (nextButton.baseWidth / 2);
                }
            });
        });
    }

    createButtonConfig(keyDefinition) {
        if (typeof keyDefinition === 'string') {
            return this.buildCharacterButtonConfig(keyDefinition);
        }

        if (keyDefinition && keyDefinition.action) {
            return this.buildActionButtonConfig(keyDefinition.action);
        }

        return this.buildCharacterButtonConfig(String(keyDefinition ?? ''));
    }

    buildCharacterButtonConfig(character) {
        const textures = BUTTON_TEXTURES.character;
        return {
            type: 'character',
            value: character,
            label: character,
            defaultTexture: textures.defaultTexture,
            activeTexture: textures.activeTexture,
            baseWidth: this.getTextureSize(textures.defaultTexture).width,
            baseHeight: this.getTextureSize(textures.defaultTexture).height
        };
    }

    buildActionButtonConfig(action) {
        const textures = BUTTON_TEXTURES[action];
        return {
            type: 'action',
            action,
            defaultTexture: textures.defaultTexture,
            activeTexture: textures.activeTexture,
            baseWidth: this.getTextureSize(textures.defaultTexture).width,
            baseHeight: this.getTextureSize(textures.defaultTexture).height
        };
    }

    handleButtonPress(buttonConfig) {
        if (this.disabled) {
            return;
        }

        if (buttonConfig.type === 'action') {
            this.handleAction(buttonConfig.action);
        } else {
            this.handleCharacter(buttonConfig.value);
        }

        const payload = this.createPayload({
            key: buttonConfig.action || buttonConfig.value,
            keyType: buttonConfig.type
        });

        this.emit('keyPress', payload);
        this.invokeCallback('onKeyPress', payload);
    }

    handleAction(action) {
        switch (action) {
            case ACTION_KEYS.BACKSPACE:
                this.handleBackspace();
                break;

            case ACTION_KEYS.SPACE:
                this.handleSpace();
                break;

            case ACTION_KEYS.CONFIRM:
                this.handleConfirm();
                break;

            default:
                break;
        }
    }

    handleCharacter(character) {
        if (this.pendingAccent) {
            this.handleCharacterWithPendingAccent(character);
            return;
        }

        if (this.isAccentKey(character)) {
            this.setPendingAccent(character);
            return;
        }

        this.appendText(character, 'input');
    }

    handleCharacterWithPendingAccent(character) {
        const pendingAccent = this.pendingAccent;

        if (this.isAccentKey(character)) {
            if (!this.appendText(pendingAccent, 'input')) {
                return;
            }

            this.setPendingAccent(character);
            return;
        }

        const composedCharacter = this.composeCharacter(pendingAccent, character);

        this.pendingAccent = null;

        if (composedCharacter) {
            this.refreshDisplay();
            this.emit('pendingAccentChange', this.createPayload({ source: 'compose' }));
            this.appendText(composedCharacter, 'input');
            return;
        }

        if (!this.canAppendText(`${pendingAccent}${character}`)) {
            this.pendingAccent = pendingAccent;
            this.refreshDisplay();
            this.notifyMaxLength();
            return;
        }

        this.appendText(pendingAccent, 'input');
        this.appendText(character, 'input');
    }

    handleBackspace() {
        if (this.pendingAccent) {
            this.pendingAccent = null;
            this.refreshDisplay();
            const payload = this.createPayload({ source: 'backspace' });
            this.emit('pendingAccentChange', payload);
            this.emit('backspace', payload);
            this.invokeCallback('onBackspace', payload);
            return;
        }

        if (!this.value.length) {
            return;
        }

        this.value = this.value.slice(0, -1);
        this.refreshDisplay();

        const payload = this.createPayload({ source: 'backspace' });
        this.emit('change', payload);
        this.invokeCallback('onChange', payload);
        this.emit('backspace', payload);
        this.invokeCallback('onBackspace', payload);
    }

    handleSpace() {
        if (this.pendingAccent && !this.commitPendingAccent('space')) {
            return;
        }

        this.appendText(' ', 'space');
    }

    handleConfirm() {
        if (this.pendingAccent && !this.commitPendingAccent('confirm')) {
            return;
        }

        const payload = this.createPayload({ source: 'confirm' });
        this.emit('confirm', payload);
        this.invokeCallback('onConfirm', payload);
    }

    commitPendingAccent(source) {
        if (!this.pendingAccent) {
            return true;
        }

        const accent = this.pendingAccent;
        this.pendingAccent = null;
        this.refreshDisplay();
        this.emit('pendingAccentChange', this.createPayload({ source }));

        return this.appendText(accent, source);
    }

    appendText(text, source) {
        if (!text) {
            return false;
        }

        if (!this.canAppendText(text)) {
            this.notifyMaxLength();
            return false;
        }

        this.value += text;
        this.refreshDisplay();

        const payload = this.createPayload({ source, appendedText: text });
        this.emit('change', payload);
        this.invokeCallback('onChange', payload);
        return true;
    }

    canAppendText(text) {
        if (!Number.isFinite(this.config.maxLength)) {
            return true;
        }

        return (this.value.length + text.length) <= this.config.maxLength;
    }

    notifyMaxLength() {
        this.scene.tweens.add({
            targets: this.valueText,
            alpha: 0.35,
            duration: 50,
            yoyo: true,
            repeat: 1
        });

        const payload = this.createPayload({ source: 'maxLength' });
        this.emit('maxLength', payload);
        this.invokeCallback('onMaxLength', payload);
    }

    composeCharacter(accent, character) {
        return ACCENT_MAP[accent]?.[character] || null;
    }

    isAccentKey(character) {
        return Object.prototype.hasOwnProperty.call(ACCENT_MAP, character);
    }

    setPendingAccent(accent) {
        this.pendingAccent = accent;
        this.refreshDisplay();
        this.emit('pendingAccentChange', this.createPayload({ source: 'accent' }));
    }

    refreshDisplay() {
        const hasValue = this.value.length > 0;
        const displayText = hasValue ? this.value : this.config.placeholder;
        const textColor = hasValue
            ? this.config.textStyle.color
            : this.config.placeholderStyle.color;
        const baseFontSize = hasValue
            ? getFontSizeValue(this.config.textStyle.fontSize, 72)
            : getFontSizeValue(this.config.textStyle.fontSize, 72);

        this.valueText.setColor(textColor);
        this.valueText.setText(displayText);
        this.valueText.setAlpha(1);

        this.pendingAccentText.setText(this.pendingAccent || '');
        this.pendingAccentText.setVisible(!!this.pendingAccent);

        const pendingAccentWidth = this.pendingAccent
            ? this.pendingAccentText.width + 20
            : 0;
        const maxTextWidth = this.textArea.width
            - this.config.textPaddingLeft
            - this.config.textPaddingRight
            - pendingAccentWidth;

        this.fitTextToWidth(displayText, maxTextWidth, baseFontSize);
    }

    fitTextToWidth(rawText, maxWidth, baseFontSize) {
        const minFontSize = this.config.minTextFontSize;
        let fontSize = baseFontSize;
        let visibleText = rawText;

        this.valueText.setFontSize(fontSize);

        while (fontSize > minFontSize && this.valueText.width > maxWidth) {
            fontSize -= 2;
            this.valueText.setFontSize(fontSize);
        }

        if (this.valueText.width <= maxWidth) {
            return;
        }

        visibleText = rawText;
        this.valueText.setFontSize(minFontSize);

        while (visibleText.length > 1 && this.valueText.width > maxWidth) {
            visibleText = visibleText.slice(1);
            this.valueText.setText(`...${visibleText}`);
        }
    }

    setValue(value, options = {}) {
        const stringValue = String(value ?? '');

        if (Number.isFinite(this.config.maxLength)) {
            this.value = stringValue.slice(0, this.config.maxLength);
        } else {
            this.value = stringValue;
        }

        this.pendingAccent = null;
        this.refreshDisplay();

        if (!options.silent) {
            const payload = this.createPayload({ source: 'setValue' });
            this.emit('change', payload);
            this.invokeCallback('onChange', payload);
        }

        return this;
    }

    getValue() {
        return this.value;
    }

    clear(options = {}) {
        this.value = '';
        this.pendingAccent = null;
        this.refreshDisplay();

        if (!options.silent) {
            const payload = this.createPayload({ source: 'clear' });
            this.emit('change', payload);
            this.invokeCallback('onChange', payload);
        }

        return this;
    }

    setPlaceholder(placeholder) {
        this.config.placeholder = placeholder;
        this.refreshDisplay();
        return this;
    }

    setDisabled(disabled) {
        this.disabled = !!disabled;
        this.alpha = this.disabled ? 0.85 : 1;
        this.keyButtons.forEach((button) => button.setDisabled(this.disabled));
        return this;
    }

    createPayload(extra = {}) {
        return {
            value: this.value,
            pendingAccent: this.pendingAccent,
            component: this,
            ...extra
        };
    }

    invokeCallback(callbackName, payload) {
        const callback = this.callbacks[callbackName];
        if (typeof callback === 'function') {
            callback(payload);
        }
    }

    getTextureSize(textureKey) {
        const sourceImage = this.scene.textures.get(textureKey).getSourceImage();
        return {
            width: sourceImage.width,
            height: sourceImage.height
        };
    }

    getButtonBaseHeight(actionOrType) {
        const textureConfig = BUTTON_TEXTURES[actionOrType] || BUTTON_TEXTURES.character;
        return this.getTextureSize(textureConfig.defaultTexture).height;
    }

    preDestroy() {
        this.keyButtons = [];
    }
}

export default Keyboard;
