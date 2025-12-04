// Connection statistics types for VPN bandwidth monitoring

export interface ConnectionStats {
  bytesSent: number;
  bytesReceived: number;
  bytesSentFormatted: string;
  bytesReceivedFormatted: string;
  packetsSent: number;
  packetsReceived: number;
  currentUploadBps: number;
  currentDownloadBps: number;
  currentUploadFormatted: string;
  currentDownloadFormatted: string;
  avgUploadBps: number;
  avgDownloadBps: number;
  avgUploadFormatted: string;
  avgDownloadFormatted: string;
  peakUploadBps: number;
  peakDownloadBps: number;
  peakUploadFormatted: string;
  peakDownloadFormatted: string;
  connectedAt: string;
  duration: string;
  durationSeconds: number;
}

export interface AllConnectionStats {
  connections: Record<string, ConnectionStats>;
  count: number;
}

// Helper function to format bytes to human readable
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let unitIndex = -1;
  let value = bytes;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

// Helper function to format bitrate to human readable
export function formatBitrate(bytesPerSecond: number): string {
  const bitsPerSecond = bytesPerSecond * 8;
  if (bitsPerSecond < 1000) return `${bitsPerSecond} bps`;
  const units = ['kbps', 'Mbps', 'Gbps'];
  let unitIndex = -1;
  let value = bitsPerSecond;
  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex++;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

// Helper function to format duration
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}
