import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Switch,
  Divider,
  IconButton,
  useTheme,
  Box,
} from "@mui/material";
import { Close, Settings } from "@mui/icons-material";
import { FrameConfig } from "../../hooks/useMultiboxTester";

type SyncOptionsMenuProps = {
  open: boolean;
  onClose: () => void;
  frame: FrameConfig;
  onUpdateSyncOption: (
    frameId: string,
    optionName: string,
    enabled: boolean
  ) => void;
};

type SyncOptions = {
  environment: boolean;
  component: boolean;
  uscContext: boolean;
  uscEnv: boolean;
  brand: boolean;
  variantBrand: boolean;
  retailerscreen: boolean;
  country: boolean;
  [key: string]: boolean;
};

const syncableSettings = [
  {
    key: "environment",
    label: "Environment",
    description: "Deployment environment (dev, acc, prev, prod)",
  },
  {
    key: "component",
    label: "Component",
    description: "Component type (car-filter, used-stock-cars, etc.)",
  },
  {
    key: "uscContext",
    label: "USC Context",
    description: "Used or Stock vehicles context",
  },
  {
    key: "uscEnv",
    label: "USC Environment",
    description: "Backend environment (UAT, Production)",
  },
  { key: "brand", label: "Brand", description: "Main brand (Toyota, Lexus)" },
  {
    key: "variantBrand",
    label: "Variant Brand",
    description: "Variant brand displayed in components",
  },
  {
    key: "retailerscreen",
    label: "Retailer Screen",
    description: "Enable or disable retailer screen mode",
  },
  {
    key: "country",
    label: "Country",
    description: "Country and language selection",
  },
];

export const SyncOptionsMenu: React.FC<SyncOptionsMenuProps> = ({
  open,
  onClose,
  frame,
  onUpdateSyncOption,
}) => {
  const theme = useTheme();

  // Default sync options if none exist on the frame
  const defaultSyncOptions: SyncOptions = {
    environment: true,
    component: true,
    uscContext: true,
    uscEnv: true,
    brand: true,
    variantBrand: true,
    retailerscreen: true,
    country: true,
  };

  // Get the current sync options with defaults
  const syncOptions = (frame.syncOptions || defaultSyncOptions) as SyncOptions;

  const handleToggleChange =
    (optionName: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onUpdateSyncOption(frame.id, optionName, event.target.checked);
    };

  const listItems = syncableSettings.reduce<React.ReactNode[]>(
    (acc, setting, index) => {
      acc.push(
        <ListItem
          key={setting.key}
          secondaryAction={
            <Switch
              edge="end"
              onChange={handleToggleChange(setting.key)}
              checked={syncOptions[setting.key]}
              color="primary"
            />
          }
        >
          <ListItemText
            primary={setting.label}
            secondary={setting.description}
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>
      );

      // Add divider if not the last item
      if (index < syncableSettings.length - 1) {
        acc.push(
          <Divider
            key={`divider-${setting.key}`}
            variant="inset"
            component="li"
          />
        );
      }

      return acc;
    },
    []
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(66, 66, 66, 0.2)"
              : "rgba(248, 248, 248, 0.8)",
          borderBottom: `1px solid ${theme.palette.divider}`,
          p: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Settings color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            Sync Configuration Settings
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography
          variant="body2"
          color="text.secondary"
          component="p"
          sx={{ mt: 2 }}
        >
          Choose which settings should be synchronized between frames when sync
          is enabled. Disabled settings will remain independent for each frame.
        </Typography>

        <List sx={{ pt: 2 }}>{listItems}</List>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(66, 66, 66, 0.2)"
              : "rgba(248, 248, 248, 0.8)",
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SyncOptionsMenu;
