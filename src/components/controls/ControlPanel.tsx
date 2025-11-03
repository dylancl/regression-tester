import React from 'react';
import { Typography, Divider, Paper, Stack, useTheme } from '@mui/material';
import { TuneOutlined } from '@mui/icons-material';
import { SelectedOptions } from '../../types';
import { configurationSchema } from '../../config/configurationSchema';
import ConfigurationPanel from '../common/ConfigurationPanel';

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

  // Transform selectedOptions to ensure all values are strings with defaults
  const values: Record<string, string> = {};
  configurationSchema.forEach((field) => {
    values[field.key] = selectedOptions[field.key] || field.defaultValue;
  });

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        transition: theme.transitions.create([
          'background-color',
          'box-shadow',
        ]),
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <TuneOutlined color="primary" fontSize="small" />
        <Typography
          variant="subtitle2"
          color="primary"
          fontWeight="medium"
          sx={{ flex: 1 }}
        >
          Component Settings
        </Typography>
      </Stack>
      <Divider sx={{ mb: 1.5 }} />

      <ConfigurationPanel
        fields={configurationSchema}
        values={values}
        countryCode={countryLanguageCode}
        onChange={handleOptionChange}
        size="small"
        showLabels={true}
        showDescriptions={true}
        layout="vertical"
      />
    </Paper>
  );
};

export default ControlPanel;
