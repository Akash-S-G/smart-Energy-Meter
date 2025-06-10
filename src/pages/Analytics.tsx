import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChartContainer } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import { TrendingUp, Percent, BarChart2, DollarSign, CalendarDays, Loader2 } from "lucide-react";
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    summary: {
      totalConsumption: 0,
      averageDaily: 0,
      peakDemand: 0,
      costSavings: 0,
    },
    dailyUsageData: [],
    weeklyTrendData: [],
    monthlyTrendData: [],
    deviceUsageData: [],
    tariffDistributionData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/analytics-data`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
    // Fetch data every 5 seconds (adjust as needed for real-time updates)
    const interval = setInterval(fetchAnalyticsData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="container mx-auto p-6 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-4"/> Loading analytics...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-6 text-center text-red-500">Error loading analytics: {error.message}</div>;
  }

  const { summary, dailyUsageData, weeklyTrendData, monthlyTrendData, deviceUsageData, tariffDistributionData } = analyticsData;

  const CustomPieChartLegend = ({ payload }: { payload?: any[] }) => {
    return (
      <ul className="space-y-2">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm font-medium">{entry.name}: {entry.value}%</span>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Energy Analytics</h1>
        <p className="text-muted-foreground">Detailed insights into your energy consumption patterns and trends</p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consumption</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeof summary.totalConsumption === 'number' ? summary.totalConsumption.toFixed(1) : 'N/A'} kWh</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 inline-block text-green-500 mr-1" /> {typeof summary.averageDaily === 'number' ? summary.averageDaily.toFixed(1) : 'N/A'} kWh average daily
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{typeof summary.costSavings === 'number' ? summary.costSavings.toFixed(0) : 'N/A'}</div>
            <p className="text-xs text-muted-foreground mt-1">compared to last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Demand</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeof summary.peakDemand === 'number' ? summary.peakDemand.toFixed(1) : 'N/A'} kW</div>
            <p className="text-xs text-muted-foreground mt-1">
              Highest usage recorded this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily Cost</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{typeof summary.averageDaily === 'number' ? (summary.averageDaily * 6).toFixed(0) : 'N/A'}</div>
            <p className="text-xs text-muted-foreground mt-1">Based on daily consumption</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Usage Trends, Device Analysis, Tariff Breakdown */}
      <Tabs defaultValue="usage-trends" className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="usage-trends">Usage Trends</TabsTrigger>
          <TabsTrigger value="device-analysis">Device Analysis</TabsTrigger>
          <TabsTrigger value="tariff-breakdown">Tariff Breakdown</TabsTrigger>
        </TabsList>

        {/* Usage Trends Content */}
        <TabsContent value="usage-trends">
          <Card>
            <CardHeader>
              <CardTitle>Usage Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    "Daily Usage": {
                      label: "Daily Usage",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="aspect-video h-[250px] w-full"
                >
                  <AreaChart
                    data={dailyUsageData}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 text-sm shadow-sm">
                              <p className="font-medium">{payload[0].payload.date}</p>
                              {payload.map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <span
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  {item.name}: {item.value}
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="usage"
                      stackId="1"
                      stroke="var(--color-Daily-Usage)"
                      fill="var(--color-Daily-Usage)"
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Device Analysis Content */}
        <TabsContent value="device-analysis">
          <Card>
            <CardHeader>
              <CardTitle>Device Usage Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="h-[250px] w-[250px]">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={deviceUsageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {deviceUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={["#EF4444", "#F97316", "#F59E0B", "#10B981", "#3B82F6"][index % 5]} />
                        ))}
                      </Pie>
                      <Legend content={<CustomPieChartLegend />} layout="vertical" align="right" verticalAlign="middle" />
                      <Tooltip formatter={(value, name, props) => [`${value}%`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tariff Breakdown Content */}
        <TabsContent value="tariff-breakdown">
          <Card>
            <CardHeader>
              <CardTitle>Tariff Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer>
                  <BarChart
                    data={tariffDistributionData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics; 