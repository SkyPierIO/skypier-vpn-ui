import http from "../http.common";
import { ConnectionStats, AllConnectionStats } from "../types/stats.type";

class StatsService {
  /**
   * Get connection statistics for a specific peer
   * @param peerId The peer ID to get stats for
   * @returns Promise with the connection stats
   */
  getConnectionStats(peerId: string) {
    return http.get<ConnectionStats>(`/stats/${peerId}`);
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
