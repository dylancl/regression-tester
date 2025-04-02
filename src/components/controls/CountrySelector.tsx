import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Divider,
  Paper,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Collapse,
  Button,
  Tooltip,
  SelectChangeEvent,
  Stack,
  Fade,
  useTheme
} from '@mui/material';
import { ChevronLeft, ChevronRight, ExpandLess, ExpandMore, Language } from '@mui/icons-material';
import { countryLanguageCodes, getCountriesByNmsc } from '../../utils';

interface CountrySelectorProps {
  countryLanguageCode: string;
  goToNextCountry: () => void;
  goToPreviousCountry: () => void;
  changeCountry: (code: string) => void;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  countryLanguageCode,
  goToNextCountry,
  goToPreviousCountry,
  changeCountry,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedNmsc, setSelectedNmsc] = useState<string | null>(null);
  const theme = useTheme();

  // Get country details
  const countryDetails = countryLanguageCodes[countryLanguageCode] || { pretty: 'Unknown', nmsc: 'Unknown' };
  const { pretty: countryName, nmsc: countryNmsc } = countryDetails;

  // Get all countries grouped by NMSC
  const countriesByNmsc = getCountriesByNmsc();
  
  // Toggle the expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);
    
    // When expanding, automatically select the current country's NMSC
    if (!expanded) {
      setSelectedNmsc(countryNmsc);
    }
  };
  
  // Handle NMSC selection
  const handleNmscChange = (event: SelectChangeEvent) => {
    setSelectedNmsc(event.target.value as string);
  };

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        transition: theme.transitions.create(['background-color', 'box-shadow']),
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Language color="primary" fontSize="small" />
        <Typography variant="subtitle2" color="primary" fontWeight="medium" sx={{ flex: 1 }}>
          Country Selection
        </Typography>
        <IconButton size="small" onClick={toggleExpanded}>
          {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        </IconButton>
      </Stack>
      
      <Divider sx={{ mb: 1.5 }} />
      
      {/* Current country with navigation buttons */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: expanded ? 2 : 0,
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.05)' 
          : theme.palette.grey[50],
        p: 1,
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        transition: theme.transitions.create(['background-color', 'border-color']),
      }}>
        <Tooltip title="Previous Country">
          <IconButton onClick={goToPreviousCountry} size="small" color="primary">
            <ChevronLeft fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Typography 
          variant="body2" 
          sx={{ 
            flex: 1, 
            textAlign: 'center', 
            fontWeight: 500,
            color: 'text.primary'
          }}
        >
          {countryName} ({countryLanguageCode})
        </Typography>
        
        <Tooltip title="Next Country">
          <IconButton onClick={goToNextCountry} size="small" color="primary">
            <ChevronRight fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Expanded country selection options */}
      <Collapse in={expanded}>
        <Fade in={expanded}>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="nmsc-select-label">Select NMSC</InputLabel>
              <Select
                labelId="nmsc-select-label"
                id="nmsc-select"
                value={selectedNmsc || ''}
                label="Select NMSC"
                onChange={handleNmscChange}
                sx={{ bgcolor: 'background.paper' }}
              >
                {Object.keys(countriesByNmsc).map((nmsc) => (
                  <MenuItem key={nmsc} value={nmsc}>
                    {nmsc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {selectedNmsc && (
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: 1,
                maxHeight: '200px',
                overflowY: 'auto',
                p: 1.5,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : theme.palette.grey[50],
                borderRadius: 1,
                transition: theme.transitions.create('background-color'),
                border: `1px solid ${theme.palette.divider}`,
              }}>
                {countriesByNmsc[selectedNmsc].map((code) => (
                  <Button
                    key={code}
                    variant={code === countryLanguageCode ? "contained" : "outlined"}
                    size="small"
                    onClick={() => changeCountry(code)}
                    sx={{ 
                      minHeight: '32px',
                      fontSize: '0.75rem',
                      textTransform: 'none',
                    }}
                  >
                    {countryLanguageCodes[code]?.pretty || code}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
        </Fade>
      </Collapse>
    </Paper>
  );
};

export default CountrySelector;