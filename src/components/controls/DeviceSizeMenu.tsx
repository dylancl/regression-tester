import React, { useCallback } from 'react';
import { Menu, MenuItem, Typography, ListItemIcon, Divider } from '@mui/material';
import { 
  PhoneAndroid, 
  TabletAndroid, 
  Laptop,
  Monitor,
  AspectRatio
} from '@mui/icons-material';
import { getDeviceSizeByCategory, DeviceSize } from '../../utils/deviceSizes';

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
  // Define categories and their corresponding icons
  const categories = [
    { id: 'mobile' as const, label: 'Mobile', icon: <PhoneAndroid fontSize="small" /> },
    { id: 'tablet' as const, label: 'Tablet', icon: <TabletAndroid fontSize="small" /> },
    { id: 'laptop' as const, label: 'Laptop', icon: <Laptop fontSize="small" /> },
    { id: 'desktop' as const, label: 'Desktop', icon: <Monitor fontSize="small" /> }
  ];

  // Get all device sizes by category
  const deviceSizesByCategory = Object.fromEntries(
    categories.map(category => [
      category.id, 
      getDeviceSizeByCategory(category.id)
    ])
  );

  // Custom sizes not defined in deviceSizes.ts
  const customSizes = useCallback(() => {
    return [[320, 568], [375, 667], [414, 896], [768, 1024], [1280, 800], [1440, 900], [1680, 1050], [1920, 1080]].map(([width, height]) => ({ width, height }));
  }, []);

  // Handler for item selection
  const handleMenuItemClick = (width: number, height: number) => {
    onSelect(width, height);
    onClose(); // Close the size menu
    
    // Also close the parent menu if the callback is provided
    if (onCloseParentMenu) {
      onCloseParentMenu();
    }
  };

  const generateDeviceSectionItems = (category: typeof categories[0], sizes: DeviceSize[]) => {
    const items: React.ReactNode[] = [];
    
    // Add category header
    items.push(
      <MenuItem key={`${category.id}-header`} disabled sx={{ opacity: 0.7 }}>
        <ListItemIcon>
          {category.icon}
        </ListItemIcon>
        <Typography variant="body2" fontWeight="bold">{category.label}</Typography>
      </MenuItem>
    );
    
    // Add device size items
    sizes.forEach(size => {
      items.push(
        <MenuItem 
          key={`${category.id}-${size.width}-${size.height}`}
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
            {size.name} ({size.width}x{size.height}px)
            {size.description && <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>- {size.description}</Typography>}
          </Typography>
        </MenuItem>
      );
    });
    
    // Add divider
    items.push(<Divider key={`${category.id}-divider`} sx={{ my: 0.5 }} />);
    
    return items;
  };

  // Build all menu items in a flat array
  const allMenuItems: React.ReactNode[] = [];
  
  // Add device category sections
  categories.forEach(category => {
    allMenuItems.push(...generateDeviceSectionItems(category, deviceSizesByCategory[category.id]));
  });
  
  // Add custom section
  allMenuItems.push(
    <MenuItem key="custom-header" disabled sx={{ opacity: 0.7 }}>
      <ListItemIcon>
        <AspectRatio fontSize="small" />
      </ListItemIcon>
      <Typography variant="body2" fontWeight="bold">Custom</Typography>
    </MenuItem>
  );
  
  // Add custom sizes
  customSizes().forEach(({ width, height }) => {
    allMenuItems.push(
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
    );
  });

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
      {allMenuItems}
    </Menu>
  );
};