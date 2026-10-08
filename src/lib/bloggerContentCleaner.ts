// Blogger Content Cleaner
// Removes duplicate header/cover images from Blogger post HTML body,
// cleans Blogger separator wrappers, caption tables, and optimizes formatting for Toolzaro reader.

/**
 * Normalizes an image URL by removing Blogger dimension/format parameters
 * e.g. /s1600/, /s320/, /w640-h360/, /s72-c/, =s1600, =w640
 */
export function normalizeImageUrl(url?: string): string {
  if (!url) return '';
  return url
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/s\d+(-c)?\//g, '/')
    .replace(/\/w\d+-h\d+[^/]*\//g, '/')
    .replace(/=[sw]\d+[^&?#]*/g, '')
    .replace(/[?#].*$/, '')
    .toLowerCase();
}

/**
 * Checks if two image URLs refer to the same underlying image
 */
export function isSameImage(url1?: string, url2?: string): boolean {
  if (!url1 || !url2) return false;
  const n1 = normalizeImageUrl(url1);
  const n2 = normalizeImageUrl(url2);
  if (n1 === n2) return true;

  // Compare core filename / photo token if both are long enough
  const part1 = n1.split('/').filter(Boolean).pop() || '';
  const part2 = n2.split('/').filter(Boolean).pop() || '';
  if (part1 && part2 && part1 === part2 && part1.length > 5) return true;

  // Also check if one is a substring of the other (e.g. googleusercontent unique ID hash)
  if (n1.length > 25 && n2.length > 25) {
    const hash1 = n1.replace(/[^a-z0-9]/gi, '');
    const hash2 = n2.replace(/[^a-z0-9]/gi, '');
    if (hash1.includes(hash2) || hash2.includes(hash1)) return true;
  }

  return false;
}

/**
 * Removes the duplicate cover/header image from article body HTML.
 * In Blogger, posts usually embed the featured thumbnail image at the very top of the body
 * inside <div class="separator"><a ...><img .../></a></div> or <table class="tr-caption-container">.
 * Since Toolzaro already displays this image prominently in the top 16:9 Featured Cover box,
 * keeping it in the body causes visitors to see the exact same image twice in a row.
 * 
 * This function cleanly removes that first duplicate image and its container,
 * while leaving all subsequent illustrations, screenshots, diagrams, and formatting 100% intact!
 */
export function cleanPostContentHtml(html: string, coverImage?: string): string {
  if (!html) return '';
  if (typeof window === 'undefined') {
    // Basic regex fallback if window is not available
    return html;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const images = Array.from(doc.querySelectorAll('img'));
    if (images.length === 0) return html;

    const firstImg = images[0];
    const firstImgSrc = firstImg.getAttribute('src') || '';

    // Check if the first image matches coverImage OR is located at the top of the post body
    const isDirectMatch = isSameImage(firstImgSrc, coverImage);
    const isAtTop = isFirstImageAtTopOfPost(firstImg, doc.body);

    // If it matches coverImage or is the leading header image (and coverImage exists)
    if (isDirectMatch || (coverImage && isAtTop)) {
      // Find the highest container to remove without removing text:
      // Typically: div.separator, table.tr-caption-container, or a wrapper <p> with no other text
      let elementToRemove: Element = firstImg;
      let curr: Element | null = firstImg.parentElement;

      while (curr && curr !== doc.body) {
        const tag = curr.tagName.toLowerCase();
        const isSeparator = curr.classList.contains('separator') || curr.classList.contains('tr-caption-container');
        const textLen = (curr.textContent || '').trim().length;
        const imgCount = curr.querySelectorAll('img').length;

        // If it's a known Blogger separator, or a p/div wrapper containing only this image and whitespace/short caption
        if (isSeparator || ((tag === 'p' || tag === 'div') && imgCount === 1 && textLen <= 30)) {
          elementToRemove = curr;
          curr = curr.parentElement;
        } else if (tag === 'a' && curr.parentElement && (curr.parentElement.classList.contains('separator') || curr.parentElement.classList.contains('tr-caption-container'))) {
          elementToRemove = curr.parentElement;
          curr = elementToRemove.parentElement;
        } else {
          break;
        }
      }

      elementToRemove.remove();

      // Clean up any empty leading <br>, <p></p>, or empty <div> tags at the start of body
      let firstChild = doc.body.firstElementChild;
      while (firstChild && (
        firstChild.tagName.toLowerCase() === 'br' ||
        ((firstChild.tagName.toLowerCase() === 'p' || firstChild.tagName.toLowerCase() === 'div') && !firstChild.textContent?.trim() && firstChild.querySelectorAll('img').length === 0)
      )) {
        const next = firstChild.nextElementSibling;
        firstChild.remove();
        firstChild = next;
      }

      return doc.body.innerHTML;
    }

    return html;
  } catch (err) {
    console.warn('[cleanPostContentHtml] Failed to clean HTML:', err);
    return html;
  }
}

/**
 * Checks if an image is positioned right at the top of the post body
 * (i.e., with little to no preceding body text)
 */
function isFirstImageAtTopOfPost(img: HTMLImageElement, root: HTMLElement): boolean {
  // Traverse preceding elements in DOM order to check text before this image
  try {
    const range = document.createRange();
    range.setStart(root, 0);
    range.setEndBefore(img);
    const precedingText = range.toString().trim();
    // If there are fewer than 40 characters before the image, it's the header image!
    return precedingText.length < 40;
  } catch {
    // Safe fallback: check child index of img's ancestor
    let curr: HTMLElement | null = img;
    while (curr && curr.parentElement !== root && curr.parentElement) {
      curr = curr.parentElement;
    }
    if (curr && curr.parentElement === root) {
      const idx = Array.prototype.indexOf.call(root.children, curr);
      return idx <= 1;
    }
    return true;
  }
}
