import React, { useState, useEffect, useRef } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import StatsService from '../services/stats.service';
import { ConnectionStats, formatBitrate } from '../types/stats.type';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [stats, setStats] = useState<ConnectionStats | null>(null);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const timeCounter = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(800);

  // Responsive chart sizing
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setChartWidth(Math.max(300, width - 20));
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

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
        const effectiveMax = isMobile ? 30 : maxDataPoints;
        if (updated.length > effectiveMax) {
          return updated.slice(-effectiveMax);
        }
        return updated;
      });
    }, 1000);

    return cleanup;
  }, [peerId, maxDataPoints, isMobile]);

  const chartHeight = isMobile ? 200 : isTablet ? 250 : 300;

  // If no peerId is provided, show placeholder
  if (!peerId) {
    return (
      <Box 
        ref={containerRef}
        sx={{ 
          width: '100%',
          minHeight: chartHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover',
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Connect to a peer to see bandwidth statistics
        </Typography>
      </Box>
    );
  }

  const xAxisData = dataPoints.map(d => d.time);
  const uploadData = dataPoints.map(d => d.upload);
  const downloadData = dataPoints.map(d => d.download);

  // Show loading state
  if (dataPoints.length === 0) {
    return (
      <Box 
        ref={containerRef}
        sx={{ 
          width: '100%',
          minHeight: chartHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover',
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Collecting data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box ref={containerRef} sx={{ width: '100%' }}>
      <LineChart
        xAxis={[{ 
          data: xAxisData,
          scaleType: 'linear',
          tickMinStep: isMobile ? 10 : 5,
        }]}
        yAxis={[{
          label: isMobile ? '' : 'KB/s',
          min: 0,
        }]}
        series={[
          {
            label: isMobile ? '↑' : 'Upload',
            data: uploadData,
            area: true,
            color: '#f6547d',
            showMark: false,
            disableHighlight: true,
          },
          {
            label: isMobile ? '↓' : 'Download',
            data: downloadData,
            area: true,
            color: '#641691',
            showMark: false,
            disableHighlight: true,
          },
        ]}
        width={chartWidth}
        height={chartHeight}
        skipAnimation
        disableAxisListener
        margin={{ 
          left: isMobile ? 40 : 60, 
          right: isMobile ? 10 : 20,
          top: 20,
          bottom: isMobile ? 30 : 40,
        }}
        sx={{
          '.MuiLineElement-root': {
            strokeWidth: 2,
          },
          '.MuiAreaElement-root': {
            fillOpacity: 0.15,
          },
        }}
      />
      
      {/* Current Speed Indicators */}
      {stats && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: { xs: 2, md: 4 },
            mt: 1,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f6547d' }} />
            <Typography variant="caption" color="text.secondary">
              Upload: <strong style={{ color: '#f6547d' }}>
                {stats.currentUploadFormatted || formatBitrate(stats.currentUploadBps)}
              </strong>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#641691' }} />
            <Typography variant="caption" color="text.secondary">
              Download: <strong style={{ color: '#641691' }}>
                {stats.currentDownloadFormatted || formatBitrate(stats.currentDownloadBps)}
              </strong>
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
