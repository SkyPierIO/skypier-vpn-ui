import { lookup } from 'ipfs-geoip';
import http from '../http.common';

export interface PeerLocation {
  peerId: string;
  geoIP: string;
  countryCode: string;
  latitude: number;
  longitude: number;
}

// Shared cache for geoip lookups across components
const geoIPCache: { [key: string]: PeerLocation } = {};

// IPFS gateways for geoip lookup
const GATEWAYS = ['https://ipfs.io', 'https://dweb.link'];

/**
 * Get the location for a peer by its ID
 * Uses cache to avoid redundant lookups
 */
export async function getPeerLocation(peerId: string): Promise<PeerLocation | null> {
  // Check cache first
  if (geoIPCache[peerId]) {
    return geoIPCache[peerId];
  }

  try {
    // Get peer's IP address from the backend
    const response = await http.get(`/peer/${peerId}/info`, { timeout: 5000 });
    
    if (response.status !== 200 || !response.data || response.data.length < 1) {
      return null;
    }

    const ip = response.data[0];
    
    // Lookup geolocation using ipfs-geoip
    const result = await lookup(GATEWAYS, ip);
    
    if (!result) {
      return null;
    }

    const location: PeerLocation = {
      peerId,
      geoIP: `${result.country_name}, ${result.city}`,
      countryCode: result.country_code || 'XX',
      latitude: result.latitude || 0,
      longitude: result.longitude || 0,
    };

    // Store in cache
    geoIPCache[peerId] = location;

    return location;
  } catch (error) {
    console.error(`Error fetching location for peer ${peerId}:`, error);
    return null;
  }
}

/**
 * Get locations for multiple peers in parallel
 * Returns only successfully resolved locations
 */
export async function getPeerLocations(peerIds: string[]): Promise<PeerLocation[]> {
  const locationPromises = peerIds.map(peerId => getPeerLocation(peerId));
  const results = await Promise.allSettled(locationPromises);
  
  return results
    .filter((result): result is PromiseFulfilledResult<PeerLocation | null> => 
      result.status === 'fulfilled' && result.value !== null
    )
    .map(result => result.value as PeerLocation);
}

/**
 * Get all cached locations
 */
export function getCachedLocations(): PeerLocation[] {
  return Object.values(geoIPCache);
}

/**
 * Check if a peer's location is cached
 */
export function isLocationCached(peerId: string): boolean {
  return peerId in geoIPCache;
}

/**
 * Clear the cache (useful for testing or forced refresh)
 */
export function clearCache(): void {
  Object.keys(geoIPCache).forEach(key => delete geoIPCache[key]);
}

export default {
  getPeerLocation,
  getPeerLocations,
  getCachedLocations,
  isLocationCached,
  clearCache,
};
