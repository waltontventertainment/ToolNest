// Custom HTML/CSS/JS Tools Service (Firestore + Local Storage Cache)
import { db } from './firebase';

export interface CustomAdminTool {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  customHtml: string; // The HTML/CSS/JS payload
  iconName?: string;
  enabled: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

const COLLECTION_NAME = 'custom_tools';
const LOCAL_STORAGE_CACHE_KEY = 'toolzaro_custom_tools_cache';

let memoryToolsCache: CustomAdminTool[] | null = null;

function getLocalCache(): CustomAdminTool[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalCache(tools: CustomAdminTool[]): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(tools));
  } catch {}
}

export async function getCustomTools(): Promise<CustomAdminTool[]> {
  if (memoryToolsCache && memoryToolsCache.length > 0) {
    return memoryToolsCache;
  }

  const cached = getLocalCache();
  if (cached.length > 0) {
    memoryToolsCache = cached;
  }

  try {
    const { collection, getDocs } = await import('firebase/firestore');
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    const list: CustomAdminTool[] = [];
    snap.forEach(doc => {
      list.push({ id: doc.id, ...(doc.data() as any) });
    });

    if (list.length > 0) {
      memoryToolsCache = list;
      setLocalCache(list);
      return list;
    }
    return cached;
  } catch (err) {
    console.warn('Custom tools fetch fallback to cache:', err);
    return cached;
  }
}

export async function saveCustomTool(tool: Partial<CustomAdminTool>): Promise<CustomAdminTool> {
  const { doc, setDoc } = await import('firebase/firestore');
  const now = new Date().toISOString();
  const id = tool.id || `custom-tool-${Date.now()}`;
  const slug = tool.slug?.trim().toLowerCase() || `tool-${Date.now()}`;

  const finalTool: CustomAdminTool = {
    id,
    slug,
    name: tool.name || 'Untitled Custom Tool',
    category: tool.category || 'Utility',
    description: tool.description || '',
    customHtml: tool.customHtml || '',
    iconName: tool.iconName || 'Wrench',
    enabled: tool.enabled !== undefined ? tool.enabled : true,
    metaTitle: tool.metaTitle || tool.name || 'Online Tool',
    metaDescription: tool.metaDescription || tool.description || '',
    createdAt: tool.createdAt || now,
    updatedAt: now,
  };

  await setDoc(doc(db, COLLECTION_NAME, id), finalTool, { merge: true });

  const cached = getLocalCache().filter(t => t.id !== id && t.slug !== slug);
  cached.unshift(finalTool);
  memoryToolsCache = cached;
  setLocalCache(cached);

  return finalTool;
}

export async function deleteCustomTool(id: string): Promise<boolean> {
  const { doc, deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, COLLECTION_NAME, id));

  const cached = getLocalCache().filter(t => t.id !== id);
  memoryToolsCache = cached;
  setLocalCache(cached);
  return true;
}
