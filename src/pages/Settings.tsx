
import { useEffect, useState } from "react";
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
import { Button, TextareaAutosize } from "@mui/material";

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
  // const [theme, setTheme] = useState<string>("");

  // const GetTheme = async () => {
  //   try {
  //     const response = await http.get(`/getConfig`);
  //     if (response.status === 200) {
  //       console.log(response.data.uiTheme);
  //       if (response.data.uiTheme) {
  //         setTheme(response.data.uiTheme);
  //       }
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };
  // GetTheme();

  const [config, setConfig] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchConfig = async () => {
    try {
      const response = await http.get(`/getConfig`);
      if (response.status === 200) {
        setConfig(JSON.stringify(response.data, null, 2)); // Convert JSON object to string with indentation
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async () => {
    try {
      const parsedConfig = JSON.parse(config); // Ensure the config is valid JSON
      const response = await http.post(`/updateConfig`, parsedConfig);
      if (response.status === 200) {
        alert("Configuration updated successfully");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update configuration. Please ensure the configuration is valid JSON.");
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <div>
      <Typography variant="h4" mb={2} gutterBottom color="text.primary">Settings</Typography>

      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography variant="h6">Theme</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" color="text.secondary">
            Choose between light and dark theme.
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={<ThemeSwitch sx={{ m: 1 }} defaultChecked />}
              label={" mode"}
            />
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <Typography variant="h6">Skypier client configuration</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" color="text.secondary">
            Edit the Skypier configuration below:
          </Typography>
          <TextareaAutosize
            minRows={10}
            style={{ width: '100%', padding: '8px', fontSize: '16px', borderRadius: '4px', borderColor: '#ccc' }}
            value={config}
            onChange={(e) => setConfig(e.target.value)}
          />
          <Button variant="outlined" onClick={updateConfig} disabled={isLoading}>
            Update configuration
          </Button>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <Typography variant="h6">Swagger</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            In debug mode you can use the Skypier Swagger UI.
          </Typography>
          <Typography>
            Visit Swagger API <a href="/swagger/index.html">here</a>
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion disabled>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
        >
          <Typography variant="h6">More controls to come...</Typography>
        </AccordionSummary>
      </Accordion>
    </div>

  );
};
export default Settings;
