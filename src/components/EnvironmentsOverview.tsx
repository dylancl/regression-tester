import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Chip,
    Stack,
    useTheme,
    Link,
    Button
} from '@mui/material';
import {
    CloudOutlined,
    DevicesOutlined,
    PublicOutlined,
    SpeedOutlined,
    VerifiedOutlined,
    LaptopMacOutlined,
    GppGoodOutlined,
    LaunchOutlined
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';

type EnvironmentInfo = {
    name: string;
    url: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    features: string[];
    isDefault?: boolean;
};

const EnvironmentsOverview: React.FC = () => {
    const theme = useTheme();

    const environments: EnvironmentInfo[] = [
        {
            name: 'Localhost',
            url: 'http://localhost:5001',
            description: 'Local development environment for testing changes before deployment.',
            icon: <LaptopMacOutlined fontSize="large" />,
            color: theme.palette.info.main,
            features: ['Fastest Development', 'No Deployment Required', 'Local Testing']
        },
        {
            name: 'Development',
            url: 'https://usc-webcomponentsdev.toyota-europe.com',
            description: 'Development environment for integrating and testing new features.',
            icon: <DevicesOutlined fontSize="large" />,
            color: theme.palette.secondary.main,
            features: ['Continuous Integration', 'Feature Testing', 'Developer Preview']
        },
        {
            name: 'Acceptance',
            url: 'https://usc-webcomponentsacc.toyota-europe.com',
            description: 'Quality assurance environment for validating features before preview.',
            icon: <VerifiedOutlined fontSize="large" />,
            color: theme.palette.warning.main,
            features: ['QA Testing', 'Stakeholder Reviews', 'Pre-Release Validation']
        },
        {
            name: 'Preview',
            url: 'https://usc-webcomponentsprev.toyota-europe.com',
            description: 'Preview environment that mirrors production for final testing.',
            icon: <SpeedOutlined fontSize="large" />,
            color: theme.palette.success.main,
            features: ['Production-Like Environment', 'Final Testing', 'Release Candidate'],
            isDefault: true
        },
        {
            name: 'Production',
            url: 'https://usc-webcomponents.toyota-europe.com',
            description: 'Live production environment for end users.',
            icon: <PublicOutlined fontSize="large" />,
            color: theme.palette.primary.main,
            features: ['Live Environment', 'Customer Facing', 'High Availability', 'Performance Optimized']
        }
    ];

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: "easeOut"
            }
        })
    };

    return (
        <Box 
            sx={{ 
                height: 'calc(100vh - 64px)', // Assuming app bar height is 64px, adjust if needed
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            <Box 
                sx={{ 
                    p: 3, 
                    maxWidth: '1200px', 
                    mx: 'auto',
                    overflow: 'auto',
                    flex: 1,
                    scrollbarWidth: 'thin',
                    '&::-webkit-scrollbar': {
                        width: '8px',
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
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Paper
                        elevation={2}
                        sx={{
                            p: 3,
                            mb: 4,
                            borderRadius: 2,
                            background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            color: 'white'
                        }}
                    >
                        <Typography variant="h4" gutterBottom>
                            Environments Overview
                        </Typography>
                        <Typography variant="subtitle1">
                            Comprehensive view of all USC Component environments available for testing
                        </Typography>
                    </Paper>

                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid spacing={12}>
                            <Paper elevation={1} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                    <CloudOutlined color="primary" sx={{ fontSize: 32 }} />
                                    <Typography variant="h5">
                                        Environment Pipeline
                                    </Typography>
                                </Stack>
                                <Divider sx={{ mb: 2 }} />
                                <Typography variant="body1" component={'p'}>
                                    TODO: Add text explaining the environment pipeline and the purpose of the different environments.
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid spacing={12}>
                            <Paper elevation={1} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                    <GppGoodOutlined color="success" sx={{ fontSize: 32 }} />
                                    <Typography variant="h5">
                                        Testing Considerations
                                    </Typography>
                                </Stack>
                                <Divider sx={{ mb: 2 }} />
                                <Typography variant="body1" component={'p'}>
                                    TODO: Add text explaining testing on different environments, the fact that some environments may not have certain features etc.
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </motion.div>

                <Grid container spacing={3}>
                    {environments.map((env, index) => (
                        <Grid spacing={12} key={env.name}>
                            <motion.div
                                custom={index}
                                initial="hidden"
                                animate="visible"
                                variants={cardVariants}
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card
                                    sx={{
                                        height: '100%',
                                        borderRadius: 2,
                                        overflow: 'visible',
                                        position: 'relative',
                                        boxShadow: env.isDefault
                                            ? `0 0 0 2px ${theme.palette.primary.main}, ${theme.shadows[3]}`
                                            : theme.shadows[3],
                                    }}
                                >
                                    {env.isDefault && (
                                        <Chip
                                            label="Default"
                                            color="primary"
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                top: -10,
                                                right: 12,
                                                zIndex: 1,
                                            }}
                                        />
                                    )}
                                    <CardHeader
                                        avatar={
                                            <Box
                                                sx={{
                                                    bgcolor: env.color,
                                                    color: 'white',
                                                    width: 50,
                                                    height: 50,
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                {env.icon}
                                            </Box>
                                        }
                                        title={
                                            <Typography variant="h6">
                                                {env.name}
                                            </Typography>
                                        }
                                        subheader={
                                            <Link
                                                href={env.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    fontSize: '0.8rem',
                                                    color: 'text.secondary',
                                                    '&:hover': { color: env.color }
                                                }}
                                            >
                                                {env.url}
                                                <LaunchOutlined sx={{ ml: 0.5, fontSize: '0.8rem' }} />
                                            </Link>
                                        }
                                    />
                                    <CardContent>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {env.description}
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <Typography variant="subtitle2" gutterBottom>
                                            Key Features:
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            {env.features.map(feature => (
                                                <Chip
                                                    key={feature}
                                                    label={feature}
                                                    size="small"
                                                    sx={{
                                                        mb: 1,
                                                        bgcolor: `${env.color}15`,
                                                        color: env.color,
                                                        borderColor: `${env.color}30`,
                                                        border: '1px solid',
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>

                <Box sx={{ mt: 4, textAlign: 'center', pb: 2 }}>
                    <Button
                        component={RouterLink}
                        to="/"
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={{ borderRadius: 2 }}
                    >
                        Start Testing
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default EnvironmentsOverview;