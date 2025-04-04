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
    SelectChangeEvent,
    FormHelperText,
} from '@mui/material';
import {
    SettingsOverscan,
    Close,
} from '@mui/icons-material';
import { SelectedOptions } from '../../types';
import { countryLanguageCodes } from '../../utils';

interface GlobalConfigMenuProps {
    frames: Array<{
        id: string;
        countryLanguageCode: string;
        selectedOptions: SelectedOptions;
    }>;
    onChangeCountry: (frameId: string, code: string) => void;
    onOptionChange: (frameId: string, name: string, value: string) => void;
    onShowNotification: (message: string) => void;
}

export const GlobalConfigMenu: React.FC<GlobalConfigMenuProps> = ({
    frames,
    onChangeCountry,
    onOptionChange,
    onShowNotification,
}) => {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    // For global menu, we need to compute the common or most-used values
    const getCommonValue = (optionName: string): string => {
        if (!frames.length) return '';
        
        // Check if all frames have the same value for this option
        const values = frames.map(frame => frame.selectedOptions[optionName] || '');
        const firstValue = values[0];
        const allSame = values.every(v => v === firstValue);
        
        if (allSame) return firstValue;
        
        // If not all same, return the most common value or first frame's value
        // This is a simplified implementation, for a more advanced one, you could 
        // show "Multiple values" or count frequencies
        return firstValue;
    };

    const getCommonCountry = (): string => {
        if (!frames.length) return '';
        
        // Check if all frames have the same country
        const countries = frames.map(frame => frame.countryLanguageCode);
        const firstCountry = countries[0];
        const allSame = countries.every(c => c === firstCountry);
        
        if (allSame) return firstCountry;
        
        // If not all same, return the most common or first frame's value
        return firstCountry;
    };

    // Get the most common country to determine feature availability
    const commonCountry = getCommonCountry();
    const countrySettings = countryLanguageCodes[commonCountry] || {};
    const hasLexus = countrySettings.hasLexus || false;
    const hasStock = countrySettings.hasStock || false;
    const hasUsed = countrySettings.hasUsed !== false; // Default to true if not explicitly set to false

    const handleChange = (event: SelectChangeEvent) => {
        const name = event.target.name;
        const value = event.target.value;
        
        // Apply the change to all frames
        frames.forEach(frame => {
            onOptionChange(frame.id, name, value);
        });
        
        onShowNotification(`Updated ${name} for all frames to ${value}`);
    };

    const handleCountryChange = (code: string) => {
        // Apply the country change to all frames
        frames.forEach(frame => {
            onChangeCountry(frame.id, code);
        });
        
        onShowNotification(`Changed country for all frames to ${countryLanguageCodes[code]?.pretty || code}`);
    };

    // If there are no frames, don't render anything
    if (!frames.length) return null;

    return (
        <>
            <Fab
                size="small"
                color="primary"
                aria-label="global configuration"
                onClick={handleClick}
                sx={{
                    position: 'absolute',
                    bottom: 80, // Position above the main SpeedDial
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
                    boxShadow: open
                        ? theme.shadows[8]
                        : 'none',
                    backdropFilter: 'blur(4px)',
                    opacity: open ? 1 : 0.7,
                    zIndex: 100,
                }}
            >
                <SettingsOverscan />
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
                        }
                    }
                }}
            >
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    bgcolor: theme.palette.mode === 'dark'
                        ? 'rgba(66, 66, 66, 0.2)'
                        : 'rgba(248, 248, 248, 0.8)',
                }}>
                    <Typography variant="subtitle1" fontWeight="medium" color="primary">
                        Global Configuration
                    </Typography>
                    <IconButton size="small" onClick={handleClose}>
                        <Close fontSize="small" />
                    </IconButton>
                </Box>

                <Box sx={{
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
                }}>
                    <Stack spacing={2.5}>
                        {/* Country Selection Section */}
                        <Box sx={{
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.9)',
                            p: 1.5, 
                            borderRadius: 1,
                            boxShadow: theme.shadows[1]
                        }}>
                            <Typography variant="subtitle2" color="primary" gutterBottom fontWeight="medium">
                                Country (All Frames)
                            </Typography>
                            <FormControl fullWidth size="small">
                                <InputLabel id="country-label">Country</InputLabel>
                                <Select
                                    labelId="country-label"
                                    id="country"
                                    value={getCommonCountry()}
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
                                    {Object.entries(countryLanguageCodes).map(([code, country]) => (
                                        <MenuItem key={code} value={code}>
                                            {country.pretty} ({code})
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>
                                    Change country for all frames at once
                                </FormHelperText>
                            </FormControl>
                        </Box>
                        <Divider />

                        {/* Environment Section */}
                        <Box sx={{
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.9)',
                            p: 1.5, 
                            borderRadius: 1,
                            boxShadow: theme.shadows[1]
                        }}>
                            <Typography variant="subtitle2" color="primary" gutterBottom fontWeight="medium">
                                Environment (All Frames)
                            </Typography>
                            <Stack spacing={1.5}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="environment-label">Deployment Environment</InputLabel>
                                    <Select
                                        labelId="environment-label"
                                        id="environment"
                                        name="environment"
                                        value={getCommonValue('environment') || 'prev'}
                                        label="Deployment Environment"
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="localhost">Localhost</MenuItem>
                                        <MenuItem value="dev">Development</MenuItem>
                                        <MenuItem value="acc">Acceptance</MenuItem>
                                        <MenuItem value="prev">Preview</MenuItem>
                                        <MenuItem value="prod">Production</MenuItem>
                                    </Select>
                                    <FormHelperText>Select the deployment environment for all frames</FormHelperText>
                                </FormControl>

                                <FormControl fullWidth size="small">
                                    <InputLabel id="usc-env-label">USC Environment</InputLabel>
                                    <Select
                                        labelId="usc-env-label"
                                        id="uscEnv"
                                        name="uscEnv"
                                        value={getCommonValue('uscEnv') || 'uat'}
                                        label="USC Environment"
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="uat">UAT</MenuItem>
                                        <MenuItem value="production">Production</MenuItem>
                                    </Select>
                                    <FormHelperText>Backend environment for all frames</FormHelperText>
                                </FormControl>
                            </Stack>
                        </Box>
                        <Divider />

                        {/* Component Section */}
                        <Box sx={{
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.9)',
                            p: 1.5, 
                            borderRadius: 1,
                            boxShadow: theme.shadows[1]
                        }}>
                            <Typography variant="subtitle2" color="primary" gutterBottom fontWeight="medium">
                                Component (All Frames)
                            </Typography>
                            <FormControl fullWidth size="small">
                                <InputLabel id="component-label">Component</InputLabel>
                                <Select
                                    labelId="component-label"
                                    id="component"
                                    name="component"
                                    value={getCommonValue('component') || 'car-filter'}
                                    label="Component"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="car-filter">Car Filter</MenuItem>
                                    <MenuItem value="used-stock-cars">Used/Stock Cars</MenuItem>
                                    <MenuItem value="used-stock-cars-pdf">Used/Stock Cars PDF</MenuItem>
                                </Select>
                                <FormHelperText>Select the component to test for all frames</FormHelperText>
                            </FormControl>
                        </Box>
                        <Divider />

                        {/* USC Context Section */}
                        <Box sx={{
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.9)',
                            p: 1.5, 
                            borderRadius: 1,
                            boxShadow: theme.shadows[1]
                        }}>
                            <Typography variant="subtitle2" color="primary" gutterBottom fontWeight="medium">
                                USC Context (All Frames)
                            </Typography>
                            <FormControl fullWidth size="small">
                                <InputLabel id="usc-context-label">USC Context</InputLabel>
                                <Select
                                    labelId="usc-context-label"
                                    id="uscContext"
                                    name="uscContext"
                                    value={getCommonValue('uscContext') || 'used'}
                                    label="USC Context"
                                    onChange={handleChange}
                                    disabled={getCommonValue('component') === 'used-stock-cars-pdf'}
                                >
                                    <MenuItem value="used" disabled={!hasUsed}>
                                        Used {!hasUsed && '(Not Available)'}
                                    </MenuItem>
                                    <MenuItem value="stock" disabled={!hasStock}>
                                        Stock {!hasStock && '(Not Available)'}
                                    </MenuItem>
                                </Select>
                                <FormHelperText>
                                    Used or Stock cars for all frames
                                </FormHelperText>
                            </FormControl>
                        </Box>
                        <Divider />

                        {/* Brand Section */}
                        <Box sx={{
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.9)',
                            p: 1.5, 
                            borderRadius: 1,
                            boxShadow: theme.shadows[1]
                        }}>
                            <Typography variant="subtitle2" color="primary" gutterBottom fontWeight="medium">
                                Brand Settings (All Frames)
                            </Typography>
                            <Stack spacing={1.5}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="brand-label">Brand</InputLabel>
                                    <Select
                                        labelId="brand-label"
                                        id="brand"
                                        name="brand"
                                        value={getCommonValue('brand') || 'toyota'}
                                        label="Brand"
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="toyota">Toyota</MenuItem>
                                        <MenuItem value="lexus" disabled={!hasLexus}>
                                            Lexus {!hasLexus && '(Not Available)'}
                                        </MenuItem>
                                    </Select>
                                    <FormHelperText>
                                        Brand selection for all frames
                                    </FormHelperText>
                                </FormControl>

                                <FormControl fullWidth size="small">
                                    <InputLabel id="variant-brand-label">Variant Brand</InputLabel>
                                    <Select
                                        labelId="variant-brand-label"
                                        id="variantBrand"
                                        name="variantBrand"
                                        value={getCommonValue('variantBrand') || 'toyota'}
                                        label="Variant Brand"
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="toyota">Toyota</MenuItem>
                                        <MenuItem value="lexus">Lexus</MenuItem>
                                    </Select>
                                    <FormHelperText>Variant brand for all frames</FormHelperText>
                                </FormControl>
                            </Stack>
                        </Box>
                    </Stack>
                </Box>
            </Popover>
        </>
    );
};

export default GlobalConfigMenu;