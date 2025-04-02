import React from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Divider,
  FormHelperText,
  Paper,
  SelectChangeEvent,
  Stack,
  useTheme
} from '@mui/material';
import { TuneOutlined } from '@mui/icons-material';
import { SelectedOptions } from '../../types';
import { countryLanguageCodes } from '../../utils';

interface ControlPanelProps {
  selectedOptions: SelectedOptions;
  handleOptionChange: (name: string, value: string) => void;
  countryLanguageCode: string;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedOptions,
  handleOptionChange,
  countryLanguageCode,
}) => {
  const theme = useTheme();
  
  // Get country-specific features
  const countrySettings = countryLanguageCodes[countryLanguageCode] || {};
  const hasLexus = countrySettings.hasLexus || false;
  const hasStock = countrySettings.hasStock || false;

  const handleChange = (event: SelectChangeEvent) => {
    const name = event.target.name;
    const value = event.target.value;
    handleOptionChange(name, value);
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
        <TuneOutlined color="primary" fontSize="small" />
        <Typography variant="subtitle2" color="primary" fontWeight="medium" sx={{ flex: 1 }}>
          Component Settings
        </Typography>
      </Stack>
      <Divider sx={{ mb: 1.5 }} />

      <Stack spacing={2}>
        {/* Environment Selection */}
        <FormControl fullWidth size="small">
          <InputLabel id="environment-label">Environment</InputLabel>
          <Select
            labelId="environment-label"
            id="environment"
            name="environment"
            value={selectedOptions.environment}
            label="Environment"
            onChange={handleChange}
            sx={{ bgcolor: 'background.paper' }}
          >
            <MenuItem value="localhost">Localhost</MenuItem>
            <MenuItem value="dev">Development</MenuItem>
            <MenuItem value="acc">Acceptance</MenuItem>
            <MenuItem value="prev">Preview</MenuItem>
            <MenuItem value="prod">Production</MenuItem>
          </Select>
          <FormHelperText>Select the deployment environment</FormHelperText>
        </FormControl>

        {/* Component Selection */}
        <FormControl fullWidth size="small">
          <InputLabel id="component-label">Component</InputLabel>
          <Select
            labelId="component-label"
            id="component"
            name="component"
            value={selectedOptions.component}
            label="Component"
            onChange={handleChange}
            sx={{ bgcolor: 'background.paper' }}
          >
            <MenuItem value="car-filter">Car Filter</MenuItem>
            <MenuItem value="used-stock-cars">Used/Stock Cars</MenuItem>
            <MenuItem value="used-stock-cars-pdf">Used/Stock Cars PDF</MenuItem>
          </Select>
          <FormHelperText>Select the component to test</FormHelperText>
        </FormControl>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {/* USC Context */}
          <FormControl fullWidth size="small">
            <InputLabel id="usc-context-label">USC Context</InputLabel>
            <Select
              labelId="usc-context-label"
              id="uscContext"
              name="uscContext"
              value={selectedOptions.uscContext}
              label="USC Context"
              onChange={handleChange}
              disabled={selectedOptions.component === 'used-stock-cars-pdf'}
              sx={{ bgcolor: 'background.paper' }}
            >
              <MenuItem value="used">Used</MenuItem>
              <MenuItem value="stock" disabled={!hasStock}>
                Stock {!hasStock && '(Not Available)'}
              </MenuItem>
            </Select>
            <FormHelperText>
              {!hasStock && selectedOptions.uscContext === 'used' 
                ? 'Stock is not available for this country' 
                : 'Used or Stock cars'}
            </FormHelperText>
          </FormControl>

          {/* USC Environment */}
          <FormControl fullWidth size="small"> 
            <InputLabel id="usc-env-label">USC Environment</InputLabel>
            <Select
              labelId="usc-env-label"
              id="uscEnv"
              name="uscEnv"
              value={selectedOptions.uscEnv}
              label="USC Environment"
              onChange={handleChange}
              sx={{ bgcolor: 'background.paper' }}
            >
              <MenuItem value="uat">UAT</MenuItem>
              <MenuItem value="production">Production</MenuItem>
            </Select>
            <FormHelperText>Backend environment</FormHelperText>
          </FormControl>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {/* Brand Selection */}
          <FormControl fullWidth size="small">
            <InputLabel id="brand-label">Brand</InputLabel>
            <Select
              labelId="brand-label"
              id="brand"
              name="brand"
              value={selectedOptions.brand}
              label="Brand"
              onChange={handleChange}
              sx={{ bgcolor: 'background.paper' }}
            >
              <MenuItem value="toyota">Toyota</MenuItem>
              <MenuItem value="lexus" disabled={!hasLexus}>
                Lexus {!hasLexus && '(Not Available)'}
              </MenuItem>
            </Select>
            <FormHelperText>
              {!hasLexus && selectedOptions.brand === 'toyota' 
                ? 'Lexus is not available for this country' 
                : 'Brand selection'}
            </FormHelperText>
          </FormControl>

          {/* Variant Brand Selection */}
          <FormControl fullWidth size="small">
            <InputLabel id="variant-brand-label">Variant Brand</InputLabel>
            <Select
              labelId="variant-brand-label"
              id="variantBrand"
              name="variantBrand"
              value={selectedOptions.variantBrand}
              label="Variant Brand"
              onChange={handleChange}
              sx={{ bgcolor: 'background.paper' }}
            >
              <MenuItem value="toyota">Toyota</MenuItem>
              <MenuItem value="lexus" disabled={!hasLexus}>
                Lexus {!hasLexus && '(Not Available)'}
              </MenuItem>
            </Select>
            <FormHelperText>Variant brand for the component</FormHelperText>
          </FormControl>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default ControlPanel;