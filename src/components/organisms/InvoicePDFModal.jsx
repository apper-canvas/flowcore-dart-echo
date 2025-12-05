import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import customerService from "@/services/api/customerService";

const InvoicePDFModal = ({ isOpen, onClose, order }) => {
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [apperClient, setApperClient] = useState(null);

  useEffect(() => {
    if (isOpen) {
      initializeApperClient();
      loadCustomerData();
    }
  }, [isOpen, order]);

  const initializeApperClient = () => {
    try {
      if (window.ApperSDK && window.ApperSDK.ApperClient) {
        const { ApperClient } = window.ApperSDK;
        
        const client = new ApperClient({
          apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
          apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
        });
        
        setApperClient(client);
      } else {
        console.error("Apper SDK not loaded");
        toast.error("PDF generation service not available");
      }
    } catch (error) {
      console.error("Failed to initialize Apper client:", error);
      toast.error("Failed to initialize PDF generation service");
    }
  };

  const loadCustomerData = async () => {
    if (!order?.customerId) return;
    
    try {
      const customerData = await customerService.getById(order.customerId);
      setCustomer(customerData);
    } catch (error) {
      console.error("Failed to load customer data:", error);
      toast.error("Failed to load customer information");
    }
  };

  const generatePDF = async () => {
    if (!apperClient || !order || !customer) {
      toast.error("Missing required data for PDF generation");
      return;
    }

    setLoading(true);

    try {
      const invoiceData = {
        order: {
          id: order.Id,
          orderNumber: order.orderNumber,
          date: order.createdAt,
          status: order.status,
          subtotal: order.subtotal || 0,
          tax: order.tax || 0,
          total: order.total || 0,
          items: order.items || [],
          notes: order.notes || ""
        },
        customer: {
          id: customer.Id,
          name: customer.name,
          email: customer.email || "",
          phone: customer.phone || "",
          address: customer.address || ""
        },
        company: {
          name: "FlowCore ERP",
          address: "123 Business St, Suite 100",
          city: "Business City, BC 12345",
          phone: "(555) 123-4567",
          email: "info@flowcore.com"
        }
      };

      const result = await apperClient.functions.invoke(import.meta.env.VITE_GENERATE_INVOICE_PDF, {
        body: JSON.stringify(invoiceData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (result.success) {
        // Handle successful PDF generation
        if (result.downloadUrl) {
          // Open PDF in new tab or trigger download
          window.open(result.downloadUrl, '_blank');
          toast.success("Invoice PDF generated successfully");
          onClose();
        } else {
          console.info(`apper_info: Got an error in this function: ${import.meta.env.VITE_GENERATE_INVOICE_PDF}. The response body is: ${JSON.stringify(result)}.`);
          toast.error("Failed to generate PDF download link");
        }
      } else {
        console.info(`apper_info: Got an error in this function: ${import.meta.env.VITE_GENERATE_INVOICE_PDF}. The response body is: ${JSON.stringify(result)}.`);
        toast.error(result.error || "Failed to generate invoice PDF");
      }
    } catch (error) {
      console.info(`apper_info: Got this error an this function: ${import.meta.env.VITE_GENERATE_INVOICE_PDF}. The error is: ${error.message}`);
      toast.error("Error generating invoice PDF");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Generate Invoice PDF</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ApperIcon name="X" className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <Loading />
              <p className="mt-4 text-gray-600">Generating PDF invoice...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Invoice Details</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Order: {order?.orderNumber}</p>
                  <p>Customer: {customer?.name || "Loading..."}</p>
                  <p>Total: ${order?.total?.toFixed(2) || "0.00"}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  onClick={generatePDF}
                  disabled={loading || !apperClient || !customer}
                >
                  <ApperIcon name="FileText" className="w-4 h-4 mr-2" />
                  Generate PDF
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicePDFModal;