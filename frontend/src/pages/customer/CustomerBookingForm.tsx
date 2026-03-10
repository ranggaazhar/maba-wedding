import { useCustomerBookingForm } from "@/hooks/Customer/useCustomerBookingForm"; 
import { 
  CheckCircle2, Loader2, 
  User, Package, ShoppingCart, CreditCard, AlertCircle 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

import Step1CustomerInfo from "@/pages/customer/Step1CustomerInfo";
import Step2Models from "@/pages/customer/Step2Models";
import Step3Properties from "@/pages/customer/Step3Properties";
import Step4Payment from "@/pages/customer/Step4Payment";
import BookingSuccess from "@/pages/customer/BookingSuccess";

const STEPS = [
  { id: 1, title: "Data Diri", icon: User, description: "Informasi customer" },
  { id: 2, title: "Pilih Model", icon: Package, description: "Model dekorasi" },
  { id: 3, title: "Pilih Property", icon: ShoppingCart, description: "Properti tambahan" },
  { id: 4, title: "Pembayaran", icon: CreditCard, description: "Bayar DP 10%" },
];

export default function CustomerBookingForm() {
  const {
    currentStep, isValidating, isSubmitting,
    createdBookingId, bookingCode,
    formData, setFormData,
    paymentFile, setPaymentFile,
    paymentData, setPaymentData,
    totalEstimate,
    handleNext, handleBack, handleSubmitBooking,
  } = useCustomerBookingForm();

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
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center transition-all
                        ${isCompleted ? "bg-green-500 text-white" : ""}
                        ${isActive ? "bg-primary text-white ring-4 ring-primary/20" : ""}
                        ${!isActive && !isCompleted ? "bg-muted text-muted-foreground" : ""}
                      `}>
                        {isCompleted ? <CheckCircle2 size={24} /> : <Icon size={24} />}
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
                      <Separator className={`flex-1 mx-4 ${isCompleted ? "bg-green-500" : ""}`} />
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
              <Step1CustomerInfo formData={formData} setFormData={setFormData} onNext={handleNext} />
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
                totalEstimate={totalEstimate}
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