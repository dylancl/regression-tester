import React from 'react';
import { Typography, useTheme } from '@mui/material';
import { SelectedOptions } from '../../types';
import { getPrettyString } from '../../utils';

interface FrameTitleProps {
    /**
     * Selected options for the frame
     */
    selectedOptions: SelectedOptions;

    /**
     * Country language code for the frame
     */
    countryLanguageCode: string;

    /**
     * Maximum width for the title (in pixels)
     */
    maxWidth?: number;

    /**
     * Should the text wrap to the next line if it exceeds the maxWidth?
     */
    wrapText?: boolean;
}

/**
 * A reusable component that formats the frame title based on the selected options
 * and country language code with proper highlighting and styling
 */
export const FrameTitle: React.FC<FrameTitleProps> = ({
    selectedOptions,
    countryLanguageCode,
    maxWidth = 120,
    wrapText = false,
}) => {
    const theme = useTheme();

    return (
        <Typography
            variant="subtitle2"
            fontWeight="medium"
            noWrap={!wrapText}
            sx={{
                maxWidth: maxWidth,
                lineHeight: 1.2,
            }}
        >
            {getPrettyString(selectedOptions, countryLanguageCode).map((part, index) => (
                <Typography
                    key={index}
                    component="span"
                    variant="subtitle2"
                    fontWeight={part.style.bold ? 'bold' : 'normal'}
                    fontSize={part.style.small ? '0.75rem' : 'inherit'}
                    sx={{
                        color: part.style.bold ? theme.palette.primary.main : theme.palette.text.primary,
                    }}
                >
                    {part.text}
                    {part.separator && (
                        <Typography
                            component="span"
                            variant="subtitle2"
                            sx={{
                                color: theme.palette.text.secondary,
                                fontSize: '0.75rem',
                                mx: 0.5,
                            }}
                        >
                            {part.separator}
                        </Typography>
                    )}
                </Typography>
            ))}
        </Typography>
    );
};

export default FrameTitle;