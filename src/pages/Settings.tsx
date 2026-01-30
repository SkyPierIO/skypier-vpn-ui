
import { useEffect, useState, useContext } from "react";
import { ColorModeContext } from "../App";
import { useTheme } from "@mui/material/styles";
import http from "../http.common";

import { styled } from '@mui/material/styles';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch, { SwitchProps } from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { 
  Button, 
  TextField, 
  Box, 
  Stack,
  Alert,
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import CodeIcon from '@mui/icons-material/Code';

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
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" mb={3} gutterBottom color="text.primary">
        Settings
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      )}

      {/* Theme Settings */}
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography variant="h6">Theme</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose between light and dark theme.
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <ThemeSwitch
                  checked={theme.palette.mode === 'dark'}
                  onChange={colorMode.toggleColorMode}
                />
              }
              label={theme.palette.mode === 'dark' ? "Dark mode" : "Light mode"}
            />
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Skypier Configuration */}
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6">Skypier Configuration</Typography>
            {isSaving && <CircularProgress size={20} />}
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : config ? (
            <Stack spacing={3}>
              <Typography variant="body2" color="text.secondary">
                Configure your Skypier client settings below.
              </Typography>

              {/* Nickname */}
              <TextField
                label="Nickname"
                value={config.nickname || ''}
                onChange={(e) => handleConfigChange('nickname', e.target.value)}
                fullWidth
                helperText="A friendly name for your Skypier node"
              />

              {/* Log Level */}
              <TextField
                label="Log Level"
                value={config.logLevel || ''}
                onChange={(e) => handleConfigChange('logLevel', e.target.value)}
                fullWidth
                select
                SelectProps={{ native: true }}
                helperText="Set the verbosity of logs"
              >
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warn">Warn</option>
                <option value="error">Error</option>
              </TextField>

              {/* Private Key */}
              <TextField
                label="Private Key"
                value={config.privateKey || ''}
                onChange={(e) => handleConfigChange('privateKey', e.target.value)}
                fullWidth
                type="password"
                helperText="Your node's private key (keep this secure!)"
                InputProps={{
                  sx: { fontFamily: 'monospace' }
                }}
              />

              <Divider />

              {/* Boolean Switches */}
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Feature Toggles
                </Typography>
                
                <Stack spacing={1}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.advertisePrivateAddresses || false}
                        onChange={(e) => handleConfigChange('advertisePrivateAddresses', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">Advertise Private Addresses</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Allow advertising of private network addresses
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.swaggerEnabled || false}
                        onChange={(e) => handleConfigChange('swaggerEnabled', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">Swagger API Documentation</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Enable the Swagger UI for API testing
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.dhtDiscovery || false}
                        onChange={(e) => handleConfigChange('dhtDiscovery', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">DHT Discovery</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Enable peer discovery via Distributed Hash Table
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.enableProfiling || false}
                        onChange={(e) => handleConfigChange('enableProfiling', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">Enable Profiling</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Enable performance profiling (for debugging)
                        </Typography>
                      </Box>
                    }
                  />
                </Stack>
              </Box>

              <Divider />

              {/* Profiling Port */}
              <TextField
                label="Profiling Port"
                type="number"
                value={config.profilingPort || 6060}
                onChange={(e) => handleConfigChange('profilingPort', parseInt(e.target.value) || 6060)}
                fullWidth
                helperText="Port for the profiling server"
                disabled={!config.enableProfiling}
              />

              {/* Advanced: Raw JSON Editor */}
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Chip
                    icon={<CodeIcon />}
                    label={showRawJson ? "Hide Raw JSON" : "Show Raw JSON"}
                    onClick={() => setShowRawJson(!showRawJson)}
                    variant={showRawJson ? "filled" : "outlined"}
                    color="primary"
                    size="small"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Advanced users only
                  </Typography>
                </Stack>

                {showRawJson && (
                  <TextField
                    multiline
                    rows={12}
                    value={rawJsonText}
                    onChange={(e) => setRawJsonText(e.target.value)}
                    fullWidth
                    sx={{
                      '& textarea': {
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                      }
                    }}
                    helperText="Edit the raw JSON configuration (be careful!)"
                  />
                )}
              </Box>

              {/* Save Button */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={updateConfig}
                  disabled={isSaving}
                  size="large"
                >
                  {isSaving ? 'Saving...' : 'Save Configuration'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={fetchConfig}
                  disabled={isSaving}
                >
                  Reset
                </Button>
              </Box>
            </Stack>
          ) : (
            <Alert severity="error">Failed to load configuration</Alert>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Swagger Documentation */}
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
        >
          <Typography variant="h6">API Documentation</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Access the Swagger UI for API testing and documentation.
          </Typography>
          <Button
            variant="outlined"
            href="/swagger/index.html"
            target="_blank"
            disabled={!config?.swaggerEnabled}
            sx={{ mt: 2 }}
          >
            Open Swagger UI
          </Button>
          {!config?.swaggerEnabled && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Enable Swagger in the configuration above to access the API documentation
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};
export default Settings;
