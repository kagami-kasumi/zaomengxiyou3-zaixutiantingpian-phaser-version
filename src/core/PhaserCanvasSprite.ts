import Phaser from 'phaser';

/**
 * Phaser 3.90.0 CanvasRenderer.batchSprite compatibility override.
 * Copyright (c) 2013-2025 Phaser Studio Inc. (MIT; see PhaserCanvasSprite.LICENSE.txt).
 * Keep upstream crop, flip, mask and integer positioning; omit only the 0.5px
 * destination-size expansion. This affects Canvas instances, never WebGL.
 * Revalidate against upstream and run the 233 browser suite when upgrading Phaser.
 */
export function installCanvasSpriteExtentFix(game: Phaser.Game): void {
  if (!(game.renderer instanceof Phaser.Renderer.Canvas.CanvasRenderer)) return;
  const renderer = game.renderer;
  const cameraMatrix = new Phaser.GameObjects.Components.TransformMatrix();
  const objectMatrix = new Phaser.GameObjects.Components.TransformMatrix();
  renderer.batchSprite = function (gameObject, frame, camera, parentTransformMatrix) {
    // Phaser's declaration uses GameObject, but batchSprite receives textured objects.
    const sprite = gameObject as Phaser.GameObjects.Sprite & {
      _crop: { flipX: boolean; flipY: boolean; cw: number; ch: number; cx: number; cy: number; x: number; y: number };
    };
        let alpha = camera.alpha * sprite.alpha;

        if (alpha === 0)
        {
            //  Nothing to see, so abort early
            return;
        }

        let ctx = this.currentContext;

        let camMatrix = cameraMatrix;
        let spriteMatrix = objectMatrix;

        let cd = frame.canvasData as { x: number; y: number };

        let frameX = cd.x;
        let frameY = cd.y;
        let frameWidth = frame.cutWidth;
        let frameHeight = frame.cutHeight;
        let customPivot = frame.customPivot;

        let res = frame.source.resolution;

        let displayOriginX = sprite.displayOriginX;
        let displayOriginY = sprite.displayOriginY;

        let x = -displayOriginX + frame.x;
        let y = -displayOriginY + frame.y;

        if (sprite.isCropped)
        {
            let crop = sprite._crop;

            if (crop.flipX !== sprite.flipX || crop.flipY !== sprite.flipY)
            {
                frame.updateCropUVs(crop, sprite.flipX, sprite.flipY);
            }

            frameWidth = crop.cw;
            frameHeight = crop.ch;

            frameX = crop.cx;
            frameY = crop.cy;

            x = -displayOriginX + crop.x;
            y = -displayOriginY + crop.y;

            if (sprite.flipX)
            {
                if (x >= 0)
                {
                    x = -(x + frameWidth);
                }
                else if (x < 0)
                {
                    x = (Math.abs(x) - frameWidth);
                }
            }

            if (sprite.flipY)
            {
                if (y >= 0)
                {
                    y = -(y + frameHeight);
                }
                else if (y < 0)
                {
                    y = (Math.abs(y) - frameHeight);
                }
            }
        }

        let flipX = 1;
        let flipY = 1;

        if (sprite.flipX)
        {
            if (!customPivot)
            {
                x += (-frame.realWidth + (displayOriginX * 2));
            }

            flipX = -1;
        }

        //  Auto-invert the flipY if this is coming from a GLTexture
        if (sprite.flipY)
        {
            if (!customPivot)
            {
                y += (-frame.realHeight + (displayOriginY * 2));
            }

            flipY = -1;
        }

        let gx = sprite.x;
        let gy = sprite.y;

        if (camera.roundPixels)
        {
            gx = Math.floor(gx);
            gy = Math.floor(gy);
        }

        spriteMatrix.applyITRS(gx, gy, sprite.rotation, sprite.scaleX * flipX, sprite.scaleY * flipY);

        camMatrix.copyFrom((camera as Phaser.Cameras.Scene2D.Camera & { matrix: Phaser.GameObjects.Components.TransformMatrix }).matrix);

        if (parentTransformMatrix)
        {
            //  Multiply the camera by the parent matrix
            camMatrix.multiplyWithOffset(parentTransformMatrix, -camera.scrollX * sprite.scrollFactorX, -camera.scrollY * sprite.scrollFactorY);

            //  Undo the camera scroll
            spriteMatrix.e = gx;
            spriteMatrix.f = gy;
        }
        else
        {
            spriteMatrix.e -= camera.scrollX * sprite.scrollFactorX;
            spriteMatrix.f -= camera.scrollY * sprite.scrollFactorY;
        }

        //  Multiply by the Sprite matrix
        camMatrix.multiply(spriteMatrix);

        if ((camera as Phaser.Cameras.Scene2D.Camera & { renderRoundPixels: boolean }).renderRoundPixels)
        {
            camMatrix.e = Math.floor(camMatrix.e + 0.5);
            camMatrix.f = Math.floor(camMatrix.f + 0.5);
        }

        ctx.save();

        camMatrix.setToContext(ctx);

        ctx.globalCompositeOperation = this.blendModes[sprite.blendMode as number];

        ctx.globalAlpha = alpha;

        ctx.imageSmoothingEnabled = !frame.source.scaleMode;

        if (sprite.mask)
        {
            sprite.mask.preRenderCanvas(this, sprite, camera);
        }

        if (frameWidth > 0 && frameHeight > 0)
        {
            let fw = frameWidth / res;
            let fh = frameHeight / res;

            if (camera.roundPixels)
            {
                x = Math.floor(x + 0.5);
                y = Math.floor(y + 0.5);
                // Preserve the source extent: no half-pixel destination expansion.
            }

            ctx.drawImage(
                frame.source.image as CanvasImageSource,
                frameX, frameY,
                frameWidth, frameHeight,
                x, y,
                fw, fh
            );
        }

        if (sprite.mask)
        {
            sprite.mask.postRenderCanvas(this);
        }

        ctx.restore();
  };
}
