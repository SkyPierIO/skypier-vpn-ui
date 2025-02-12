// REACT
import * as React from "react";

// COMPONENTS
import IpLocation from "./components/IpLocation"
import Login from "./components/Login"

// MUI ICONS
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItemIcon from "@mui/material/ListItemIcon";
import InsightsIcon from '@mui/icons-material/Insights';
import SettingsIcon from '@mui/icons-material/Settings';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExploreIcon from '@mui/icons-material/Explore';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import CardMembershipIcon from '@mui/icons-material/CardMembership';

// MUI
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { Stack, Fab } from "@mui/material";

import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import QuitButton from "./components/QuitButton";


const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const fabStyle = {
	position: 'absolute',
	bottom: 16,
	right: 16,
  backgroundColor: "#7355b9"
  };
  

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));


const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

function MyApp() {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);

  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const fabHeaderStyle = {
    borderRadius: "var(--wui-border-radius-3xl)",
    textTransform: "none",
    fontSize: "16px",
    color: "#fff",
    display: "flex",
    padding: "7px 12px 7px 8px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    backgroundColor:"rgba(255, 255, 255, 0.05)",
    boxShadow: "none",
    gap: "8px",
    fontWeight:"bold",
    fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
    '&:hover': {
      backgroundColor:"rgba(255, 255, 255, 0.1)"
    }
  };

  return (
    <Box sx={{ display: "flex" }} >
        <AppBar position="fixed" open={open}>
          <Toolbar sx={{backdropFilter: "blur(8px)"}} className={`main-toolbar toolbar-${theme.palette.mode}`}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                marginRight: 2,
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
        <Typography component="div" sx={{ flexGrow: 1 }}>
          <a href="/">
            <img
              src="/logo.svg"
              alt="Skypier Logo"
              height="35"
            />
          </a>
            </Typography>
            <Box>
        <Stack direction="row" spacing={1}>
          <IpLocation></IpLocation>
          {/* <w3m-network-button /> */}
          <w3m-button />
          <Fab sx={fabHeaderStyle} onClick={colorMode.toggleColorMode} size="medium" variant="extended" color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </Fab>
          <QuitButton />
        </Stack>
        </Box>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <DrawerHeader className="drawerHeader">
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "rtl" ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            {["Dashboard", "Explore peers", "Saved peers", "Host a node", "My subscription"].map((text, index) => (
              <ListItem key={text} disablePadding sx={{ display: "block"}}>
                <ListItemButton
                  href={"/"+text.replace(/\s/g, "_")}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                    }}
                  >
                    {{	0: <InsightsIcon color="disabled"/>,
                        1: <ExploreIcon color="disabled"/>,
                        2: <AutoAwesomeIcon color="disabled"/>,
                        3: <ViewInArIcon color="disabled"/>,
                        4: <CardMembershipIcon color="disabled"/>,
                      }[index]}
                  </ListItemIcon>
                  <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            {["Settings"].map((text, index) => (
              <ListItem key={text} disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  href={"/"+text.replace(/\s/g, "_")}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                    }}
                  >
            {{0: <SettingsIcon color="disabled"/>	}[index]}
                  </ListItemIcon>
                  <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Box component="main" className={`main-${theme.palette.mode}`} sx={{ flexGrow: 1, p: 3, minHeight:"100vh"}}>
          <DrawerHeader />
            <Login/>
            {/* <Fab sx={fabStyle} aria-label="fff" color="secondary" variant="extended">
              <ElectricalServicesIcon />
                FastConnect
            </Fab> */}
        </Box>
      </Box>
  );
}



export default function App() {

  const [mode, setMode] = React.useState<'light' | 'dark'>('dark');
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <MyApp />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
