import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  CreditCard, 
  Shield, 
  Database, 
  ArrowLeft,
  CheckCircle
} from 'lucide-react';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface CheckoutFormProps {
  dataset: any;
  clientSecret: string;
  amount: number;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ dataset, clientSecret, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const confirmPaymentMutation = useMutation({
    mutationFn: (paymentIntentId: string) => 
      apiRequest('POST', '/api/confirm-payment', { paymentIntentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/purchases'] });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment on our backend
        await confirmPaymentMutation.mutateAsync(paymentIntent.id);
        
        toast({
          title: "Payment Successful!",
          description: "Your dataset is now available for download.",
        });
        
        navigate(`/dataset/${dataset.id}`);
      }
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg bg-gray-50">
        <PaymentElement />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary/90" 
        size="lg"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>Processing...</>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Complete Purchase - ${amount}
          </>
        )}
      </Button>

      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>Secured by Stripe • SSL Encrypted</span>
        </div>
      </div>
    </form>
  );
};

export default function Checkout() {
  const [match] = useRoute('/checkout/:id');
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const datasetId = match?.id;

  const [clientSecret, setClientSecret] = useState<string>("");

  const { data: dataset, isLoading: datasetLoading } = useQuery({
    queryKey: [`/api/datasets/${datasetId}`],
    enabled: !!datasetId,
  });

  // Check authentication
  useEffect(() => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to purchase datasets.',
        variant: 'destructive',
      });
      navigate('/auth');
    }
  }, [user, navigate, toast]);

  // Create payment intent
  useEffect(() => {
    if (dataset && user) {
      apiRequest("POST", "/api/create-payment-intent", { datasetId: dataset.id })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          toast({
            title: 'Payment Setup Failed',
            description: error.message || 'Failed to initialize payment',
            variant: 'destructive',
          });
        });
    }
  }, [dataset, user, toast]);

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (datasetLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Dataset not found</h2>
          <p className="text-muted-foreground mb-4">The dataset you're trying to purchase doesn't exist.</p>
          <Button onClick={() => navigate('/marketplace')}>
            Browse Datasets
          </Button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Setting up payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/dataset/${dataset.id}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dataset
          </Button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Purchase</h1>
            <p className="text-muted-foreground">
              You're about to purchase access to this dataset
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Database className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{dataset.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      by {dataset.seller?.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{dataset.category}</Badge>
                      <Badge variant="outline">{dataset.format}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-medium">
                      {Math.round(dataset.fileSize / (1024 * 1024))}MB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">License:</span>
                    <span className="font-medium">{dataset.license}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Downloads:</span>
                    <span className="font-medium">{dataset.downloads}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dataset Price:</span>
                    <span className="font-semibold">${dataset.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processing Fee:</span>
                    <span className="font-semibold">${(dataset.price * 0.03).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${(dataset.price * 1.03).toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center text-green-800">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <div>
                      <p className="font-medium">What you'll get:</p>
                      <ul className="text-sm mt-1 space-y-1">
                        <li>• Instant download access</li>
                        <li>• Lifetime access to this dataset</li>
                        <li>• Commercial usage rights</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Elements 
                  stripe={stripePromise} 
                  options={{ 
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: 'hsl(173 71% 42%)',
                      },
                    },
                  }}
                >
                  <CheckoutForm 
                    dataset={dataset} 
                    clientSecret={clientSecret}
                    amount={parseFloat((dataset.price * 1.03).toFixed(2))}
                  />
                </Elements>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
