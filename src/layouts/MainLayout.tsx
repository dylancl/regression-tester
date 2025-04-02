import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Container, styled, Button, Stack } from '@mui/material';
import { Fullscreen, Dashboard, Cloud, Language } from '@mui/icons-material';
import { motion } from 'framer-motion';

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

  const isMultibox = location.pathname === '/multibox';
  const isEnvironmentsPage = location.pathname === '/environments';
  const isCountriesPage = location.pathname === '/countries';
  const isSingleView = location.pathname === '/';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <StyledAppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Toyota Regression Tester 
            {isMultibox ? '- Multibox' : 
             isEnvironmentsPage ? '- Environments' : 
             isCountriesPage ? '- Countries & NMSCs' : ''}
          </Typography>
          
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
            
            <Button
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
            </Button>
          </Stack>
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