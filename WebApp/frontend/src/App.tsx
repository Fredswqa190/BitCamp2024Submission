import ToggleColorMode from './components/ToggleColorMode';
import useSocketSetup from "./useSocketSetup"
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { createContext, useMemo, useState } from "react"
import LiveChart from './components/LiveChart';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import SensorStatus from './components/SensorStatus';
import { Container, Grid } from '@mui/material';
import Chatbot from './components/chat';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export default function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
      }}),
    [mode],
  );

  useSocketSetup();

  return (
    <>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline enableColorScheme />
          <Box 
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: "100%",
              minWidth: "100%",
            }}
          >
            <ToggleColorMode/>
            {/* <Counter/> */}
            <SensorStatus />
            <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
            >
            <h1>LivePresence</h1>
          </Grid>
            <Grid marginTop="2em" container columns={4} direction="row">
              <LiveChart title="Temperature" dataKey="temperature"/>
              <LiveChart title="CO2" dataKey="co2"/>
              <LiveChart title="Humidity" dataKey="humidity"/>
              <LiveChart title="Volatile Organic Compounds" dataKey="voc"/>
              <Chatbot/>
            </Grid>            
          </Box>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </>
  );
}
