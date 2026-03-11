import { useEffect, useState, useContext } from "react";
import { ColorModeContext } from "../App";
import { useTheme, alpha } from "@mui/material/styles";
import http from "../http.common";

import { styled } from '@mui/material/styles';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch, { SwitchProps } from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import {
  Button,
  TextField,
  Box,
  Stack,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Tooltip,
  Collapse,
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import CodeIcon from '@mui/icons-material/Code';
import PaletteIcon from '@mui/icons-material/Palette';
import TuneIcon from '@mui/icons-material/Tune';
import ApiIcon from '@mui/icons-material/Api';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import KeyIcon from '@mui/icons-material/Key';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

// ─── Custom Moon/Sun Switch ───────────────────────────────────────────────────
const ThemeSwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff',
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
    width: 32,
    height: 32,
    '&::before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        '#fff',
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
    borderRadius: 20 / 2,
  },
}));

// ─── Section Card ─────────────────────────────────────────────────────────────
interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  gradient: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const SectionCard = ({
  icon, title, subtitle, color, gradient, children, defaultOpen = true,
}: SectionCardProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
      {/* Section header */}
      <Box
        onClick={() => setOpen(o => !o)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: { xs: 2, md: 3 },
          py: 2,
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'background 0.2s ease',
          '&:hover': { bgcolor: alpha(color, 0.06) },
        }}
      >
        <Avatar
          sx={{
            width: 44,
            height: 44,
            background: gradient,
            boxShadow: `0 4px 14px ${alpha(color, 0.4)}`,
            flexShrink: 0,
            '& .MuiSvgIcon-root': { fontSize: 20, color: '#fff' },
          }}
        >
          {icon}
        </Avatar>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>

        <Box
          sx={{
            color: 'text.secondary',
            transition: 'transform 0.25s ease',
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
          }}
        >
          <ExpandMoreIcon />
        </Box>
      </Box>

      <Collapse in={open}>
        <Divider />
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          {children}
        </CardContent>
      </Collapse>
    </Card>
  );
};

// ─── Feature Toggle Row ───────────────────────────────────────────────────────
interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  color?: string;
}

const ToggleRow = ({ label, description, checked, onChange, color = '#6366f1' }: ToggleRowProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      px: 2,
      py: 1.5,
      borderRadius: 2,
      border: '1px solid',
      borderColor: checked ? alpha(color, 0.3) : 'divider',
      bgcolor: checked ? alpha(color, 0.04) : 'transparent',
      transition: 'all 0.2s ease',
    }}
  >
    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {description}
      </Typography>
    </Box>
    <Switch
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      sx={{
        flexShrink: 0,
        '& .MuiSwitch-switchBase.Mui-checked': { color },
        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
          backgroundColor: color,
        },
      }}
    />
  </Box>
);

