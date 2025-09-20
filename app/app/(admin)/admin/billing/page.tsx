'use client';

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  FileText,
  Filter,
  Search,
  Settings,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


// Mock billing data
const mockBillingRecords = [
  {
    id: '1',
    studentName: 'Emma Johnson',
    parentName: 'Sarah Johnson',
    amount: 1200,
    dueDate: '2024-01-15',
    paidDate: '2024-01-12',
    status: 'paid',
    type: 'tuition',
    invoiceNumber: 'INV-2024-001',
  },
  {
    id: '2',
    studentName: 'Liam Chen',
    parentName: 'Wei Chen',
    amount: 1200,
    dueDate: '2024-01-15',
    paidDate: null,
    status: 'pending',
    type: 'tuition',
    invoiceNumber: 'INV-2024-002',
  },
  {
    id: '3',
    studentName: 'Sophia Rodriguez',
    parentName: 'Maria Rodriguez',
    amount: 1200,
    dueDate: '2024-01-15',
    paidDate: null,
    status: 'overdue',
    type: 'tuition',
    invoiceNumber: 'INV-2024-003',
  },
  {
    id: '4',
    studentName: 'Emma Johnson',
    parentName: 'Sarah Johnson',
    amount: 150,
    dueDate: '2024-01-20',
    paidDate: '2024-01-18',
    status: 'paid',
    type: 'materials',
    invoiceNumber: 'INV-2024-004',
  },
  {
    id: '5',
    studentName: 'Liam Chen',
    parentName: 'Wei Chen',
    amount: 75,
    dueDate: '2024-01-25',
    paidDate: null,
    status: 'pending',
    type: 'field_trip',
    invoiceNumber: 'INV-2024-005',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-accent/20 text-accent border-accent/30';
    case 'pending':
      return 'bg-primary/20 text-primary border-primary/30';
    case 'overdue':
      return 'bg-destructive/20 text-destructive border-destructive/30';
    default:
      return 'bg-muted text-muted-foreground border-muted';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'tuition':
      return 'bg-primary/20 text-primary';
    case 'materials':
      return 'bg-accent/20 text-accent';
    case 'field_trip':
      return 'bg-secondary/20 text-secondary-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export default function AdminBilling() {
  const totalRevenue = mockBillingRecords.reduce(
    (sum, record) => sum + record.amount,
    0
  );
  const paidAmount = mockBillingRecords
    .filter((record) => record.status === 'paid')
    .reduce((sum, record) => sum + record.amount, 0);
  const pendingAmount = mockBillingRecords
    .filter((record) => record.status === 'pending')
    .reduce((sum, record) => sum + record.amount, 0);
  const overdueAmount = mockBillingRecords
    .filter((record) => record.status === 'overdue')
    .reduce((sum, record) => sum + record.amount, 0);

  const paidRecords = mockBillingRecords.filter(
    (record) => record.status === 'paid'
  );
  const pendingRecords = mockBillingRecords.filter(
    (record) => record.status === 'pending'
  );
  const overdueRecords = mockBillingRecords.filter(
    (record) => record.status === 'overdue'
  );

  const collectionRate =
    totalRevenue > 0 ? (paidAmount / totalRevenue) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Billing Management
              </h1>
              <p className="text-muted-foreground">
                Manage tuition, fees, and payment processing
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
                <DollarSign className="w-4 h-4 mr-2" />
                Process Payment
              </Button>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ${totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Collected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">
                  ${paidAmount.toLocaleString()}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={collectionRate} className="h-2 flex-1" />
                  <span className="text-xs text-muted-foreground">
                    {Math.round(collectionRate)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  ${pendingAmount.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {pendingRecords.length} invoices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Overdue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  ${overdueAmount.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {overdueRecords.length} invoices
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by student name, parent name, or invoice number..."
                    className="w-full"
                  />
                </div>
                <Button variant="outline">
                  <Search className="w-4 h-4" />
                </Button>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Billing Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Invoices</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="space-y-4">
                {mockBillingRecords.map((record) => (
                  <Card key={record.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 bg-primary/20">
                            <AvatarFallback className="text-primary font-medium">
                              {record.studentName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">
                              {record.studentName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Parent: {record.parentName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Invoice: {record.invoiceNumber}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">
                            ${record.amount.toLocaleString()}
                          </div>
                          <Badge
                            className={getStatusColor(record.status)}
                            variant="outline"
                          >
                            {record.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={getTypeColor(record.type)}
                              variant="outline"
                            >
                              {record.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>
                              Due:{' '}
                              {new Date(record.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                          {record.paidDate && (
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-accent" />
                              <span>
                                Paid:{' '}
                                {new Date(record.paidDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          {record.status === 'overdue' && (
                            <div className="flex items-center gap-2 text-sm text-destructive">
                              <AlertCircle className="w-4 h-4" />
                              <span>Payment overdue</span>
                            </div>
                          )}
                          {record.status === 'pending' && (
                            <div className="flex items-center gap-2 text-sm text-primary">
                              <Clock className="w-4 h-4" />
                              <span>Payment pending</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Invoice
                        </Button>
                        <Button variant="outline" size="sm">
                          Send Reminder
                        </Button>
                        {record.status !== 'paid' && (
                          <Button
                            size="sm"
                            className="bg-accent hover:bg-accent/90"
                          >
                            Mark as Paid
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          Download PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <div className="space-y-4">
                {pendingRecords.map((record) => (
                  <Card key={record.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 bg-primary/20">
                            <AvatarFallback className="text-primary font-medium">
                              {record.studentName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">
                              {record.studentName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Parent: {record.parentName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Invoice: {record.invoiceNumber}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">
                            ${record.amount.toLocaleString()}
                          </div>
                          <Badge
                            className={getStatusColor(record.status)}
                            variant="outline"
                          >
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Send Reminder
                        </Button>
                        <Button
                          size="sm"
                          className="bg-accent hover:bg-accent/90"
                        >
                          Mark as Paid
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="overdue" className="space-y-4">
              <div className="space-y-4">
                {overdueRecords.map((record) => (
                  <Card
                    key={record.id}
                    className="border-l-4 border-l-destructive"
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 bg-destructive/20">
                            <AvatarFallback className="text-destructive font-medium">
                              {record.studentName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">
                              {record.studentName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Parent: {record.parentName}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-destructive">
                              <AlertCircle className="w-4 h-4" />
                              <span>
                                Overdue since{' '}
                                {new Date(record.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-destructive">
                            ${record.amount.toLocaleString()}
                          </div>
                          <Badge
                            className={getStatusColor(record.status)}
                            variant="outline"
                          >
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Contact Parent
                        </Button>
                        <Button
                          size="sm"
                          className="bg-accent hover:bg-accent/90"
                        >
                          Mark as Paid
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="paid" className="space-y-4">
              <div className="space-y-4">
                {paidRecords.map((record) => (
                  <Card key={record.id} className="border-l-4 border-l-accent">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 bg-accent/20">
                            <AvatarFallback className="text-accent font-medium">
                              {record.studentName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">
                              {record.studentName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Parent: {record.parentName}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-accent">
                              <CheckCircle className="w-4 h-4" />
                              <span>
                                Paid on{' '}
                                {record.paidDate &&
                                  new Date(
                                    record.paidDate
                                  ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-accent">
                            ${record.amount.toLocaleString()}
                          </div>
                          <Badge
                            className={getStatusColor(record.status)}
                            variant="outline"
                          >
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Receipt
                        </Button>
                        <Button variant="outline" size="sm">
                          Download PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
