import { AppBar, Toolbar, Typography, IconButton, Badge, Avatar, Box } from '@mui/material';
import { Menu as MenuIcon, Notifications } from '@mui/icons-material';

function Navbar({ toggleDrawer }) {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={toggleDrawer}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          JuntaAIBank
        </Typography>
        <IconButton color="inherit">
          <Badge badgeContent={3} color="error">
            <Notifications />
          </Badge>
        </IconButton>
        <IconButton sx={{ ml: 2 }}>
          <Avatar sx={{ bgcolor: 'secondary.main' }}>U</Avatar>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;