import { seedAllPetsQaSave } from '../../systems/PetVisualQaFixtureSystem';
import type { SaveStorage } from '../../systems/SaveSystem';

/** Explicit local testing control, outside the original game's display list. */
export function createPetVisualQaEntry(storage: SaveStorage, refreshSlots: () => void): () => void {
  const { hostname, port } = window.location;
  if (port !== '5173' || !['localhost', '127.0.0.1'].includes(hostname)) return () => {};
  const panel = document.createElement('aside');
  panel.dataset.petQaEntry = 'true';
  panel.setAttribute('aria-label', '本地全宠物测试');
  panel.style.cssText = 'position:fixed;top:8px;right:8px;z-index:100;padding:8px 12px;border:1px solid #a79554;border-radius:6px;background:#18202fee;color:#fff;font:13px sans-serif;max-width:290px';
  const label = document.createElement('div');
  label.textContent = '本地测试 · 双人 / 全35只宠物';
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = '创建 / 刷新全宠物测试档';
  button.style.cssText = 'margin-top:6px;padding:6px 10px;cursor:pointer';
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'margin-top:6px;line-height:1.5';
  status.textContent = '使用存档6；已有存档不会被覆盖。';
  button.onclick = () => {
    try {
      const result = seedAllPetsQaSave(storage, '?qaPetSave=all', window.location.hostname, window.location.port);
      status.textContent = result === 'created' ? '已创建：点击存档6进入全宠物测试。'
        : result === 'selected-existing' ? '已刷新：点击存档6进入，原测试进度保留。'
          : result === 'occupied' ? '存档6已占用或损坏，未修改任何已有存档。'
            : '当前地址不支持本地测试档。';
      refreshSlots();
    } catch {
      status.textContent = '浏览器存储不可用，无法创建测试档。';
    }
  };
  panel.append(label, button, status);
  document.body.append(panel);
  return () => { button.onclick = null; panel.remove(); };
}
