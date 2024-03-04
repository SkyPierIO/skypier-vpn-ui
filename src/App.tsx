import * as React from "react";
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';

import Dashboard from "./pages/Dashboard";
import Peers from "./pages/Peers";

import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InsightsIcon from '@mui/icons-material/Insights';
import SettingsIcon from '@mui/icons-material/Settings';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExploreIcon from '@mui/icons-material/Explore';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import { Stack } from "@mui/material";
import Fab from '@mui/material/Fab';


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

export default function App() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }} >
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{backdropFilter: "blur(8px)"}} className="main-toolbar">
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
			<img
				src="/logo.svg"
				alt="Skypier Logo"
				height="35"
			/>
          </Typography>
          <Box>
			<Stack direction="row" spacing={1}>
				<w3m-network-button />
          		<w3m-button />
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
            <ListItem key={text} disablePadding sx={{ display: "block", color: "#eee"}}>
              <ListItemButton
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
      <Box component="main" className="main" sx={{ flexGrow: 1, p: 3, minHeight:"100vh"}}>
        <DrawerHeader />

          <BrowserRouter>      
            <Routes>
              <Route path="/" element={<Dashboard/>}/>
              <Route path="/peers" element={<Peers/>}/>
            </Routes>
          </BrowserRouter>

          <Fab sx={fabStyle} aria-label="fff" color="secondary" variant="extended">
            <ElectricalServicesIcon />
			FastConnect
          </Fab>
      </Box>
    </Box>
  );
}
