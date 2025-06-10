import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUp, Clock, Zap, DollarSign, Lightbulb, TrendingUp, AlertTriangle, Brain, Sparkle, Loader2 } from "lucide-react";
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/config';

const Index = () => {
  const [dashboardData, setDashboardData] = useState({
    currentUsage: 0,
    todayUsage: 0,
    todayProjected: 0,
    spentSoFar: 0,
    currentTariffRate: 0,
    projectedMonthlyCost: 0,
    monthlyCostChange: 0,
    hourlyUsageData: [],
    aiInsights: [],
    quickTips: [],
    currentVoltage: 0,
    currentCurrent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard-data`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // Fetch data every 5 seconds (adjust as needed for real-time updates)
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="container mx-auto p-6 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-4"/> Loading dashboard...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-6 text-center text-red-500">Error loading dashboard: {error.message}</div>;
  }

  // Destructure data from state for easier access
  const { currentUsage, todayUsage, todayProjected, spentSoFar, currentTariffRate, projectedMonthlyCost, monthlyCostChange, hourlyUsageData, aiInsights, quickTips, currentVoltage, currentCurrent } = dashboardData;

  // Find the specific AI insights based on type for display
  const monthlyBillPrediction = aiInsights.find(tip => tip.type === 'monthly-bill-prediction');
  const optimalLaundryTime = aiInsights.find(tip => tip.type === 'optimal-laundry-time');
  const unusualSpikeDetected = aiInsights.find(tip => tip.type === 'unusual-spike-detected');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Energy Dashboard</h1>
        <p className="text-muted-foreground">Monitor your real-time energy consumption and optimize your usage</p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Usage</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentUsage.toFixed(2)} kW</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">●</span> Off-Peak Rate ₹3.5/kWh
            </p>
            <p className="text-xs text-muted-foreground">₹{ (currentUsage * 3.5).toFixed(2) }/hour</p>
            <p className="text-xs text-muted-foreground mt-2">Last updated: {new Date().toLocaleTimeString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Voltage</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-muted-foreground">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L13.5 21.75l1.5-4.5H3.75z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeof currentVoltage === 'number' ? currentVoltage.toFixed(2) : 'N/A'} V</div>
            <p className="text-xs text-muted-foreground mt-1">Live reading from sensor</p>
            <p className="text-xs text-muted-foreground mt-2">Last updated: {new Date().toLocaleTimeString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Current</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-muted-foreground">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5l-6 6m0 0l6 6m-6-6h15m-15 0a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeof currentCurrent === 'number' ? currentCurrent.toFixed(2) : 'N/A'} mA</div>
            <p className="text-xs text-muted-foreground mt-1">Live reading from sensor</p>
            <p className="text-xs text-muted-foreground mt-2">Last updated: {new Date().toLocaleTimeString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Usage</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayUsage.toFixed(2)} kWh</div>
            <p className="text-xs text-muted-foreground">of {todayProjected.toFixed(2)} kWh projected</p>
            <Progress value={(todayUsage / todayProjected) * 100} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">₹{spentSoFar.toFixed(2)} spent so far</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Tariff</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">OFF-PEAK</Badge>
              <span className="ml-2">₹{currentTariffRate.toFixed(2)}/kWh</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">10 PM - 6 AM</p>
            <Alert className="mt-2 p-2 text-xs">
              <Lightbulb className="h-4 w-4 inline-block mr-2" />
              Normal rates. Off-peak hours (₹3.5/unit) start at 10 PM
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{typeof projectedMonthlyCost === 'number' ? projectedMonthlyCost.toFixed(0) : 'N/A'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className={`h-3 w-3 inline-block mr-1 ${typeof monthlyCostChange === 'number' && monthlyCostChange > 0 ? 'text-red-500' : 'text-green-500'}`} /> 
              {typeof monthlyCostChange === 'number' && monthlyCostChange > 0 ? `+${monthlyCostChange}` : monthlyCostChange}% from last month
            </p>
            <p className="text-xs text-muted-foreground">Based on current usage patterns</p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Alert */}
      {unusualSpikeDetected && (
        <Alert variant="destructive" className="bg-orange-50 text-orange-800 border-orange-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-orange-900">Usage Alert</AlertTitle>
          <AlertDescription className="text-orange-800">
            {unusualSpikeDetected.message}
            <br />
            <a href="#" className="underline">Check for appliances left running</a>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Hourly Usage Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Hourly Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  usage: {
                    label: "Usage (kW)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="aspect-video h-[250px] w-full"
              >
                <LineChart
                  data={Array.isArray(hourlyUsageData) ? hourlyUsageData : []}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="time"
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
                    cursor={false}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 text-sm shadow-sm">
                            Time: {payload[0].payload.time}<br/>
                            Usage: {typeof payload[0].value === 'number' ? payload[0].value.toFixed(2) : 'N/A'} kWh
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    dataKey="usage"
                    type="monotone"
                    stroke="var(--color-usage)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-usage)",
                      stroke: "var(--color-usage)",
                      strokeWidth: 2,
                      r: 4,
                    }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* AI Insights Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.isArray(aiInsights) && aiInsights.length > 0 ? (
                aiInsights.map((insight, index) => (
                  <div key={index}>
                    <p className="font-medium">{insight.title} <Badge variant="secondary">{insight.priority}</Badge></p>
                    <p className="text-sm text-muted-foreground">{insight.message}</p>
                    <p className="text-xs text-muted-foreground mt-1"><Clock className="h-3 w-3 inline-block mr-1"/> {insight.timestamp}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No AI insights available at the moment.</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkle className="h-5 w-5" />
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.isArray(quickTips) && quickTips.length > 0 ? (
                quickTips.map((tip, index) => (
                  <div key={index}>
                    <p className="font-medium">{tip.title}</p>
                    <p className="text-sm text-muted-foreground">{tip.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No quick tips available at the moment.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
