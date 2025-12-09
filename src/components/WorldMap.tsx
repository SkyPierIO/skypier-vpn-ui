import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import * as topojson from 'topojson-client';
import { Box, useTheme } from '@mui/material';

interface PeerLocation {
  peerId: string;
  latitude: number;
  longitude: number;
  countryCode: string;
  city: string;
  country: string;
  status?: string;
}

interface WorldMapProps {
  peers: PeerLocation[];
  selectedPeerId: string | null;
  connectedPeerId: string | null;
  userLocation: { latitude: number; longitude: number } | null;
  onPeerSelect?: (peerId: string) => void;
  fullscreen?: boolean;
}

// City aggregation for marker sizing
interface CityGroup {
  key: string;
  latitude: number;
  longitude: number;
  peers: PeerLocation[];
  countryCode: string;
  city: string;
}

const WorldMap = ({ peers, selectedPeerId, connectedPeerId, userLocation, onPeerSelect, fullscreen = false }: WorldMapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const theme = useTheme();
  const [worldData, setWorldData] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 });

  // Theme colors - using emerald green (#10b981, #059669) consistent with Dashboard
  const isDark = theme.palette.mode === 'dark';
  const landColor = isDark ? '#374151' : '#c8d3e2';
  const borderColor = isDark ? '#000000ff' : '#64748b';
  const oceanColor = 'transparent';
  const markerColor = '#10b981';
  const selectedMarkerColor = '#059669';
  const connectedMarkerColor = '#f59e0b';
  const highlightCountryColor = isDark ? '#4b5563' : '#cbd5e1';
  const connectionLineColor = '#10b981';

  // Load world topology data
  useEffect(() => {
    const loadWorldData = async () => {
      try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
        const data = await response.json();
        setWorldData(data);
      } catch (error) {
        console.error('Failed to load world map data:', error);
      }
    };
    loadWorldData();
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: width,
          height: height > 0 ? height : Math.max(400, width * 0.5)
        });
      }
    };

    handleResize();
    // Use ResizeObserver for more reliable size tracking
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', handleResize);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Group peers by city for marker sizing
  const cityGroups: CityGroup[] = peers.reduce((acc: CityGroup[], peer) => {
    if (!peer.latitude || !peer.longitude) return acc;
    
    const key = `${peer.latitude.toFixed(1)}-${peer.longitude.toFixed(1)}`;
    const existing = acc.find(g => g.key === key);
    
    if (existing) {
      existing.peers.push(peer);
    } else {
      acc.push({
        key,
        latitude: peer.latitude,
        longitude: peer.longitude,
        peers: [peer],
        countryCode: peer.countryCode,
        city: peer.city
      });
    }
    return acc;
  }, []);

  // Get country codes that have peers
  const peerCountryCodes = [...new Set(peers.map(p => p.countryCode?.toUpperCase()))];

  // Find selected peer location
  const selectedPeer = peers.find(p => p.peerId === selectedPeerId);
  const connectedPeer = peers.find(p => p.peerId === connectedPeerId);

  // Center map on selected peer
  useEffect(() => {
    if (!svgRef.current || !selectedPeer || !zoomRef.current || !selectedPeer.latitude || !selectedPeer.longitude) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;

    // Setup projection (same as in render)
    const projection = geoNaturalEarth1()
      .scale(fullscreen ? width / 4.5 : width / 5.5)
      .translate([width / 2, height / 2]);

    const coords = projection([selectedPeer.longitude, selectedPeer.latitude]);
    if (!coords) return;

    // Get current transform
    const currentTransform = d3.zoomTransform(svgRef.current);
    const scale = currentTransform.k;

    // Calculate new transform to center on the peer
    const x = width / 2 - coords[0] * scale;
    const y = height / 2 - coords[1] * scale;

    // Animate to the new position
    svg.transition()
      .duration(750)
      .call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(x, y).scale(scale)
      );
  }, [selectedPeerId, dimensions, fullscreen]);

  // Render map
  useEffect(() => {
    if (!svgRef.current || !worldData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    // Setup projection
    const projection = geoNaturalEarth1()
      .scale(fullscreen ? width / 4.5 : width / 5.5)
      .translate([width / 2, height / 2]);

    const pathGenerator = geoPath().projection(projection);

    // Convert TopoJSON to GeoJSON
    const countries = topojson.feature(worldData, worldData.objects.countries) as any;

    // Create a group for all map elements (for potential zoom/pan)
    const mapGroup = svg.append('g').attr('class', 'map-group');

    // Setup zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        mapGroup.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    // Background ocean
    mapGroup.append('rect')
      .attr('width', width * 3)
      .attr('height', height * 3)
      .attr('x', -width)
      .attr('y', -height)
      .attr('fill', oceanColor);

    // Draw countries
    mapGroup.selectAll('.country')
      .data(countries.features)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', pathGenerator as any)
      .attr('fill', (d: any) => {
        // Highlight countries with peers
        const countryId = d.id;
        // Note: country IDs in the dataset are numeric, need to match with country codes
        return landColor;
      })
      .attr('stroke', borderColor)
      .attr('stroke-width', 0.5);

    // Defs for animation
    const defs = svg.append('defs');
    
    // Animated dash pattern for connection line
    defs.append('style')
      .text(`
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .connection-line {
          animation: dash 0.5s linear infinite;
        }
      `);

    // Draw connection line if connected
    if (connectedPeer && userLocation && connectedPeer.latitude && connectedPeer.longitude) {
      const userCoords = projection([userLocation.longitude, userLocation.latitude]);
      const peerCoords = projection([connectedPeer.longitude, connectedPeer.latitude]);

      if (userCoords && peerCoords) {
        // Calculate curved path
        const midX = (userCoords[0] + peerCoords[0]) / 2;
        const midY = Math.min(userCoords[1], peerCoords[1]) - 50;

        mapGroup.append('path')
          .attr('class', 'connection-line')
          .attr('d', `M ${userCoords[0]} ${userCoords[1]} Q ${midX} ${midY} ${peerCoords[0]} ${peerCoords[1]}`)
          .attr('fill', 'none')
          .attr('stroke', connectedMarkerColor)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5,5')
          .style('animation', 'dash 0.5s linear infinite');

        // User location marker
        mapGroup.append('circle')
          .attr('cx', userCoords[0])
          .attr('cy', userCoords[1])
          .attr('r', 6)
          .attr('fill', '#3b82f6')
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
      }
    }

    // Draw peer markers
    cityGroups.forEach((group) => {
      const coords = projection([group.longitude, group.latitude]);
      if (!coords) return;

      const isSelected = group.peers.some(p => p.peerId === selectedPeerId);
      const isConnected = group.peers.some(p => p.peerId === connectedPeerId);
      const peerCount = group.peers.length;
      
      // Base size + bonus for multiple peers
      const baseSize = fullscreen ? 8 : 6;
      const size = baseSize + Math.min(peerCount - 1, 4) * 2;

      // Outer glow for selected/connected
      if (isSelected || isConnected) {
        mapGroup.append('circle')
          .attr('cx', coords[0])
          .attr('cy', coords[1])
          .attr('r', size + 4)
          .attr('fill', 'none')
          .attr('stroke', isConnected ? connectedMarkerColor : selectedMarkerColor)
          .attr('stroke-width', 2)
          .attr('opacity', 0.6);
      }

      // Main marker
      const marker = mapGroup.append('circle')
        .attr('cx', coords[0])
        .attr('cy', coords[1])
        .attr('r', size)
        .attr('fill', isConnected ? connectedMarkerColor : isSelected ? selectedMarkerColor : markerColor)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .attr('cursor', 'pointer')
        .attr('opacity', 0.9);

      // Click handler
      marker.on('click', () => {
        if (group.peers.length === 1 && onPeerSelect) {
          onPeerSelect(group.peers[0].peerId);
        }
      });

      // Tooltip
      marker.append('title')
        .text(`${group.city}: ${peerCount} peer${peerCount > 1 ? 's' : ''}`);

      // Peer count label for groups with multiple peers
      if (peerCount > 1) {
        mapGroup.append('text')
          .attr('x', coords[0])
          .attr('y', coords[1] + 1)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#fff')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .attr('pointer-events', 'none')
          .text(peerCount);
      }
    });

  }, [worldData, dimensions, peers, selectedPeerId, connectedPeerId, userLocation, theme.palette.mode, cityGroups, fullscreen]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 300,
        borderRadius: fullscreen ? 0 : 2,
        overflow: 'hidden',
        bgcolor: oceanColor,
        cursor: 'grab',
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ display: 'block' }}
      />
    </Box>
  );
};

export default WorldMap;
