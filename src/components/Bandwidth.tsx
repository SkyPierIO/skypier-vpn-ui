import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Box, Typography, Paper, Chip } from '@mui/material';
import Grid from '@mui/material/Grid';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import StatsService from '../services/stats.service';
import { ConnectionStats, formatBytes, formatBitrate, formatDuration } from '../types/stats.type';

interface BandwidthProps {
  peerId?: string;
  maxDataPoints?: number;
}

interface DataPoint {
  time: number;
  upload: number;
  download: number;
}

export default function Bandwidth({ peerId, maxDataPoints = 60 }: BandwidthProps) {
  const [stats, setStats] = useState<ConnectionStats | null>(null);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const timeCounter = useRef(0);

  useEffect(() => {
    if (!peerId) return;

    const cleanup = StatsService.pollStats(peerId, (newStats) => {
      setStats(newStats);
      timeCounter.current += 1;
      
      setDataPoints(prev => {
        const newPoint: DataPoint = {
          time: timeCounter.current,
          upload: newStats.currentUploadBps / 1024, // Convert to KB/s for display
          download: newStats.currentDownloadBps / 1024,
        };
        
        const updated = [...prev, newPoint];
        // Keep only the last maxDataPoints
        if (updated.length > maxDataPoints) {
          return updated.slice(-maxDataPoints);
        }
        return updated;
      });
    }, 1000);

    return cleanup;
  }, [peerId, maxDataPoints]);

  // If no peerId is provided, show placeholder with mock data
  if (!peerId || !stats) {
    return (
      <Box>
        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
          {!peerId ? 'Connect to a peer to see bandwidth statistics' : 'Loading...'}
        </Typography>
        <LineChart
          xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
          series={[
            {
              label: "Upload",
              data: [0, 0, 0, 0, 0, 0],
              area: true,
              color: "#f6547d"
            },
            {
              label: "Download",
              data: [0, 0, 0, 0, 0, 0],
              area: true,
              color: "#641691"
            },
          ]}
          width={850}
          height={300}
          margin={{ left: 0, right: 0 }}
        />
      </Box>
    );
  }

  const xAxisData = dataPoints.map(d => d.time);
  const uploadData = dataPoints.map(d => d.upload);
  const downloadData = dataPoints.map(d => d.download);

  return (
    <Box>
      {/* Stats Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <CloudUploadIcon sx={{ color: '#f6547d', mr: 1 }} />
              <Typography variant="subtitle2">Upload</Typography>
            </Box>
            <Typography variant="h6" sx={{ color: '#f6547d' }}>
              {stats.currentUploadFormatted || formatBitrate(stats.currentUploadBps)}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Total: {stats.bytesSentFormatted || formatBytes(stats.bytesSent)}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <CloudDownloadIcon sx={{ color: '#641691', mr: 1 }} />
              <Typography variant="subtitle2">Download</Typography>
            </Box>
            <Typography variant="h6" sx={{ color: '#641691' }}>
              {stats.currentDownloadFormatted || formatBitrate(stats.currentDownloadBps)}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Total: {stats.bytesReceivedFormatted || formatBytes(stats.bytesReceived)}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Connected</Typography>
            <Typography variant="h6">
              {stats.duration || formatDuration(stats.durationSeconds || 0)}
            </Typography>
            <Chip 
              label="Active" 
              color="success" 
              size="small" 
              sx={{ mt: 0.5 }}
            />
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Peak Speed</Typography>
            <Typography variant="body2" sx={{ color: '#f6547d' }}>
              ↑ {stats.peakUploadFormatted || formatBitrate(stats.peakUploadBps)}
            </Typography>
            <Typography variant="body2" sx={{ color: '#641691' }}>
              ↓ {stats.peakDownloadFormatted || formatBitrate(stats.peakDownloadBps)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Live Bandwidth Chart */}
      <LineChart
        xAxis={[{ 
          data: xAxisData.length > 0 ? xAxisData : [0],
          label: 'Time (seconds)'
        }]}
        series={[
          {
            label: "Upload (KB/s)",
            data: uploadData.length > 0 ? uploadData : [0],
            area: true,
            color: "#f6547d"
          },
          {
            label: "Download (KB/s)",
            data: downloadData.length > 0 ? downloadData : [0],
            area: true,
            color: "#641691"
          },
        ]}
        width={850}
        height={300}
        margin={{ left: 50, right: 20 }}
      />
    </Box>
  );
}
