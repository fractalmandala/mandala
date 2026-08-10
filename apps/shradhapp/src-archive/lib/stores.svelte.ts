import { backend } from './backend';
import type { MediaItem } from './backend/types';

class MediaStore {
  items = $state<MediaItem[]>([]);
  loaded = $state(false);
  error = $state<string | null>(null);

  async load() {
    try {
      this.items = await backend.listMedia();
      this.error = null;
    } catch (e) {
      this.error = String(e);
    } finally {
      this.loaded = true;
    }
  }

  byId(id: string): MediaItem | undefined {
    return this.items.find((i) => i.id === id);
  }
}

export const mediaStore = new MediaStore();
