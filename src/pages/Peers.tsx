import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

const Peers = () => {

  return (
    <div>
      <h1>Peers</h1>
      <List>
          {["Dashboard", "Explore peers", "Saved peers", "Host a node", "My subscription"].map((text, index) => (
            <ListItem key={text} disablePadding sx={{ display: "block", color: "#eee"}}>
              <ListItemButton
                href={text.replace(/\s/g, "_")}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                }}
              >
                <ListItemText primary={text}/>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
    </div>
  );
};
export default Peers;
