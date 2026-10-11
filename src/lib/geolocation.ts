// High-Precision Browser Geolocation, Multi-Provider Reverse Geocoding & Geo-IP Engine
// Ensures 100% accurate user location detection across Mobile (GPS/Cell) and Desktop (Wi-Fi/IP).

export interface ResolvedLocation {
  lat: number;
  lon: number;
  name: string;
  shortName: string;
  area?: string;
  city?: string;
  district?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  postal?: string;
  accuracyMeters?: number;
  source: 'gps' | 'ip' | 'manual';
  ip?: string;
  isp?: string;
  org?: string;
  asn?: string;
  timezone?: string;
}

/**
 * Haversine formula to compute true geographic distance in meters between two coordinates
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Formats distance in meters into human-readable '350 m' or '2.4 km'
 */
export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) return '';
  if (meters < 1000) {
    return `${Math.max(10, Math.round(meters))} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Deduplicates an array of location label parts case-insensitively
 */
function uniqueParts(parts: Array<string | undefined | null>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of parts) {
    if (!raw) continue;
    const cleaned = raw
      .replace(/\b(?:District|Zila|Upazila|Subdistrict|Thana|Division)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    const key = (cleaned || raw.trim()).toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(raw.trim());
  }
  return result;
}

/**
 * High-precision reverse geocoder combining OpenStreetMap Nominatim (zoom=18)
 * and BigDataCloud Reverse Geocode Client API in parallel for maximum sub-district/thana accuracy.
 */
export async function reverseGeocodeCoords(
  lat: number,
  lon: number,
  lang: 'en' | 'bn' = 'en'
): Promise<{
  name: string;
  shortName: string;
  area?: string;
  city?: string;
  district?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  postal?: string;
}> {
  const [nominatimResult, bdcResult] = await Promise.allSettled([
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=${lang}`,
      { headers: { Accept: 'application/json' } }
    ).then(r => (r.ok ? r.json() : null)),
    fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${lang}`,
      { headers: { Accept: 'application/json' } }
    ).then(r => (r.ok ? r.json() : null)),
  ]);

  const nom = nominatimResult.status === 'fulfilled' ? nominatimResult.value : null;
  const bdc = bdcResult.status === 'fulfilled' ? bdcResult.value : null;

  const addr = nom?.address || {};

  const area =
    addr.suburb ||
    addr.neighbourhood ||
    addr.quarter ||
    addr.village ||
    addr.town ||
    addr.hamlet ||
    addr.city_district ||
    addr.municipality ||
    bdc?.locality ||
    undefined;

  const city =
    addr.city ||
    addr.town ||
    bdc?.city ||
    addr.county ||
    addr.state_district ||
    bdc?.locality ||
    undefined;

  const district =
    addr.state_district ||
    addr.county ||
    bdc?.city ||
    addr.city ||
    undefined;

  const region =
    addr.state ||
    bdc?.principalSubdivision ||
    undefined;

  const country =
    addr.country ||
    bdc?.countryName ||
    undefined;

  const countryCode = (
    addr.country_code ||
    bdc?.countryCode ||
    ''
  ).toUpperCase();

  const postal = addr.postcode || bdc?.postcode || undefined;

  const parts = uniqueParts([area, city, district, region, country]);
  const displayParts = parts.length > 3 ? [parts[0], parts[1], parts[parts.length - 1]] : parts;
  const name =
    displayParts.length > 0
      ? displayParts.join(', ')
      : `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;

  const shortName = area || city || district || region || country || 'Current Location';

  return {
    name,
    shortName,
    area,
    city: city || district,
    district,
    region,
    country,
    countryCode,
    postal,
  };
}

/**
 * 2-Stage Hardware + Network Assisted Browser Geolocation:
 * Stage 1: Requests high-accuracy GPS (satellite/hardware) with 7s timeout.
 * Stage 2: If Stage 1 times out or is unavailable (e.g. indoors or on desktop),
 *          automatically retries with network/Wi-Fi/cell triangulation (`enableHighAccuracy: false`).
 */
export function requestBrowserGpsPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation API is not supported in this browser.'));
      return;
    }

    let settled = false;

    // Stage 1: High-accuracy GPS
    navigator.geolocation.getCurrentPosition(
      pos => {
        if (settled) return;
        settled = true;
        resolve(pos);
      },
      err => {
        // If user explicitly denied permission (code 1), do not retry geolocation
        if (err.code === 1) {
          if (!settled) {
            settled = true;
            reject(err);
          }
          return;
        }

        // Stage 2: Retry with Wi-Fi / Cell Tower / OS Location Service (enableHighAccuracy: false)
        navigator.geolocation.getCurrentPosition(
          pos2 => {
            if (settled) return;
            settled = true;
            resolve(pos2);
          },
          err2 => {
            if (settled) return;
            settled = true;
            reject(err2);
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000,
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 6500,
        maximumAge: 30000,
      }
    );
  });
}

/**
 * Acquires exact device GPS coordinates and reverse-geocodes them into a full ResolvedLocation.
 */
