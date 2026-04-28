const DEFAULT_EDIT_BUTTONS = [
  { id: "zoomIn", texture: "Button-Zoom-In" },
  { id: "zoomOut", texture: "Button-Zoom-Out" },
  { id: "rotate", texture: "Button-Rotate" },
  { id: "backward", texture: "Button-Backward" },
  { id: "forward", texture: "Button-Forward" },
  { id: "delete", texture: "Button-Delete" },
];

export class EditableDragDropComponent {
  constructor(scene, config = {}) {
    if (!scene || !scene.add || !scene.input) {
      throw new Error(
        "EditableDragDropComponent requires a valid Phaser scene."
      );
    }

    this.scene = scene;
    this.groups = [...(config.groups || Object.keys(config.itemsByGroup || {}))];

    if (!this.groups.length) {
      throw new Error(
        "EditableDragDropComponent requires at least one group."
      );
    }

    this.itemsByGroup = config.itemsByGroup || {};
    this.currentGroup = this.groups.includes(config.initialGroup)
      ? config.initialGroup
      : this.groups[0];

    this.dropZone = config.dropZone || {};
    this.visibleBounds = config.visibleBounds || this.dropZone.visibleBounds || null;
    this.dropRadius = config.dropRadius ?? this.dropZone.radius ?? 400;
    this.scaleMenu = config.scaleMenu ?? 0.25;
    this.scaleDropped = config.scaleDropped ?? 1;
    this.minScale = config.minScale ?? 0.2;
    this.scaleStep = config.scaleStep ?? 0.1;
    this.rotationStep = config.rotationStep ?? 15;
    this.editMenuOffset = config.editMenuOffset ?? -220;
    this.editMenuSpacing = config.editMenuSpacing ?? 70;
    this.stageActive = config.stageActive ?? true;

    this.depths = {
      plate: 100,
      itemBase: 101,
      ui: 500,
      editMenu: 9999,
      ...(config.depths || {}),
    };

    this.editButtons = config.editButtons || DEFAULT_EDIT_BUTTONS;
    this.spriteFactory =
      config.spriteFactory ||
      ((params) => this.scene.add.image(params.x, params.y, params.key));

    this.callbacks = {
      onServe: config.onServe,
      onRemove: config.onRemove,
      onSelectionChange: config.onSelectionChange,
      onActiveItemChange: config.onActiveItemChange,
      onEditAction: config.onEditAction,
    };

    this.managerId = `editable-drag-drop-${Date.now()}-${Math.round(
      Math.random() * 1e6
    )}`;

    this.menuSprites = [];
    this.servedItems = this.createStateMap(() => []);
    this.selectedItems = this.createStateMap(() => []);
    this.activeServedItem = null;
    this.destroyed = false;
    this.maskGraphics = null;
    this.geometryMask = null;
    this.editMenuGroup = null;
    this.editMenuHalfWidth = 0;

    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleSceneShutdown = this.handleSceneShutdown.bind(this);

    this.createVisibilityMask();
    this.createEditMenu();
    this.registerInputEvents();
    this.loadGroup(this.currentGroup);

    this.scene.events.on("shutdown", this.handleSceneShutdown);
    this.scene.events.on("destroy", this.handleSceneShutdown);
  }

  createStateMap(initialValueOrFactory) {
    const isFactory = typeof initialValueOrFactory === "function";
    return Object.fromEntries(
      this.groups.map((group) => [
        group,
        isFactory ? initialValueOrFactory(group) : initialValueOrFactory,
      ])
    );
  }

  createVisibilityMask() {
    if (!this.visibleBounds) {
      return;
    }

    this.maskGraphics = this.scene.make.graphics({ add: false });
    this.geometryMask = this.maskGraphics.createGeometryMask();
    this.refreshMask();
  }

  refreshMask() {
    if (!this.maskGraphics) {
      return;
    }

    const bounds = this.resolveVisibleBounds();
    this.maskGraphics.clear();

    if (!bounds) {
      return;
    }

    this.maskGraphics.fillStyle(0xffffff, 1);
    this.maskGraphics.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);

