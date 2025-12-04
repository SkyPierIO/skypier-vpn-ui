import http from "../http.common";
import { ConnectionStats, AllConnectionStats, formatBytes, formatBitrate, formatDuration } from "../types/stats.type";

// Backend response type (snake_case)
interface BackendStats {
  bytes_sent: number;
  bytes_received: number;
  packets_sent: number;
  packets_received: number;
  connected_at: string;
  uptime_seconds: number;
  upload_rate_bps: number;
  download_rate_bps: number;
  latency_ms: number;
  last_activity_at: string;
}

// Transform backend response to frontend format
function transformStats(data: BackendStats): ConnectionStats {
  return {
    bytesSent: data.bytes_sent || 0,
    bytesReceived: data.bytes_received || 0,
    bytesSentFormatted: formatBytes(data.bytes_sent || 0),
    bytesReceivedFormatted: formatBytes(data.bytes_received || 0),
    packetsSent: data.packets_sent || 0,
    packetsReceived: data.packets_received || 0,
    currentUploadBps: data.upload_rate_bps || 0,
    currentDownloadBps: data.download_rate_bps || 0,
    currentUploadFormatted: formatBitrate(data.upload_rate_bps || 0),
    currentDownloadFormatted: formatBitrate(data.download_rate_bps || 0),
    avgUploadBps: 0, // Backend doesn't track this yet
    avgDownloadBps: 0,
    avgUploadFormatted: '0 bps',
    avgDownloadFormatted: '0 bps',
    peakUploadBps: 0, // Backend doesn't track this yet
    peakDownloadBps: 0,
    peakUploadFormatted: '0 bps',
    peakDownloadFormatted: '0 bps',
    connectedAt: data.connected_at || '',
    duration: formatDuration(data.uptime_seconds || 0),
    durationSeconds: data.uptime_seconds || 0,
  };
}

class StatsService {
  /**
   * Get connection statistics for a specific peer
   * @param peerId The peer ID to get stats for
   * @returns Promise with the connection stats
   */
  async getConnectionStats(peerId: string): Promise<{ data: ConnectionStats }> {
    const response = await http.get<BackendStats>(`/stats/${peerId}`);
    return { data: transformStats(response.data) };
  }

  /**
   * Get statistics for all active connections
   * @returns Promise with all connection stats
   */
  getAllConnectionStats() {
    return http.get<AllConnectionStats>(`/stats`);
  }

  /**
   * Poll stats at regular intervals
   * @param peerId The peer ID to poll stats for
   * @param callback Function to call with updated stats
   * @param intervalMs Polling interval in milliseconds (default: 1000ms)
   * @returns Cleanup function to stop polling
   */
  pollStats(
    peerId: string,
    callback: (stats: ConnectionStats) => void,
    intervalMs: number = 1000
  ): () => void {
    const intervalId = setInterval(async () => {
      try {
        const response = await this.getConnectionStats(peerId);
        callback(response.data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    }, intervalMs);

    // Return cleanup function
    return () => clearInterval(intervalId);
  }

  /**
   * Poll all connection stats at regular intervals
   * @param callback Function to call with updated stats
   * @param intervalMs Polling interval in milliseconds (default: 1000ms)
   * @returns Cleanup function to stop polling
   */
  pollAllStats(
    callback: (stats: AllConnectionStats) => void,
    intervalMs: number = 1000
  ): () => void {
    const intervalId = setInterval(async () => {
      try {
        const response = await this.getAllConnectionStats();
        callback(response.data);
      } catch (error) {
        console.error("Failed to fetch all stats:", error);
      }
    }, intervalMs);

    // Return cleanup function
    return () => clearInterval(intervalId);
  }
}

export default new StatsService();
