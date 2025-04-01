import { ReactNode } from 'react';
import { Box, AppBar, Toolbar, Typography, Container, styled } from '@mui/material';
import { motion } from 'framer-motion';
import { useThemeContext } from '../contexts/ThemeContext';

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
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <StyledAppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Toyota Regression Tester
          </Typography>
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