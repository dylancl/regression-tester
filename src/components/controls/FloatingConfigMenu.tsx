import React, { useState } from 'react';
import {
  Box,
  Fab,
  Popover,
  Typography,
  Stack,
  Divider,
  useTheme,
  IconButton,
  Fade,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import { Settings, Close } from '@mui/icons-material';
import { SelectedOptions } from '../../types';
import { countryLanguageCodes } from '../../utils';
import { configurationSchema } from '../../config/configurationSchema';
import ConfigurationPanel from '../common/ConfigurationPanel';

interface FloatingConfigMenuProps {
  frame: {
    id: string;
    countryLanguageCode: string;
    selectedOptions: SelectedOptions;
  };
  onChangeCountry: (frameId: string, code: string) => void;
  onOptionChange: (frameId: string, name: string, value: string) => void;
  onShowNotification: (message: string) => void;
}

interface FloatingConfigMenuProps {
  frame: {
    id: string;
    countryLanguageCode: string;
    selectedOptions: SelectedOptions;
  };
  onChangeCountry: (frameId: string, code: string) => void;
  onOptionChange: (frameId: string, name: string, value: string) => void;
  onShowNotification: (message: string) => void;
}

export const FloatingConfigMenu: React.FC<FloatingConfigMenuProps> = ({
  frame,
  onChangeCountry,
  onOptionChange,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  // Transform selectedOptions to ensure all values are strings with defaults
  const values: Record<string, string> = {};
  configurationSchema.forEach((field) => {
    values[field.key] = frame.selectedOptions[field.key] || field.defaultValue;
  });

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCountryChange = (code: string) => {
    onChangeCountry(frame.id, code);
    // Don't close the popover so the user can continue making changes
  };

  return (
    <>
      <Fab
        size="small"
        color="default"
        aria-label="configuration options"
        onClick={handleClick}
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          bgcolor: open
            ? theme.palette.primary.main
            : theme.palette.mode === 'dark'
            ? 'rgba(0, 0, 0, 0.4)'
            : 'rgba(255, 255, 255, 0.4)',
          color: open
            ? '#fff'
            : theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.7)'
            : 'rgba(0, 0, 0, 0.7)',
          '&:hover': {
            bgcolor: theme.palette.primary.main,
            color: '#fff',
          },
          transition: 'background-color 0.3s, color 0.3s, opacity 0.3s',
          boxShadow: open ? theme.shadows[8] : 'none',
          backdropFilter: 'blur(4px)',
          opacity: open ? 1 : 0.7,
          zIndex: 100,
        }}
      >
        <Settings />
      </Fab>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        slots={{ transition: Fade }}
        slotProps={{
          transition: {
            timeout: { enter: 200, exit: 200 },
          },
          paper: {
            elevation: 4,
            sx: {
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              maxWidth: 380,
              width: '100%',
              overflow: 'hidden',
              backdropFilter: 'blur(8px)',
            },
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor:
              theme.palette.mode === 'dark'
                ? 'rgba(66, 66, 66, 0.2)'
                : 'rgba(248, 248, 248, 0.8)',
          }}
        >
          <Typography variant="subtitle1" fontWeight="medium" color="primary">
            Frame Configuration
          </Typography>
          <IconButton size="small" onClick={handleClose}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{
            p: 2,
            maxHeight: '40rem',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: theme.palette.background.default,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.divider,
              borderRadius: '4px',
            },
          }}
        >
          <Stack spacing={2.5}>
            {/* Country Selection Section */}
            <Box
              sx={{
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(0, 0, 0, 0.4)'
                    : 'rgba(255, 255, 255, 0.9)',
                p: 1.5,
                borderRadius: 1,
                boxShadow: theme.shadows[1],
              }}
            >
              <Typography
                variant="subtitle2"
                color="primary"
                gutterBottom
                fontWeight="medium"
              >
                Country
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel id="country-label">Country</InputLabel>
                <Select
                  labelId="country-label"
                  id="country"
                  value={frame.countryLanguageCode}
                  label="Country"
                  onChange={(e) => handleCountryChange(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  }}
                >
                  {Object.entries(countryLanguageCodes).map(
                    ([code, country]) => (
                      <MenuItem key={code} value={code}>
                        {country.pretty} ({code})
                      </MenuItem>
                    )
                  )}
                </Select>
                <FormHelperText>
                  Use the dropdown to change country
                </FormHelperText>
              </FormControl>
            </Box>
            <Divider />

            {/* Environment Section */}
            <Box
              sx={{
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(0, 0, 0, 0.4)'
                    : 'rgba(255, 255, 255, 0.9)',
                p: 1.5,
                borderRadius: 1,
                boxShadow: theme.shadows[1],
              }}
            >
              <Typography
                variant="subtitle2"
                color="primary"
                gutterBottom
                fontWeight="medium"
              >
                Environment
              </Typography>
              <ConfigurationPanel
                fields={configurationSchema.filter((field) =>
                  ['environment', 'uscEnv'].includes(field.key)
                )}
                values={values}
                countryCode={frame.countryLanguageCode}
                onChange={(key, value) => onOptionChange(frame.id, key, value)}
                size="small"
                showLabels={true}
                showDescriptions={true}
                layout="vertical"
              />
            </Box>
            <Divider />

            {/* Component Section */}
            <Box
              sx={{
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(0, 0, 0, 0.4)'
                    : 'rgba(255, 255, 255, 0.9)',
                p: 1.5,
                borderRadius: 1,
                boxShadow: theme.shadows[1],
              }}
            >
              <Typography
                variant="subtitle2"
                color="primary"
                gutterBottom
                fontWeight="medium"
              >
                Component
              </Typography>
              <ConfigurationPanel
                fields={configurationSchema.filter((field) =>
                  ['component'].includes(field.key)
                )}
                values={values}
                countryCode={frame.countryLanguageCode}
                onChange={(key, value) => onOptionChange(frame.id, key, value)}
                size="small"
                showLabels={true}
                showDescriptions={true}
                layout="vertical"
              />
            </Box>
            <Divider />

            {/* USC Context Section */}
            <Box
              sx={{
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(0, 0, 0, 0.4)'
                    : 'rgba(255, 255, 255, 0.9)',
                p: 1.5,
                borderRadius: 1,
                boxShadow: theme.shadows[1],
              }}
            >
              <Typography
                variant="subtitle2"
                color="primary"
                gutterBottom
                fontWeight="medium"
              >
                USC Context
              </Typography>
              <ConfigurationPanel
                fields={configurationSchema.filter((field) =>
                  ['uscContext'].includes(field.key)
                )}
                values={values}
                countryCode={frame.countryLanguageCode}
                onChange={(key, value) => onOptionChange(frame.id, key, value)}
                size="small"
                showLabels={true}
                showDescriptions={true}
                layout="vertical"
              />
            </Box>
            <Divider />

            {/* Brand Section */}
            <Box
              sx={{
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(0, 0, 0, 0.4)'
                    : 'rgba(255, 255, 255, 0.9)',
                p: 1.5,
                borderRadius: 1,
                boxShadow: theme.shadows[1],
              }}
            >
              <Typography
                variant="subtitle2"
                color="primary"
                gutterBottom
                fontWeight="medium"
              >
                Brand Settings
              </Typography>
              <ConfigurationPanel
                fields={configurationSchema.filter((field) =>
                  ['brand', 'variantBrand'].includes(field.key)
                )}
                values={values}
                countryCode={frame.countryLanguageCode}
                onChange={(key, value) => onOptionChange(frame.id, key, value)}
                size="small"
                showLabels={true}
                showDescriptions={true}
                layout="vertical"
              />
            </Box>
            <Divider />

            {/* Retailer Screen Section */}
            <Box
              sx={{
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(0, 0, 0, 0.4)'
                    : 'rgba(255, 255, 255, 0.9)',
                p: 1.5,
                borderRadius: 1,
                boxShadow: theme.shadows[1],
              }}
            >
              <Typography
                variant="subtitle2"
                color="primary"
                gutterBottom
                fontWeight="medium"
              >
                Retailer Screen
              </Typography>
              <ConfigurationPanel
                fields={configurationSchema.filter((field) =>
                  ['retailerscreen'].includes(field.key)
                )}
                values={values}
                countryCode={frame.countryLanguageCode}
                onChange={(key, value) => onOptionChange(frame.id, key, value)}
                size="small"
                showLabels={true}
                showDescriptions={true}
                layout="vertical"
              />
            </Box>
            <Divider />

            {/* tyCode Section */}
            <Box
              sx={{
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(0, 0, 0, 0.4)'
                    : 'rgba(255, 255, 255, 0.9)',
                p: 1.5,
                borderRadius: 1,
                boxShadow: theme.shadows[1],
              }}
            >
              <Typography
                variant="subtitle2"
                color="primary"
                gutterBottom
                fontWeight="medium"
              >
                Toyota Code
              </Typography>
              <ConfigurationPanel
                fields={configurationSchema.filter((field) =>
                  ['tyCode'].includes(field.key)
                )}
                values={values}
                countryCode={frame.countryLanguageCode}
                onChange={(key, value) => onOptionChange(frame.id, key, value)}
                size="small"
                showLabels={true}
                showDescriptions={true}
                layout="vertical"
              />
            </Box>
          </Stack>
        </Box>
      </Popover>
    </>
  );
};

export default FloatingConfigMenu;
