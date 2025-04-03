import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Container, styled, Button, Stack, useMediaQuery, useTheme, IconButton, Menu, MenuItem } from '@mui/material';
import {
  Fullscreen, Dashboard,
  // Cloud, 
  Language, Menu as MenuIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useState } from 'react';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
}));

const ContentContainer = styled(Container)({
  padding: 0, // Remove padding
  height: 'calc(100vh - 64px)', // Subtract only the AppBar height
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden', // Prevent scrolling at this level
});

const AnimatedContent = styled(motion.div)({
  flex: 1,
  overflow: 'hidden', // Prevent scrolling here too
});

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<null | HTMLElement>(null);

  const isMultibox = location.pathname === '/multibox';
  const isEnvironmentsPage = location.pathname === '/environments';
  const isCountriesPage = location.pathname === '/countries';
  const isSingleView = location.pathname === '/';

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <StyledAppBar position="static">
        <Toolbar sx={{ flexWrap: 'wrap' }}>
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            component="div"
            sx={{
              flexGrow: 1,
              whiteSpace: isMobile ? 'nowrap' : 'normal',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {isMobile ? 'USC Tester' : 'USC Component Regression Tester'}
            {!isMobile && (isMultibox ? '- Multibox' :
              isEnvironmentsPage ? '- Environments' :
                isCountriesPage ? '- Countries & NMSCs' : '')}
          </Typography>

          {isMobile ? (
            // Mobile menu button and dropdown
            <>
              <IconButton
                color="inherit"
                aria-label="open menu"
                edge="end"
                onClick={handleMobileMenuOpen}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={mobileMenuAnchorEl}
                open={Boolean(mobileMenuAnchorEl)}
                onClose={handleMobileMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem
                  component={Link}
                  to="/"
                  onClick={handleMobileMenuClose}
                  selected={isSingleView}
                  sx={{
                    color: isSingleView ? theme.palette.primary.main : 'inherit',
                    fontWeight: isSingleView ? 500 : 400
                  }}
                >
                  <Fullscreen fontSize="small" sx={{ mr: 1 }} />
                  Single View
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/multibox"
                  onClick={handleMobileMenuClose}
                  selected={isMultibox}
                  sx={{
                    color: isMultibox ? theme.palette.primary.main : 'inherit',
                    fontWeight: isMultibox ? 500 : 400
                  }}
                >
                  <Dashboard fontSize="small" sx={{ mr: 1 }} />
                  Multibox
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/countries"
                  onClick={handleMobileMenuClose}
                  selected={isCountriesPage}
                  sx={{
                    color: isCountriesPage ? theme.palette.primary.main : 'inherit',
                    fontWeight: isCountriesPage ? 500 : 400
                  }}
                >
                  <Language fontSize="small" sx={{ mr: 1 }} />
                  Countries
                </MenuItem>
                {/*
                <MenuItem 
                  component={Link} 
                  to="/environments"
                  onClick={handleMobileMenuClose}
                  selected={isEnvironmentsPage}
                  sx={{ 
                    color: isEnvironmentsPage ? theme.palette.primary.main : 'inherit',
                    fontWeight: isEnvironmentsPage ? 500 : 400
                  }}
                >
                  <Cloud fontSize="small" sx={{ mr: 1 }} />
                  Environments
                </MenuItem>
                */}
              </Menu>
            </>
          ) : (
            // Desktop horizontal buttons
            <Stack direction="row" spacing={1}>
              <Button
                component={Link}
                to="/"
                variant={isSingleView ? "contained" : "text"}
                color="inherit"
                startIcon={<Fullscreen />}
                sx={{
                  bgcolor: isSingleView ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  '&:hover': {
                    bgcolor: isSingleView ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Single View
              </Button>

              <Button
                component={Link}
                to="/multibox"
                variant={isMultibox ? "contained" : "text"}
                color="inherit"
                startIcon={<Dashboard />}
                sx={{
                  bgcolor: isMultibox ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  '&:hover': {
                    bgcolor: isMultibox ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Multibox
              </Button>

              <Button
                component={Link}
                to="/countries"
                variant={isCountriesPage ? "contained" : "text"}
                color="inherit"
                startIcon={<Language />}
                sx={{
                  bgcolor: isCountriesPage ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  '&:hover': {
                    bgcolor: isCountriesPage ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Countries
              </Button>

              {/* <Button
                component={Link}
                to="/environments"
                variant={isEnvironmentsPage ? "contained" : "text"}
                color="inherit"
                startIcon={<Cloud />}
                sx={{
                  bgcolor: isEnvironmentsPage ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  '&:hover': {
                    bgcolor: isEnvironmentsPage ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Environments
              </Button> */}
            </Stack>
          )}
        </Toolbar>
      </StyledAppBar>
      <ContentContainer maxWidth={false} disableGutters>
        <AnimatedContent
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </AnimatedContent>
      </ContentContainer>
    </Box>
  );
};

export default MainLayout;