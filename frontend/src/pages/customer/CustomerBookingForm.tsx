// src/pages/customer/CustomerBookingForm.tsx
import { useCustomerBookingForm } from "@/hooks/Customer/useCustomerBookingForm";
import {
  CheckCircle2, Loader2,
  User, Package, ShoppingCart, CreditCard, AlertCircle,
  Sparkles, Layers, BookOpen, ArrowRight, ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import Step1CustomerInfo from "@/pages/customer/Step1CustomerInfo";
import Step2Models from "@/pages/customer/Step2Models";
import Step3Properties from "@/pages/customer/Step3Properties";
import Step4Payment from "@/pages/customer/Step4Payment";
import Step2CustomRequest from "@/pages/customer/Step2CustomRequest";
import BookingSuccess from "@/pages/customer/BookingSuccess";

const CATALOG_STEPS = [
  { id: 1, title: "Data Diri",      icon: User,         description: "Informasi customer" },
  { id: 2, title: "Pilih Model",    icon: Package,      description: "Model dekorasi" },
  { id: 3, title: "Pilih Property", icon: ShoppingCart, description: "Properti tambahan" },
  { id: 4, title: "Pembayaran",     icon: CreditCard,   description: "Bayar DP 10%" },
];
const CUSTOM_STEPS = [
  { id: 1, title: "Data Diri",      icon: User,         description: "Informasi customer" },
  { id: 2, title: "Custom Request", icon: Sparkles,     description: "Ajukan request" },
  { id: 3, title: "Pilih Property", icon: ShoppingCart, description: "Properti tambahan" },
  { id: 4, title: "Pembayaran",     icon: CreditCard,   description: "Bayar DP Flat" },
];
const COMBINATION_STEPS = [
  { id: 1, title: "Data Diri",      icon: User,         description: "Informasi customer" },
  { id: 2, title: "Pilih Model",    icon: Package,      description: "Model dekorasi" },
  { id: 3, title: "Pilih Property", icon: ShoppingCart, description: "Properti tambahan" },
  { id: 4, title: "Custom Request", icon: Sparkles,     description: "Request tambahan" },
  { id: 5, title: "Pembayaran",     icon: CreditCard,   description: "Bayar DP 10%" },
];

function ModeSelection({ onSelect, onBack }: {
  onSelect: (mode: 'catalog' | 'custom' | 'combination') => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Pilih Tipe Booking</h3>
        <p className="text-sm text-muted-foreground">Bagaimana Anda ingin memesan dekorasi?</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer border-2 hover:border-blue-400 hover:shadow-md transition-all group" onClick={() => onSelect('catalog')}>
          <CardContent className="pt-6 pb-5 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <BookOpen size={28} className="text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold">Dari Katalog</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Pilih model dekorasi yang sudah tersedia di katalog kami</p>
            </div>
            <Badge className="bg-blue-50 text-blue-700 border border-blue-200">Harga Langsung Terlihat</Badge>
            <Button className="w-full" size="sm" variant="outline">Pilih Ini <ArrowRight size={14} className="ml-2" /></Button>
          </CardContent>
        </Card>
        <Card className="cursor-pointer border-2 hover:border-orange-400 hover:shadow-md transition-all group" onClick={() => onSelect('custom')}>
          <CardContent className="pt-6 pb-5 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
              <Sparkles size={28} className="text-orange-600" />
            </div>
            <div>
              <h4 className="font-semibold">Custom Request</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Ajukan dekorasi sesuai keinginan Anda dengan foto referensi</p>
            </div>
            <Badge className="bg-orange-50 text-orange-700 border border-orange-200">Harga Ditentukan Admin</Badge>
            <Button className="w-full" size="sm" variant="outline">Pilih Ini <ArrowRight size={14} className="ml-2" /></Button>
          </CardContent>
        </Card>
        <Card className="cursor-pointer border-2 hover:border-purple-400 hover:shadow-md transition-all group" onClick={() => onSelect('combination')}>
          <CardContent className="pt-6 pb-5 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <Layers size={28} className="text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold">Kombinasi</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Pilih dari katalog dan tambahkan custom request sekaligus</p>
            </div>
            <Badge className="bg-purple-50 text-purple-700 border border-purple-200">Paling Fleksibel</Badge>
            <Button className="w-full" size="sm" variant="outline">Pilih Ini <ArrowRight size={14} className="ml-2" /></Button>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-start pt-2 border-t">
        <Button variant="outline" onClick={onBack}><ArrowLeft size={16} className="mr-2" /> Kembali ke Data Diri</Button>
      </div>
    </div>
  );
}

function ProgressSteps({ steps, currentStep }: {
  steps: { id: number; title: string; icon: React.ElementType; description: string }[];
  currentStep: number;
}) {
  return (
    <div className="flex items-center justify-between overflow-x-auto pb-2">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive    = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        return (
          <div key={step.id} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shrink-0 ${isCompleted ? "bg-green-500 text-white" : ""} ${isActive ? "bg-primary text-white ring-4 ring-primary/20" : ""} ${!isActive && !isCompleted ? "bg-muted text-muted-foreground" : ""}`}>
                {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
              </div>
              <div className="text-center min-w-0 px-1">
                <p className={`text-xs font-medium truncate ${isActive ? "text-primary" : "text-muted-foreground"}`}>{step.title}</p>
                <p className="text-xs text-muted-foreground hidden md:block truncate">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`h-px flex-1 mx-2 shrink-0 transition-colors ${isCompleted ? "bg-green-500" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CustomerBookingForm() {
  const {
    currentStep, isValidating, isSubmitting, isSuccess,
    createdBookingId, bookingCode,
    bookingMode, handleSelectMode,
    formData, setFormData,
    customRequests, customRequestFiles,
    handleAddCustomRequest, handleUpdateCustomRequest,
    handleRemoveCustomRequest, handleSetCustomRequestFiles,
    paymentFile, setPaymentFile,
    paymentData, setPaymentData,
    totalEstimate, customRequestFee, dpAmount,
    handleNextFromStep1, handleNext, handleBack, handleSubmitBooking,
  } = useCustomerBookingForm();

  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Memvalidasi link booking...</p>
      </div>
    );
  }

  if (isSuccess && createdBookingId) {
    return <BookingSuccess bookingCode={bookingCode} bookingId={createdBookingId} />;
  }

  const steps = bookingMode === 'catalog' ? CATALOG_STEPS
    : bookingMode === 'custom'      ? CUSTOM_STEPS
    : bookingMode === 'combination' ? COMBINATION_STEPS
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl text-center">Form Booking Dekorasi</CardTitle>
            <CardDescription className="text-center">Lengkapi form berikut untuk melakukan booking</CardDescription>
            {bookingMode && (
              <div className="flex justify-center pt-1">
                {bookingMode === 'catalog'     && <Badge className="bg-blue-50 text-blue-700 border border-blue-200 gap-1"><BookOpen size={12} /> Dari Katalog</Badge>}
                {bookingMode === 'custom'      && <Badge className="bg-orange-50 text-orange-700 border border-orange-200 gap-1"><Sparkles size={12} /> Custom Request</Badge>}
                {bookingMode === 'combination' && <Badge className="bg-purple-50 text-purple-700 border border-purple-200 gap-1"><Layers size={12} /> Kombinasi</Badge>}
              </div>
            )}
          </CardHeader>
        </Card>

        {bookingMode && steps && (
          <Card><CardContent className="pt-6"><ProgressSteps steps={steps} currentStep={currentStep} /></CardContent></Card>
        )}

        <Card>
          <CardContent className="pt-6">

            {/* Step 1 */}
            {currentStep === 1 && (
              <Step1CustomerInfo formData={formData} setFormData={setFormData} onNext={handleNextFromStep1} />
            )}

            {/* Step 2 — Mode Selection */}
            {currentStep === 2 && bookingMode === null && (
              <ModeSelection onSelect={handleSelectMode} onBack={handleBack} />
            )}

            {/* Step 2 — Catalog/Combination: Models */}
            {currentStep === 2 && (bookingMode === 'catalog' || bookingMode === 'combination') && (
              <Step2Models
                models={formData.models || []}
                setModels={(models) => setFormData((prev) => ({ ...prev, models }))}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {/* Step 2 — Custom: Custom Request */}
            {currentStep === 2 && bookingMode === 'custom' && (
              <Step2CustomRequest
                customRequests={customRequests}
                customRequestFiles={customRequestFiles}
                onAdd={handleAddCustomRequest}
                onUpdate={handleUpdateCustomRequest}
                onRemove={handleRemoveCustomRequest}
                onSetFiles={handleSetCustomRequestFiles}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {/* Step 3 — Catalog/Combination: Properties */}
            {currentStep === 3 && (bookingMode === 'catalog' || bookingMode === 'combination') && (
              <Step3Properties
                properties={formData.properties || []}
                setProperties={(properties) => setFormData((prev) => ({ ...prev, properties }))}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {/* Step 3 — Custom: Pilih Property (opsional) */}
            {currentStep === 3 && bookingMode === 'custom' && (
              <Step3Properties
                properties={formData.properties || []}
                setProperties={(properties) => setFormData((prev) => ({ ...prev, properties }))}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {/* Step 4 — Custom: Payment */}
            {currentStep === 4 && bookingMode === 'custom' && (
              <Step4Payment
                paymentFile={paymentFile} setPaymentFile={setPaymentFile}
                paymentData={paymentData} setPaymentData={setPaymentData}
                totalEstimate={totalEstimate}
                dpAmount={dpAmount}
                bookingMode={bookingMode}
                eventType={formData.event_type}
                customRequestFee={customRequestFee}
                onBack={handleBack} onSubmit={handleSubmitBooking} isSubmitting={isSubmitting}
              />
            )}

            {/* Step 4 — Combination: Custom Request (opsional) */}
            {currentStep === 4 && bookingMode === 'combination' && (
              <Step2CustomRequest
                customRequests={customRequests}
                customRequestFiles={customRequestFiles}
                onAdd={handleAddCustomRequest}
                onUpdate={handleUpdateCustomRequest}
                onRemove={handleRemoveCustomRequest}
                onSetFiles={handleSetCustomRequestFiles}
                onNext={handleNext}
                onBack={handleBack}
                optional
              />
            )}

            {/* Step 4 — Catalog: Payment */}
            {currentStep === 4 && bookingMode === 'catalog' && (
              <Step4Payment
                paymentFile={paymentFile} setPaymentFile={setPaymentFile}
                paymentData={paymentData} setPaymentData={setPaymentData}
                totalEstimate={totalEstimate}
                dpAmount={dpAmount}
                bookingMode={bookingMode}
                eventType={formData.event_type}
                customRequestFee={customRequestFee}
                onBack={handleBack} onSubmit={handleSubmitBooking} isSubmitting={isSubmitting}
              />
            )}

            {/* Step 5 — Combination: Payment */}
            {currentStep === 5 && bookingMode === 'combination' && (
              <Step4Payment
                paymentFile={paymentFile} setPaymentFile={setPaymentFile}
                paymentData={paymentData} setPaymentData={setPaymentData}
                totalEstimate={totalEstimate}
                dpAmount={dpAmount}
                bookingMode={bookingMode}
                eventType={formData.event_type}
                customRequestFee={customRequestFee}
                onBack={handleBack} onSubmit={handleSubmitBooking} isSubmitting={isSubmitting}
              />
            )}

          </CardContent>
        </Card>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Pastikan semua data sudah benar sebelum melanjutkan.</AlertDescription>
        </Alert>
      </div>
    </div>
  );
}