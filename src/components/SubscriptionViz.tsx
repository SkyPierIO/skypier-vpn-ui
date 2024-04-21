import { Typography } from '@mui/material';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';


export default function SubscriptionViz() {
  return (
    <>
      <Typography variant="h5" gutterBottom>
      </Typography>  
      <Gauge 
        width={300} 
        height={300} 
        value={28} 
        valueMax={60} 
        startAngle={-110} 
        endAngle={110} 
        sx={{
          [`& .${gaugeClasses.valueText}`]: {
            fontSize: 22,
          },
          [`& .${gaugeClasses.valueArc}`]: {
            fill: '#f6547d',
          }
        }}
        text={({ value, valueMax }) => `${value} days left / ${valueMax}`}/>
    </>
  );
}