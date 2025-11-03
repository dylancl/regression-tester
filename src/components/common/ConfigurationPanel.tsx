import React from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormHelperText,
  TextField,
  SelectChangeEvent,
  Box,
  Stack,
} from '@mui/material';
import {
  ConfigurationField,
  SelectOption,
} from '../../config/configurationSchema';

interface ConfigurationPanelProps {
  fields: ConfigurationField[];
  values: Record<string, string>;
  countryCode?: string;
  onChange: (key: string, value: string) => void;
  size?: 'small' | 'medium';
  showLabels?: boolean;
  showDescriptions?: boolean;
  layout?: 'vertical' | 'horizontal';
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  fields,
  values,
  countryCode,
  onChange,
  size = 'small',
  showLabels = true,
  showDescriptions = true,
  layout = 'vertical',
}) => {
  const handleSelectChange =
    (field: ConfigurationField) => (event: SelectChangeEvent) => {
      onChange(field.key, event.target.value);
    };

  const handleTextChange =
    (field: ConfigurationField) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(field.key, event.target.value);
    };

  const getConditionalProps = (field: ConfigurationField) => {
    if (!field.conditionalLogic) return {};

    const conditionalResult = field.conditionalLogic(values, countryCode);

    return {
      disabled: conditionalResult.disabled,
      helperText: conditionalResult.helperText,
      options: conditionalResult.options,
    };
  };

  const renderSelectField = (field: ConfigurationField) => {
    const conditionalProps = getConditionalProps(field);
    const options = conditionalProps.options || field.selectOptions || [];

    return (
      <FormControl fullWidth size={size} key={field.key}>
        {showLabels && (
          <InputLabel id={`${field.key}-label`}>{field.label}</InputLabel>
        )}
        <Select
          labelId={showLabels ? `${field.key}-label` : undefined}
          id={field.key}
          name={field.key}
          value={values[field.key] || field.defaultValue}
          label={showLabels ? field.label : undefined}
          onChange={handleSelectChange(field)}
          disabled={conditionalProps.disabled}
        >
          {options.map((option: SelectOption) => {
            const isDisabled =
              typeof option.disabled === 'function'
                ? option.disabled(countryCode)
                : option.disabled;

            return (
              <MenuItem
                key={option.value}
                value={option.value}
                disabled={isDisabled}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                {option.label}
                {option.helperText && (
                  <Box sx={{ fontSize: '0.8em', color: 'text.secondary' }}>
                    {option.helperText}
                  </Box>
                )}
              </MenuItem>
            );
          })}
        </Select>
        {showDescriptions &&
          (conditionalProps.helperText || field.description) && (
            <FormHelperText>
              {conditionalProps.helperText || field.description}
            </FormHelperText>
          )}
      </FormControl>
    );
  };

  const renderTextField = (field: ConfigurationField) => {
    const conditionalProps = getConditionalProps(field);

    return (
      <TextField
        key={field.key}
        fullWidth
        size={size}
        label={showLabels ? field.label : undefined}
        name={field.key}
        value={values[field.key] || field.defaultValue}
        onChange={handleTextChange(field)}
        placeholder={`Enter ${field.label.toLowerCase()}`}
        helperText={
          showDescriptions
            ? conditionalProps.helperText || field.description
            : undefined
        }
        disabled={conditionalProps.disabled}
        inputProps={{
          pattern: field.validationRules?.pattern?.source,
        }}
      />
    );
  };

  const renderField = (field: ConfigurationField) => {
    switch (field.type) {
      case 'select':
        return renderSelectField(field);
      case 'text':
        return renderTextField(field);
      default:
        return null;
    }
  };

  if (layout === 'horizontal') {
    return (
      <Stack direction="row" spacing={2} flexWrap="wrap">
        {fields.map(renderField)}
      </Stack>
    );
  }

  return <Stack spacing={2}>{fields.map(renderField)}</Stack>;
};

export default ConfigurationPanel;
