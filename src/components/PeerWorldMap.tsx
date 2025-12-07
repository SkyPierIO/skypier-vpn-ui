import React, { useEffect, useState, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { Box, Typography, Tooltip, CircularProgress, useTheme } from '@mui/material';
import { gql, useQuery } from '@apollo/client';
import { getPeerLocation, PeerLocation, getCachedLocations } from '../services/geoip.service';

// Natural Earth TopoJSON for world map
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface PeerWorldMapProps {
  height?: number;
  showTooltips?: boolean;
}

const PeerWorldMap: React.FC<PeerWorldMapProps> = ({ height = 200, showTooltips = true }) => {
  const theme = useTheme();
  const [peerLocations, setPeerLocations] = useState<PeerLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // GraphQL query for peers (same as Peers.tsx)
  const NODES_GRAPHQL = `
    {
      newPeers(first: 100) {
        from
        timestamp
        peerId
      }
    }
  `;

  const NODES_GQL = gql(NODES_GRAPHQL);
  const { data: nodesData, loading: nodesLoading } = useQuery(NODES_GQL, {
    pollInterval: 5 * 60000, // Refresh every 5 minutes
  });

  // Deduplicate and filter valid peers
  const validPeers = useMemo(() => {
    if (!nodesData?.newPeers) return [];
    
    return nodesData.newPeers
      .filter(
        (node: any, index: number, self: any[]) =>
          node.peerId &&
          node.peerId.length > 43 &&
          index === self.findIndex((item) => item.peerId === node.peerId)
      )
      .map((node: any) => node.peerId);
  }, [nodesData]);

  // Fetch locations for all peers with progress tracking
  useEffect(() => {
    if (!validPeers.length) {
      setLoading(false);
      return;
    }

    const fetchLocations = async () => {
      setLoading(true);
      const locations: PeerLocation[] = [];
      const batchSize = 5; // Process 5 peers at a time to avoid overwhelming the API
      
      for (let i = 0; i < validPeers.length; i += batchSize) {
        const batch = validPeers.slice(i, i + batchSize);
        const batchPromises = batch.map((peerId: string) => getPeerLocation(peerId));
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result) => {
          if (result.status === 'fulfilled' && result.value) {
            locations.push(result.value);
          }
        });

        // Update progress
        setLoadingProgress(Math.round(((i + batchSize) / validPeers.length) * 100));
        
        // Update locations progressively for a better UX
        setPeerLocations([...locations]);
      }

      setLoading(false);
    };

    // Start with cached locations for instant display
    setPeerLocations(getCachedLocations());
    fetchLocations();
  }, [validPeers]);

  // Aggregate peers by approximate location (round to 1 decimal place)
  const aggregatedMarkers = useMemo(() => {
    const locationMap = new Map<string, { lat: number; lng: number; count: number; peers: string[] }>();

    peerLocations.forEach((loc) => {
      // Round to 1 decimal place for aggregation
      const key = `${loc.latitude.toFixed(1)},${loc.longitude.toFixed(1)}`;
      const existing = locationMap.get(key);

      if (existing) {
        existing.count += 1;
        existing.peers.push(loc.geoIP);
      } else {
        locationMap.set(key, {
          lat: loc.latitude,
          lng: loc.longitude,
          count: 1,
          peers: [loc.geoIP],
        });
      }
    });

    return Array.from(locationMap.values());
  }, [peerLocations]);

  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box sx={{ position: 'relative', width: '100%', height }}>
      {/* Loading indicator */}
      {(loading || nodesLoading) && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            zIndex: 10,
            bgcolor: 'background.paper',
            borderRadius: 1,
            px: 1,
            py: 0.5,
          }}
        >
          <CircularProgress size={14} />
          <Typography variant="caption" color="text.secondary">
            {loadingProgress}%
          </Typography>
        </Box>
      )}

      {/* Peer count badge */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          zIndex: 10,
          bgcolor: 'background.paper',
          borderRadius: 1,
          px: 1,
          py: 0.5,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          📍 {peerLocations.length} located
        </Typography>
      </Box>

      <ComposableMap
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 147,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup center={[0, 20]} zoom={1}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isDarkMode ? '#2d3748' : '#e2e8f0'}
                  stroke={isDarkMode ? '#4a5568' : '#cbd5e0'}
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: isDarkMode ? '#3d4a5c' : '#cbd5e0' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Peer markers */}
          {aggregatedMarkers.map((marker, index) => {
            const markerSize = Math.min(4 + marker.count * 2, 16); // Scale with count, max 16px
            
            const markerElement = (
              <Marker key={index} coordinates={[marker.lng, marker.lat]}>
                <circle
                  r={markerSize}
                  fill="#6366f1"
                  fillOpacity={0.7}
                  stroke="#fff"
                  strokeWidth={1}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                />
                {marker.count > 1 && (
                  <text
                    textAnchor="middle"
                    y={4}
                    style={{
                      fontFamily: 'system-ui',
                      fontSize: markerSize * 0.8,
                      fill: '#fff',
                      fontWeight: 'bold',
                      pointerEvents: 'none',
                    }}
                  >
                    {marker.count}
                  </text>
                )}
              </Marker>
            );

            if (showTooltips) {
              const uniqueLocations = [...new Set(marker.peers)];
              const tooltipContent = uniqueLocations.length > 3
                ? `${uniqueLocations.slice(0, 3).join(', ')} +${uniqueLocations.length - 3} more`
                : uniqueLocations.join(', ');

              return (
                <Tooltip
                  key={index}
                  title={`${marker.count} peer${marker.count > 1 ? 's' : ''}: ${tooltipContent}`}
                  arrow
                >
                  {markerElement}
                </Tooltip>
              );
            }

            return markerElement;
          })}
        </ZoomableGroup>
      </ComposableMap>
    </Box>
  );
};

export default PeerWorldMap;
