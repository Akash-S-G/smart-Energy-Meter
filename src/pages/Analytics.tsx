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
    weeklyUsage: 0,
    weeklyUsageChange: 0,
    weeklyCost: 0,
    avgDailyCost: 0,
    monthlyTrendValue: 0,
    monthlyTrendChange: 0,
    efficiencyScore: 0,
    usageTrendsData: [],
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

  const { weeklyUsage, weeklyUsageChange, weeklyCost, avgDailyCost, monthlyTrendValue, monthlyTrendChange, efficiencyScore, usageTrendsData, deviceUsageData, tariffDistributionData } = analyticsData;

  const CustomPieChartLegend = ({ payload }) => {
    return (
      <ul className="space-y-2">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm font-medium">{entry.name}: {entry.value}%</span>
            </div>
            <div className="text-right">
              <p className="text-sm">₹{entry.payload.amount}</p>
              <p className="text-xs text-muted-foreground">{entry.payload.kwh} kWh</p>
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
            <CardTitle className="text-sm font-medium">Weekly Usage</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyUsage.toFixed(1)} kWh</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 inline-block text-green-500 mr-1" /> {weeklyUsageChange}% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{weeklyCost}</div>
            <p className="text-xs text-muted-foreground mt-1">₹{avgDailyCost} per day average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Trend</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{monthlyTrendValue}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 inline-block text-red-500 mr-1" /> {monthlyTrendChange}% vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{efficiencyScore}%</div>
            <Progress value={efficiencyScore} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Based on optimal usage patterns</p>
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
                    "Energy Usage": {
                      label: "Energy Usage",
                      color: "hsl(var(--chart-1))",
                    },
                    "Cost Breakdown": {
                      label: "Cost Breakdown",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="aspect-video h-[250px] w-full"
                >
                  <AreaChart
                    data={usageTrendsData}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
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
                              <p className="font-medium">{payload[0].payload.name}</p>
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
                      dataKey="Energy Usage"
                      stackId="1"
                      stroke="var(--color-Energy-Usage)"
                      fill="var(--color-Energy-Usage)"
                    />
                    <Area
                      type="monotone"
                      dataKey="Cost Breakdown"
                      stackId="1"
                      stroke="var(--color-Cost-Breakdown)"
                      fill="var(--color-Cost-Breakdown)"
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
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 text-sm shadow-sm">
                                <p className="font-medium">{payload[0].name}: {payload[0].value}%</p>
                                <p className="text-xs text-muted-foreground">₹{payload[0].payload.amount} ({payload[0].payload.kwh} kWh)</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 gap-2 min-w-[200px]">
                  {deviceUsageData.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm font-medium">{entry.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">₹{entry.amount}</p>
                        <p className="text-xs text-muted-foreground">{entry.kwh} kWh</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tariff Breakdown Content */}
        <TabsContent value="tariff-breakdown">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Tariff Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={tariffDistributionData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Tariff Rate (₹)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
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