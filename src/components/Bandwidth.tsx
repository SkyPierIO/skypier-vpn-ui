import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';

export default function Bandwidth() {
  return (
    <LineChart
      xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
      series={[
        {
          label: "Upload",
          data: [2, 5.5, 2, 8.5, 1.5, 5],
          area: true,
          color: "#f6547d"
        },
        {
          label: "Download",
          data: [3, 7, 3.8, 16.5, 4, 7.9],
          area: true,
          color: "#641691"
        },
      ]}
      width={850}
      height={300}
      margin={{ left: 0, right: 0  }}
    />
  );
}