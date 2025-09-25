'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  FileText,
  Calendar,
  DollarSign,
  User,
  Building,
  Filter,
  Search,
  Download,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { InvoiceListProps, InvoiceWithDetails } from '../types';
import { InvoiceViewModal } from './invoice-view-modal';
import { InvoiceEditModal } from './invoice-edit-modal';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  paid: 'bg-green-100 text-green-800 hover:bg-green-200',
  overdue: 'bg-red-100 text-red-800 hover:bg-red-200',
  cancelled: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  refunded: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
};

const typeColors = {
  rent: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  maintenance: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  utility: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  fine: 'bg-red-100 text-red-800 hover:bg-red-200',
  other: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
};

export function InvoiceList({
  invoices,
  isLoading,
  onEdit,
  onView,
  onDelete,
  onStatusChange,
  properties = [],
  units = [],
  tenants = [],
}: InvoiceListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithDetails | null>(null);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${invoice.tenant.firstName} ${invoice.tenant.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.tenant.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesType = typeFilter === 'all' || invoice.invoiceType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge className={typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const handleViewInvoice = (invoice: InvoiceWithDetails) => {
    setSelectedInvoice(invoice);
    setViewModalOpen(true);
  };

  const handleEditInvoice = (invoice: InvoiceWithDetails) => {
    setSelectedInvoice(invoice);
    setEditModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleSaveEdit = (data: any) => {
    if (onEdit) {
      onEdit(data);
    }
    handleCloseEditModal();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'MMM dd, yyyy');
  };

  const isOverdue = (dueDate: number, status: string) => {
    return status === 'pending' && new Date(dueDate) < new Date();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Loading invoices...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='animate-pulse'>
                <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                <div className='h-3 bg-gray-200 rounded w-1/2'></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className='sr-only'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <FileText className='h-5 w-5' />
                Invoices
              </CardTitle>
              <CardDescription>Manage and track all invoices for your properties</CardDescription>
            </div>
            <Button className='bg-blue-500 hover:bg-blue-600 text-white'>
              <Download className='h-4 w-4 mr-2' />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className='flex flex-col sm:flex-row gap-4 mb-6'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <Input
                placeholder='Search invoices...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-full sm:w-40'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='pending'>Pending</SelectItem>
                <SelectItem value='paid'>Paid</SelectItem>
                <SelectItem value='overdue'>Overdue</SelectItem>
                <SelectItem value='cancelled'>Cancelled</SelectItem>
                <SelectItem value='refunded'>Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className='w-full sm:w-40'>
                <SelectValue placeholder='Type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                <SelectItem value='rent'>Rent</SelectItem>
                <SelectItem value='maintenance'>Maintenance</SelectItem>
                <SelectItem value='utility'>Utility</SelectItem>
                <SelectItem value='fine'>Fine</SelectItem>
                <SelectItem value='other'>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Invoice Table */}
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Property/Unit</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='w-[50px]'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className='text-center py-8 text-gray-500'>
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map(invoice => (
                    <TableRow key={invoice._id}>
                      <TableCell className='font-medium'>
                        <div className='flex items-center gap-2'>
                          <FileText className='h-4 w-4 text-gray-400' />
                          {invoice.invoiceNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <User className='h-4 w-4 text-gray-400' />
                          <div>
                            <div className='font-medium'>
                              {invoice.tenant.firstName} {invoice.tenant.lastName}
                            </div>
                            <div className='text-sm text-gray-500'>{invoice.tenant.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Building className='h-4 w-4 text-gray-400' />
                          <div>
                            <div className='font-medium'>{invoice.property.name}</div>
                            {invoice.unit && (
                              <div className='text-sm text-gray-500'>Unit {invoice.unit.unitNumber}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(invoice.invoiceType)}</TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <DollarSign className='h-4 w-4 text-gray-400' />
                          <div>
                            <div className='font-medium'>{formatCurrency(invoice.totalAmount)}</div>
                            {invoice.lateFee && invoice.lateFee > 0 && (
                              <div className='text-sm text-red-500'>+{formatCurrency(invoice.lateFee)} late fee</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Calendar className='h-4 w-4 text-gray-400' />
                          <div>
                            <div
                              className={isOverdue(invoice.dueDate, invoice.status) ? 'text-red-600 font-medium' : ''}
                            >
                              {formatDate(invoice.dueDate)}
                            </div>
                            {isOverdue(invoice.dueDate, invoice.status) && (
                              <div className='text-sm text-red-500'>Overdue</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                              <Eye className='h-4 w-4 mr-2' />
                              View Details
                            </DropdownMenuItem>
                            {invoice.status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleEditInvoice(invoice)}>
                                <Edit className='h-4 w-4 mr-2' />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {onStatusChange && invoice.status === 'pending' && (
                              <DropdownMenuItem onClick={() => onStatusChange(invoice, 'paid')}>
                                <DollarSign className='h-4 w-4 mr-2' />
                                Mark as Paid
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem onClick={() => onDelete(invoice)} className='text-red-600'>
                                <Trash2 className='h-4 w-4 mr-2' />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          {filteredInvoices.length > 0 && (
            <div className='mt-6 grid grid-cols-1 md:grid-cols-4 gap-4'>
              <Card>
                <CardContent className='p-4'>
                  <div className='text-sm text-gray-500'>Total Invoices</div>
                  <div className='text-2xl font-bold'>{filteredInvoices.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className='p-4'>
                  <div className='text-sm text-gray-500'>Total Amount</div>
                  <div className='text-2xl font-bold'>
                    {formatCurrency(filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className='p-4'>
                  <div className='text-sm text-gray-500'>Paid Amount</div>
                  <div className='text-2xl font-bold text-green-600'>
                    {formatCurrency(filteredInvoices.reduce((sum, inv) => sum + (inv.totalPaid || 0), 0))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className='p-4'>
                  <div className='text-sm text-gray-500'>Outstanding</div>
                  <div className='text-2xl font-bold text-red-600'>
                    {formatCurrency(
                      filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0) -
                        filteredInvoices.reduce((sum, inv) => sum + (inv.totalPaid || 0), 0)
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <InvoiceViewModal
        invoice={selectedInvoice}
        isOpen={viewModalOpen}
        onClose={handleCloseViewModal}
        onEdit={handleEditInvoice}
      />

      <InvoiceEditModal
        invoice={selectedInvoice}
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveEdit}
        properties={properties}
        units={units}
        tenants={tenants}
      />
    </>
  );
}
