import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  CheckCircle2, Loader2, 
  User, Package, ShoppingCart, CreditCard, AlertCircle 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { bookingLinkApi, bookingApi, type CreateBookingData } from "@/api/bookingApi";
import Swal from "sweetalert2";
import axios from "axios";

// Import step components
import Step1CustomerInfo from "@/components/customer/Step1CustomerInfo";
import Step2Models from "@/components/customer/Step2Models";
import Step3Properties from "@/components/customer/Step3Properties";
import Step4Payment from "@/components/customer/Step4Payment";
import BookingSuccess from "@/components/customer/BookingSuccess";

interface BookingLinkResponse {
  id: number;
  customer_name?: string;
  customer_phone?: string;
}

interface PaymentData {
  bank_name: string;
  account_number: string;
  account_name: string;
}

const STEPS = [
  { id: 1, title: "Data Diri", icon: User, description: "Informasi customer" },
  { id: 2, title: "Pilih Model", icon: Package, description: "Model dekorasi" },
  { id: 3, title: "Pilih Property", icon: ShoppingCart, description: "Properti tambahan" },
  { id: 4, title: "Pembayaran", icon: CreditCard, description: "Upload bukti DP" },
];

export default function CustomerBookingForm() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isValidating, setIsValidating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);
  const [bookingCode, setBookingCode] = useState<string>("");

  // Form data state
  const [formData, setFormData] = useState<CreateBookingData>({
    booking_link_id: 0,
    customer_name: "",
    customer_phone: "",
    full_address: "",
    event_venue: "",
    event_date: "",
    event_type: "",
    referral_source: "",
    theme_color: "",
    total_estimate: "0",
    customer_notes: "",
    models: [],
    properties: [],
  });

  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    bank_name: "",
    account_number: "",
    account_name: "",
  });

  // Validate booking link on mount
  useEffect(() => {
    const validateLink = async () => {
      if (!token) {
        Swal.fire("Error", "Token booking tidak valid", "error");
        navigate("/");
        return;
      }

      try {
        setIsValidating(true);
        const response = await bookingLinkApi.validateBookingLink(token);
        
        if (response.success) {
          const data = response.data as BookingLinkResponse;
          
          setFormData(prev => ({
            ...prev,
            booking_link_id: data.id,
            customer_name: data.customer_name || "",
            customer_phone: data.customer_phone || "",
          }));
        }
      } catch (error: unknown) {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message
          : "Link booking tidak valid atau sudah expired";
        
        Swal.fire("Error", message, "error").then(() => navigate("/"));
      } finally {
        setIsValidating(false);
      }
    };

    validateLink();
  }, [token, navigate]);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitBooking = async () => {
    try {
      setIsSubmitting(true);

      // Validate required fields
      if (!formData.customer_name || !formData.customer_phone || !formData.event_date) {
        Swal.fire("Error", "Data customer tidak lengkap", "error");
        setCurrentStep(1);
        setIsSubmitting(false);
        return;
      }

      if (!formData.models || formData.models.length === 0) {
        Swal.fire("Error", "Pilih minimal 1 model dekorasi", "error");
        setCurrentStep(2);
        setIsSubmitting(false);
        return;
      }

      // Calculate total estimate
      let totalEstimate = 0;
      
      // Add model prices
      if (formData.models) {
        formData.models.forEach(model => {
          totalEstimate += Number(model.price || 0);
        });
      }
      
      // Add property prices
      if (formData.properties) {
        formData.properties.forEach(prop => {
          totalEstimate += Number(prop.subtotal || 0);
        });
      }

      // Prepare booking data
      const bookingDataToSubmit: CreateBookingData = {
        ...formData,
        total_estimate: String(totalEstimate),
        // Ensure models and properties are arrays
        models: formData.models || [],
        properties: formData.properties || [],
      };

      console.log("Submitting booking data:", bookingDataToSubmit);

      const bookingResponse = await bookingApi.createBooking(bookingDataToSubmit);

      if (bookingResponse.success) {
        const bookingId = bookingResponse.data.id;
        const bookingCodeStr = bookingResponse.data.booking_code;
        
        setCreatedBookingId(bookingId);
        setBookingCode(bookingCodeStr);

        // Upload payment proof if exists
        if (paymentFile) {
          try {
            await bookingApi.uploadPaymentProof(bookingId, paymentFile, paymentData);
          } catch (uploadError) {
            console.error("Payment upload error:", uploadError);
            // Continue even if upload fails
          }
        }

        setCurrentStep(5);
      }
    } catch (error: unknown) {
      console.error("Booking submission error:", error);
      
      let message = "Gagal menyimpan booking";
      
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
        console.error("API Error Response:", error.response?.data);
      }
      
      Swal.fire("Error", message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Memvalidasi link booking...</p>
      </div>
    );
  }

  if (currentStep === 5 && createdBookingId) {
    return <BookingSuccess bookingCode={bookingCode} bookingId={createdBookingId} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center">Form Booking Dekorasi</CardTitle>
            <CardDescription className="text-center">
              Lengkapi form berikut untuk melakukan booking
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Progress Steps */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <div
                        className={`
                          w-12 h-12 rounded-full flex items-center justify-center transition-all
                          ${isCompleted ? "bg-green-500 text-white" : ""}
                          ${isActive ? "bg-primary text-white ring-4 ring-primary/20" : ""}
                          ${!isActive && !isCompleted ? "bg-muted text-muted-foreground" : ""}
                        `}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={24} />
                        ) : (
                          <Icon size={24} />
                        )}
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-medium ${isActive ? "text-primary" : ""}`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-muted-foreground hidden md:block">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {index < STEPS.length - 1 && (
                      <Separator
                        className={`flex-1 mx-4 ${isCompleted ? "bg-green-500" : ""}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Form Content */}
        <Card>
          <CardContent className="pt-6">
            {currentStep === 1 && (
              <Step1CustomerInfo
                formData={formData}
                setFormData={setFormData}
                onNext={handleNext}
              />
            )}

            {currentStep === 2 && (
              <Step2Models
                models={formData.models || []}
                setModels={(models) => setFormData(prev => ({ ...prev, models }))}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 3 && (
              <Step3Properties
                properties={formData.properties || []}
                setProperties={(properties) => setFormData(prev => ({ ...prev, properties }))}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 4 && (
              <Step4Payment
                paymentFile={paymentFile}
                setPaymentFile={setPaymentFile}
                paymentData={paymentData}
                setPaymentData={setPaymentData}
                onBack={handleBack}
                onSubmit={handleSubmitBooking}
                isSubmitting={isSubmitting}
              />
            )}
          </CardContent>
        </Card>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Pastikan semua data yang Anda masukkan sudah benar sebelum melanjutkan ke step berikutnya.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}