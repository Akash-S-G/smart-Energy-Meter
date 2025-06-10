import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, Wallet, Clock, CheckCircle, XCircle, ChevronRight, DollarSign, Lightbulb, Loader2 } from "lucide-react";
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config';

const Billing = () => {
  const [billingData, setBillingData] = useState({
    currentBill: {
      period: "",
      dueDate: "",
      totalAmount: 0,
      consumption: 0,
      status: "",
      details: [],
    },
    pastBills: [],
    paymentOptions: [],
    alerts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/billing-data`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBillingData(data);
      } catch (error) {
        console.error("Error fetching billing data:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
    // Fetch data every 5 seconds (adjust as needed for real-time updates)
    const interval = setInterval(fetchBillingData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="container mx-auto p-6 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-4"/> Loading billing information...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-6 text-center text-red-500">Error loading billing information: {error.message}</div>;
  }

  const { currentBill, pastBills, paymentOptions, alerts } = billingData;

  const currentMonth = currentBill.period.split('-')[0].trim();
  const avgRate = currentBill.consumption > 0 ? (currentBill.totalAmount / currentBill.consumption) : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Billing & Payments</h1>
        <p className="text-muted-foreground">Manage your energy bills and payment history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Current Bill Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Current Bill - {currentBill.period}</CardTitle>
              <Button variant="link" className="p-0 h-auto text-sm">Current Period <ChevronRight className="h-4 w-4 inline-block ml-1"/></Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div>
                  <div className="text-3xl font-bold">{currentBill.consumption}</div>
                  <p className="text-sm text-muted-foreground">kWh Used</p>
                </div>
                <div>
                  <div className="text-3xl font-bold">₹{currentBill.totalAmount.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                </div>
                <div>
                  <div className="text-3xl font-bold">₹{avgRate.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">Avg Rate/kWh</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-3">Bill Details</h3>
              <div className="space-y-3">
                {currentBill.details.map((detail, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <p className="font-medium">{detail.description}</p>
                    <p className="font-medium">₹{detail.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between items-center font-bold text-lg border-t pt-4">
                <span>Current Bill Status:</span>
                <Badge variant={currentBill.status === 'Unpaid' ? 'destructive' : 'success'}>
                  {currentBill.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Due Date: {currentBill.dueDate}</p>
            </CardContent>
          </Card>

          {/* Past Bills Section */}
          <Card>
            <CardHeader>
              <CardTitle>Past Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pastBills.length > 0 ? (
                  pastBills.map((bill, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{bill.period}</p>
                        <p className="text-sm text-muted-foreground">Consumption: {bill.consumption} kWh</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={bill.status === 'Paid' ? 'success' : 'destructive'}>
                          {bill.status}
                        </Badge>
                        <p className="font-bold text-lg">₹{bill.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No past bills available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Payment Options */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {paymentOptions.map((option, index) => (
                <Button key={index} className="w-full" size="lg" variant="outline">
                  <span className="mr-2 text-xl">{option.icon}</span> {option.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Alerts/Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Alerts & Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.length > 0 ? (
                alerts.map((alert, index) => (
                  <Alert key={index} className="p-3 text-sm">
                    <Lightbulb className="h-4 w-4 inline-block mr-2"/>
                    <AlertDescription>{alert}</AlertDescription>
                  </Alert>
                ))
              ) : (
                <p className="text-muted-foreground">No new alerts.</p>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" size="lg"><Wallet className="mr-2 h-5 w-5"/> Pay Current Bill</Button>
              <Button variant="outline" className="w-full" size="lg"><Download className="mr-2 h-5 w-5"/> Download Bill</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Billing; 