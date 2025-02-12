import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Grid,
  Paper,
  Snackbar,
  Alert,
  IconButton,
  ButtonGroup,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    background: {
      default: '#F5F7F5',
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, #F5F7F5 0%, #E8F5E9 100%)',
          minHeight: '100vh',
          paddingTop: '2rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, #ffffff 0%, #F5F7F5 100%)',
          boxShadow: '0 8px 32px rgba(46, 125, 50, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#4CAF50',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2E7D32',
            },
          },
        },
      },
    },
  },
  typography: {
    h4: {
      color: '#1B5E20',
      fontWeight: 600,
    },
    h6: {
      color: '#2E7D32',
      fontWeight: 500,
    },
  },
});

interface DayData {
  target: number;
  actual: number;
  coefficient: number;
  name: string;
}

function App() {
  const [weeklyGoal, setWeeklyGoal] = useState<number>(500);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [days, setDays] = useState<DayData[]>([
    { name: 'Lundi', target: 0, actual: 0, coefficient: 1 },
    { name: 'Mardi', target: 0, actual: 0, coefficient: 1 },
    { name: 'Mercredi', target: 0, actual: 0, coefficient: 1 },
    { name: 'Jeudi', target: 0, actual: 0, coefficient: 1 },
    { name: 'Vendredi', target: 0, actual: 0, coefficient: 3 },
    { name: 'Samedi', target: 0, actual: 0, coefficient: 3 },
    { name: 'Dimanche', target: 0, actual: 0, coefficient: 0 },
  ]);

  useEffect(() => {
    calculateDailyTargets();
  }, [weeklyGoal]);

  const calculateDailyTargets = () => {
    const totalCoefficients = days.reduce((sum, day) => sum + day.coefficient, 0);
    const baseTarget = weeklyGoal / totalCoefficients;

    const newDays = days.map(day => ({
      ...day,
      target: Math.round(baseTarget * day.coefficient),
    }));

    setDays(newDays);
  };

  const handleActualChange = (index: number, value: number) => {
    const newDays = [...days];
    newDays[index].actual = value;

    const totalActual = newDays.reduce((sum, day) => sum + day.actual, 0);
    const remaining = weeklyGoal - totalActual;

    if (remaining < 0) {
      setSuccessMessage(`Vous avez dépassé votre objectif de ${Math.abs(remaining)}€`);
      setShowSuccess(true);
    }

    // Calculer les nouveaux objectifs pour les jours suivants
    const totalRemainingCoefficients = newDays
      .slice(index + 1)
      .reduce((sum, day) => sum + day.coefficient, 0);

    if (totalRemainingCoefficients > 0) {
      const remainingBaseTarget = Math.max(0, remaining) / totalRemainingCoefficients;

      for (let i = index + 1; i < newDays.length; i++) {
        newDays[i].target = Math.round(remainingBaseTarget * newDays[i].coefficient);
      }
    }

    setDays(newDays);
  };

  const handleCoefficientChange = (index: number, increment: boolean) => {
    const newDays = [...days];
    const newCoefficient = increment 
      ? newDays[index].coefficient + 0.5 
      : Math.max(0, newDays[index].coefficient - 0.5);
    
    newDays[index] = {
      ...newDays[index],
      coefficient: newCoefficient
    };
    
    setDays(newDays);
  };

  const totalRealized = days.reduce((sum, day) => sum + day.actual, 0);
  const isObjectiveReached = totalRealized >= weeklyGoal;

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 4,
          padding: { xs: 2, sm: 4 },
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
        }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" 
            sx={{ 
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
              marginBottom: 4,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
            }}>
            Calculateur d'Objectifs VTC
          </Typography>
          
          <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Objectif de la semaine (€)
            </Typography>
            <TextField
              fullWidth
              type="number"
              value={weeklyGoal || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeeklyGoal(Number(e.target.value))}
              variant="outlined"
              inputProps={{ min: 0 }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                }
              }}
            />
          </Paper>

          <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
            <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
              <Grid item xs={12}>
                <Grid container spacing={{ xs: 1, sm: 2 }}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary.dark" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Jour</Typography>
                  </Grid>
                  <Grid item xs={4} sm={3}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary.dark" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Coef.</Typography>
                  </Grid>
                  <Grid item xs={4} sm={3}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary.dark" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Objectif</Typography>
                  </Grid>
                  <Grid item xs={4} sm={3}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary.dark" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Réalisé</Typography>
                  </Grid>
                </Grid>
              </Grid>

              {days.map((day, index) => (
                <Grid item xs={12} key={day.name}>
                  <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <Typography color="primary.main" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{day.name}</Typography>
                    </Grid>
                    <Grid item xs={4} sm={3}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: { xs: 'flex-start', sm: 'flex-start' },
                        gap: 1
                      }}>
                        <ButtonGroup 
                          size="small" 
                          sx={{ 
                            backgroundColor: 'white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            borderRadius: '4px',
                            '& .MuiButtonGroup-grouped:not(:last-of-type)': {
                              borderColor: 'rgba(46, 125, 50, 0.2)',
                            }
                          }}
                        >
                          <IconButton
                            onClick={() => handleCoefficientChange(index, false)}
                            size="small"
                            sx={{
                              color: 'primary.main',
                              p: { xs: '4px', sm: '8px' },
                              '&:hover': {
                                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                              }
                            }}
                          >
                            <RemoveIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                          </IconButton>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            px: { xs: 1, sm: 2 },
                            minWidth: { xs: '2rem', sm: '3rem' },
                            justifyContent: 'center',
                            color: 'primary.main',
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          }}>
                            {day.coefficient}x
                          </Box>
                          <IconButton
                            onClick={() => handleCoefficientChange(index, true)}
                            size="small"
                            sx={{
                              color: 'primary.main',
                              p: { xs: '4px', sm: '8px' },
                              '&:hover': {
                                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                              }
                            }}
                          >
                            <AddIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                          </IconButton>
                        </ButtonGroup>
                      </Box>
                    </Grid>
                    <Grid item xs={4} sm={3}>
                      <Typography color="primary.main" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{day.target}€</Typography>
                    </Grid>
                    <Grid item xs={4} sm={3}>
                      <TextField
                        type="number"
                        value={day.actual || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleActualChange(index, Number(e.target.value))}
                        variant="outlined"
                        size="small"
                        fullWidth
                        inputProps={{ min: 0 }}
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                          },
                          '& input': {
                            padding: { xs: '0.5rem', sm: '1rem' },
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Paper>

          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 2, sm: 3 }, 
              borderRadius: 2,
              background: isObjectiveReached
                ? 'linear-gradient(145deg, #2E7D32 0%, #1B5E20 100%)'
                : 'linear-gradient(145deg, #d32f2f 0%, #c62828 100%)',
              transition: 'background 0.3s ease-in-out',
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: { xs: 'center', sm: 'space-between' }, 
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap'
            }}>
              <Typography variant="h6" fontWeight="bold" sx={{ 
                color: 'white',
                fontSize: { xs: '1rem', sm: '1.25rem' },
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                Total réalisé : {totalRealized}€ / {weeklyGoal}€
              </Typography>
              <Typography sx={{ 
                color: 'white',
                fontSize: { xs: '0.875rem', sm: '1rem' },
                opacity: 0.9
              }}>
                {isObjectiveReached 
                  ? `Félicitations ! Objectif dépassé de ${(totalRealized - weeklyGoal).toFixed(2)}€`
                  : `Reste à réaliser : ${(weeklyGoal - totalRealized).toFixed(2)}€`
                }
              </Typography>
            </Box>
          </Paper>
        </Box>

        <Snackbar
          open={showSuccess}
          autoHideDuration={3000}
          onClose={() => setShowSuccess(false)}
        >
          <Alert 
            severity="success" 
            onClose={() => setShowSuccess(false)}
            sx={{ 
              background: 'linear-gradient(145deg, #4CAF50 0%, #2E7D32 100%)',
              color: 'white',
              width: '100%'
            }}
          >
            {successMessage}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default App;