    this.getAllServedSprites().forEach((sprite) => {
      if (!sprite.active || sprite === this.activeServedItem) {
        return;
      }

      this.applyInactivePresentation(sprite);
    });
  }

  resolveVisibleBounds() {
    const rawBounds =
      typeof this.visibleBounds === "function"
        ? this.visibleBounds({
            scene: this.scene,
            component: this,
          })
        : this.visibleBounds;

    if (!rawBounds) {
      return null;
    }

    if (typeof rawBounds.getBounds === "function") {
      return this.normalizeBounds(rawBounds.getBounds());
    }

    return this.normalizeBounds(rawBounds);
  }

  normalizeBounds(bounds) {
    if (!bounds) {
      return null;
    }

    if (
      typeof bounds.x === "number" &&
      typeof bounds.y === "number" &&
      typeof bounds.width === "number" &&
      typeof bounds.height === "number"
    ) {
      return {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        left: bounds.x,
        right: bounds.x + bounds.width,
        top: bounds.y,
        bottom: bounds.y + bounds.height,
      };
    }

    if (
      typeof bounds.left === "number" &&
      typeof bounds.right === "number" &&
      typeof bounds.top === "number" &&
      typeof bounds.bottom === "number"
    ) {
      return {
        x: bounds.left,
        y: bounds.top,
        width: bounds.right - bounds.left,
        height: bounds.bottom - bounds.top,
        left: bounds.left,
        right: bounds.right,
        top: bounds.top,
        bottom: bounds.bottom,
      };
    }

    return null;
  }

  createEditMenu() {
    this.editMenuGroup = this.scene.add.container(0, 0);
    this.editMenuGroup.setDepth(this.depths.editMenu);
    this.editMenuGroup.setVisible(false);

    let maxButtonWidth = 0;

    this.editButtons.forEach((button, index) => {
      const sprite = this.scene.add
        .image(index * this.editMenuSpacing, 0, button.texture)
        .setInteractive({ useHandCursor: true });

      sprite.on("pointerdown", (pointer, localX, localY, event) => {
        if (event && typeof event.stopPropagation === "function") {
          event.stopPropagation();
        }
        this.handleEditAction(button.id);
      });

      maxButtonWidth = Math.max(maxButtonWidth, sprite.width);
      this.editMenuGroup.add(sprite);
    });

    const totalWidth = (this.editButtons.length - 1) * this.editMenuSpacing;
    this.editMenuGroup.list.forEach((button) => {
      button.x -= totalWidth / 2;
    });

    this.editMenuHalfWidth = totalWidth / 2 + maxButtonWidth / 2;
  }

  registerInputEvents() {
    this.scene.input.on("dragstart", this.handleDragStart);
    this.scene.input.on("drag", this.handleDrag);
    this.scene.input.on("dragend", this.handleDragEnd);
  }

  unregisterInputEvents() {
    this.scene.input.off("dragstart", this.handleDragStart);
    this.scene.input.off("drag", this.handleDrag);
    this.scene.input.off("dragend", this.handleDragEnd);
  }

  handleSceneShutdown() {
    this.destroy();
  }

  loadGroup(group = this.currentGroup) {
    this.assertGroup(group);
    this.currentGroup = group;

    this.destroyMenuSprites();

    const items = this.itemsByGroup[group] || [];
    items.forEach((data) => {
      this.createMenuSprite(data, group);
    });

    this.setStageActive(this.stageActive);
  }

  setGroup(group) {
    this.loadGroup(group);
  }

  refreshCurrentGroup() {
    this.loadGroup(this.currentGroup);
  }

  reset() {
    this.setActiveServedItem(null);
    this.destroyMenuSprites();
    this.destroyServedSprites();
    this.servedItems = this.createStateMap(() => []);
    this.selectedItems = this.createStateMap(() => []);
    this.loadGroup(this.currentGroup);
    this.emitSelectionChange(this.currentGroup, "reset");
  }

  destroy() {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.unregisterInputEvents();

    if (this.scene && this.scene.events) {
      this.scene.events.off("shutdown", this.handleSceneShutdown);
      this.scene.events.off("destroy", this.handleSceneShutdown);
    }

    this.hideEditMenu();
    this.destroyMenuSprites();
    this.destroyServedSprites();

    if (this.editMenuGroup && this.editMenuGroup.destroy) {
      this.editMenuGroup.destroy(true);
    }

    if (this.maskGraphics && this.maskGraphics.destroy) {
      this.maskGraphics.destroy();
    }

    this.activeServedItem = null;
  }

  destroyMenuSprites() {
    this.menuSprites.forEach((sprite) => {
      if (sprite && sprite.pendingDraggedSprite && sprite.pendingDraggedSprite.destroy) {
        sprite.pendingDraggedSprite.destroy();
      }

      if (sprite && sprite.destroy) {
        sprite.destroy();
      }
    });

    this.menuSprites = [];
  }

  destroyServedSprites() {
    this.getAllServedSprites().forEach((sprite) => {
      if (sprite && sprite.destroy) {
        sprite.destroy();
      }
    });
  }

  createMenuSprite(data, group) {
    const sprite = this.createSprite({
      x: data.x,
      y: data.y,
      key: data.key,
      group,
      type: "menu",
      data,
    });

    sprite.setScale(this.scaleMenu).setDepth(this.depths.ui);
    sprite.startX = data.x;
    sprite.startY = data.y;
    sprite.isMenuTemplate = true;
    sprite.isFromMenu = true;
    sprite.originGroup = group;
    sprite.menuData = { ...data, group };
    sprite.pendingDraggedSprite = null;

    this.enableSpriteInteraction(sprite);
    this.menuSprites.push(sprite);

    return sprite;
  }

  createPendingDraggedSprite(menuSprite, pointer) {
    const group = menuSprite.originGroup || this.currentGroup;
    const sprite = this.createSprite({
      x: pointer.worldX ?? pointer.x,
      y: pointer.worldY ?? pointer.y,
      key: menuSprite.assetKey,
      group,
      type: "served",
      data: menuSprite.menuData,
    });

    sprite.setScale(this.scaleDropped);
    sprite.isFromMenu = false;
    sprite.isMenuTemplate = false;
    sprite.isPendingPlacement = true;
    sprite.hasBeenDropped = false;
    sprite.originGroup = group;
    sprite.menuData = { ...(menuSprite.menuData || {}), group };
    sprite.elementDepth = this.getNextElementDepth();

    sprite.on("pointerdown", (pointerDown, localX, localY, event) => {
      if (event && typeof event.stopPropagation === "function") {
        event.stopPropagation();
      }
      this.setActiveServedItem(sprite);
    });

    this.enableSpriteInteraction(sprite);
    this.clearSpriteMask(sprite);
    sprite.setDepth(sprite.elementDepth);

    return sprite;
  }

  createSprite({ x, y, key, group, type, data }) {
    const sprite = this.spriteFactory({
      scene: this.scene,
      x,
      y,
      key,
      group,
      type,
      data,
      component: this,
    });

    if (!sprite) {
      throw new Error(
        "EditableDragDropComponent spriteFactory must return a sprite."
      );
    }

    sprite.assetKey = key;
    sprite.__editableDragDropManagerId = this.managerId;

    return sprite;
  }

  enableSpriteInteraction(sprite) {
    if (!sprite || !sprite.active) {
      return;
    }

    sprite.setInteractive({ useHandCursor: true });
    this.scene.input.setDraggable(sprite);
  }

  disableSpriteInteraction(sprite) {
    if (!sprite || !sprite.active || !sprite.input) {
      return;
    }

    sprite.disableInteractive();
  }

  handleDragStart(pointer, gameObject) {
    if (!this.isManagedObject(gameObject)) {
      return;
    }

    gameObject.dragStartX = gameObject.x;
    gameObject.dragStartY = gameObject.y;

    if (gameObject.isMenuTemplate) {
      this.setActiveServedItem(null);
      gameObject.pendingDraggedSprite = this.createPendingDraggedSprite(
        gameObject,
        pointer
      );
      gameObject.x = gameObject.startX;
      gameObject.y = gameObject.startY;
      return;
    }

    this.setActiveServedItem(gameObject);
  }

  handleDrag(pointer, gameObject, dragX, dragY) {
    if (!this.isManagedObject(gameObject)) {
      return;
    }

    if (gameObject.isMenuTemplate) {
      gameObject.x = gameObject.startX;
      gameObject.y = gameObject.startY;

      if (gameObject.pendingDraggedSprite && gameObject.pendingDraggedSprite.active) {
        gameObject.pendingDraggedSprite.x = dragX;
        gameObject.pendingDraggedSprite.y = dragY;
      }

      return;
    }

    gameObject.x = dragX;
    gameObject.y = dragY;

    if (this.activeServedItem === gameObject) {
      this.positionEditMenu(gameObject);
    }
  }

  handleDragEnd(pointer, gameObject) {
    if (!this.isManagedObject(gameObject)) {
      return;
    }

    if (gameObject.isMenuTemplate) {
      const pendingSprite = gameObject.pendingDraggedSprite;
      gameObject.pendingDraggedSprite = null;
      gameObject.x = gameObject.startX;
      gameObject.y = gameObject.startY;

      if (!pendingSprite || !pendingSprite.active) {
        return;
      }

      if (this.isInsideDropZone(pendingSprite)) {
        this.finalizePendingSprite(pendingSprite);
      } else {
        pendingSprite.destroy();
      }

      return;
    }

    if (this.isInsideDropZone(gameObject)) {
      gameObject.hasBeenDropped = true;

      if (this.activeServedItem === gameObject) {
        this.positionEditMenu(gameObject);
      }

      return;
    }

    this.setActiveServedItem(null);
    this.applyInactivePresentation(gameObject);
  }

  finalizePendingSprite(sprite) {
    const group = sprite.originGroup || this.currentGroup;
    sprite.isPendingPlacement = false;
    sprite.hasBeenDropped = true;

    this.servedItems[group].push(sprite);
    this.updateSelectedItemsForGroup(group);
    this.setActiveServedItem(sprite);

    this.emitSelectionChange(group, "serve");
    this.emitCallback("onServe", {
      group,
      key: sprite.assetKey,
      data: sprite.menuData,
      sprite,
      state: this.getState(),
      component: this,
    });
  }

  removeServedItem(sprite, options = {}) {
    if (!sprite || !sprite.active) {
      return;
    }

    const { reason = "delete", suppressSelectionChange = false } = options;
    const group = sprite.originGroup;
    const key = sprite.assetKey;
    const wasActive = this.activeServedItem === sprite;

    this.servedItems[group] = this.servedItems[group].filter(
      (candidate) => candidate !== sprite
    );
    this.updateSelectedItemsForGroup(group);

    if (wasActive) {
      this.activeServedItem = null;
      this.hideEditMenu();
      this.emitCallback("onActiveItemChange", {
        sprite: null,
        data: null,
        group,
        state: this.getState(),
        component: this,
      });
    }

    sprite.destroy();

    if (!suppressSelectionChange) {
      this.emitSelectionChange(group, reason);
    }

    this.emitCallback("onRemove", {
      group,
      key,
      data: sprite.menuData,
      reason,
      state: this.getState(),
      component: this,
    });
  }

  removeServedItemByGroup(group, options = {}) {
    this.assertGroup(group);

    [...this.servedItems[group]].forEach((sprite) => {
      this.removeServedItem(sprite, options);
    });
  }

  createEditActionPayload(actionId, item) {
    return {
      actionId,
      sprite: item,
      data: item ? item.menuData : null,
      group: item ? item.originGroup : null,
      state: this.getState(),
      component: this,
    };
  }

  handleEditAction(actionId) {
    const item = this.activeServedItem;
    if (!item || !item.active) {
      return;
    }

    const payload = this.createEditActionPayload(actionId, item);

    switch (actionId) {
      case "zoomIn":
        item.setScale(item.scaleX + this.scaleStep, item.scaleY + this.scaleStep);
        this.positionEditMenu(item);
        break;

      case "zoomOut": {
        const nextScaleX = Math.max(this.minScale, item.scaleX - this.scaleStep);
        const nextScaleY = Math.max(this.minScale, item.scaleY - this.scaleStep);
        item.setScale(nextScaleX, nextScaleY);
        this.positionEditMenu(item);
        break;
      }

      case "rotate":
        item.angle += this.rotationStep;
        this.positionEditMenu(item);
        break;

      case "backward":
        this.moveItemDepth(item, -1);
        this.positionEditMenu(item);
        break;

      case "forward":
        this.moveItemDepth(item, 1);
        this.positionEditMenu(item);
        break;

      case "delete":
        this.removeServedItem(item, {
          reason: "delete",
        });
        break;

      default:
        return;
    }

    this.emitCallback("onEditAction", payload);
  }

  moveItemDepth(sprite, direction) {
    const sprites = this.getAllServedSprites()
      .filter((item) => item.active)
      .sort((a, b) => a.elementDepth - b.elementDepth);

    const currentIndex = sprites.indexOf(sprite);
    if (currentIndex === -1) {
      return;
    }

    const targetIndex = Phaser.Math.Clamp(
      currentIndex + direction,
      0,
      sprites.length - 1
    );

    if (targetIndex === currentIndex) {
      return;
    }

    const [movedItem] = sprites.splice(currentIndex, 1);
    sprites.splice(targetIndex, 0, movedItem);

    sprites.forEach((item, index) => {
      item.elementDepth = this.depths.itemBase + index;
      item.setDepth(item.elementDepth);
    });
  }

  positionEditMenu(target) {
    if (!target || !target.active || !this.stageActive) {
      return;
    }

    const scaleReference = Math.max(
      Math.abs(target.scaleX),
      Math.abs(target.scaleY),
      1
    );
    const rawX = target.x;
    const rawY = target.y + this.editMenuOffset * scaleReference;
    const clampedX = Phaser.Math.Clamp(
      rawX,
      this.editMenuHalfWidth + 20,
      this.scene.scale.width - this.editMenuHalfWidth - 20
    );
    const clampedY = Phaser.Math.Clamp(rawY, 60, this.scene.scale.height - 60);

    this.editMenuGroup.setPosition(clampedX, clampedY);
    this.editMenuGroup.setVisible(true);
  }

  hideEditMenu() {
    if (this.editMenuGroup) {
      this.editMenuGroup.setVisible(false);
    }
  }

  setActiveServedItem(sprite) {
    const nextActiveSprite = sprite && sprite.active ? sprite : null;
    const previousActiveSprite =
      this.activeServedItem && this.activeServedItem.active
        ? this.activeServedItem
        : null;

    if (previousActiveSprite === nextActiveSprite) {
      if (nextActiveSprite && this.stageActive) {
        this.applyActivePresentation(nextActiveSprite);
        this.positionEditMenu(nextActiveSprite);
      } else if (!nextActiveSprite) {
        this.hideEditMenu();
      }
      return;
    }

    if (previousActiveSprite) {
      this.applyInactivePresentation(previousActiveSprite);
    }

    this.activeServedItem = nextActiveSprite;

    if (!nextActiveSprite) {
      this.hideEditMenu();
      this.emitCallback("onActiveItemChange", {
        sprite: null,
        data: null,
        group: previousActiveSprite ? previousActiveSprite.originGroup : null,
        state: this.getState(),
        component: this,
      });
      return;
    }

    this.applyActivePresentation(nextActiveSprite);

    if (this.stageActive) {
      this.positionEditMenu(nextActiveSprite);
    } else {
      this.hideEditMenu();
    }

    this.emitCallback("onActiveItemChange", {
      sprite: nextActiveSprite,
      data: nextActiveSprite.menuData,
      group: nextActiveSprite.originGroup,
      state: this.getState(),
      component: this,
    });
  }

  applyActivePresentation(sprite) {
    if (!sprite || !sprite.active) {
      return;
    }

    this.clearSpriteMask(sprite);
    sprite.setVisible(true);
    sprite.setDepth(sprite.elementDepth ?? this.depths.itemBase);
  }

  applyInactivePresentation(sprite) {
    if (!sprite || !sprite.active) {
      return;
    }

    sprite.setDepth(sprite.elementDepth ?? this.depths.itemBase);

    if (this.geometryMask) {
      sprite.setMask(this.geometryMask);
    } else {
      this.clearSpriteMask(sprite);
    }
  }

  clearSpriteMask(sprite) {
    if (!sprite || !sprite.active) {
      return;
    }

    sprite.clearMask();
  }

  setStageActive(isActive) {
    this.stageActive = !!isActive;

    if (!this.stageActive) {
      this.setActiveServedItem(null);
    }

    this.menuSprites.forEach((sprite) => {
      if (!sprite.active) {
        return;
      }

      sprite.setVisible(this.stageActive);

      if (this.stageActive) {
        this.enableSpriteInteraction(sprite);
      } else {
        this.disableSpriteInteraction(sprite);
      }
    });

    this.getAllServedSprites().forEach((sprite) => {
      if (!sprite.active) {
        return;
      }

      if (this.stageActive) {
        this.enableSpriteInteraction(sprite);
      } else {
        this.disableSpriteInteraction(sprite);
      }
    });

    if (!this.stageActive) {
      this.hideEditMenu();
    }
  }

  isManagedObject(gameObject) {
    return (
      gameObject &&
      gameObject.__editableDragDropManagerId === this.managerId
    );
  }

  isInsideDropZone(gameObject) {
    if (typeof this.dropZone.contains === "function") {
      return !!this.dropZone.contains({
        gameObject,
        center: this.getDropZoneCenter(),
        component: this,
      });
    }

    const visibleBounds = this.resolveVisibleBounds();
    if (visibleBounds) {
      return (
        gameObject.x >= visibleBounds.left &&
        gameObject.x <= visibleBounds.right &&
        gameObject.y >= visibleBounds.top &&
        gameObject.y <= visibleBounds.bottom
      );
    }

    const center = this.getDropZoneCenter();
    const distance = Phaser.Math.Distance.Between(
      gameObject.x,
      gameObject.y,
      center.x,
      center.y
    );

    return distance < this.dropRadius;
  }

  overlapsVisibleBounds(gameObject) {
    const visibleBounds = this.resolveVisibleBounds();
    const objectBounds = this.getObjectBounds(gameObject);

    if (!visibleBounds || !objectBounds) {
      return false;
    }

    const visibleRect = new Phaser.Geom.Rectangle(
      visibleBounds.x,
      visibleBounds.y,
      visibleBounds.width,
      visibleBounds.height
    );
    const objectRect = new Phaser.Geom.Rectangle(
      objectBounds.x,
      objectBounds.y,
      objectBounds.width,
      objectBounds.height
    );

    return Phaser.Geom.Rectangle.Overlaps(visibleRect, objectRect);
  }

  getObjectBounds(gameObject) {
    if (!gameObject || typeof gameObject.getBounds !== "function") {
      return null;
    }

    return this.normalizeBounds(gameObject.getBounds());
  }

  getDropZoneCenter() {
    if (this.dropZone.target) {
      return {
        x: this.dropZone.target.x,
        y: this.dropZone.target.y,
      };
    }

    const visibleBounds = this.resolveVisibleBounds();
    if (visibleBounds) {
      return {
        x: visibleBounds.x + visibleBounds.width / 2,
        y: visibleBounds.y + visibleBounds.height / 2,
      };
    }

    if (
      typeof this.dropZone.x === "number" &&
      typeof this.dropZone.y === "number"
    ) {
      return {
        x: this.dropZone.x,
        y: this.dropZone.y,
      };
    }

    throw new Error(
      "EditableDragDropComponent requires dropZone.target, visibleBounds or dropZone.x/dropZone.y."
    );
  }

  getNextElementDepth() {
    const occupiedDepths = this.getAllServedSprites()
      .filter((sprite) => sprite.active)
      .map((sprite) => sprite.elementDepth ?? this.depths.itemBase - 1);

    return occupiedDepths.length
      ? Math.max(...occupiedDepths) + 1
      : this.depths.itemBase;
  }

  getAllServedSprites() {
    return Object.values(this.servedItems).flat();
  }

  updateSelectedItemsForGroup(group) {
    this.selectedItems[group] = this.servedItems[group]
      .filter((sprite) => sprite.active)
      .map((sprite) => sprite.assetKey);
  }

  getState() {
    return {
      currentGroup: this.currentGroup,
      selectedItems: Object.fromEntries(
        this.groups.map((group) => [group, [...this.selectedItems[group]]])
      ),
      servedItems: Object.fromEntries(
        this.groups.map((group) => [group, [...this.servedItems[group]]])
      ),
      activeServedItem: this.activeServedItem,
    };
  }

  emitSelectionChange(group, reason) {
    this.emitCallback("onSelectionChange", {
      group,
      reason,
      state: this.getState(),
      selectedItems: Object.fromEntries(
        this.groups.map((groupKey) => [
          groupKey,
          [...this.selectedItems[groupKey]],
        ])
      ),
      servedItems: Object.fromEntries(
        this.groups.map((groupKey) => [
          groupKey,
          [...this.servedItems[groupKey]],
        ])
      ),
      component: this,
    });
  }

  emitCallback(callbackName, payload) {
    const callback = this.callbacks[callbackName];
    if (typeof callback === "function") {
      callback(payload);
    }
  }

  assertGroup(group) {
    if (!this.groups.includes(group)) {
      throw new Error(`Unknown group "${group}" passed to component.`);
    }
  }
}
