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
      month: "",
      kWhUsed: 0,
      totalAmount: 0,
      avgRate: 0,
      breakdown: {
        peak: { amount: 0, kWh: 0, rate: 0 },
        normal: { amount: 0, kWh: 0, rate: 0 },
        offPeak: { amount: 0, kWh: 0, rate: 0 },
      },
      additionalCharges: [],
    },
    paymentSummary: {
      thisMonth: 0,
      lastMonth: 0,
      sixMonthAverage: 0,
      totalPaidSixMonths: 0,
    },
    paymentHistory: [],
    monthlyBillsHistory: [],
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

  const { currentBill, paymentSummary, paymentHistory, monthlyBillsHistory } = billingData;

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
              <CardTitle>Current Bill - {currentBill.month}</CardTitle>
              <Button variant="link" className="p-0 h-auto text-sm">Current Period <ChevronRight className="h-4 w-4 inline-block ml-1"/></Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div>
                  <div className="text-3xl font-bold">{currentBill.kWhUsed}</div>
                  <p className="text-sm text-muted-foreground">kWh Used</p>
                </div>
                <div>
                  <div className="text-3xl font-bold">₹{currentBill.totalAmount}</div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                </div>
                <div>
                  <div className="text-3xl font-bold">₹{currentBill.avgRate.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground">Avg Rate/kWh</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-3">Usage Breakdown by Tariff</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500" />
                    <div>
                      <p className="font-medium">Peak Hours</p>
                      <p className="text-xs text-muted-foreground">6 AM - 10 AM & 6 PM - 10 PM • ₹{currentBill.breakdown.peak.rate}/kWh</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{currentBill.breakdown.peak.amount}</p>
                    <p className="text-xs text-muted-foreground">{currentBill.breakdown.peak.kWh} kWh</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-orange-500" />
                    <div>
                      <p className="font-medium">Normal Hours</p>
                      <p className="text-xs text-muted-foreground">10 AM - 6 PM • ₹{currentBill.breakdown.normal.rate}/kWh</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{currentBill.breakdown.normal.amount}</p>
                    <p className="text-xs text-muted-foreground">{currentBill.breakdown.normal.kWh} kWh</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-green-500" />
                    <div>
                      <p className="font-medium">Off-Peak Hours</p>
                      <p className="text-xs text-muted-foreground">10 PM - 6 AM • ₹{currentBill.breakdown.offPeak.rate}/kWh</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{currentBill.breakdown.offPeak.amount}</p>
                    <p className="text-xs text-muted-foreground">{currentBill.breakdown.offPeak.kWh} kWh</p>
                  </div>
                </div>
              </div>
              {currentBill.additionalCharges.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Additional Charges</h3>
                  {/* Render additional charges here */}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Bills History */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Bills History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyBillsHistory.map((bill, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{bill.month}</p>
                      <p className="text-sm text-muted-foreground">{bill.kwh} kWh total usage</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="destructive">Peak: ₹{bill.peak}</Badge>
                      <Badge variant="default">Normal: ₹{bill.normal}</Badge>
                      <Badge variant="secondary">Off-peak: ₹{bill.offPeak}</Badge>
                      <p className="font-bold text-lg">₹{bill.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" size="lg"><Wallet className="mr-2 h-5 w-5"/> Pay Current Bill</Button>
              <Button variant="outline" className="w-full" size="lg"><Download className="mr-2 h-5 w-5"/> Download Bill</Button>
              <Button variant="outline" className="w-full" size="lg">Set Auto-Pay</Button>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <p className="text-sm">This Month</p>
                <p className="font-medium">₹{paymentSummary.thisMonth}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm">Last Month</p>
                <p className="font-medium">₹{paymentSummary.lastMonth}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm">6-Month Average</p>
                <p className="font-medium">₹{paymentSummary.sixMonthAverage}</p>
              </div>
              <div className="flex justify-between font-bold border-t pt-2 mt-2">
                <p>Total Paid (6 months)</p>
                <p>₹{paymentSummary.totalPaidSixMonths}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentHistory.map((payment, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{payment.month}</p>
                    <p className="text-xs text-muted-foreground">{payment.status === "Pending" ? `Due Date: ${payment.dueDate}` : `Paid on: ${payment.paidDate}`}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">₹{payment.amount}</p>
                    {payment.status === "Paid" ? (
                      <Badge className="bg-green-100 text-green-800 border-green-300">Paid</Badge>
                    ) : (
                      <Badge variant="destructive">Pending</Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Billing Alerts */}
          <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
            <AlertTitle className="text-red-900">Billing Alerts</AlertTitle>
            <AlertDescription className="text-red-800 space-y-2">
              <p>
                <DollarSign className="h-3 w-3 inline-block mr-1"/> Your current bill is 12% higher than last month
              </p>
              <p>
                <Clock className="h-3 w-3 inline-block mr-1"/> Payment due in 5 days
              </p>
              <p>
                <Lightbulb className="h-3 w-3 inline-block mr-1"/> Save ₹45/month by shifting usage to off-peak hours
              </p>
            </AlertDescription>
          </Alert>

          {/* Instant Payment (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle>Instant payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">UPI Payment</p>
              <p className="font-medium">PhonePe, GPay, Paytm</p>
            </CardContent>
          </Card>

          {/* Auto-Pay (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle>Auto-Pay</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">Never miss a payment</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Billing; 