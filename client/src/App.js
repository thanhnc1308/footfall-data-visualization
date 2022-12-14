import axios from 'axios';
import { useEffect, useState } from 'react';
// bar chart
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
// date range picker
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const barChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Footfall Visualization',
    },
  },
};

const cloneDeep = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

function App() {
  const DEFAULT_START_DATE = new Date('2020-11-03');
  const DEFAULT_END_DATE = new Date('2021-11-03');
  const [barChartData, setBarChartData] = useState({ labels: [], datasets: [] });
  const [normalizedChartData, setNormalizedChartData] = useState({ labels: [], datasets: [] });
  const [selectedDateRange, setSelectedDateRange] = useState({ startDate: DEFAULT_START_DATE, endDate: DEFAULT_END_DATE });
  const selectionRange = {
    startDate: DEFAULT_START_DATE,
    endDate: DEFAULT_END_DATE,
    key: 'selectedDateRange',
  };

  const loadData = async ({ startDate = DEFAULT_START_DATE, endDate = DEFAULT_END_DATE }) => {
    const response = await axios.get(`http://localhost:3001/footfall?startDate=${startDate}&endDate=${endDate}`);
    if (response.status === 200) {
      const footfallData = response.data.data;
      const labels = footfallData.map((footfallItem) => footfallItem.Time.slice(0, 10));
      const datasetItem = {
        label: 'Number of People by Day',
        data: footfallData.map((footfallItem) => footfallItem.Value),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      };
      setBarChartData({
        labels,
        datasets: [datasetItem],
      });
    }
  };

  const handleSelectDateRange = async (e) => {
    setSelectedDateRange(e.selectedDateRange);
  };

  const normalizeChartData = () => {
    if (!barChartData.datasets.length) {
      return;
    }
    console.log(barChartData.datasets);
    const footfallData = barChartData.datasets[0].data;
    const maxFootfall = Math.max(...footfallData);
    const _normalizedChartData = cloneDeep(barChartData);
    _normalizedChartData.datasets[0].data = footfallData.map((item) => Math.round((item / maxFootfall) * 100));
    setNormalizedChartData(_normalizedChartData);
  };

  useEffect(() => {
    loadData(selectedDateRange);
  }, [selectedDateRange]);

  useEffect(() => {
    normalizeChartData();
  }, [barChartData]);
  return (
    <div className="App">
      <div className="date-range-picker">
        <DateRangePicker ranges={[selectionRange]} onChange={handleSelectDateRange} />
      </div>
      <div className="original-chart">
        <Bar options={barChartOptions} data={barChartData} />
      </div>
      <div className="normalized-chart">
        <Bar options={barChartOptions} data={normalizedChartData} />
      </div>
    </div>
  );
}

export default App;