// ─── Main Settings Component ──────────────────────────────────────────────────
const Settings = () => {
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showRawJson, setShowRawJson] = useState<boolean>(false);
  const [rawJsonText, setRawJsonText] = useState<string>("");

  const fetchConfig = async () => {
    try {
      const response = await http.get(`/getConfig`);
      if (response.status === 200) {
        setConfig(response.data);
        setRawJsonText(JSON.stringify(response.data, null, 2));
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to load configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async () => {
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");
    try {
      const configToSave = showRawJson ? JSON.parse(rawJsonText) : config;
      const response = await http.post(`/updateConfig`, configToSave);
      if (response.status === 200) {
        setSuccessMessage("Configuration updated successfully!");
        setConfig(configToSave);
        setRawJsonText(JSON.stringify(configToSave, null, 2));
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to update configuration. Please ensure all values are valid.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfigChange = (field: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [field]: value }));
  };

  const colorMode = useContext(ColorModeContext);
  const theme = useTheme();

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>

      {/* ── Page Header ── */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography
          variant="h4"
          color="text.primary"
          sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }, mb: 0.5 }}
        >
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your Skypier node configuration and preferences
        </Typography>
      </Box>

      {/* ── Alerts ── */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      )}

      <Stack spacing={2.5}>

        {/* ── Theme Section ── */}
        <SectionCard
          icon={<PaletteIcon />}
          title="Appearance"
          subtitle="Choose your preferred colour theme"
          color="#6366f1"
          gradient="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              px: 2,
              py: 1.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha('#6366f1', 0.2),
              bgcolor: alpha('#6366f1', 0.04),
            }}
          >
            <Avatar
              sx={{
                bgcolor: alpha('#6366f1', 0.12),
                color: '#6366f1',
                width: 36,
                height: 36,
              }}
            >
              {theme.palette.mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {theme.palette.mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Toggle between light and dark interface
              </Typography>
            </Box>
            <ThemeSwitch
              checked={theme.palette.mode === 'dark'}
              onChange={colorMode.toggleColorMode}
            />
          </Box>
        </SectionCard>

        {/* ── Skypier Config Section ── */}
        <SectionCard
          icon={<TuneIcon />}
          title="Skypier Configuration"
          subtitle="Node identity, network and feature settings"
          color="#f6547d"
          gradient="linear-gradient(135deg, #f6547d 0%, #ec4899 100%)"
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#f6547d' }} />
            </Box>
          ) : config ? (
            <Stack spacing={2.5}>

              {/* Node Identity */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, mb: 1.5, display: 'block' }}>
                  Node Identity
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Nickname"
                    value={config.nickname || ''}
                    onChange={(e) => handleConfigChange('nickname', e.target.value)}
                    fullWidth
                    helperText="A friendly name for your Skypier node"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <TextField
                    label="Private Key"
                    value={config.privateKey || ''}
                    onChange={(e) => handleConfigChange('privateKey', e.target.value)}
                    fullWidth
                    type="password"
                    helperText="Your node's private key — keep this secure!"
                    InputProps={{ sx: { fontFamily: 'monospace', borderRadius: 2 } }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Stack>
              </Box>

              <Divider />

              {/* Logging */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, mb: 1.5, display: 'block' }}>
                  Logging
                </Typography>
                <TextField
                  label="Log Level"
                  value={config.logLevel || ''}
                  onChange={(e) => handleConfigChange('logLevel', e.target.value)}
                  fullWidth
                  select
                  SelectProps={{ native: true }}
                  helperText="Set the verbosity of logs"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  <option value="debug">Debug</option>
                  <option value="info">Info</option>
                  <option value="warn">Warn</option>
                  <option value="error">Error</option>
                </TextField>
              </Box>

              <Divider />

              {/* Feature Toggles */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, mb: 1.5, display: 'block' }}>
                  Feature Toggles
                </Typography>
                <Stack spacing={1.5}>
                  <ToggleRow
                    label="Advertise Private Addresses"
                    description="Allow advertising of private network addresses"
                    checked={config.advertisePrivateAddresses || false}
                    onChange={(val) => handleConfigChange('advertisePrivateAddresses', val)}
                    color="#6366f1"
                  />
                  <ToggleRow
                    label="Swagger API Documentation"
                    description="Enable the Swagger UI for API testing"
                    checked={config.swaggerEnabled || false}
                    onChange={(val) => handleConfigChange('swaggerEnabled', val)}
                    color="#f6547d"
                  />
                  <ToggleRow
                    label="DHT Discovery"
                    description="Enable peer discovery via Distributed Hash Table"
                    checked={config.dhtDiscovery || false}
                    onChange={(val) => handleConfigChange('dhtDiscovery', val)}
                    color="#10b981"
                  />
                  <ToggleRow
                    label="Enable Profiling"
                    description="Performance profiling (for debugging)"
                    checked={config.enableProfiling || false}
                    onChange={(val) => handleConfigChange('enableProfiling', val)}
                    color="#f59e0b"
                  />
                </Stack>
              </Box>

              {config.enableProfiling && (
                <>
                  <Divider />
                  <TextField
                    label="Profiling Port"
                    type="number"
                    value={config.profilingPort || 6060}
                    onChange={(e) => handleConfigChange('profilingPort', parseInt(e.target.value) || 6060)}
                    fullWidth
                    helperText="Port for the profiling server"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </>
              )}

              <Divider />

              {/* Raw JSON Editor */}
              <Box>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                  <Chip
                    icon={<CodeIcon />}
                    label={showRawJson ? "Hide Raw JSON" : "Edit Raw JSON"}
                    onClick={() => setShowRawJson(!showRawJson)}
                    variant={showRawJson ? "filled" : "outlined"}
                    color="primary"
                    size="small"
                    sx={{ borderRadius: 1.5 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Advanced users only
                  </Typography>
                </Stack>

                <Collapse in={showRawJson}>
                  <TextField
                    multiline
                    rows={12}
                    value={rawJsonText}
                    onChange={(e) => setRawJsonText(e.target.value)}
                    fullWidth
                    sx={{
                      '& textarea': { fontFamily: 'monospace', fontSize: '0.875rem' },
                      '& .MuiOutlinedInput-root': { borderRadius: 2 },
                    }}
                    helperText="Edit the raw JSON configuration (be careful!)"
                  />
                </Collapse>
              </Box>

              {/* Action Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} pt={0.5}>
                <Button
                  variant="contained"
                  startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                  onClick={updateConfig}
                  disabled={isSaving}
                  size="large"
                  sx={{
                    background: 'linear-gradient(135deg, #f6547d 0%, #ec4899 100%)',
                    boxShadow: `0 4px 14px ${alpha('#f6547d', 0.4)}`,
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 3,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #e8456e 0%, #db2777 100%)',
                      boxShadow: `0 6px 20px ${alpha('#f6547d', 0.5)}`,
                    },
                    '&:disabled': { opacity: 0.6 },
                  }}
                >
                  {isSaving ? 'Saving…' : 'Save Configuration'}
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchConfig}
                  disabled={isSaving}
                  size="large"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderColor: alpha('#f6547d', 0.4),
                    color: '#f6547d',
                    '&:hover': {
                      borderColor: '#f6547d',
                      bgcolor: alpha('#f6547d', 0.06),
                    },
                  }}
                >
                  Reset
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Alert severity="error">Failed to load configuration</Alert>
          )}
        </SectionCard>

        {/* ── API Documentation Section ── */}
        <SectionCard
          icon={<ApiIcon />}
          title="API Documentation"
          subtitle="Swagger UI for testing and exploring the REST API"
          color="#10b981"
          gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
          defaultOpen={false}
        >
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Access the Swagger UI to explore and test all available API endpoints.
              Make sure Swagger is enabled in the configuration above.
            </Typography>

            <Box
              component={config?.swaggerEnabled ? 'a' : 'div'}
              href={config?.swaggerEnabled ? '/swagger/index.html' : undefined}
              target="_blank"
              rel="noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                textDecoration: 'none',
                border: '1px solid',
                borderColor: config?.swaggerEnabled ? alpha('#10b981', 0.3) : 'divider',
                opacity: config?.swaggerEnabled ? 1 : 0.45,
                cursor: config?.swaggerEnabled ? 'pointer' : 'not-allowed',
                transition: 'all 0.25s ease',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(135deg, ${alpha('#10b981', 0)} 0%, ${alpha('#10b981', 0.08)} 100%)`,
                  opacity: 0,
                  transition: 'opacity 0.25s ease',
                },
                ...(config?.swaggerEnabled && {
                  '&:hover': {
                    borderColor: alpha('#10b981', 0.6),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 24px ${alpha('#10b981', 0.2)}`,
                    '&::before': { opacity: 1 },
                    '& .api-arrow': { transform: 'translateX(4px)', opacity: 1 },
                  },
                }),
              }}
            >
              <Avatar
                sx={{
                  width: 42,
                  height: 42,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: config?.swaggerEnabled ? `0 4px 12px ${alpha('#10b981', 0.35)}` : 'none',
                  '& .MuiSvgIcon-root': { fontSize: 20, color: '#fff' },
                }}
              >
                <ApiIcon />
              </Avatar>

              <Box sx={{ flexGrow: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2, color: 'text.primary' }}>
                  Open Swagger UI
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {config?.swaggerEnabled ? 'Opens in a new tab' : 'Enable Swagger in configuration first'}
                </Typography>
              </Box>

              <Box
                className="api-arrow"
                sx={{
                  color: '#10b981',
                  opacity: 0.45,
                  transition: 'transform 0.25s ease, opacity 0.25s ease',
                  display: 'flex',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <OpenInNewIcon sx={{ fontSize: 18 }} />
              </Box>
            </Box>

            {!config?.swaggerEnabled && (
              <Typography variant="caption" color="text.secondary">
                Enable <strong>Swagger API Documentation</strong> in the Skypier Configuration section above, then save.
              </Typography>
            )}
          </Stack>
        </SectionCard>

      </Stack>
    </Box>
  );
};

export default Settings;
