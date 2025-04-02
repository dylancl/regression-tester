import { 
  Paper, 
  Stack, 
  Typography, 
  Slider, 
  IconButton 
} from '@mui/material';
import { ZoomIn, ZoomOut } from '@mui/icons-material';
import React from 'react';

interface ZoomControlsProps {
  zoomLevel: number;
  onZoomChange: (event: Event, newValue: number | number[]) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoomLevel,
  onZoomChange,
  onZoomIn,
  onZoomOut
}) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        width: 240,
        borderRadius: 2,
      }}
    >
      <Stack spacing={2}>
        <Typography variant="subtitle2" textAlign="center">
          Zoom Level: {zoomLevel}%
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton onClick={onZoomOut} size="small">
            <ZoomOut />
          </IconButton>
          <Slider
            value={zoomLevel}
            onChange={onZoomChange}
            min={50}
            max={200}
            step={5}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}%`}
          />
          <IconButton onClick={onZoomIn} size="small">
            <ZoomIn />
          </IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
};