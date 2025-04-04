import React from 'react';
import { Menu, MenuItem, Typography, ListItemIcon, Divider } from '@mui/material';
import { 
  PhoneAndroid, 
  TabletAndroid, 
  Laptop,
  Monitor,
  AspectRatio
} from '@mui/icons-material';
import { getDeviceSizeByCategory } from '../../utils/deviceSizes';

interface DeviceSizeMenuProps {
  anchorEl: HTMLElement | null;
  currentWidth: number;
  onClose: () => void;
  onSelect: (width: number, height: number) => void;
  onCloseParentMenu?: () => void; // Add optional prop to close parent menu
}

export const DeviceSizeMenu: React.FC<DeviceSizeMenuProps> = ({ 
  anchorEl, 
  currentWidth, 
  onClose, 
  onSelect,
  onCloseParentMenu
}) => {
  const mobileSizes = getDeviceSizeByCategory('mobile');
  const tabletSizes = getDeviceSizeByCategory('tablet');
  const laptopSizes = getDeviceSizeByCategory('laptop');
  const desktopSizes = getDeviceSizeByCategory('desktop');

  // Custom sizes not defined in deviceSizes.ts
  const customSizes = [[320, 568], [375, 667], [414, 896], [768, 1024], [1280, 800], [1440, 900], [1680, 1050], [1920, 1080]].map(([width, height]) => ({ width, height }));

  // Handler for item selection
  const handleMenuItemClick = (width: number, height: number) => {
    onSelect(width, height);
    onClose(); // Close the size menu
    
    // Also close the parent menu if the callback is provided
    if (onCloseParentMenu) {
      onCloseParentMenu();
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      slotProps={{
        paper: {
          sx: {
            minWidth: 200,
            py: 0.5,
            borderRadius: 1,
            boxShadow: (theme) => theme.shadows[1],
            bgcolor: (theme) => theme.palette.background.paper,
          }
        }
      }}
    >
      {/* Mobile Section */}
      <MenuItem disabled sx={{ opacity: 0.7 }}>
        <ListItemIcon>
          <PhoneAndroid fontSize="small" />
        </ListItemIcon>
        <Typography variant="body2" fontWeight="bold">Mobile</Typography>
      </MenuItem>
      
      {mobileSizes.map((size) => (
        <MenuItem 
          key={`mobile-${size.width}-${size.height}`}
          onClick={() => handleMenuItemClick(size.width, size.height)}
          selected={currentWidth === size.width}
          sx={{ 
            pl: 4,
            minHeight: 36,
            '&:hover': {
              backgroundColor: (theme) => theme.palette.action.hover,
            }
          }}
        >
          <Typography variant="body2">
            {size.name} ({size.width}px/{size.height}px)
            {size.description && <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>- {size.description}</Typography>}
          </Typography>
        </MenuItem>
      ))}

      <Divider sx={{ my: 0.5 }} />

      {/* Tablet Section */}
      <MenuItem disabled sx={{ opacity: 0.7 }}>
        <ListItemIcon>
          <TabletAndroid fontSize="small" />
        </ListItemIcon>
        <Typography variant="body2" fontWeight="bold">Tablet</Typography>
      </MenuItem>
      
      {tabletSizes.map((size) => (
        <MenuItem 
          key={`tablet-${size.width}-${size.height}`}
          onClick={() => handleMenuItemClick(size.width, size.height)}
          selected={currentWidth === size.width}
          sx={{ 
            pl: 4,
            minHeight: 36,
            '&:hover': {
              backgroundColor: (theme) => theme.palette.action.hover,
            }
          }}
        >
          <Typography variant="body2">
            {size.name} ({size.width}px)
            {size.description && <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>- {size.description}</Typography>}
          </Typography>
        </MenuItem>
      ))}

      <Divider sx={{ my: 0.5 }} />

      {/* Laptop Section */}
      <MenuItem disabled sx={{ opacity: 0.7 }}>
        <ListItemIcon>
          <Laptop fontSize="small" />
        </ListItemIcon>
        <Typography variant="body2" fontWeight="bold">Laptop</Typography>
      </MenuItem>
      
      {laptopSizes.map((size) => (
        <MenuItem 
          key={`laptop-${size.width}-${size.height}`}
          onClick={() => handleMenuItemClick(size.width, size.height)}
          selected={currentWidth === size.width}
          sx={{ 
            pl: 4,
            minHeight: 36,
            '&:hover': {
              backgroundColor: (theme) => theme.palette.action.hover,
            }
          }}
        >
          <Typography variant="body2">
            {size.name} ({size.width}px)
            {size.description && <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>- {size.description}</Typography>}
          </Typography>
        </MenuItem>
      ))}

      <Divider sx={{ my: 0.5 }} />

      {/* Desktop Section */}
      <MenuItem disabled sx={{ opacity: 0.7 }}>
        <ListItemIcon>
          <Monitor fontSize="small" />
        </ListItemIcon>
        <Typography variant="body2" fontWeight="bold">Desktop</Typography>
      </MenuItem>
      
      {desktopSizes.map((size) => (
        <MenuItem 
          key={`laptop-${size.width}-${size.height}`}
          onClick={() => handleMenuItemClick(size.width, size.height)}
          selected={currentWidth === size.width}
          sx={{ 
            pl: 4,
            minHeight: 36,
            '&:hover': {
              backgroundColor: (theme) => theme.palette.action.hover,
            }
          }}
        >
          <Typography variant="body2">
            {size.name} ({size.width}px)
            {size.description && <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>- {size.description}</Typography>}
          </Typography>
        </MenuItem>
      ))}

      <Divider sx={{ my: 0.5 }} />

      {/* Custom Section */}
      <MenuItem disabled sx={{ opacity: 0.7 }}>
        <ListItemIcon>
          <AspectRatio fontSize="small" />
        </ListItemIcon>
        <Typography variant="body2" fontWeight="bold">Custom</Typography>
      </MenuItem>
      
      {customSizes.map(({ width, height }) => (
        <MenuItem 
          key={`custom-${width}-${height}`}
          onClick={() => handleMenuItemClick(width, height)}
          selected={currentWidth === width}
          sx={{ 
            pl: 4,
            minHeight: 36,
            '&:hover': {
              backgroundColor: (theme) => theme.palette.action.hover,
            }
          }}
        >
          <Typography variant="body2">{width}px x {height}px</Typography>
        </MenuItem>
      ))}
    </Menu>
  );
};