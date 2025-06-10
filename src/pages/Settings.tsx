import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { User, Bell, Settings as SettingsIcon, Database, MapPin } from "lucide-react";
import { useState } from 'react';

const Settings = () => {
  // State for Profile Settings
  const [fullName, setFullName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [phoneNumber, setPhoneNumber] = useState("+91 98765 43210");
  const [serviceAddress, setServiceAddress] = useState("123 Energy Street, Mumbai, Maharashtra");

  // State for Notification Preferences
  const [billReminders, setBillReminders] = useState(true);
  const [usageAlerts, setUsageAlerts] = useState(true);
  const [peakHourWarnings, setPeakHourWarnings] = useState(true);
  const [monthlyReports, setMonthlyReports] = useState(true);

  // State for App Preferences
  const [language, setLanguage] = useState("English");
  const [currency, setCurrency] = useState("Indian Rupee");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [theme, setTheme] = useState("Light");

  // State for Data & Privacy
  const [shareUsageData, setShareUsageData] = useState(false);
  const [locationServices, setLocationServices] = useState(true);

  const handleSaveChanges = () => {
    console.log("Saving changes...");
    // In a real app, send this data to a backend API
    const settingsData = {
      profile: { fullName, email, phoneNumber, serviceAddress },
      notifications: { billReminders, usageAlerts, peakHourWarnings, monthlyReports },
      app: { language, currency, dateFormat, theme },
      privacy: { shareUsageData, locationServices },
    };
    console.log(settingsData);
    alert("Settings saved! (Check console for data)");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Customize your energy monitoring experience and notification preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceAddress">Service Address</Label>
              <Input id="serviceAddress" value={serviceAddress} onChange={(e) => setServiceAddress(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="billReminders" className="flex flex-col space-y-1">
              <span>Bill Reminders</span>
              <span className="font-normal leading-snug text-muted-foreground">Get notified when your bill is due</span>
            </Label>
            <Switch id="billReminders" checked={billReminders} onCheckedChange={setBillReminders} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="usageAlerts" className="flex flex-col space-y-1">
              <span>Usage Alerts</span>
              <span className="font-normal leading-snug text-muted-foreground">Alerts for unusual energy consumption</span>
            </Label>
            <Switch id="usageAlerts" checked={usageAlerts} onCheckedChange={setUsageAlerts} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="peakHourWarnings" className="flex flex-col space-y-1">
              <span>Peak Hour Warnings</span>
              <span className="font-normal leading-snug text-muted-foreground">Notify before peak pricing periods</span>
            </Label>
            <Switch id="peakHourWarnings" checked={peakHourWarnings} onCheckedChange={setPeakHourWarnings} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="monthlyReports" className="flex flex-col space-y-1">
              <span>Monthly Reports</span>
              <span className="font-normal leading-snug text-muted-foreground">Receive monthly energy usage summary</span>
            </Label>
            <Switch id="monthlyReports" checked={monthlyReports} onCheckedChange={setMonthlyReports} />
          </div>
        </CardContent>
      </Card>

      {/* App Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" /> App Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                  <SelectItem value="Marathi">Marathi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Indian Rupee">₹ Indian Rupee</SelectItem>
                  <SelectItem value="USD">$ USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger id="dateFormat">
                  <SelectValue placeholder="Select Date Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Light">Light</SelectItem>
                  <SelectItem value="Dark">Dark</SelectItem>
                  <SelectItem value="System">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" /> Data & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="shareUsageData" className="flex flex-col space-y-1">
              <span>Share Usage Data for Analytics</span>
              <span className="font-normal leading-snug text-muted-foreground">Help improve energy efficiency recommendations</span>
            </Label>
            <Switch id="shareUsageData" checked={shareUsageData} onCheckedChange={setShareUsageData} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="locationServices" className="flex flex-col space-y-1">
              <span>Location-Based Services</span>
              <span className="font-normal leading-snug text-muted-foreground">For weather-based energy insights</span>
            </Label>
            <Switch id="locationServices" checked={locationServices} onCheckedChange={setLocationServices} />
          </div>
          <div className="flex gap-4 mt-6">
            <Button variant="outline" className="flex-1">Export My Data</Button>
            <Button variant="destructive" className="flex-1">Delete Account</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mt-6">
        <Button size="lg" onClick={handleSaveChanges}>Save Changes</Button>
      </div>
    </div>
  );
};

export default Settings; 