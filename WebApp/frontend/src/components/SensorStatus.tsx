import Box from '@mui/material/Box';
import StatusLabel from './StatusLabel';
import socket from '../socket';
import { useEffect, useState } from 'react';

const GREEN = "#0be881"
const RED = "#ff3f34"
const YELLOW = "#ffa801"

export default function SensorStatus() {
    const [occupancy, setOccupancy] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(false);
    const [temp, setTemp] = useState(0);
    const [co2, setCO2] = useState(0);
    const [humidity, setHumidity] = useState(0);
    const [voc, setVOC] = useState(0);

    useEffect(() => {
        socket.on("connect", () => {
            setConnectionStatus(true);
        });

        socket.on("sensor_data", (data) => {
            console.log("recieved sensor data")
            console.log(data)
            setTemp(data.temperature);
            setCO2(data.co2);
            setHumidity(data.humidity);
            setVOC(data.humidity);
        });

        socket.on("occupancy", (data) => {
            setOccupancy(data);
        });

        return () => {
            socket.off("sensor_data");
            socket.off("occupancy");
            socket.off("connect");

            setConnectionStatus(false)
        }

    }, [])

    return (
        <Box gap={4} p={2} display="flex" flexWrap={"wrap"}>
            <StatusLabel label="Sensor Status" value={connectionStatus ? "Connected" : "Disconnected" } valueColor={connectionStatus ? GREEN : RED}/>
            <StatusLabel label="Occupancy" value={occupancy ? "Occupants detected" : "No occupants detected"} valueColor={occupancy ? GREEN : RED}/>
            <StatusLabel label="Temperature" units="K" value={temp} valueColor={YELLOW}/>
            <StatusLabel label="CO2" units="PPM" value={co2} valueColor={YELLOW}/>
            <StatusLabel label="Humidity" units="g/kg" value={humidity} valueColor={YELLOW}/>
        </Box>
    )
}