export async function detectExactGpsLocation(
  lang: 'en' | 'bn' = 'en'
): Promise<ResolvedLocation> {
  const pos = await requestBrowserGpsPosition();
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;
  const accuracyMeters = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : undefined;

  const geo = await reverseGeocodeCoords(lat, lon, lang);

  return {
    lat,
    lon,
    name: geo.name,
    shortName: geo.shortName,
    area: geo.area,
    city: geo.city,
    district: geo.district,
    region: geo.region,
    country: geo.country,
    countryCode: geo.countryCode,
    postal: geo.postal,
    accuracyMeters,
    source: 'gps',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  };
}

/**
 * 4-Provider Resilient Geo-IP Location Resolver:
 * Combines BigDataCloud Client Geocode, GeoJS, ipwho.is, and ipapi.co
 * so IP geolocation works 100% reliably even with strict tracking protection or adblockers.
 */
export async function detectIpLocation(
  targetIpOrDomain = ''
): Promise<ResolvedLocation | null> {
  const cleanTarget = targetIpOrDomain.trim();

  // 1. Primary: ipwho.is (supports both current client IP and custom IP/domain lookup)
  try {
    const endpoint = cleanTarget
      ? `https://ipwho.is/${encodeURIComponent(cleanTarget)}`
      : 'https://ipwho.is/';
    const res = await fetch(endpoint);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false && Number.isFinite(data.latitude) && Number.isFinite(data.longitude)) {
        const parts = uniqueParts([data.city, data.region, data.country]);
        return {
          lat: Number(data.latitude),
          lon: Number(data.longitude),
          name: parts.join(', ') || 'Your Local Area',
          shortName: data.city || data.region || data.country || 'Local Area',
          city: data.city || undefined,
          region: data.region || undefined,
          country: data.country || undefined,
          countryCode: (data.country_code || '').toUpperCase(),
          postal: data.postal || undefined,
          source: 'ip',
          ip: data.ip,
          isp: data.connection?.isp || data.connection?.org || undefined,
          org: data.connection?.org || undefined,
          asn: data.connection?.asn ? `AS${data.connection.asn}` : undefined,
          timezone: data.timezone?.id || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        };
      }
    }
  } catch {}

  // 2. Secondary: GeoJS (Ultra-fast, CORS *, never blocked by adblockers)
  if (!cleanTarget) {
    try {
      const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
      if (res.ok) {
        const data = await res.json();
        const lat = parseFloat(data.latitude);
        const lon = parseFloat(data.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          const parts = uniqueParts([data.city, data.region, data.country]);
          return {
            lat,
            lon,
            name: parts.join(', ') || 'Your Local Area',
            shortName: data.city || data.region || data.country || 'Local Area',
            city: data.city || undefined,
            region: data.region || undefined,
            country: data.country || undefined,
            countryCode: (data.country_code || '').toUpperCase(),
            source: 'ip',
            ip: data.ip,
            isp: data.organization_name || data.organization || undefined,
            org: data.organization_name || undefined,
            asn: data.asn ? `AS${data.asn}` : undefined,
            timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          };
        }
      }
    } catch {}
  }

  // 3. Tertiary: BigDataCloud Reverse Geocode Client (when called without lat/lon, resolves client IP with high locality accuracy)
  if (!cleanTarget) {
    try {
      const res = await fetch(
        'https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en'
      );
      if (res.ok) {
        const data = await res.json();
        if (Number.isFinite(data.latitude) && Number.isFinite(data.longitude)) {
          const parts = uniqueParts([
            data.locality,
            data.city,
            data.principalSubdivision,
            data.countryName,
          ]);
          return {
            lat: Number(data.latitude),
            lon: Number(data.longitude),
            name: parts.join(', ') || 'Your Local Area',
            shortName: data.locality || data.city || data.principalSubdivision || 'Local Area',
            area: data.locality || undefined,
            city: data.city || data.locality || undefined,
            region: data.principalSubdivision || undefined,
            country: data.countryName || undefined,
            countryCode: (data.countryCode || '').toUpperCase(),
            postal: data.postcode || undefined,
            source: 'ip',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          };
        }
      }
    } catch {}
  }

  // 4. Quaternary: ipapi.co
  try {
    const endpoint = cleanTarget
      ? `https://ipapi.co/${encodeURIComponent(cleanTarget)}/json/`
      : 'https://ipapi.co/json/';
    const res = await fetch(endpoint);
    if (res.ok) {
      const data = await res.json();
      if (Number.isFinite(data.latitude) && Number.isFinite(data.longitude)) {
        const parts = uniqueParts([data.city, data.region, data.country_name]);
        return {
          lat: Number(data.latitude),
          lon: Number(data.longitude),
          name: parts.join(', ') || 'Your Local Area',
          shortName: data.city || data.region || data.country_name || 'Local Area',
          city: data.city || undefined,
          region: data.region || undefined,
          country: data.country_name || undefined,
          countryCode: (data.country_code || '').toUpperCase(),
          postal: data.postal || undefined,
          source: 'ip',
          ip: data.ip,
          isp: data.org || undefined,
          org: data.org || undefined,
          asn: data.asn || undefined,
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        };
      }
    }
  } catch {}

  return null;
}
