import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  Stack,
  useTheme,
  Button,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Language,
  Search,
  ViewList,
  ViewModule,
  FilterList,
  Check,
  DirectionsCar,
  Widgets,
  BusinessCenter
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { countryLanguageCodes, getCountriesByNmsc } from '../utils';

// Define type for display modes
type DisplayMode = 'grid' | 'list';
type FilterOption = 'all' | 'lexus' | 'stock';

const CountriesOverview: React.FC = () => {
  const theme = useTheme();
  const [displayMode, setDisplayMode] = useState<DisplayMode>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');

  // Get countries grouped by NMSC
  const countriesByNmsc = useMemo(() => getCountriesByNmsc(), []);

  // Filter countries based on search query and filter option
  const filteredCountries = useMemo(() => {
    const nmscEntries = Object.entries(countriesByNmsc);
    
    return nmscEntries.map(([nmsc, countryCodes]) => {
      const filteredCodes = countryCodes.filter(code => {
        const country = countryLanguageCodes[code];
        const countryName = country.pretty.toLowerCase();
        const codeMatch = code.toLowerCase().includes(searchQuery.toLowerCase());
        const nameMatch = countryName.includes(searchQuery.toLowerCase());
        const nmscMatch = nmsc.toLowerCase().includes(searchQuery.toLowerCase());
        const searchMatches = searchQuery === '' || codeMatch || nameMatch || nmscMatch;
        
        // Apply feature filters
        const featureMatches = 
          filterOption === 'all' || 
          (filterOption === 'lexus' && country.hasLexus) || 
          (filterOption === 'stock' && country.hasStock);
        
        return searchMatches && featureMatches;
      });
      
      return { nmsc, countryCodes: filteredCodes };
    }).filter(group => group.countryCodes.length > 0);
  }, [countriesByNmsc, searchQuery, filterOption]);

  // Handlers for UI controls
  const handleDisplayModeChange = (
    _: React.MouseEvent<HTMLElement>, 
    newMode: DisplayMode | null
  ) => {
    if (newMode !== null) {
      setDisplayMode(newMode);
    }
  };

  const handleFilterChange = (
    _: React.MouseEvent<HTMLElement>, 
    newFilter: FilterOption | null
  ) => {
    if (newFilter !== null) {
      setFilterOption(newFilter);
    }
  };

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.4,
        ease: "easeOut"
      }
    })
  };

  // Get number of countries with special features
  const countryStats = useMemo(() => {
    const countryCodes = Object.keys(countryLanguageCodes);
    const total = countryCodes.length;
    const withLexus = countryCodes.filter(code => countryLanguageCodes[code].hasLexus).length;
    const withStock = countryCodes.filter(code => countryLanguageCodes[code].hasStock).length;
    
    return { total, withLexus, withStock };
  }, []);

  return (
    <Box sx={{ 
      p: 3, 
      maxWidth: '1300px', 
      mx: 'auto', 
      overflowY: 'auto',
      height: '100%' 
    }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 2,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white'
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={2}>
            <Language sx={{ fontSize: 42 }} />
            <Box>
              <Typography variant="h4" gutterBottom>
                Countries & NMSC Overview
              </Typography>
              <Typography variant="subtitle1">
                All supported countries and National Marketing and Sales Companies
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid spacing={12}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: theme.palette.background.paper,
                height: '100%'
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box 
                  sx={{ 
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Language />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {countryStats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Countries
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid spacing={12}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: theme.palette.background.paper,
                height: '100%'
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box 
                  sx={{ 
                    bgcolor: '#AB0F15', // Lexus red
                    color: 'white',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <DirectionsCar />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#AB0F15' }}>
                    {countryStats.withLexus}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    With Lexus Support
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid spacing={12}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: theme.palette.background.paper,
                height: '100%'
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box 
                  sx={{ 
                    bgcolor: theme.palette.success.main,
                    color: 'white',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Widgets />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {countryStats.withStock}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    With Stock Car Support
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Controls */}
        <Paper 
          elevation={1}
          sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: theme.palette.background.paper }}
        >
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={2} 
            alignItems={{ xs: 'stretch', md: 'center' }}
          >
            {/* Search */}
            <TextField
              placeholder="Search countries or NMSC..."
              variant="outlined"
              size="small"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />
            
            {/* Filter */}
            <Stack 
              direction="row" 
              spacing={1} 
              alignItems="center"
              sx={{ minWidth: { xs: '100%', md: 'auto' } }}
            >
              <FilterList color="action" />
              <ToggleButtonGroup
                value={filterOption}
                exclusive
                onChange={handleFilterChange}
                aria-label="filter options"
                size="small"
                sx={{ 
                  '.MuiToggleButton-root': { 
                    textTransform: 'none',
                    px: 2,
                  } 
                }}
              >
                <ToggleButton value="all">
                  All
                </ToggleButton>
                <ToggleButton value="lexus">
                  Lexus
                </ToggleButton>
                <ToggleButton value="stock">
                  Stock Cars
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            
            {/* View toggle */}
            <ToggleButtonGroup
              value={displayMode}
              exclusive
              onChange={handleDisplayModeChange}
              aria-label="display mode"
              size="small"
            >
              <ToggleButton value="grid" aria-label="grid view">
                <ViewModule />
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <ViewList />
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Paper>

        {/* Countries by NMSC */}
        {displayMode === 'grid' ? (
          <>
            {filteredCountries.map((group, groupIndex) => (
              <Box key={group.nmsc} sx={{ mb: 4 }}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: theme.palette.mode === 'dark' 
                      ? 'rgba(66, 66, 66, 0.2)' 
                      : 'rgba(248, 248, 248, 0.8)',
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <BusinessCenter color="primary" />
                    <Typography variant="h6">
                      NMSC: {group.nmsc} ({group.countryCodes.length} {group.countryCodes.length === 1 ? 'country' : 'countries'})
                    </Typography>
                  </Stack>
                </Paper>
                
                <Grid container spacing={2}>
                  {group.countryCodes.map((code, index) => {
                    const country = countryLanguageCodes[code];
                    return (
                      <Grid spacing={12} key={code}>
                        <motion.div
                          custom={(groupIndex * 10) + index}
                          initial="hidden"
                          animate="visible"
                          variants={cardVariants}
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card 
                            sx={{ 
                              height: '100%', 
                              borderRadius: 2,
                              bgcolor: theme.palette.background.paper,
                              '&:hover': {
                                boxShadow: theme.shadows[4]
                              },
                            }}
                          >
                            <CardHeader
                              title={
                                <Typography variant="subtitle1" fontWeight="medium">
                                  {country.pretty}
                                </Typography>
                              }
                              subheader={
                                <Typography variant="caption" color="text.secondary">
                                  {code}
                                </Typography>
                              }
                              avatar={
                                <Box 
                                  sx={{ 
                                    bgcolor: theme.palette.primary.main,
                                    color: 'white',
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <Language />
                                </Box>
                              }
                              sx={{ pb: 1 }}
                            />
                            <Divider />
                            <CardContent sx={{ pt: 1 }}>
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                {country.hasLexus && (
                                  <Chip 
                                    icon={<Check fontSize="small" />} 
                                    label="Lexus Support" 
                                    size="small" 
                                    sx={{ 
                                      bgcolor: '#F8E5E6', 
                                      color: '#AB0F15',
                                      fontWeight: 500,
                                      fontSize: '0.7rem',
                                    }} 
                                  />
                                )}
                                {country.hasStock && (
                                  <Chip 
                                    icon={<Check fontSize="small" />} 
                                    label="Stock Cars" 
                                    size="small" 
                                    sx={{ 
                                      bgcolor: theme.palette.success.light,
                                      color: theme.palette.success.dark,
                                      fontWeight: 500,
                                      fontSize: '0.7rem',
                                    }} 
                                  />
                                )}
                                {country.hasUsed === false && (
                                  <Chip 
                                    icon={<Check fontSize="small" />} 
                                    label="No Used Cars" 
                                    size="small" 
                                    sx={{ 
                                      bgcolor: theme.palette.warning.light,
                                      color: theme.palette.warning.dark,
                                      fontWeight: 500,
                                      fontSize: '0.7rem',
                                    }} 
                                  />
                                )}
                              </Stack>
                              
                              <Button
                                component={RouterLink}
                                to={`/?country=${code}&nmsc=${country.nmsc}`}
                                variant="outlined"
                                color="primary"
                                size="small"
                                fullWidth
                                sx={{ mt: 2, borderRadius: 1.5 }}
                              >
                                Test This Country
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            ))}
          </>
        ) : (
          <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {filteredCountries.map((group) => (
              <Box key={group.nmsc}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: theme.palette.mode === 'dark' 
                      ? 'rgba(66, 66, 66, 0.2)' 
                      : 'rgba(248, 248, 248, 0.8)',
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <BusinessCenter color="primary" />
                    <Typography variant="subtitle1" fontWeight="medium">
                      NMSC: {group.nmsc} ({group.countryCodes.length} {group.countryCodes.length === 1 ? 'country' : 'countries'})
                    </Typography>
                  </Stack>
                </Box>
                
                <List disablePadding>
                  {group.countryCodes.map((code) => {
                    const country = countryLanguageCodes[code];
                    return (
                      <ListItem
                        key={code}
                        divider
                        secondaryAction={
                          <Button
                            component={RouterLink}
                            to={`/?country=${code}&nmsc=${country.nmsc}`}
                            variant="outlined"
                            color="primary"
                            size="small"
                            sx={{ borderRadius: 1.5 }}
                          >
                            Test
                          </Button>
                        }
                        sx={{
                          '&:hover': {
                            bgcolor: theme.palette.action.hover
                          }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography variant="body1">{country.pretty}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                ({code})
                              </Typography>
                            </Stack>
                          }
                          secondary={
                            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                              {country.hasLexus && (
                                <Chip 
                                  label="Lexus" 
                                  size="small" 
                                  sx={{ 
                                    height: 20,
                                    bgcolor: '#F8E5E6', 
                                    color: '#AB0F15',
                                    fontSize: '0.65rem',
                                  }} 
                                />
                              )}
                              {country.hasStock && (
                                <Chip 
                                  label="Stock Cars" 
                                  size="small" 
                                  sx={{ 
                                    height: 20,
                                    bgcolor: theme.palette.success.light,
                                    color: theme.palette.success.dark,
                                    fontSize: '0.65rem',
                                  }} 
                                />
                              )}
                              {country.hasUsed === false && (
                                <Chip 
                                  label="No Used Cars" 
                                  size="small" 
                                  sx={{ 
                                    height: 20,
                                    bgcolor: theme.palette.warning.light,
                                    color: theme.palette.warning.dark,
                                    fontSize: '0.65rem',
                                  }} 
                                />
                              )}
                            </Stack>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            ))}
          </Paper>
        )}

        {/* No results message */}
        {filteredCountries.length === 0 && (
          <Box sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' 
              ? 'rgba(66, 66, 66, 0.2)' 
              : 'rgba(248, 248, 248, 0.8)',
          }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No countries match your search
            </Typography>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => {
                setSearchQuery('');
                setFilterOption('all');
              }}
            >
              Reset Filters
            </Button>
          </Box>
        )}
      </motion.div>
    </Box>
  );
};

export default CountriesOverview;