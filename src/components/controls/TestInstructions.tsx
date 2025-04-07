import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Collapse,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Fab,
  Link,
  Alert,
  ButtonGroup,
  Badge,
} from '@mui/material';
import {
  ExpandMore,
  RadioButtonUnchecked,
  Assignment,
  KeyboardArrowRight,
  KeyboardArrowDown,
  Help,
  Close,
  FactCheck,
  Edit,
  Launch,
  OpenInNew,
  Check,
  Clear,
  Block,
} from '@mui/icons-material';
import { SelectedOptions } from '../../types';
import { TestScenario, TestStep, getTestScenarios, TEST_SCENARIOS_SPREADSHEET_ID, TestStepStatus } from '../../data/testScenarios';

// Define the interface for test progress data that will be shared with the sidebar
export interface TestProgressData {
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  notTested: number;
  completion: number;
}

interface TestInstructionsProps {
  selectedOptions: SelectedOptions;
  onProgressUpdate?: (progressData: TestProgressData) => void;
}

const TestInstructions: React.FC<TestInstructionsProps> = ({ 
  selectedOptions,
  onProgressUpdate 
}) => {
  const theme = useTheme();
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);
  const [stepStatuses, setStepStatuses] = useState<Record<string, TestStepStatus>>({});
  const [showExpectedResults, setShowExpectedResults] = useState<Record<string, boolean>>({});
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  
  // Google Sheets URLs
  const sheetsEditUrl = `https://docs.google.com/spreadsheets/d/${TEST_SCENARIOS_SPREADSHEET_ID}/edit`;
  const componentsSheetUrl = `${sheetsEditUrl}#gid=0`;
  const stepsSheetUrl = `${sheetsEditUrl}#gid=1`;
  
  // Fetch test scenarios when component mounts or selected options change
  useEffect(() => {
    if (!open) return; // Only fetch when dialog is open
    
    const fetchScenarios = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedScenarios = await getTestScenarios(selectedOptions);
        console.log("Fetched scenarios:", fetchedScenarios);
        setScenarios(fetchedScenarios);
      } catch (err) {
        console.error("Failed to fetch test scenarios:", err);
        setError("Failed to load test instructions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchScenarios();
  }, [selectedOptions, open]);
  
  // Calculate test progress data
  const calculateTestProgress = (
    scenarios: TestScenario[], 
    statuses: Record<string, TestStepStatus>
  ): TestProgressData => {
    let total = 0;
    let passed = 0;
    let failed = 0;
    let blocked = 0;
    
    scenarios.forEach(scenario => {
      scenario.steps.forEach(step => {
        total++;
        const stepKey = `${scenario.id}-${step.id}`;
        const status = statuses[stepKey];
        
        if (status === 'pass') passed++;
        else if (status === 'fail') failed++;
        else if (status === 'blocked') blocked++;
      });
    });
    
    const notTested = total - passed - failed - blocked;
    const completion = total === 0 ? 0 : Math.round(((passed + failed + blocked) / total) * 100);
    
    return {
      total,
      passed,
      failed,
      blocked,
      notTested,
      completion
    };
  };
  
  // Get completion percentage for a scenario
  const getScenarioProgress = (scenarioId: string, steps: TestStep[]): { 
    completion: number; 
    passed: number; 
    failed: number;
    blocked: number;
  } => {
    if (steps.length === 0) return { completion: 0, passed: 0, failed: 0, blocked: 0 };
    
    let tested = 0;
    let passed = 0;
    let failed = 0;
    let blocked = 0;
    
    steps.forEach(step => {
      const stepKey = `${scenarioId}-${step.id}`;
      const status = stepStatuses[stepKey];
      
      if (status) {
        tested++;
        if (status === 'pass') passed++;
        else if (status === 'fail') failed++;
        else if (status === 'blocked') blocked++;
      }
    });
    
    const completion = Math.round((tested / steps.length) * 100);
    
    return { 
      completion,
      passed,
      failed,
      blocked
    };
  };
  
  // Set step status (pass/fail/blocked)
  const setStepStatus = (scenarioId: string, stepId: string, status: TestStepStatus) => {
    const stepKey = `${scenarioId}-${stepId}`;
    
    setStepStatuses(prev => {
      // If clicking the same status again, clear the status
      if (prev[stepKey] === status) {
        const newStatuses = { ...prev };
        delete newStatuses[stepKey];
        return newStatuses;
      }
      
      // Otherwise set the new status
      return {
        ...prev,
        [stepKey]: status
      };
    });
  };
  
  // Toggle expected result visibility
  const toggleExpectedResult = (stepId: string) => {
    setShowExpectedResults(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };
  
  // Handle accordion expansion
  const handleAccordionChange = (scenarioId: string) => {
    setExpandedScenario(expandedScenario === scenarioId ? null : scenarioId);
  };
  
  // Reset all steps for a scenario
  const resetScenario = (scenarioId: string, steps: TestStep[]) => {
    const newStepStatuses = { ...stepStatuses };
    
    steps.forEach(step => {
      const key = `${scenarioId}-${step.id}`;
      delete newStepStatuses[key];
    });
    
    setStepStatuses(newStepStatuses);
  };
  
  // Handle dialog open/close
  const handleClickOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
    setShowGuide(false);
  };
  
  // Get status color
  const getStatusColor = (status: TestStepStatus) => {
    switch (status) {
      case 'pass': return theme.palette.success.main;
      case 'fail': return theme.palette.error.main;
      case 'blocked': return theme.palette.warning.main;
      default: return theme.palette.text.disabled;
    }
  };
  
  // Use useMemo to calculate progress data only when dependencies change
  const progressData = useMemo(() => 
    calculateTestProgress(scenarios, stepStatuses),
    [scenarios, stepStatuses]
  );
  
  // Use a separate effect with a stable dependency to report progress updates
  useEffect(() => {
    if (onProgressUpdate) {
      onProgressUpdate(progressData);
    }
  }, [progressData, onProgressUpdate]);
  
  // Render floating action button
  const renderFab = () => (
    <Tooltip title="Test Instructions">
      <Fab
        color="primary"
        aria-label="test instructions"
        onClick={handleClickOpen}
        size="medium"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <Badge 
          badgeContent={progressData.completion + '%'} 
          color={progressData.failed > 0 ? 'error' : 'success'}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.65rem',
              fontWeight: 'bold',
              minWidth: '32px',
              height: '20px',
              padding: '0 4px',
            }
          }}
        >
          <FactCheck />
        </Badge>
      </Fab>
    </Tooltip>
  );
  
  // Render spreadsheet guide
  const renderGuide = () => (
    <Dialog 
      open={showGuide} 
      onClose={() => setShowGuide(false)}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        How to Use the Test Scenarios Spreadsheet
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" paragraph>
          The test scenarios are managed in Google Sheets using a simple two-sheet structure:
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            1. Components Sheet
          </Typography>
          
          <Table
            headers={[
              "ComponentID", "Component", "Brand", "Context", "Title", "Description", "Tags"
            ]}
            rows={[
              ["comp-1", "carFilter", "toyota", "used", "Car Filter Tests", "Tests for the car filter component", "filters,search"],
              ["comp-2", "carDetails", "toyota", "new", "Car Details Tests", "Tests for the car details page", "details,specs"]
            ]}
          />
          
          <Typography variant="body2" sx={{ mt: 1 }}>
            The Components sheet defines which components you're testing and their basic info:
          </Typography>
          <ul>
            <li><strong>ComponentID</strong>: A unique identifier for the component (referenced in the Steps sheet)</li>
            <li><strong>Component, Brand, Context</strong>: These match the selections in the regression tester</li>
            <li><strong>Title, Description</strong>: Basic info about what you're testing</li>
            <li><strong>Tags</strong>: Optional keywords for categorization</li>
          </ul>
        </Box>
        
        <Box>
          <Typography variant="h6" gutterBottom>
            2. Steps Sheet
          </Typography>
          
          <Table
            headers={[
              "ComponentID", "ScenarioID", "StepID", "Instruction", "ExpectedResult", "Status"
            ]}
            rows={[
              ["comp-1", "filtering", "step-1", "Click the filter button", "Filter panel should open", ""],
              ["comp-1", "filtering", "step-2", "Select 'Toyota' from the make dropdown", "Only Toyota cars should be shown", ""],
              ["comp-1", "sorting", "step-1", "Click the 'Sort by' dropdown", "Sorting options should appear", ""]
            ]}
          />
          
          <Typography variant="body2" sx={{ mt: 1 }}>
            The Steps sheet contains all the test steps:
          </Typography>
          <ul>
            <li><strong>ComponentID</strong>: References the ID from the Components sheet</li>
            <li><strong>ScenarioID</strong>: Groups related steps together (e.g., "filtering" or "sorting")</li>
            <li><strong>StepID</strong>: A unique identifier for each step within a scenario</li>
            <li><strong>Instruction</strong>: What the tester should do</li>
            <li><strong>ExpectedResult</strong>: What should happen after following the instruction</li>
            <li><strong>Status</strong>: Optional field for tracking test status (e.g., "pass", "fail", "blocked")</li>
          </ul>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={() => window.open(componentsSheetUrl, '_blank')}
          startIcon={<OpenInNew />}
        >
          Open Components Sheet
        </Button>
        <Button 
          onClick={() => window.open(stepsSheetUrl, '_blank')}
          startIcon={<OpenInNew />}
        >
          Open Steps Sheet
        </Button>
        <Button onClick={() => setShowGuide(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );
  
  // Render dialog content
  const renderDialog = () => (
    <Dialog 
      open={open} 
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: '800px',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Assignment color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Test Instructions
          </Typography>
        </Box>
        
        <Box>
          <Tooltip title="View Spreadsheet Guide">
            <IconButton 
              onClick={() => setShowGuide(true)}
              edge="end"
              aria-label="guide"
              size="small"
              sx={{ mr: 1 }}
              color="info"
            >
              <Help fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit in Google Sheets">
            <IconButton 
              onClick={() => window.open(sheetsEditUrl, '_blank')}
              edge="end"
              aria-label="edit"
              size="small"
              sx={{ mr: 1 }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton onClick={handleClose} edge="end" aria-label="close" size="small">
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ 
        p: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Component Info */}
        <Box sx={{ 
          px: 3, 
          py: 2, 
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant="subtitle1" fontWeight="medium">
            {selectedOptions.component} - {selectedOptions.brand}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedOptions.uscContext === 'used' ? 'Used Cars' : 'Stock Cars'}
          </Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            flexGrow: 1,
            p: 4
          }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Loading test instructions...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            flexGrow: 1,
            p: 4
          }}>
            <Alert severity="error" sx={{ mb: 2, width: '100%', maxWidth: 500 }}>
              {error}
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
              This could be because the spreadsheet doesn't exist or you don't have access to it.
              Try checking the spreadsheet ID or creating a new test scenarios spreadsheet.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => setShowGuide(true)}
                startIcon={<Help />}
              >
                View Guide
              </Button>
              <Button 
                variant="contained" 
                size="small"
                onClick={() => {
                  setLoading(true);
                  // Retry loading after a short delay
                  setTimeout(() => {
                    getTestScenarios(selectedOptions)
                      .then(fetchedScenarios => {
                        setScenarios(fetchedScenarios);
                        setError(null);
                      })
                      .catch(err => {
                        console.error("Failed to fetch test scenarios:", err);
                        setError("Failed to load test instructions. Please try again later.");
                      })
                      .finally(() => setLoading(false));
                  }, 500);
                }}
              >
                Retry
              </Button>
            </Box>
          </Box>
        ) : scenarios.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            flexGrow: 1,
            p: 4,
            textAlign: 'center'
          }}>
            <Assignment color="disabled" sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" gutterBottom>
              No test scenarios found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
              There are no test scenarios for <strong>{selectedOptions.component} - {selectedOptions.brand} - {selectedOptions.uscContext}</strong>. 
              You can add test scenarios in the Google Sheet using our new two-sheet format.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                size="small"
                startIcon={<Help />}
                onClick={() => setShowGuide(true)}
              >
                View Guide
              </Button>
              <Button 
                variant="contained" 
                size="small"
                startIcon={<Edit />}
                onClick={() => window.open(sheetsEditUrl, '_blank')}
              >
                Edit Test Scenarios
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ 
            flexGrow: 1,
            overflow: 'auto',
            pb: 2
          }}>
            {/* Overall completion */}
            <Box sx={{ 
              padding: 3,
              borderBottom: `1px solid ${theme.palette.divider}`
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 1
              }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Overall Progress
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {progressData.completion}% Complete
                </Typography>
              </Box>
              
              {/* Progress bar */}
              <Box sx={{ 
                height: 8, 
                width: '100%', 
                bgcolor: theme.palette.grey[200],
                borderRadius: 1, 
                overflow: 'hidden',
                display: 'flex'
              }}>
                {progressData.passed > 0 && (
                  <Box 
                    sx={{ 
                      height: '100%', 
                      width: `${(progressData.passed / progressData.total) * 100}%`,
                      bgcolor: theme.palette.success.main
                    }} 
                  />
                )}
                {progressData.failed > 0 && (
                  <Box 
                    sx={{ 
                      height: '100%', 
                      width: `${(progressData.failed / progressData.total) * 100}%`,
                      bgcolor: theme.palette.error.main
                    }} 
                  />
                )}
                {progressData.blocked > 0 && (
                  <Box 
                    sx={{ 
                      height: '100%', 
                      width: `${(progressData.blocked / progressData.total) * 100}%`,
                      bgcolor: theme.palette.warning.main
                    }} 
                  />
                )}
              </Box>
              
              {/* Status legend */}
              <Box sx={{ display: 'flex', mt: 1, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: theme.palette.success.main,
                    mr: 0.5
                  }} />
                  <Typography variant="caption" color="text.secondary">
                    {progressData.passed} Passed
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: theme.palette.error.main,
                    mr: 0.5
                  }} />
                  <Typography variant="caption" color="text.secondary">
                    {progressData.failed} Failed
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: theme.palette.warning.main,
                    mr: 0.5
                  }} />
                  <Typography variant="caption" color="text.secondary">
                    {progressData.blocked} Blocked
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: theme.palette.grey[300],
                    mr: 0.5
                  }} />
                  <Typography variant="caption" color="text.secondary">
                    {progressData.notTested} Not Tested
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Divider />
          
            {/* Test scenarios */}
            {scenarios.map((scenario) => {
              const { completion, passed, failed, blocked } = getScenarioProgress(scenario.id, scenario.steps);
              const isExpanded = expandedScenario === scenario.id;
              
              return (
                <Accordion 
                  key={scenario.id}
                  expanded={isExpanded}
                  onChange={() => handleAccordionChange(scenario.id)}
                  disableGutters
                  elevation={0}
                  sx={{
                    '&:before': { display: 'none' },
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    sx={{
                      px: 3,
                      minHeight: '56px !important',
                      backgroundColor: isExpanded 
                        ? (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)')
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.08)' 
                          : 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {scenario.title}
                        </Typography>
                        
                        {/* Scenario progress indicators */}
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          mt: 0.5 
                        }}>
                          <Box
                            sx={{
                              height: 4,
                              width: 60,
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                              borderRadius: 1,
                              mr: 1,
                              overflow: 'hidden',
                              display: 'flex'
                            }}
                          >
                            {passed > 0 && (
                              <Box 
                                sx={{ 
                                  height: '100%', 
                                  width: `${(passed / scenario.steps.length) * 100}%`,
                                  bgcolor: theme.palette.success.main
                                }} 
                              />
                            )}
                            {failed > 0 && (
                              <Box 
                                sx={{ 
                                  height: '100%', 
                                  width: `${(failed / scenario.steps.length) * 100}%`,
                                  bgcolor: theme.palette.error.main
                                }} 
                              />
                            )}
                            {blocked > 0 && (
                              <Box 
                                sx={{ 
                                  height: '100%', 
                                  width: `${(blocked / scenario.steps.length) * 100}%`,
                                  bgcolor: theme.palette.warning.main
                                }} 
                              />
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {completion}% Complete
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* Status indicators */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {passed > 0 && (
                          <Tooltip title={`${passed} Passed`}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: theme.palette.success.main,
                                  display: 'inline-block',
                                  mr: 0.3,
                                }}
                              />
                              <Typography variant="caption">{passed}</Typography>
                            </Box>
                          </Tooltip>
                        )}
                        
                        {failed > 0 && (
                          <Tooltip title={`${failed} Failed`}>
                            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: theme.palette.error.main,
                                  display: 'inline-block',
                                  mr: 0.3,
                                }}
                              />
                              <Typography variant="caption">{failed}</Typography>
                            </Box>
                          </Tooltip>
                        )}
                        
                        {blocked > 0 && (
                          <Tooltip title={`${blocked} Blocked`}>
                            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: theme.palette.warning.main,
                                  display: 'inline-block',
                                  mr: 0.3,
                                }}
                              />
                              <Typography variant="caption">{blocked}</Typography>
                            </Box>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </AccordionSummary>
                  
                  <AccordionDetails sx={{ px: 3, py: 2 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {scenario.description}
                    </Typography>
                    
                    <List disablePadding>
                      {scenario.steps.map((step, stepIndex) => {
                        const stepKey = `${scenario.id}-${step.id}`;
                        const status = stepStatuses[stepKey];
                        const showResult = showExpectedResults[step.id];
                        
                        return (
                          <React.Fragment key={step.id}>
                            <ListItem 
                              disablePadding 
                              sx={{ 
                                py: 1,
                                px: 0,
                                opacity: status ? 0.85 : 1,
                                transition: 'all 0.2s',
                                backgroundColor: status ? 
                                  `${getStatusColor(status)}10` : // 10% opacity of the status color
                                  'transparent',
                                borderRadius: 1,
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                <IconButton
                                  size="small"
                                  sx={{ 
                                    color: status ? getStatusColor(status) : 'inherit',
                                    p: 0.5 
                                  }}
                                  onClick={() => setStepStatus(scenario.id, step.id, 'pass')}
                                >
                                  {status === 'pass' ? <Check /> : <RadioButtonUnchecked />}
                                </IconButton>
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Typography 
                                    variant="body1"
                                    sx={{ 
                                      textDecoration: status ? 'line-through' : 'none',
                                      fontWeight: status ? 'normal' : 'medium',
                                    }}
                                  >
                                    {stepIndex + 1}. {step.instruction}
                                  </Typography>
                                }
                              />
                              
                              {/* Pass/Fail/Blocked buttons */}
                              <ButtonGroup size="small" sx={{ mr: 1 }}>
                                <Tooltip title="Pass">
                                  <Button 
                                    variant={status === 'pass' ? 'contained' : 'outlined'} 
                                    color="success"
                                    onClick={() => setStepStatus(scenario.id, step.id, 'pass')}
                                    sx={{ 
                                      minWidth: '32px',
                                      p: 0,
                                      borderColor: status === 'pass' ? 'transparent' : theme.palette.success.main
                                    }}
                                  >
                                    <Check fontSize="small" />
                                  </Button>
                                </Tooltip>
                                <Tooltip title="Fail">
                                  <Button 
                                    variant={status === 'fail' ? 'contained' : 'outlined'} 
                                    color="error"
                                    onClick={() => setStepStatus(scenario.id, step.id, 'fail')}
                                    sx={{ 
                                      minWidth: '32px',
                                      p: 0,
                                      borderColor: status === 'fail' ? 'transparent' : theme.palette.error.main
                                    }}
                                  >
                                    <Clear fontSize="small" />
                                  </Button>
                                </Tooltip>
                                <Tooltip title="Blocked">
                                  <Button 
                                    variant={status === 'blocked' ? 'contained' : 'outlined'} 
                                    color="warning"
                                    onClick={() => setStepStatus(scenario.id, step.id, 'blocked')}
                                    sx={{ 
                                      minWidth: '32px',
                                      p: 0,
                                      borderColor: status === 'blocked' ? 'transparent' : theme.palette.warning.main
                                    }}
                                  >
                                    <Block fontSize="small" />
                                  </Button>
                                </Tooltip>
                              </ButtonGroup>
                              
                              <Tooltip title="View expected result">
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpectedResult(step.id);
                                  }}
                                >
                                  {showResult ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                                </IconButton>
                              </Tooltip>
                            </ListItem>
                            
                            <Collapse in={showResult}>
                              <Box 
                                sx={{ 
                                  ml: 5, 
                                  mb: 2, 
                                  p: 2,
                                  borderRadius: 1,
                                  backgroundColor: theme.palette.mode === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.05)' 
                                    : theme.palette.grey[50],
                                  border: `1px solid ${theme.palette.divider}`,
                                  display: 'flex',
                                  alignItems: 'flex-start'
                                }}
                              >
                                <Help 
                                  fontSize="small" 
                                  color="info" 
                                  sx={{ mt: 0.3, mr: 1, opacity: 0.7 }}
                                />
                                <Typography variant="body2">
                                  <strong>Expected Result:</strong> {step.expectedResult}
                                </Typography>
                              </Box>
                            </Collapse>
                            
                            {stepIndex < scenario.steps.length - 1 && (
                              <Divider sx={{ ml: 5 }} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </List>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={() => resetScenario(scenario.id, scenario.steps)}
                        startIcon={<RefreshIcon />}
                      >
                        Reset Progress
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        )}
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ py: 2, px: 3 }}>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
          Test scenarios are managed in{' '}
          <Link 
            href={sheetsEditUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: 'inline-flex', alignItems: 'center' }}
          >
            Google Sheets
            <Launch fontSize="inherit" sx={{ ml: 0.5, fontSize: '0.8rem' }} />
          </Link>
        </Typography>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  return (
    <>
      {renderFab()}
      {renderDialog()}
      {renderGuide()}
    </>
  );
};

// Simple table component for the guide
const Table = ({ headers, rows }: { headers: string[], rows: any[][] }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 1,
      overflow: 'auto',
      maxWidth: '100%'
    }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        fontSize: '0.875rem'
      }}>
        <thead>
          <tr style={{ 
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            textAlign: 'left'
          }}>
            {headers.map((header, index) => (
              <th key={index} style={{ 
                padding: '8px 12px',
                borderBottom: `1px solid ${theme.palette.divider}`,
                fontWeight: 'bold'
              }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} style={{
              backgroundColor: rowIndex % 2 === 0 
                ? 'transparent' 
                : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.01)')
            }}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} style={{ 
                  padding: '8px 12px',
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
};

// Needed for the Reset button
const RefreshIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
  </svg>
);

export default TestInstructions;